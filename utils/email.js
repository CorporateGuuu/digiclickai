const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER || 'your_mailtrap_user',
    pass: process.env.EMAIL_PASS || 'your_mailtrap_password'
  }
});

// Load email template
const loadTemplate = (templateName) => {
  const templatePath = path.join(__dirname, '../views/emails', `${templateName}.html`);
  try {
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`Error loading email template ${templateName}:`, error);
    return null;
  }
};

// Replace placeholders in template
const replacePlaceholders = (template, replacements) => {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
};

// Send order confirmation email
const sendOrderConfirmation = async (order, user, items) => {
  try {
    // Load template
    let template = loadTemplate('order-confirmation');
    
    if (!template) {
      throw new Error('Order confirmation template not found');
    }
    
    // Format items for email
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${parseFloat(item.price).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${parseFloat(item.total_price).toFixed(2)}</td>
      </tr>
    `).join('');
    
    // Format date
    const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Replace placeholders
    const replacements = {
      customerName: `${user.first_name} ${user.last_name}`,
      orderNumber: order.order_number,
      orderDate: orderDate,
      orderItems: itemsHtml,
      orderTotal: parseFloat(order.total_amount).toFixed(2),
      shippingAddress: order.shipping_address || 'Not provided',
      paymentMethod: order.payment_method || 'Credit Card'
    };
    
    const htmlContent = replacePlaceholders(template, replacements);
    
    // Send email
    const info = await transporter.sendMail({
      from: '"Phone Electronics Store" <noreply@phoneelectronicsstore.com>',
      to: user.email,
      subject: `Order Confirmation #${order.order_number}`,
      html: htmlContent
    });
    
    // // // console.log('Order confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

// Send shipping update email
const sendShippingUpdate = async (order, user, trackingNumber, carrier) => {
  try {
    // Load template
    let template = loadTemplate('shipping-update');
    
    if (!template) {
      throw new Error('Shipping update template not found');
    }
    
    // Replace placeholders
    const replacements = {
      customerName: `${user.first_name} ${user.last_name}`,
      orderNumber: order.order_number,
      trackingNumber: trackingNumber,
      carrier: carrier,
      trackingUrl: `https://example.com/track?number=${trackingNumber}&carrier=${encodeURIComponent(carrier)}`
    };
    
    const htmlContent = replacePlaceholders(template, replacements);
    
    // Send email
    const info = await transporter.sendMail({
      from: '"Phone Electronics Store" <noreply@phoneelectronicsstore.com>',
      to: user.email,
      subject: `Your Order #${order.order_number} Has Shipped`,
      html: htmlContent
    });
    
    // // // console.log('Shipping update email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending shipping update email:', error);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    // Load template
    let template = loadTemplate('welcome');
    
    if (!template) {
      throw new Error('Welcome template not found');
    }
    
    // Replace placeholders
    const replacements = {
      customerName: user.first_name,
      loginUrl: 'http://localhost:3000/login'
    };
    
    const htmlContent = replacePlaceholders(template, replacements);
    
    // Send email
    const info = await transporter.sendMail({
      from: '"Phone Electronics Store" <noreply@phoneelectronicsstore.com>',
      to: user.email,
      subject: 'Welcome to Phone Electronics Store',
      html: htmlContent
    });
    
    // // // console.log('Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

module.exports = {
  sendOrderConfirmation,
  sendShippingUpdate,
  sendWelcomeEmail
};
