const db = require('../config');
const bcrypt = require('bcrypt');

const UserModel = {
  // Get all users
  async getAllUsers() {
    const query = `
      SELECT id, email, first_name, last_name, phone, is_admin, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  },
  
  // Get user by ID
  async getUserById(id) {
    const query = `
      SELECT id, email, first_name, last_name, phone, is_admin, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    const { rows } = await db.query(query, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    // Get user addresses
    const addressesQuery = `
      SELECT * FROM user_addresses
      WHERE user_id = $1
      ORDER BY is_default DESC
    `;
    const addressesResult = await db.query(addressesQuery, [id]);
    
    return {
      ...rows[0],
      addresses: addressesResult.rows
    };
  },
  
  // Get user by email
  async getUserByEmail(email) {
    const query = `
      SELECT * FROM users
      WHERE email = $1
    `;
    const { rows } = await db.query(query, [email]);
    return rows[0] || null;
  },
  
  // Create a new user
  async createUser(userData) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Check if email already exists
      const checkQuery = `
        SELECT 1 FROM users WHERE email = $1
      `;
      const checkResult = await client.query(checkQuery, [userData.email]);
      
      if (checkResult.rows.length > 0) {
        throw new Error('Email already in use');
      }
      
      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);
      
      // Insert user
      const userQuery = `
        INSERT INTO users (
          email, password_hash, first_name, last_name, phone, is_admin
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        ) RETURNING id, email, first_name, last_name, phone, is_admin, created_at, updated_at
      `;
      
      const userValues = [
        userData.email,
        passwordHash,
        userData.first_name || null,
        userData.last_name || null,
        userData.phone || null,
        userData.is_admin || false
      ];
      
      const userResult = await client.query(userQuery, userValues);
      const userId = userResult.rows[0].id;
      
      // Insert address if provided
      if (userData.address) {
        const addressQuery = `
          INSERT INTO user_addresses (
            user_id, address_line1, address_line2, city, state, postal_code, country, is_default, address_type
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          ) RETURNING *
        `;
        
        const addressValues = [
          userId,
          userData.address.address_line1,
          userData.address.address_line2 || null,
          userData.address.city,
          userData.address.state || null,
          userData.address.postal_code,
          userData.address.country,
          userData.address.is_default !== undefined ? userData.address.is_default : true,
          userData.address.address_type || 'both'
        ];
        
        await client.query(addressQuery, addressValues);
      }
      
      await client.query('COMMIT');
      
      // Return the created user
      return this.getUserById(userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  // Update a user
  async updateUser(id, userData) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // If email is being updated, check if it's already in use
      if (userData.email) {
        const checkQuery = `
          SELECT 1 FROM users WHERE email = $1 AND id != $2
        `;
        const checkResult = await client.query(checkQuery, [userData.email, id]);
        
        if (checkResult.rows.length > 0) {
          throw new Error('Email already in use');
        }
      }
      
      // Prepare update query
      let updateQuery = `
        UPDATE users SET
          first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          phone = COALESCE($3, phone),
          updated_at = CURRENT_TIMESTAMP
      `;
      
      const queryParams = [
        userData.first_name || null,
        userData.last_name || null,
        userData.phone || null
      ];
      
      // Add email to update if provided
      if (userData.email) {
        updateQuery += `, email = $${queryParams.length + 1}`;
        queryParams.push(userData.email);
      }
      
      // Add password to update if provided
      if (userData.password) {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(userData.password, saltRounds);
        updateQuery += `, password_hash = $${queryParams.length + 1}`;
        queryParams.push(passwordHash);
      }
      
      // Add is_admin to update if provided
      if (userData.is_admin !== undefined) {
        updateQuery += `, is_admin = $${queryParams.length + 1}`;
        queryParams.push(userData.is_admin);
      }
      
      // Complete the query
      updateQuery += ` WHERE id = $${queryParams.length + 1} RETURNING id, email, first_name, last_name, phone, is_admin, created_at, updated_at`;
      queryParams.push(id);
      
      // Execute the update
      const userResult = await client.query(updateQuery, queryParams);
      
      if (userResult.rows.length === 0) {
        throw new Error(`User with ID ${id} not found`);
      }
      
      await client.query('COMMIT');
      
      // Return the updated user
      return this.getUserById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  // Delete a user
  async deleteUser(id) {
    const query = `
      DELETE FROM users
      WHERE id = $1
      RETURNING id, email, first_name, last_name
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },
  
  // Add an address to a user
  async addUserAddress(userId, addressData) {
    // If this is the first address or is_default is true, set all other addresses to not default
    if (addressData.is_default) {
      const updateQuery = `
        UPDATE user_addresses
        SET is_default = false
        WHERE user_id = $1
      `;
      await db.query(updateQuery, [userId]);
    }
    
    // Insert the new address
    const query = `
      INSERT INTO user_addresses (
        user_id, address_line1, address_line2, city, state, postal_code, country, is_default, address_type
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) RETURNING *
    `;
    
    const values = [
      userId,
      addressData.address_line1,
      addressData.address_line2 || null,
      addressData.city,
      addressData.state || null,
      addressData.postal_code,
      addressData.country,
      addressData.is_default !== undefined ? addressData.is_default : false,
      addressData.address_type || 'shipping'
    ];
    
    const { rows } = await db.query(query, values);
    return rows[0];
  },
  
  // Update a user address
  async updateUserAddress(addressId, userId, addressData) {
    // If setting as default, update all other addresses first
    if (addressData.is_default) {
      const updateQuery = `
        UPDATE user_addresses
        SET is_default = false
        WHERE user_id = $1
      `;
      await db.query(updateQuery, [userId]);
    }
    
    // Update the address
    const query = `
      UPDATE user_addresses SET
        address_line1 = COALESCE($1, address_line1),
        address_line2 = COALESCE($2, address_line2),
        city = COALESCE($3, city),
        state = COALESCE($4, state),
        postal_code = COALESCE($5, postal_code),
        country = COALESCE($6, country),
        is_default = COALESCE($7, is_default),
        address_type = COALESCE($8, address_type)
      WHERE id = $9 AND user_id = $10
      RETURNING *
    `;
    
    const values = [
      addressData.address_line1 || null,
      addressData.address_line2 || null,
      addressData.city || null,
      addressData.state || null,
      addressData.postal_code || null,
      addressData.country || null,
      addressData.is_default !== undefined ? addressData.is_default : null,
      addressData.address_type || null,
      addressId,
      userId
    ];
    
    const { rows } = await db.query(query, values);
    return rows[0] || null;
  },
  
  // Delete a user address
  async deleteUserAddress(addressId, userId) {
    const query = `
      DELETE FROM user_addresses
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const { rows } = await db.query(query, [addressId, userId]);
    
    // If this was a default address and there are other addresses, make one of them default
    if (rows.length > 0 && rows[0].is_default) {
      const checkQuery = `
        SELECT id FROM user_addresses
        WHERE user_id = $1
        LIMIT 1
      `;
      const checkResult = await db.query(checkQuery, [userId]);
      
      if (checkResult.rows.length > 0) {
        const updateQuery = `
          UPDATE user_addresses
          SET is_default = true
          WHERE id = $1
        `;
        await db.query(updateQuery, [checkResult.rows[0].id]);
      }
    }
    
    return rows[0] || null;
  },
  
  // Authenticate a user
  async authenticateUser(email, password) {
    // Get user with password hash
    const query = `
      SELECT id, email, password_hash, first_name, last_name, is_admin
      FROM users
      WHERE email = $1
    `;
    const { rows } = await db.query(query, [email]);
    
    if (rows.length === 0) {
      return null;
    }
    
    const user = rows[0];
    
    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return null;
    }
    
    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
};

module.exports = UserModel;
