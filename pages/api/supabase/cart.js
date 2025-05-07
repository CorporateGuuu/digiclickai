import supabase from '../../../lib/supabase';

export default async function handler(req, res) {
  // Get user ID from session
  const { user } = await supabase.auth.getUser();
  
  if (!user && req.method !== 'GET') {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  const userId = user?.id;
  const sessionId = req.cookies.cart_session_id || null;
  
  if (req.method === 'GET') {
    try {
      // Get cart for authenticated user or session
      let cartQuery;
      
      if (userId) {
        cartQuery = supabase
          .from('carts')
          .select('id')
          .eq('user_id', userId)
          .single();
      } else if (sessionId) {
        cartQuery = supabase
          .from('carts')
          .select('id')
          .eq('session_id', sessionId)
          .single();
      } else {
        // No user or session, return empty cart
        return res.status(200).json({
          success: true,
          cart: {
            items: [],
            subtotal: 0,
            item_count: 0
          }
        });
      }
      
      const { data: cartData, error: cartError } = await cartQuery;
      
      if (cartError && cartError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw cartError;
      }
      
      // If no cart exists, return empty cart
      if (!cartData) {
        return res.status(200).json({
          success: true,
          cart: {
            items: [],
            subtotal: 0,
            item_count: 0
          }
        });
      }
      
      // Get cart items
      const { data: cartItems, error: itemsError } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          price_at_addition,
          products (
            id,
            name,
            slug,
            price,
            discount_percentage,
            image_url,
            stock_quantity
          )
        `)
        .eq('cart_id', cartData.id);
      
      if (itemsError) {
        throw itemsError;
      }
      
      // Format cart items
      const formattedItems = cartItems.map(item => {
        const product = item.products;
        const discountedPrice = product.discount_percentage
          ? parseFloat((product.price * (1 - product.discount_percentage / 100)).toFixed(2))
          : parseFloat(product.price);
        
        return {
          id: item.id,
          product_id: product.id,
          name: product.name,
          slug: product.slug,
          price: parseFloat(product.price),
          discount_percentage: parseFloat(product.discount_percentage || 0),
          discounted_price: discountedPrice,
          image_url: product.image_url,
          quantity: item.quantity,
          total: parseFloat((discountedPrice * item.quantity).toFixed(2))
        };
      });
      
      // Calculate subtotal
      const subtotal = formattedItems.reduce((sum, item) => sum + item.total, 0);
      const itemCount = formattedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return res.status(200).json({
        success: true,
        cart: {
          id: cartData.id,
          items: formattedItems,
          subtotal: parseFloat(subtotal.toFixed(2)),
          item_count: itemCount
        }
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching cart',
        error: error.message
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { product_id, quantity = 1 } = req.body;
      
      if (!product_id) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }
      
      // Get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, price, discount_percentage, stock_quantity')
        .eq('id', product_id)
        .single();
      
      if (productError) {
        throw productError;
      }
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      // Check stock
      if (product.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Not enough stock available'
        });
      }
      
      // Get or create cart
      let cartId;
      
      // Check if cart exists
      const { data: existingCart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq(userId ? 'user_id' : 'session_id', userId || sessionId)
        .single();
      
      if (cartError && cartError.code !== 'PGRST116') {
        throw cartError;
      }
      
      if (existingCart) {
        cartId = existingCart.id;
      } else {
        // Create new cart
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert([
            userId ? { user_id: userId } : { session_id: sessionId }
          ])
          .select('id')
          .single();
        
        if (createError) {
          throw createError;
        }
        
        cartId = newCart.id;
      }
      
      // Check if product already in cart
      const { data: existingItem, error: itemError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('product_id', product_id)
        .single();
      
      if (itemError && itemError.code !== 'PGRST116') {
        throw itemError;
      }
      
      // Calculate price
      const priceAtAddition = product.discount_percentage
        ? parseFloat((product.price * (1 - product.discount_percentage / 100)).toFixed(2))
        : parseFloat(product.price);
      
      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        
        // Check stock again
        if (product.stock_quantity < newQuantity) {
          return res.status(400).json({
            success: false,
            message: 'Not enough stock available'
          });
        }
        
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);
        
        if (updateError) {
          throw updateError;
        }
      } else {
        // Add new item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([
            {
              cart_id: cartId,
              product_id,
              quantity,
              price_at_addition: priceAtAddition
            }
          ]);
        
        if (insertError) {
          throw insertError;
        }
      }
      
      // Return updated cart
      return res.status(200).json({
        success: true,
        message: 'Product added to cart',
        cart_id: cartId
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      return res.status(500).json({
        success: false,
        message: 'Error adding to cart',
        error: error.message
      });
    }
  } else if (req.method === 'PUT') {
    try {
      const { item_id, quantity } = req.body;
      
      if (!item_id || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Item ID and quantity are required'
        });
      }
      
      // Get cart item
      const { data: cartItem, error: itemError } = await supabase
        .from('cart_items')
        .select(`
          id,
          cart_id,
          product_id,
          products (stock_quantity)
        `)
        .eq('id', item_id)
        .single();
      
      if (itemError) {
        throw itemError;
      }
      
      // Check if item belongs to user's cart
      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('id', cartItem.cart_id)
        .eq(userId ? 'user_id' : 'session_id', userId || sessionId)
        .single();
      
      if (cartError) {
        throw cartError;
      }
      
      if (!cart) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this cart item'
        });
      }
      
      // Check stock
      if (cartItem.products.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Not enough stock available'
        });
      }
      
      // Update quantity
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', item_id);
      
      if (updateError) {
        throw updateError;
      }
      
      return res.status(200).json({
        success: true,
        message: 'Cart item updated'
      });
    } catch (error) {
      console.error('Error updating cart item:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating cart item',
        error: error.message
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { item_id } = req.body;
      
      if (!item_id) {
        return res.status(400).json({
          success: false,
          message: 'Item ID is required'
        });
      }
      
      // Get cart item
      const { data: cartItem, error: itemError } = await supabase
        .from('cart_items')
        .select('id, cart_id')
        .eq('id', item_id)
        .single();
      
      if (itemError) {
        throw itemError;
      }
      
      // Check if item belongs to user's cart
      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('id', cartItem.cart_id)
        .eq(userId ? 'user_id' : 'session_id', userId || sessionId)
        .single();
      
      if (cartError) {
        throw cartError;
      }
      
      if (!cart) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this cart item'
        });
      }
      
      // Delete item
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', item_id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      return res.status(200).json({
        success: true,
        message: 'Cart item removed'
      });
    } catch (error) {
      console.error('Error removing cart item:', error);
      return res.status(500).json({
        success: false,
        message: 'Error removing cart item',
        error: error.message
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}
