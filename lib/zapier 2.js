/**
 * Zapier Integration for MDTS Tech Store
 * 
 * This file provides functions to interact with Zapier webhooks
 * for various automation tasks like order notifications, inventory updates,
 * customer management, and marketing automation.
 */

// Zapier webhook URLs (these would be set in environment variables)
const ZAPIER_WEBHOOKS = {
  newOrder: process.env.ZAPIER_WEBHOOK_NEW_ORDER,
  lowInventory: process.env.ZAPIER_WEBHOOK_LOW_INVENTORY,
  newCustomer: process.env.ZAPIER_WEBHOOK_NEW_CUSTOMER,
  abandonedCart: process.env.ZAPIER_WEBHOOK_ABANDONED_CART,
  productReview: process.env.ZAPIER_WEBHOOK_PRODUCT_REVIEW,
  supportRequest: process.env.ZAPIER_WEBHOOK_SUPPORT_REQUEST
};

/**
 * Send data to a Zapier webhook
 * @param {string} webhookUrl - The webhook URL to send data to
 * @param {object} data - The data to send
 * @returns {Promise<object>} - Response from the webhook
 */
async function sendToZapier(webhookUrl, data) {
  if (!webhookUrl) {
    console.error('Zapier webhook URL not provided');
    return { success: false, error: 'Webhook URL not provided' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending data to Zapier:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Notify Zapier about a new order
 * @param {object} orderData - Order data
 */
export async function notifyNewOrder(orderData) {
  return await sendToZapier(ZAPIER_WEBHOOKS.newOrder, {
    event: 'new_order',
    timestamp: new Date().toISOString(),
    data: orderData
  });
}

/**
 * Notify Zapier about low inventory
 * @param {object} productData - Product data
 */
export async function notifyLowInventory(productData) {
  return await sendToZapier(ZAPIER_WEBHOOKS.lowInventory, {
    event: 'low_inventory',
    timestamp: new Date().toISOString(),
    data: productData
  });
}

/**
 * Notify Zapier about a new customer
 * @param {object} customerData - Customer data
 */
export async function notifyNewCustomer(customerData) {
  return await sendToZapier(ZAPIER_WEBHOOKS.newCustomer, {
    event: 'new_customer',
    timestamp: new Date().toISOString(),
    data: customerData
  });
}

/**
 * Notify Zapier about an abandoned cart
 * @param {object} cartData - Cart data
 */
export async function notifyAbandonedCart(cartData) {
  return await sendToZapier(ZAPIER_WEBHOOKS.abandonedCart, {
    event: 'abandoned_cart',
    timestamp: new Date().toISOString(),
    data: cartData
  });
}

/**
 * Notify Zapier about a new product review
 * @param {object} reviewData - Review data
 */
export async function notifyProductReview(reviewData) {
  return await sendToZapier(ZAPIER_WEBHOOKS.productReview, {
    event: 'product_review',
    timestamp: new Date().toISOString(),
    data: reviewData
  });
}

/**
 * Notify Zapier about a new support request
 * @param {object} supportData - Support request data
 */
export async function notifySupportRequest(supportData) {
  return await sendToZapier(ZAPIER_WEBHOOKS.supportRequest, {
    event: 'support_request',
    timestamp: new Date().toISOString(),
    data: supportData
  });
}

/**
 * Generic function to send any data to a custom Zapier webhook
 * @param {string} webhookUrl - Custom webhook URL
 * @param {string} eventName - Name of the event
 * @param {object} data - Data to send
 */
export async function sendCustomEvent(webhookUrl, eventName, data) {
  return await sendToZapier(webhookUrl, {
    event: eventName,
    timestamp: new Date().toISOString(),
    data: data
  });
}

export default {
  notifyNewOrder,
  notifyLowInventory,
  notifyNewCustomer,
  notifyAbandonedCart,
  notifyProductReview,
  notifySupportRequest,
  sendCustomEvent
};
