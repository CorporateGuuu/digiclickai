import zapier from '../../../lib/zapier';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { event } = req.query;

  // Handle different event types
  switch (event) {
    case 'new_order':
      const orderData = req.body;
      
      if (!orderData.orderNumber || !orderData.totalAmount || !orderData.items || !orderData.customerName || !orderData.email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Order number, total amount, items, customer name, and email are required' 
        });
      }
      
      const { success: orderSuccess, error: orderError } = await zapier.notifyNewOrder(orderData);
      
      if (!orderSuccess) {
        return res.status(500).json({ success: false, message: orderError });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Order notification sent to Zapier successfully' 
      });

    case 'low_inventory':
      const productData = req.body;
      
      if (!productData.id || !productData.name || productData.quantity === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: 'Product ID, name, and quantity are required' 
        });
      }
      
      const { success: inventorySuccess, error: inventoryError } = await zapier.notifyLowInventory(productData);
      
      if (!inventorySuccess) {
        return res.status(500).json({ success: false, message: inventoryError });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Low inventory notification sent to Zapier successfully' 
      });

    case 'new_customer':
      const customerData = req.body;
      
      if (!customerData.name || !customerData.email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Customer name and email are required' 
        });
      }
      
      const { success: customerSuccess, error: customerError } = await zapier.notifyNewCustomer(customerData);
      
      if (!customerSuccess) {
        return res.status(500).json({ success: false, message: customerError });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'New customer notification sent to Zapier successfully' 
      });

    case 'abandoned_cart':
      const cartData = req.body;
      
      if (!cartData.email || !cartData.items || !cartData.totalAmount) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email, items, and total amount are required' 
        });
      }
      
      const { success: cartSuccess, error: cartError } = await zapier.notifyAbandonedCart(cartData);
      
      if (!cartSuccess) {
        return res.status(500).json({ success: false, message: cartError });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Abandoned cart notification sent to Zapier successfully' 
      });

    case 'product_review':
      const reviewData = req.body;
      
      if (!reviewData.productId || !reviewData.productName || !reviewData.rating || !reviewData.reviewText || !reviewData.customerName) {
        return res.status(400).json({ 
          success: false, 
          message: 'Product ID, product name, rating, review text, and customer name are required' 
        });
      }
      
      const { success: reviewSuccess, error: reviewError } = await zapier.notifyProductReview(reviewData);
      
      if (!reviewSuccess) {
        return res.status(500).json({ success: false, message: reviewError });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Product review notification sent to Zapier successfully' 
      });

    case 'support_request':
      const supportData = req.body;
      
      if (!supportData.name || !supportData.email || !supportData.subject || !supportData.message) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name, email, subject, and message are required' 
        });
      }
      
      const { success: supportSuccess, error: supportError } = await zapier.notifySupportRequest(supportData);
      
      if (!supportSuccess) {
        return res.status(500).json({ success: false, message: supportError });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Support request notification sent to Zapier successfully' 
      });

    case 'custom':
      const { webhookUrl, eventName, data } = req.body;
      
      if (!webhookUrl || !eventName || !data) {
        return res.status(400).json({ 
          success: false, 
          message: 'Webhook URL, event name, and data are required' 
        });
      }
      
      const { success: customSuccess, error: customError } = await zapier.sendCustomEvent(webhookUrl, eventName, data);
      
      if (!customSuccess) {
        return res.status(500).json({ success: false, message: customError });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: 'Custom event sent to Zapier successfully' 
      });

    default:
      return res.status(400).json({ success: false, message: 'Invalid event type' });
  }
}
