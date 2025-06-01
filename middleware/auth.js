const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mdtstech_store',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// In production, we should never use a fallback secret
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is not set in production!');
  process.exit(1);
}

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  // Check if user is authenticated via session
  if (req.session && req.session.userId) {
    return next();
  }

  // Check if user is authenticated via JWT token
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.redirect('/login');
  }
};

// Middleware to check if user is an admin
const isAdmin = async (req, res, next) => {
  // First check if user is authenticated
  if (!req.session || !req.session.userId) {
    // Check if user is authenticated via JWT token
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.redirect('/login');
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      return res.redirect('/login');
    }
  }

  // Get user ID from session or JWT token
  const userId = req.session?.userId || req.user?.id;

  if (!userId) {
    return res.redirect('/login');
  }

  try {
    // Check if user is an admin
    const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      return res.status(403).render('403', {
        message: 'Access denied. You do not have permission to access this page.'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).send('Server error');
  }
};

module.exports = {
  isAuthenticated,
  isAdmin,
  JWT_SECRET
};
