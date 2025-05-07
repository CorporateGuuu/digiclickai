import { Pool } from 'pg';
import nodemailer from 'nodemailer';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password',
  },
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { name, email, phone, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
  }

  try {
    // Store the contact message in the database
    const client = await pool.connect();
    
    try {
      await client.query(
        `INSERT INTO contact_messages (name, email, phone, subject, message, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [name, email, phone || null, subject, message]
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      // If database fails, we still try to send the email
    } finally {
      client.release();
    }

    // Send email notification
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@mdtstech.store',
        to: process.env.CONTACT_EMAIL || 'support@mdtstech.store',
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <h3>Message:</h3>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      });
      
      // Send confirmation email to the user
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@mdtstech.store',
        to: email,
        subject: 'Thank you for contacting MDTS - Midas Technical Solutions',
        html: `
          <h2>Thank you for contacting us!</h2>
          <p>Dear ${name},</p>
          <p>We have received your message regarding "${subject}" and will get back to you as soon as possible.</p>
          <p>For your records, here is a copy of your message:</p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <p>Best regards,</p>
          <p>The MDTS Team</p>
        `,
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      // If email fails but database succeeded, we still consider it a success
      // but log the error for monitoring
    }

    return res.status(200).json({ success: true, message: 'Your message has been sent successfully!' });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return res.status(500).json({ success: false, message: 'Failed to send your message. Please try again later.' });
  }
}
