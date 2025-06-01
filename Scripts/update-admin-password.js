/**
 * Script to update the admin password to a more secure one
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mdtstech_store',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Generate a secure random password
function generateSecurePassword(length = 16) {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  
  // Ensure at least one of each character type
  let password = '';
  password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
  password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
  password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

async function updateAdminPassword() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Check if admin user exists
    const checkQuery = `
      SELECT id FROM users 
      WHERE email = 'admin@example.com' AND is_admin = true
    `;
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows.length === 0) {
      // // // console.log('Admin user not found. Creating new admin user...');
      
      // Generate a secure password
      const password = generateSecurePassword();
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create admin user
      const insertQuery = `
        INSERT INTO users (
          email, password_hash, first_name, last_name, is_admin, created_at, updated_at
        ) VALUES (
          'admin@mdtstech.store', $1, 'Admin', 'User', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id
      `;
      await client.query(insertQuery, [hashedPassword]);
      
      // // // console.log('Admin user created successfully!');
      // // // console.log('Email: admin@mdtstech.store');
      // // // console.log('Password:', password);
      // // // console.log('\nPlease save these credentials in a secure location.');
    } else {
      // Generate a secure password
      const password = generateSecurePassword();
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update admin password
      const updateQuery = `
        UPDATE users 
        SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE email = 'admin@example.com' AND is_admin = true
      `;
      await client.query(updateQuery, [hashedPassword]);
      
      // // // console.log('Admin password updated successfully!');
      // // // console.log('Email: admin@example.com');
      // // // console.log('New Password:', password);
      // // // console.log('\nPlease save these credentials in a secure location.');
    }
    
    // Commit transaction
    await client.query('COMMIT');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error updating admin password:', error);
    process.exit(1);
  } finally {
    // Release client
    client.release();
  }
  
  // Close pool
  await pool.end();
}

// Run the function
updateAdminPassword().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
