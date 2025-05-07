import { createOrder, upsertCustomer } from '../../../lib/notion';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { action } = req.query;

  // Create a new order in Notion
  if (action === 'create') {
    const orderData = req.body;

    if (!orderData.orderNumber || !orderData.totalAmount || !orderData.items || !orderData.customerName || !orderData.email) {
      return res.status(400).json({
        success: false,
        message: 'Order number, total amount, items, customer name, and email are required'
      });
    }

    const { data, error } = await createOrder(orderData);

    if (error) {
      return res.status(500).json({ success: false, message: error });
    }

    // Also update or create the customer record
    const customerInfo = {
      name: orderData.customerName,
      email: orderData.email,
      phone: orderData.phone || '',
      totalOrders: 1, // This is a new order
      totalSpent: orderData.totalAmount
    };

    const { error: customerError } = await upsertCustomer(customerInfo);

    if (customerError) {
      console.error('Error updating customer in Notion:', customerError);
      // Continue with the order creation response even if customer update fails
    }

    return res.status(201).json({
      success: true,
      id: data.id,
      message: 'Order created successfully in Notion'
    });
  }

  // Invalid action
  return res.status(400).json({ success: false, message: 'Invalid action' });
}
