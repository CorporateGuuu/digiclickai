const db = require('../config');

const CartModel = {
  // Get cart by user ID or session ID
  async getCart(userId, sessionId) {
    let query;
    let params;
    
    if (userId) {
      query = `
        SELECT c.id, c.user_id, c.created_at, c.updated_at
        FROM carts c
        WHERE c.user_id = $1
        ORDER BY c.updated_at DESC
        LIMIT 1
      `;
      params = [userId];
    } else if (sessionId) {
      query = `
        SELECT c.id, c.session_id, c.created_at, c.updated_at
        FROM carts c
        WHERE c.session_id = $1
        ORDER BY c.updated_at DESC
        LIMIT 1
      `;
      params = [sessionId];
    } else {
      throw new Error('Either userId or sessionId must be provided');
    }
    
    const { rows } = await db.query(query, params);
    
    if (rows.length === 0) {
      return null;
    }
    
    // Get cart items
    const cartId = rows[0].id;
    const itemsQuery = `
      SELECT ci.id, ci.product_id, ci.variant_id, ci.quantity, ci.price_at_addition,
             p.name as product_name, p.image_url, p.price as current_price,
             p.discount_percentage,
             pv.variant_type, pv.variant_value, pv.price_adjustment
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_variants pv ON ci.variant_id = pv.id
      WHERE ci.cart_id = $1
    `;
    const itemsResult = await db.query(itemsQuery, [cartId]);
    
    // Calculate totals
    let subtotal = 0;
    const items = itemsResult.rows.map(item => {
      // Calculate item price with variant adjustment and discount
      let itemPrice = item.price_at_addition;
      if (item.variant_id) {
        itemPrice += item.price_adjustment || 0;
      }
      
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;
      
      return {
        ...item,
        total: itemTotal
      };
    });
    
    return {
      ...rows[0],
      items,
      subtotal,
      item_count: items.reduce((sum, item) => sum + item.quantity, 0)
    };
  },
  
  // Create a new cart
  async createCart(userId, sessionId) {
    const query = `
      INSERT INTO carts (user_id, session_id)
      VALUES ($1, $2)
      RETURNING id, user_id, session_id, created_at, updated_at
    `;
    const { rows } = await db.query(query, [userId || null, sessionId || null]);
    
    return {
      ...rows[0],
      items: [],
      subtotal: 0,
      item_count: 0
    };
  },
  
  // Get or create cart
  async getOrCreateCart(userId, sessionId) {
    const cart = await this.getCart(userId, sessionId);
    if (cart) {
      return cart;
    }
    
    return this.createCart(userId, sessionId);
  },
  
  // Add item to cart
  async addItemToCart(cartId, productId, quantity, variantId = null) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Get product information
      const productQuery = `
        SELECT p.price, pv.price_adjustment
        FROM products p
        LEFT JOIN product_variants pv ON pv.id = $1
        WHERE p.id = $2
      `;
      const productResult = await client.query(productQuery, [variantId, productId]);
      
      if (productResult.rows.length === 0) {
        throw new Error('Product not found');
      }
      
      const product = productResult.rows[0];
      let price = product.price;
      
      // Add variant price adjustment if applicable
      if (variantId && product.price_adjustment) {
        price += product.price_adjustment;
      }
      
      // Check if item already exists in cart
      const checkQuery = `
        SELECT id, quantity
        FROM cart_items
        WHERE cart_id = $1 AND product_id = $2 AND (variant_id = $3 OR (variant_id IS NULL AND $3 IS NULL))
      `;
      const checkResult = await client.query(checkQuery, [cartId, productId, variantId]);
      
      if (checkResult.rows.length > 0) {
        // Update existing item
        const existingItem = checkResult.rows[0];
        const newQuantity = existingItem.quantity + quantity;
        
        const updateQuery = `
          UPDATE cart_items
          SET quantity = $1, price_at_addition = $2
          WHERE id = $3
          RETURNING *
        `;
        await client.query(updateQuery, [newQuantity, price, existingItem.id]);
      } else {
        // Add new item
        const insertQuery = `
          INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, price_at_addition)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        await client.query(insertQuery, [cartId, productId, variantId, quantity, price]);
      }
      
      // Update cart timestamp
      const updateCartQuery = `
        UPDATE carts
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      await client.query(updateCartQuery, [cartId]);
      
      await client.query('COMMIT');
      
      // Get updated cart
      if (client.lastQuery[0].includes('user_id')) {
        const userId = client.lastQuery[1][0];
        return this.getCart(userId, null);
      } else {
        const sessionId = client.lastQuery[1][0];
        return this.getCart(null, sessionId);
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  // Update cart item quantity
  async updateCartItem(cartId, itemId, quantity) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        const deleteQuery = `
          DELETE FROM cart_items
          WHERE id = $1 AND cart_id = $2
          RETURNING *
        `;
        await client.query(deleteQuery, [itemId, cartId]);
      } else {
        // Update quantity
        const updateQuery = `
          UPDATE cart_items
          SET quantity = $1
          WHERE id = $2 AND cart_id = $3
          RETURNING *
        `;
        await client.query(updateQuery, [quantity, itemId, cartId]);
      }
      
      // Update cart timestamp
      const updateCartQuery = `
        UPDATE carts
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      await client.query(updateCartQuery, [cartId]);
      
      await client.query('COMMIT');
      
      // Get cart information to return
      const cartQuery = `
        SELECT user_id, session_id
        FROM carts
        WHERE id = $1
      `;
      const cartResult = await db.query(cartQuery, [cartId]);
      
      if (cartResult.rows.length === 0) {
        throw new Error('Cart not found');
      }
      
      const cart = cartResult.rows[0];
      
      // Get updated cart
      if (cart.user_id) {
        return this.getCart(cart.user_id, null);
      } else {
        return this.getCart(null, cart.session_id);
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  // Remove item from cart
  async removeCartItem(cartId, itemId) {
    return this.updateCartItem(cartId, itemId, 0);
  },
  
  // Clear cart
  async clearCart(cartId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Delete all items
      const deleteQuery = `
        DELETE FROM cart_items
        WHERE cart_id = $1
      `;
      await client.query(deleteQuery, [cartId]);
      
      // Update cart timestamp
      const updateCartQuery = `
        UPDATE carts
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      await client.query(updateCartQuery, [cartId]);
      
      await client.query('COMMIT');
      
      // Get cart information to return
      const cartQuery = `
        SELECT user_id, session_id
        FROM carts
        WHERE id = $1
      `;
      const cartResult = await db.query(cartQuery, [cartId]);
      
      if (cartResult.rows.length === 0) {
        throw new Error('Cart not found');
      }
      
      const cart = cartResult.rows[0];
      
      // Get updated cart
      if (cart.user_id) {
        return this.getCart(cart.user_id, null);
      } else {
        return this.getCart(null, cart.session_id);
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  // Transfer guest cart to user cart
  async transferCart(sessionId, userId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Get session cart
      const sessionCartQuery = `
        SELECT id
        FROM carts
        WHERE session_id = $1
        ORDER BY updated_at DESC
        LIMIT 1
      `;
      const sessionCartResult = await client.query(sessionCartQuery, [sessionId]);
      
      if (sessionCartResult.rows.length === 0) {
        // No session cart, nothing to transfer
        await client.query('COMMIT');
        return this.getOrCreateCart(userId, null);
      }
      
      const sessionCartId = sessionCartResult.rows[0].id;
      
      // Get user cart or create one
      const userCartQuery = `
        SELECT id
        FROM carts
        WHERE user_id = $1
        ORDER BY updated_at DESC
        LIMIT 1
      `;
      const userCartResult = await client.query(userCartQuery, [userId]);
      
      let userCartId;
      
      if (userCartResult.rows.length === 0) {
        // Create new user cart
        const createCartQuery = `
          INSERT INTO carts (user_id)
          VALUES ($1)
          RETURNING id
        `;
        const createCartResult = await client.query(createCartQuery, [userId]);
        userCartId = createCartResult.rows[0].id;
      } else {
        userCartId = userCartResult.rows[0].id;
      }
      
      // Get session cart items
      const itemsQuery = `
        SELECT product_id, variant_id, quantity, price_at_addition
        FROM cart_items
        WHERE cart_id = $1
      `;
      const itemsResult = await client.query(itemsQuery, [sessionCartId]);
      
      // For each session cart item
      for (const item of itemsResult.rows) {
        // Check if item already exists in user cart
        const checkQuery = `
          SELECT id, quantity
          FROM cart_items
          WHERE cart_id = $1 AND product_id = $2 AND (variant_id = $3 OR (variant_id IS NULL AND $3 IS NULL))
        `;
        const checkResult = await client.query(checkQuery, [userCartId, item.product_id, item.variant_id]);
        
        if (checkResult.rows.length > 0) {
          // Update existing item
          const existingItem = checkResult.rows[0];
          const newQuantity = existingItem.quantity + item.quantity;
          
          const updateQuery = `
            UPDATE cart_items
            SET quantity = $1
            WHERE id = $2
          `;
          await client.query(updateQuery, [newQuantity, existingItem.id]);
        } else {
          // Add new item
          const insertQuery = `
            INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, price_at_addition)
            VALUES ($1, $2, $3, $4, $5)
          `;
          await client.query(insertQuery, [userCartId, item.product_id, item.variant_id, item.quantity, item.price_at_addition]);
        }
      }
      
      // Delete session cart
      const deleteCartQuery = `
        DELETE FROM carts
        WHERE id = $1
      `;
      await client.query(deleteCartQuery, [sessionCartId]);
      
      await client.query('COMMIT');
      
      // Return updated user cart
      return this.getCart(userId, null);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = CartModel;
