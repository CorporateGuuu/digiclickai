const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  };

  return nodemailer.createTransporter(config);
};

// Email templates
const emailTemplates = {
  // Contact form auto-response
  contactAutoResponse: (data) => ({
    subject: 'Thank you for contacting DigiClick AI',
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #121212; color: #e0e0e0;">
        <div style="background: linear-gradient(45deg, #00d4ff, #7b2cbf); padding: 2rem; text-align: center;">
          <h1 style="color: white; margin: 0; font-family: 'Orbitron', sans-serif;">DigiClick AI</h1>
          <p style="color: white; margin: 0.5rem 0 0 0;">Transforming Business with AI</p>
        </div>
        
        <div style="padding: 2rem;">
          <h2 style="color: #00d4ff; font-family: 'Orbitron', sans-serif;">Thank You for Your Interest!</h2>
          
          <p>Dear ${data.name},</p>
          
          <p>Thank you for reaching out to DigiClick AI. We've received your inquiry about <strong>${data.service}</strong> and our team will review your message carefully.</p>
          
          <div style="background: rgba(0, 212, 255, 0.1); border-left: 4px solid #00d4ff; padding: 1rem; margin: 1.5rem 0;">
            <h3 style="color: #00d4ff; margin-top: 0;">What happens next?</h3>
            <ul style="margin: 0; padding-left: 1.5rem;">
              <li>Our AI specialists will review your requirements</li>
              <li>We'll prepare a customized solution proposal</li>
              <li>You'll receive a detailed response within 24 hours</li>
              <li>We'll schedule a consultation call if needed</li>
            </ul>
          </div>
          
          <p>In the meantime, feel free to explore our <a href="${process.env.FRONTEND_URL}/services" style="color: #00d4ff;">services</a> or check out our latest <a href="${process.env.FRONTEND_URL}/blog" style="color: #00d4ff;">AI insights</a>.</p>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="${process.env.FRONTEND_URL}/demo" style="background: linear-gradient(45deg, #00d4ff, #7b2cbf); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 50px; font-weight: 600;">Schedule a Demo</a>
          </div>
          
          <p>Best regards,<br>
          The DigiClick AI Team</p>
        </div>
        
        <div style="background: #0a0a0a; padding: 1rem; text-align: center; font-size: 0.9rem; color: #666;">
          <p>DigiClick AI | Transforming Business with AI Automation</p>
          <p>
            <a href="${process.env.FRONTEND_URL}" style="color: #00d4ff;">Website</a> | 
            <a href="${process.env.FRONTEND_URL}/contact" style="color: #00d4ff;">Contact</a> | 
            <a href="${process.env.FRONTEND_URL}/privacy" style="color: #00d4ff;">Privacy Policy</a>
          </p>
        </div>
      </div>
    `,
    text: `
      Thank you for contacting DigiClick AI!
      
      Dear ${data.name},
      
      Thank you for reaching out to DigiClick AI. We've received your inquiry about ${data.service} and our team will review your message carefully.
      
      What happens next?
      - Our AI specialists will review your requirements
      - We'll prepare a customized solution proposal  
      - You'll receive a detailed response within 24 hours
      - We'll schedule a consultation call if needed
      
      Best regards,
      The DigiClick AI Team
      
      DigiClick AI | Transforming Business with AI Automation
      Website: ${process.env.FRONTEND_URL}
    `
  }),

  // Demo confirmation
  demoConfirmation: (data) => ({
    subject: 'Demo Confirmed - DigiClick AI',
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #121212; color: #e0e0e0;">
        <div style="background: linear-gradient(45deg, #00d4ff, #7b2cbf); padding: 2rem; text-align: center;">
          <h1 style="color: white; margin: 0; font-family: 'Orbitron', sans-serif;">Demo Confirmed</h1>
        </div>
        
        <div style="padding: 2rem;">
          <h2 style="color: #00d4ff;">Your Demo is Confirmed!</h2>
          
          <p>Dear ${data.name},</p>
          
          <p>Great news! Your DigiClick AI demo has been confirmed.</p>
          
          <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid #00d4ff; padding: 1.5rem; margin: 1.5rem 0; border-radius: 8px;">
            <h3 style="color: #00d4ff; margin-top: 0;">Demo Details</h3>
            <p><strong>Date:</strong> ${new Date(data.preferredDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${data.preferredTime} ${data.timezone}</p>
            <p><strong>Duration:</strong> ${data.duration} minutes</p>
            <p><strong>Type:</strong> ${data.meetingType}</p>
            ${data.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}" style="color: #00d4ff;">${data.meetingLink}</a></p>` : ''}
          </div>
          
          <p>We'll be demonstrating solutions for: <strong>${data.serviceInterest.join(', ')}</strong></p>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="${data.meetingLink || '#'}" style="background: linear-gradient(45deg, #00d4ff, #7b2cbf); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 50px; font-weight: 600;">Join Demo</a>
          </div>
          
          <p>Looking forward to showing you how AI can transform your business!</p>
          
          <p>Best regards,<br>
          The DigiClick AI Team</p>
        </div>
      </div>
    `
  }),

  // Newsletter welcome
  newsletterWelcome: (data) => ({
    subject: 'Welcome to DigiClick AI Newsletter',
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #121212; color: #e0e0e0;">
        <div style="background: linear-gradient(45deg, #00d4ff, #7b2cbf); padding: 2rem; text-align: center;">
          <h1 style="color: white; margin: 0; font-family: 'Orbitron', sans-serif;">Welcome to DigiClick AI</h1>
          <p style="color: white; margin: 0.5rem 0 0 0;">Your AI Journey Starts Here</p>
        </div>
        
        <div style="padding: 2rem;">
          <h2 style="color: #00d4ff;">Welcome to the Future!</h2>
          
          <p>Thank you for subscribing to the DigiClick AI newsletter. You're now part of an exclusive community that stays ahead of the AI revolution.</p>
          
          <div style="background: rgba(0, 212, 255, 0.1); border-left: 4px solid #00d4ff; padding: 1rem; margin: 1.5rem 0;">
            <h3 style="color: #00d4ff; margin-top: 0;">What to expect:</h3>
            <ul style="margin: 0; padding-left: 1.5rem;">
              <li>Latest AI automation trends and insights</li>
              <li>Exclusive case studies and success stories</li>
              <li>Early access to new features and services</li>
              <li>Expert tips for business transformation</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="${process.env.FRONTEND_URL}/services" style="background: linear-gradient(45deg, #00d4ff, #7b2cbf); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 50px; font-weight: 600;">Explore Our Services</a>
          </div>
          
          <p>Ready to transform your business with AI? Let's get started!</p>
          
          <p>Best regards,<br>
          The DigiClick AI Team</p>
        </div>
        
        <div style="background: #0a0a0a; padding: 1rem; text-align: center; font-size: 0.9rem; color: #666;">
          <p>You can update your preferences or unsubscribe at any time.</p>
          <p>
            <a href="${process.env.FRONTEND_URL}/newsletter/preferences?token=${data.unsubscribeToken}" style="color: #00d4ff;">Manage Preferences</a> | 
            <a href="${process.env.FRONTEND_URL}/newsletter/unsubscribe?token=${data.unsubscribeToken}" style="color: #00d4ff;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `
  }),

  // Newsletter verification
  newsletterVerification: (data) => ({
    subject: 'Please verify your email - DigiClick AI',
    html: `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #121212; color: #e0e0e0;">
        <div style="background: linear-gradient(45deg, #00d4ff, #7b2cbf); padding: 2rem; text-align: center;">
          <h1 style="color: white; margin: 0; font-family: 'Orbitron', sans-serif;">Verify Your Email</h1>
        </div>
        
        <div style="padding: 2rem;">
          <h2 style="color: #00d4ff;">Almost there!</h2>
          
          <p>Please verify your email address to complete your subscription to the DigiClick AI newsletter.</p>
          
          <div style="text-align: center; margin: 2rem 0;">
            <a href="${process.env.FRONTEND_URL}/newsletter/verify?token=${data.verificationToken}" style="background: linear-gradient(45deg, #00d4ff, #7b2cbf); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 50px; font-weight: 600;">Verify Email</a>
          </div>
          
          <p style="font-size: 0.9rem; color: #999;">This link will expire in 24 hours. If you didn't sign up for our newsletter, you can safely ignore this email.</p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || process.env.FROM_EMAIL
    };

    const info = await transporter.sendMail(mailOptions);
    
    logger.info('Email sent successfully', {
      to: options.to,
      subject: options.subject,
      messageId: info.messageId
    });

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    logger.error('Email sending failed', {
      to: options.to,
      subject: options.subject,
      error: error.message
    });

    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Send template email
const sendTemplateEmail = async (template, to, data) => {
  try {
    if (!emailTemplates[template]) {
      throw new Error(`Email template '${template}' not found`);
    }

    const templateData = emailTemplates[template](data);
    
    return await sendEmail({
      to,
      subject: templateData.subject,
      html: templateData.html,
      text: templateData.text
    });
  } catch (error) {
    logger.error('Template email sending failed', {
      template,
      to,
      error: error.message
    });
    throw error;
  }
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('Email configuration verified successfully');
    return true;
  } catch (error) {
    logger.error('Email configuration verification failed:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendTemplateEmail,
  verifyEmailConfig,
  emailTemplates
};
