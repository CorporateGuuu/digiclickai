import { getSession } from 'next-auth/react';
import { query } from '../../../lib/db';

// Mock cart data for development
const mockCart = {
  id: 1,
  items: [
    {
      id: 1,
      name: 'iPhone 13 Pro LCD Screen',
      price: 89.99,
      quantity: 2,
      image_url: '/images/gapp/iphone-screen.jpg',
      slug: 'iphone-13-pro-lcd-screen',
      discount_percentage: 0,
      total: 179.98
    },
    {
      id: 2,
      name: 'Samsung Galaxy S21 Battery',
      price: 39.99,
      quantity: 1,
      image_url: '/images/gapp/samsung-battery.jpg',
      slug: 'samsung-galaxy-s21-battery',
      discount_percentage: 10,
      discounted_price: 35.99,
      total: 35.99
    },
    {
      id: 3,
      name: 'Professional Repair Tool Kit',
      price: 129.99,
      quantity: 1,
      image_url: '/images/gapp/repair-tools.png',
      slug: 'professional-repair-tool-kit',
      discount_percentage: 0,
      total: 129.99
    }
  ],
  item_count: 4,
  subtotal: 345.96
};

export default async function handler(req, res) {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  // If in development, use mock implementation
  if (isDevelopment) {
    return handleMockRequest(req, res);
  }

  // Production implementation
  const session = await getSession({ req });
  const userId = session?.user?.id;
  const { sessionId } = req.cookies;

  // Ensure we have either a user ID or a session ID
  if (!userId && !sessionId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  switch (req.method) {
    case 'GET':
      return getCart(req, res, userId, sessionId);
    case 'POST':
      return addToCart(req, res, userId, sessionId);
    case 'PUT':
      return updateCartItem(req, res, userId, sessionId);
    case 'DELETE':
      return removeFromCart(req, res, userId, sessionId);
    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
  }
}

// Handle mock requests for development
function handleMockRequest(req, res) {
  switch (req.method) {
    case 'GET':
      return res.status(200).json({
        success: true,
        cart: mockCart
      });

    case 'POST':
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }

      // In a real app, we would add the product to the cart
      // For now, just return the mock cart
      return res.status(200).json({
        success: true,
        message: 'Product added to cart',
        cart: mockCart
      });

    case 'PUT':
      const { itemId, quantity: newQuantity } = req.body;

      if (!itemId || !newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Item ID and quantity are required'
        });
      }

      // Update the mock cart
      const updatedItems = mockCart.items.map(item => {
        if (item.id === itemId) {
          const updatedQuantity = parseInt(newQuantity);
          return {
            ...item,
            quantity: updatedQuantity,
            total: (item.discounted_price || item.price) * updatedQuantity
          };
        }
        return item;
      });

      const updatedCart = {
        ...mockCart,
        items: updatedItems,
        item_count: updatedItems.reduce((count, item) => count + item.quantity, 0),
        subtotal: updatedItems.reduce((total, item) => total + item.total, 0)
      };

      // Update the global mock cart for future requests
      mockCart.items = updatedItems;
      mockCart.item_count = updatedCart.item_count;
      mockCart.subtotal = updatedCart.subtotal;

      return res.status(200).json({
        success: true,
        message: 'Cart updated',
        cart: updatedCart
      });

    case 'DELETE':
      const { itemId: removeItemId } = req.body;

      if (!removeItemId) {
        return res.status(400).json({
          success: false,
          message: 'Item ID is required'
        });
      }

      // Remove the item from the mock cart
      const filteredItems = mockCart.items.filter(item => item.id !== removeItemId);
      const filteredCart = {
        ...mockCart,
        items: filteredItems,
        item_count: filteredItems.reduce((count, item) => count + item.quantity, 0),
        subtotal: filteredItems.reduce((total, item) => total + item.total, 0)
      };

      // Update the global mock cart for future requests
      mockCart.items = filteredItems;
      mockCart.item_count = filteredCart.item_count;
      mockCart.subtotal = filteredCart.subtotal;

      return res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        cart: filteredCart
      });

    default:
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
  }
}

// Get cart and cart items
async function getCart(req, res, userId, sessionId) {
  try {
    // Get or create cart
    let cart = await getOrCreateCart(userId, sessionId);

    // Get cart items with product details
    const cartItemsResult = await query(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price,
             p.discount_percentage, p.image_url, p.slug
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `, [cart.id]);

    // Calculate totals
    const cartItems = cartItemsResult.rows.map(item => {
      const price = parseFloat(item.price);
      const discountPercentage = parseFloat(item.discount_percentage || 0);
      const discountedPrice = discountPercentage > 0
        ? price * (1 - discountPercentage / 100)
        : price;

      return {
        ...item,
        price,
        discount_percentage: discountPercentage,
        discounted_price: parseFloat(discountedPrice.toFixed(2)),
        total: parseFloat((discountedPrice * item.quantity).toFixed(2))
      };
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);

    return res.status(200).json({
      success: true,
      cart: {
        id: cart.id,
        items: cartItems,
        item_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: parseFloat(subtotal.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting cart'
    });
  }
}

// Add item to cart
async function addToCart(req, res, userId, sessionId) {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Validate product exists
    const productResult = await query('SELECT id FROM products WHERE id = $1', [productId]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get or create cart
    const cart = await getOrCreateCart(userId, sessionId);

    // Check if product already in cart
    const existingItemResult = await query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cart.id, productId]
    );

    if (existingItemResult.rows.length > 0) {
      // Update quantity if product already in cart
      const existingItem = existingItemResult.rows[0];
      const newQuantity = existingItem.quantity + quantity;

      await query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newQuantity, existingItem.id]
      );
    } else {
      // Add new item to cart
      await query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cart.id, productId, quantity]
      );
    }

    // Return updated cart
    return getCart(req, res, userId, sessionId);
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Error adding to cart'
    });
  }
}

// Update cart item quantity
async function updateCartItem(req, res, userId, sessionId) {
  try {
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Item ID and quantity are required'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Get cart
    const cart = await getOrCreateCart(userId, sessionId);

    // Update item quantity
    const updateResult = await query(
      `UPDATE cart_items
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND cart_id = $3
       RETURNING id`,
      [quantity, itemId, cart.id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Return updated cart
    return getCart(req, res, userId, sessionId);
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating cart item'
    });
  }
}

// Remove item from cart
async function removeFromCart(req, res, userId, sessionId) {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required'
      });
    }

    // Get cart
    const cart = await getOrCreateCart(userId, sessionId);

    // Remove item from cart
    await query(
      'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2',
      [itemId, cart.id]
    );

    // Return updated cart
    return getCart(req, res, userId, sessionId);
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Error removing from cart'
    });
  }
}

// Helper function to get or create cart
async function getOrCreateCart(userId, sessionId) {
  let cartResult;

  if (userId) {
    // Try to find cart by user ID
    cartResult = await query(
      'SELECT id FROM carts WHERE user_id = $1',
      [userId]
    );

    if (cartResult.rows.length === 0) {
      // Create new cart for user
      cartResult = await query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
        [userId]
      );
    }
  } else {
    // Try to find cart by session ID
    cartResult = await query(
      'SELECT id FROM carts WHERE session_id = $1',
      [sessionId]
    );

    if (cartResult.rows.length === 0) {
      // Create new cart for session
      cartResult = await query(
        'INSERT INTO carts (session_id) VALUES ($1) RETURNING id',
        [sessionId]
      );
    }
  }

  return cartResult.rows[0];
}
