import { pool } from './db';

// Process a message and generate a response
export async function processMessage(message, conversationId, userId) {
  try {
    // Get conversation history
    const history = await getConversationHistory(conversationId);

    // Get user information if available
    const userInfo = await getUserInfo(userId);

    // Determine the intent of the message
    const intent = await determineIntent(message);

    // Generate a response based on the intent
    let response;

    switch (intent) {
      case 'product_inquiry':
        response = await handleProductInquiry(message, history);
        break;
      case 'order_status':
        response = await handleOrderStatus(message, userInfo);
        break;
      case 'return_request':
        response = await handleReturnRequest(message, userInfo);
        break;
      case 'technical_support':
        response = await handleTechnicalSupport(message, history);
        break;
      case 'shipping_info':
        response = await handleShippingInfo(message);
        break;
      case 'pricing_info':
        response = await handlePricingInfo(message);
        break;
      case 'contact_human':
        response = await handleContactHuman();
        break;
      case 'greeting':
        response = await handleGreeting(userInfo);
        break;
      case 'thanks':
        response = await handleThanks();
        break;
      default:
        response = await handleGeneral(message, history);
    }

    // Log the interaction for analytics
    await logInteraction(conversationId, message, response, intent);

    return response;
  } catch (error) {
    console.error('Error processing message:', error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again or contact our support team at support@mdtstech.store if you need immediate assistance.";
  }
}

// Get conversation history
async function getConversationHistory(conversationId) {
  try {
    const query = `
      SELECT role, content, created_at
      FROM chatbot_messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      LIMIT 20
    `;

    const { rows } = await pool.query(query, [conversationId]);
    return rows;
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
}

// Get user information
async function getUserInfo(userId) {
  if (userId === 'anonymous') {
    return null;
  }

  try {
    const query = `
      SELECT u.name, u.email,
        (SELECT COUNT(*) FROM orders WHERE user_id = $1) as order_count,
        (SELECT MAX(created_at) FROM orders WHERE user_id = $1) as last_order_date
      FROM users u
      WHERE u.id = $1
    `;

    const { rows } = await pool.query(query, [userId]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}

// Determine the intent of a message
async function determineIntent(message) {
  // Convert message to lowercase for easier matching
  const lowerMessage = message.toLowerCase();

  // Define keywords for different intents
  const intents = {
    product_inquiry: ['product', 'item', 'device', 'phone', 'screen', 'battery', 'compatible', 'work with', 'specs', 'specifications', 'details', 'features'],
    order_status: ['order', 'status', 'tracking', 'shipped', 'delivery', 'package', 'arrive', 'when will', 'my order'],
    return_request: ['return', 'refund', 'exchange', 'broken', 'damaged', 'wrong', 'not working', 'defective', 'send back'],
    technical_support: ['help', 'support', 'issue', 'problem', 'not working', 'how to', 'instructions', 'guide', 'fix', 'repair'],
    shipping_info: ['shipping', 'delivery', 'ship to', 'shipping cost', 'shipping time', 'how long', 'international', 'domestic'],
    pricing_info: ['price', 'cost', 'discount', 'coupon', 'promo', 'sale', 'offer', 'deal', 'how much'],
    contact_human: ['human', 'agent', 'person', 'representative', 'real person', 'speak to someone', 'talk to someone', 'customer service'],
    greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings'],
    thanks: ['thank', 'thanks', 'appreciate', 'grateful', 'awesome', 'great', 'excellent']
  };

  // Check for each intent
  for (const [intent, keywords] of Object.entries(intents)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        return intent;
      }
    }
  }

  // Default intent
  return 'general';
}

// Handle product inquiry
async function handleProductInquiry(message, history) {
  try {
    // Extract product information from the message
    const productKeywords = extractProductKeywords(message);

    if (productKeywords.length === 0) {
      return "I'd be happy to help you with product information. Could you please specify which product you're interested in?";
    }

    // Search for products matching the keywords
    const products = await searchProducts(productKeywords);

    if (products.length === 0) {
      return `I couldn't find any products matching "${productKeywords.join(', ')}". Could you please try different keywords or browse our product categories at mdtstech.store/products?`;
    }

    // Format product information with better structure
    let response = "Here's what I found based on your inquiry:\n\n";

    products.slice(0, 3).forEach((product, index) => {
      response += `${index + 1}. ${product.name}\n`;
      response += `   Price: $${product.price.toFixed(2)}\n`;
      response += `   Category: ${product.category_name}\n`;
      response += `   Description: ${product.description.substring(0, 100)}...\n`;
      response += `   View details: mdtstech.store/products/${product.slug}\n\n`;
    });

    if (products.length > 3) {
      response += `I found ${products.length} products matching your search. View all results at mdtstech.store/search?q=${encodeURIComponent(productKeywords.join(' '))}`;
    }

    return response;
  } catch (error) {
    console.error('Error handling product inquiry:', error);
    return "I'm having trouble finding product information right now. Please try browsing our products directly at mdtstech.store/products or contact our support team for assistance.";
  }
}

// Extract product keywords from a message
function extractProductKeywords(message) {
  // Convert message to lowercase
  const lowerMessage = message.toLowerCase();

  // Define common product categories and terms
  const productTerms = [
    'iphone', 'samsung', 'galaxy', 'ipad', 'macbook', 'screen', 'battery',
    'repair', 'tool', 'kit', 'replacement', 'part', 'lcd', 'display', 'digitizer'
  ];

  // Extract matching terms
  const keywords = [];

  for (const term of productTerms) {
    if (lowerMessage.includes(term)) {
      keywords.push(term);
    }
  }

  return keywords;
}

// Search for products matching keywords
async function searchProducts(keywords) {
  try {
    // Build a query to search for products
    const query = `
      SELECT id, name, slug, price, description, category_name, image_url
      FROM products
      WHERE
        ${keywords.map((_, index) => `name ILIKE $${index + 1} OR description ILIKE $${index + 1}`).join(' OR ')}
      LIMIT 10
    `;

    const params = keywords.map(keyword => `%${keyword}%`);

    const { rows } = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error searching products:', error);

    // Return mock products for demo purposes
    return [
      {
        id: 1,
        name: 'iPhone 13 Pro OLED Screen',
        slug: 'iphone-13-pro-oled-screen',
        price: 129.99,
        description: 'Original quality replacement OLED screen for iPhone 13 Pro. Includes digitizer and assembly.',
        category_name: 'iPhone Parts',
        image_url: '/images/products/iphone-screen.jpg'
      },
      {
        id: 5,
        name: 'iPhone 12 Battery Replacement Kit',
        slug: 'iphone-12-battery-replacement-kit',
        price: 49.99,
        description: 'Complete battery replacement kit for iPhone 12. Includes battery, tools, and adhesive strips.',
        category_name: 'iPhone Parts',
        image_url: '/images/products/iphone-battery.jpg'
      },
      {
        id: 3,
        name: 'Professional Repair Tool Kit',
        slug: 'professional-repair-tool-kit',
        price: 89.99,
        description: 'Professional-grade repair toolkit for mobile devices. Includes precision screwdrivers, pry tools, and more.',
        category_name: 'Repair Tools',
        image_url: '/images/products/repair-tools.jpg'
      }
    ];
  }
}

// Handle order status inquiry
async function handleOrderStatus(message, userInfo) {
  try {
    // Extract order number if present
    const orderNumber = extractOrderNumber(message);

    // If user is logged in, check their recent orders
    if (userInfo) {
      if (orderNumber) {
        // Check specific order
        const order = await getOrderDetails(orderNumber, userInfo.id);

        if (order) {
          return formatOrderStatus(order);
        } else {
          return `I couldn't find order #${orderNumber} associated with your account. Please check the order number and try again, or contact our support team at support@mdtstech.store for assistance.`;
        }
      } else {
        // Check recent orders
        const recentOrders = await getRecentOrders(userInfo.id);

        if (recentOrders.length > 0) {
          let response = "Here are your recent orders:\n\n";

          recentOrders.forEach((order, index) => {
            response += formatOrderSummary(order, index + 1);
          });

          response += "\nYou can view all your orders at mdtstech.store/account/orders";

          return response;
        } else {
          return "I don't see any recent orders associated with your account. If you've placed an order and believe this is an error, please contact our support team at support@mdtstech.store.";
        }
      }
    } else {
      // User is not logged in
      if (orderNumber) {
        return `To check the status of order #${orderNumber}, please visit mdtstech.store/order-lookup and enter your order number and email address. Alternatively, you can sign in to your account to view all your orders.`;
      } else {
        return "To check your order status, please sign in to your account at mdtstech.store/account/orders. If you checked out as a guest, you can look up your order at mdtstech.store/order-lookup using your order number and email address.";
      }
    }
  } catch (error) {
    console.error('Error handling order status:', error);
    return "I'm having trouble retrieving order information right now. Please try checking your order status at mdtstech.store/account/orders or contact our support team for assistance.";
  }
}

// Extract order number from message
function extractOrderNumber(message) {
  // Look for patterns like "order #12345" or "order number 12345"
  const orderNumberRegex = /order\s*#?(\d+)|order\s*number\s*(\d+)|#(\d+)/i;
  const match = message.match(orderNumberRegex);

  if (match) {
    // Return the first captured group that has a value
    return match[1] || match[2] || match[3];
  }

  return null;
}

// Get order details
async function getOrderDetails(orderNumber, userId) {
  try {
    const query = `
      SELECT o.id, o.order_number, o.status, o.created_at, o.total_amount,
        o.shipping_address, o.shipping_method, o.tracking_number,
        json_agg(json_build_object(
          'product_id', oi.product_id,
          'product_name', oi.product_name,
          'quantity', oi.quantity,
          'price', oi.price
        )) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.order_number = $1 AND o.user_id = $2
      GROUP BY o.id
    `;

    const { rows } = await pool.query(query, [orderNumber, userId]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error getting order details:', error);

    // Return mock order for demo purposes
    return {
      id: 1,
      order_number: orderNumber,
      status: 'shipped',
      created_at: '2023-06-15T10:30:00Z',
      total_amount: 169.98,
      shipping_address: '123 Main St, Vienna, VA 22182',
      shipping_method: 'Standard Shipping',
      tracking_number: 'USPS12345678901',
      items: [
        {
          product_id: 1,
          product_name: 'iPhone 13 Pro OLED Screen',
          quantity: 1,
          price: 129.99
        },
        {
          product_id: 8,
          product_name: 'Precision Screwdriver Set',
          quantity: 1,
          price: 29.99
        }
      ]
    };
  }
}

// Get recent orders
async function getRecentOrders(userId) {
  try {
    const query = `
      SELECT o.id, o.order_number, o.status, o.created_at, o.total_amount
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
      LIMIT 3
    `;

    const { rows } = await pool.query(query, [userId]);
    return rows;
  } catch (error) {
    console.error('Error getting recent orders:', error);

    // Return mock orders for demo purposes
    return [
      {
        id: 1,
        order_number: '10001',
        status: 'shipped',
        created_at: '2023-06-15T10:30:00Z',
        total_amount: 169.98
      },
      {
        id: 2,
        order_number: '10002',
        status: 'delivered',
        created_at: '2023-05-20T14:45:00Z',
        total_amount: 89.99
      }
    ];
  }
}

// Format order status
function formatOrderStatus(order) {
  let response = `Order #${order.order_number} placed on ${new Date(order.created_at).toLocaleDateString()} is currently ${order.status.toUpperCase()}.\n\n`;

  // Add shipping information if available
  if (order.status === 'shipped' && order.tracking_number) {
    response += `Your order was shipped via ${order.shipping_method} with tracking number ${order.tracking_number}.\n`;
    response += `You can track your package at mdtstech.store/track?number=${order.tracking_number}\n\n`;
  } else if (order.status === 'processing') {
    response += "Your order is being processed and will ship soon. You'll receive an email with tracking information once it ships.\n\n";
  } else if (order.status === 'delivered') {
    response += `Your order was delivered on ${new Date(order.delivered_at || order.updated_at).toLocaleDateString()}.\n\n`;
  }

  // Add order items with better formatting
  response += "# Order Items\n";
  order.items.forEach(item => {
    response += `- ${item.quantity}x ${item.product_name} ($${item.price.toFixed(2)})\n`;
  });

  response += `\n# Order Summary\n`;
  response += `- Total: $${order.total_amount.toFixed(2)}\n`;
  response += `- Status: ${order.status.toUpperCase()}\n`;
  if (order.tracking_number) {
    response += `- Tracking: ${order.tracking_number}\n`;
  }

  response += "\nYou can view complete order details at mdtstech.store/account/orders";

  return response;
}

// Format order summary
function formatOrderSummary(order, index) {
  return `${index}. Order #${order.order_number} - ${new Date(order.created_at).toLocaleDateString()}\n` +
    `   Status: ${order.status.toUpperCase()}\n` +
    `   Total: $${order.total_amount.toFixed(2)}\n\n`;
}

// Handle return request
async function handleReturnRequest(message, userInfo) {
  // Return policy information
  const returnPolicy = "Our return policy allows returns within 30 days of delivery for most items. Items must be in original condition with all packaging and accessories.";

  // Check if user is logged in
  if (userInfo) {
    return `${returnPolicy}\n\nTo initiate a return for an order, please visit mdtstech.store/account/orders and select the order you wish to return. Then click the "Return Items" button and follow the instructions.\n\nIf you have any issues with the return process, please contact our support team at support@mdtstech.store or call us at +1 (240) 351-0511.`;
  } else {
    return `${returnPolicy}\n\nTo initiate a return, please sign in to your account at mdtstech.store/account/orders. If you checked out as a guest, you can start a return at mdtstech.store/returns using your order number and email address.\n\nIf you need further assistance, please contact our support team at support@mdtstech.store or call us at +1 (240) 351-0511.`;
  }
}

// Handle technical support
async function handleTechnicalSupport(message, history) {
  // Extract technical issue keywords
  const issueKeywords = extractTechnicalIssueKeywords(message);

  if (issueKeywords.length === 0) {
    return "I'd be happy to help with technical support. Could you please provide more details about the issue you're experiencing?";
  }

  // Search for relevant support articles
  const supportArticles = await searchSupportArticles(issueKeywords);

  if (supportArticles.length === 0) {
    return "I don't have specific information about that issue. For technical support, please visit our support center at mdtstech.store/support or contact our technical team at support@mdtstech.store.";
  }

  // Format support information with better structure
  let response = "# Technical Support Resources\n\n";

  supportArticles.forEach((article, index) => {
    response += `## ${index + 1}. ${article.title}\n`;
    response += `${article.summary}\n\n`;
    response += `Read more: mdtstech.store/support/articles/${article.slug}\n\n`;
  });

  response += "# Need More Help?\n";
  response += "If these resources don't solve your issue, please contact our technical support team:\n";
  response += "- Email: support@mdtstech.store\n";
  response += "- Phone: +1 (240) 351-0511\n";
  response += "- Hours: Monday-Friday, 9AM-10PM EST";

  return response;
}

// Extract technical issue keywords
function extractTechnicalIssueKeywords(message) {
  // Convert message to lowercase
  const lowerMessage = message.toLowerCase();

  // Define common technical issue terms
  const issueTerms = [
    'not working', 'broken', 'cracked', 'damaged', 'won\'t turn on', 'won\'t charge',
    'battery', 'screen', 'display', 'touch', 'button', 'speaker', 'microphone',
    'camera', 'wifi', 'bluetooth', 'signal', 'water', 'dropped', 'repair', 'replace'
  ];

  // Extract matching terms
  const keywords = [];

  for (const term of issueTerms) {
    if (lowerMessage.includes(term)) {
      keywords.push(term);
    }
  }

  return keywords;
}

// Search for support articles
async function searchSupportArticles(keywords) {
  try {
    // Build a query to search for support articles
    const query = `
      SELECT id, title, slug, summary, content
      FROM support_articles
      WHERE
        ${keywords.map((_, index) => `title ILIKE $${index + 1} OR content ILIKE $${index + 1}`).join(' OR ')}
      LIMIT 3
    `;

    const params = keywords.map(keyword => `%${keyword}%`);

    const { rows } = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error searching support articles:', error);

    // Return mock support articles for demo purposes
    return [
      {
        id: 1,
        title: 'How to Replace an iPhone Screen',
        slug: 'how-to-replace-iphone-screen',
        summary: 'Step-by-step guide for replacing your iPhone screen at home.',
        content: 'Detailed instructions for iPhone screen replacement...'
      },
      {
        id: 2,
        title: 'Troubleshooting iPhone Battery Issues',
        slug: 'troubleshooting-iphone-battery-issues',
        summary: 'Common battery problems and how to fix them.',
        content: 'Detailed troubleshooting steps for iPhone battery issues...'
      },
      {
        id: 3,
        title: 'Water Damage Repair Guide',
        slug: 'water-damage-repair-guide',
        summary: 'What to do if your device has water damage.',
        content: 'Detailed steps for handling water damaged devices...'
      }
    ];
  }
}

// Handle shipping information
async function handleShippingInfo(message) {
  // Extract shipping-related keywords
  const shippingKeywords = extractShippingKeywords(message);

  // Updated shipping information
  const standardShipping = "Standard Shipping (3-5 business days): Free for orders over $1000, $4.99 for orders under $1000.";
  const expressShipping = "Express Shipping (1-2 business days): $12.99";
  const internationalShipping = "International Shipping (7-14 business days): Starting at $19.99, varies by country.";

  // Check for international shipping inquiry
  if (shippingKeywords.includes('international')) {
    return `${internationalShipping}\n\nWe ship to most countries worldwide. Delivery times may vary based on customs processing. Import duties and taxes may apply and are the responsibility of the recipient.\n\nFor specific international shipping rates to your country, please visit mdtstech.store/shipping or contact our support team.`;
  }

  // Check for expedited shipping inquiry
  if (shippingKeywords.some(keyword => ['express', 'expedited', 'fast', 'quick', 'overnight'].includes(keyword))) {
    return `${expressShipping}\n\nExpress orders placed before 2 PM EST Monday-Friday will ship the same day. Orders placed after 2 PM EST or on weekends will ship the next business day.\n\nFor overnight or priority overnight options, please call our customer service at +1 (240) 351-0511.`;
  }

  // Check for free shipping inquiry
  if (shippingKeywords.some(keyword => ['free'].includes(keyword))) {
    return "Yes, we offer free shipping on all orders over $1000. For orders under $1000, standard shipping costs $4.99.";
  }

  // General shipping information with better formatting
  return `# Shipping Options\n\n` +
    `## Standard Shipping\n` +
    `${standardShipping}\n\n` +
    `## Express Shipping\n` +
    `${expressShipping}\n\n` +
    `## International Shipping\n` +
    `${internationalShipping}\n\n` +
    `# Additional Information\n` +
    `- All orders are processed within 1 business day\n` +
    `- Tracking information will be emailed once your order ships\n` +
    `- Free shipping on orders over $1000\n\n` +
    `For more details, please visit mdtstech.store/shipping.`;
}

// Extract shipping keywords
function extractShippingKeywords(message) {
  // Convert message to lowercase
  const lowerMessage = message.toLowerCase();

  // Define common shipping terms
  const shippingTerms = [
    'shipping', 'delivery', 'ship', 'deliver', 'send', 'receive',
    'international', 'domestic', 'express', 'expedited', 'standard',
    'fast', 'quick', 'overnight', 'time', 'days', 'cost', 'free'
  ];

  // Extract matching terms
  const keywords = [];

  for (const term of shippingTerms) {
    if (lowerMessage.includes(term)) {
      keywords.push(term);
    }
  }

  return keywords;
}

// Handle pricing information
async function handlePricingInfo(message) {
  // Extract product keywords for pricing
  const productKeywords = extractProductKeywords(message);

  if (productKeywords.length === 0) {
    return "I'd be happy to provide pricing information. Could you please specify which product you're interested in?";
  }

  // Search for products matching the keywords
  const products = await searchProducts(productKeywords);

  if (products.length === 0) {
    return `I couldn't find any products matching "${productKeywords.join(', ')}" to provide pricing for. Could you please try different keywords or browse our products at mdtstech.store/products?`;
  }

  // Format pricing information with better structure
  let response = "# Pricing Information\n\n";

  products.slice(0, 5).forEach((product, index) => {
    response += `## ${product.name}\n`;
    response += `- Current price: $${product.price.toFixed(2)}\n`;
    if (product.discount_percentage) {
      response += `- Original price: $${(product.price / (1 - product.discount_percentage / 100)).toFixed(2)}\n`;
      response += `- Discount: ${product.discount_percentage}% off\n`;
    }
    response += `- Category: ${product.category_name}\n`;
    response += `- Link: mdtstech.store/products/${product.slug}\n\n`;
  });

  response += "# Additional Information\n";
  response += "- All prices are in USD and subject to change\n";
  response += "- Shipping and taxes may apply\n";
  response += "- We offer volume discounts for bulk orders\n\n";
  response += "For special pricing, please contact our sales team at sales@mdtstech.store.";

  return response;
}

// Handle contact human request
async function handleContactHuman() {
  return "# Contact Customer Service\n\nI understand you'd like to speak with a human representative. Our customer service team is available Monday-Friday from 9 AM to 10 PM EST.\n\n## Contact Options\n\n- Phone: +1 (240) 351-0511\n- Email: support@mdtstech.store\n- Live Chat: Available on our website during business hours\n- Address: Vienna, VA 22182\n\n## Tips for Faster Service\n\n- Please have your order number ready if your inquiry is related to a specific order\n- For technical support, please describe your device and issue in detail\n- For returns, please have your order number and reason for return ready\n\nA customer service representative will assist you as soon as possible.";
}

// Handle greeting
async function handleGreeting(userInfo) {
  const timeOfDay = getTimeOfDay();

  if (userInfo) {
    return `Good ${timeOfDay}, ${userInfo.name}! Welcome back to MDTS. How can I assist you today?`;
  } else {
    return `Good ${timeOfDay}! Welcome to MDTS. I'm your virtual assistant. How can I help you today?`;
  }
}

// Get time of day for greeting
function getTimeOfDay() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'morning';
  } else if (hour < 18) {
    return 'afternoon';
  } else {
    return 'evening';
  }
}

// Handle thanks
async function handleThanks() {
  const responses = [
    "You're welcome! Is there anything else I can help you with?",
    "Happy to help! Do you have any other questions?",
    "My pleasure! Is there anything else you'd like to know?",
    "Glad I could assist. Is there anything else you need help with?",
    "You're very welcome! Feel free to ask if you need anything else."
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

// Handle general inquiries
async function handleGeneral(message, history) {
  // Check for common questions
  const lowerMessage = message.toLowerCase();

  // FAQ responses
  const faqs = {
    'warranty': "We offer a 90-day warranty on all parts and a 30-day warranty on accessories. For warranty claims, please email warranty@mdtstech.store with your order number and a description of the issue.",
    'business hours': "Our customer service team is available Monday-Friday from 9 AM to 10 PM EST. Our physical location in Vienna, VA is open Monday-Friday from 10 AM to 7 PM EST.",
    'contact': "You can reach our customer service team at +1 (240) 351-0511 or by email at support@mdtstech.store. Our address is Vienna, VA 22182.",
    'payment': "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, and Google Pay. For business orders, we also accept purchase orders and bank transfers.",
    'repair service': "Yes, we offer repair services for iPhones, iPads, Samsung devices, and MacBooks. You can schedule a repair at mdtstech.store/repair-services or call us at +1 (240) 351-0511.",
    'cryptocurrency': "Yes, we accept Bitcoin and several other cryptocurrencies as payment methods.",
    'apple parts': "Our Genuine Apple Parts Program (GAPP) provides access to authentic Apple parts for repairs. These parts are sourced directly from Apple and come with full warranty support. Visit mdtstech.store/gapp for more information.",
    'lcd buyback': "Our LCD Buyback Program allows you to sell your old LCD screens to us for cash. We accept screens from iPhones, Samsung phones, iPads, and other devices in various conditions. Visit mdtstech.store/lcd-buyback for more information.",
    'iphone parts': "Yes, we sell a wide range of iPhone parts including screens, batteries, cameras, and other components for all iPhone models.",
    'samsung parts': "Yes, we carry Samsung parts including screens, batteries, and other components for Galaxy S and Note series phones.",
    'repair tools': "Yes, we offer professional repair tools including precision screwdriver sets, pry tools, heat guns, and complete repair kits.",
    'return policy': "Our return policy allows returns within 30 days of delivery for most items. Items must be in original condition with all packaging and accessories."
  };

  // Check if message matches any FAQ
  for (const [keyword, response] of Object.entries(faqs)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }

  // If no specific match, provide a general response
  return "I'm here to help with product information, order status, returns, technical support, and more. Could you please provide more details about what you're looking for?";
}

// Log interaction for analytics
async function logInteraction(conversationId, userMessage, botResponse, intent) {
  try {
    const query = `
      INSERT INTO chatbot_analytics (
        conversation_id,
        user_message,
        bot_response,
        intent,
        timestamp
      )
      VALUES ($1, $2, $3, $4, $5)
    `;

    await pool.query(query, [
      conversationId,
      userMessage,
      botResponse,
      intent,
      new Date()
    ]);
  } catch (error) {
    console.error('Error logging interaction:', error);
    // Continue even if logging fails
  }
}
