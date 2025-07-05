const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { csrfProtection, loginLimiter, registerLimiter } = require('../middleware/security');
const { sendWelcomeEmail } = require('../utils/email');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store',
  ssl: false,
});

// Login page
router.get('/login', csrfProtection, (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    error: req.query.error,
    csrfToken: req.csrfToken()
  });
});

// Handle login
router.post('/login', loginLimiter, csrfProtection, async (req, res) => {
  try {
    const { email, password, remember } = req.body;

    // Find user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.redirect('/login?error=Invalid email or password');
    }

    const user = result.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.redirect('/login?error=Invalid email or password');
    }

    // Set session
    req.session.userId = user.id;
    req.session.isAdmin = user.is_admin;

    // Set JWT token if remember me is checked
    if (remember) {
      const token = jwt.sign(
        { id: user.id, email: user.email, isAdmin: user.is_admin },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict'
      });
    }

    // Redirect based on user role
    if (user.is_admin) {
      res.redirect('/admin/dashboard');
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/login?error=An error occurred during login');
  }
});

// Register page
router.get('/register', csrfProtection, (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    error: req.query.error,
    csrfToken: req.csrfToken()
  });
});

// Handle registration
router.post('/register', registerLimiter, csrfProtection, async (req, res) => {
  try {
    const { email, password, confirm_password, first_name, last_name, phone } = req.body;

    // Validate input
    if (password !== confirm_password) {
      return res.redirect('/register?error=Passwords do not match');
    }

    // Check if email already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      return res.redirect('/register?error=Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, is_admin)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id`,
      [email, hashedPassword, first_name, last_name, phone]
    );

    const userId = result.rows[0].id;

    // Set session
    req.session.userId = userId;
    req.session.isAdmin = false;

    // Create cart for new user
    await pool.query(
      'INSERT INTO carts (user_id) VALUES ($1)',
      [userId]
    );

    // Send welcome email
    const user = {
      email,
      first_name,
      last_name
    };

    sendWelcomeEmail(user)
      .catch(err => console.error('Error sending welcome email:', err));

    res.redirect('/');
  } catch (error) {
    console.error('Registration error:', error);
    res.redirect('/register?error=An error occurred during registration');
  }
});

// Logout
router.get('/logout', (req, res) => {
  // Clear session
  req.session.destroy();

  // Clear JWT token
  res.clearCookie('token');

  res.redirect('/');
});

module.exports = router;
