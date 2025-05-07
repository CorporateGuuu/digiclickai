const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
const compression = require('compression');
const {
  csrfProtection,
  apiLimiter,
  loginLimiter,
  registerLimiter,
  securityHeaders,
  handleCsrfError
} = require('./middleware/security');

// Import routes
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const cartRoutes = require('./routes/cart');
const searchRoutes = require('./routes/search');
const apiCartRoutes = require('./routes/api/cart');
const apiCheckoutRoutes = require('./routes/api/checkout');
const apiReviewsRoutes = require('./routes/api/reviews');
const apiWishlistRoutes = require('./routes/api/wishlist');

// Create Express app
const app = express();
const port = 3000;

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mdtstech_store',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(compression()); // Compress all responses
app.use(securityHeaders); // Apply security headers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Session configuration
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    httpOnly: true, // Prevent JavaScript access to cookies
    sameSite: 'strict' // Prevent CSRF attacks
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Make user data available to all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.isAuthenticated = !!req.session.userId;
  res.locals.isAdmin = !!req.session.isAdmin;
  next();
});

// Import utilities
const { getCachedData, cacheData } = require('./utils/cache');
const { getRelatedProducts } = require('./utils/related-products');

// Home page
app.get('/', async (req, res) => {
  try {
    // Try to get data from cache
    const cacheKey = 'home_page_data';
    const cachedData = await getCachedData(cacheKey);

    if (cachedData) {
      return res.render('index', {
        featuredProducts: cachedData.featuredProducts,
        categories: cachedData.categories
      });
    }

    // Get featured products
    const featuredProductsQuery = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = true
      ORDER BY p.created_at DESC
      LIMIT 8
    `;
    const featuredProductsResult = await pool.query(featuredProductsQuery);

    // Get categories
    const categoriesQuery = `
      SELECT c.*,
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c
      ORDER BY c.name
    `;
    const categoriesResult = await pool.query(categoriesQuery);

    // Cache the data for 10 minutes
    const data = {
      featuredProducts: featuredProductsResult.rows,
      categories: categoriesResult.rows
    };

    await cacheData(cacheKey, data, 600); // 10 minutes

    res.render('index', data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Server error');
  }
});

// Products page
app.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Try to get data from cache
    const cacheKey = `products_page_${page}`;
    const cachedData = await getCachedData(cacheKey);

    if (cachedData) {
      return res.render('products', {
        products: cachedData.products,
        currentPage: cachedData.currentPage,
        totalPages: cachedData.totalPages,
        totalProducts: cachedData.totalProducts
      });
    }

    // Get products with pagination
    const productsQuery = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const productsResult = await pool.query(productsQuery, [limit, offset]);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM products`;
    const countResult = await pool.query(countQuery);
    const totalProducts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalProducts / limit);

    // Cache the data for 5 minutes
    const data = {
      products: productsResult.rows,
      currentPage: page,
      totalPages: totalPages,
      totalProducts: totalProducts
    };

    await cacheData(cacheKey, data, 300); // 5 minutes

    res.render('products', data);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Server error');
  }
});

// Product detail page
app.get('/products/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Try to get data from cache
    const cacheKey = `product_detail_${slug}`;
    const cachedData = await getCachedData(cacheKey);

    if (cachedData) {
      return res.render('product-detail', {
        product: cachedData.product,
        specifications: cachedData.specifications
      });
    }

    // Get product details
    const productQuery = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = $1
    `;
    const productResult = await pool.query(productQuery, [slug]);

    if (productResult.rows.length === 0) {
      return res.status(404).render('404', { message: 'Product not found' });
    }

    const product = productResult.rows[0];

    // Get product specifications
    const specsQuery = `
      SELECT * FROM product_specifications
      WHERE product_id = $1
    `;
    const specsResult = await pool.query(specsQuery, [product.id]);

    // Get related products
    const relatedProducts = await getRelatedProducts(product.id, 4);

    // Cache the data for 1 hour
    const data = {
      product: product,
      specifications: specsResult.rows[0] || {},
      relatedProducts: relatedProducts,
      // SEO metadata
      title: product.name,
      metaDescription: product.description ? product.description.substring(0, 160) : `Buy ${product.name} at the best price. Free shipping available.`,
      metaKeywords: `${product.name}, ${product.brand}, ${product.category_name}, electronics, phones`,
      canonicalUrl: `http://localhost:3000/products/${product.slug}`,
      ogImage: product.image_url || 'http://localhost:3000/images/logo.png'
    };

    await cacheData(cacheKey, data, 3600); // 1 hour

    res.render('product-detail', data);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send('Server error');
  }
});

// Categories page
app.get('/categories', async (req, res) => {
  try {
    // Get categories
    const categoriesQuery = `
      SELECT c.*,
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c
      ORDER BY c.name
    `;
    const categoriesResult = await pool.query(categoriesQuery);

    res.render('categories', {
      categories: categoriesResult.rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send('Server error');
  }
});

// Category detail page
app.get('/categories/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Get category details
    const categoryQuery = `
      SELECT c.*,
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c
      WHERE c.slug = $1
    `;
    const categoryResult = await pool.query(categoryQuery, [slug]);

    if (categoryResult.rows.length === 0) {
      return res.status(404).render('404', { message: 'Category not found' });
    }

    const category = categoryResult.rows[0];

    // Get products in this category
    const productsQuery = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE c.slug = $1
      ORDER BY p.created_at DESC
      LIMIT 20
    `;
    const productsResult = await pool.query(productsQuery, [slug]);

    res.render('category-detail', {
      category: category,
      products: productsResult.rows
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).send('Server error');
  }
});

// Register routes
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/cart', cartRoutes);
app.use('/search', searchRoutes);
app.use('/api/cart', apiCartRoutes);
app.use('/api/checkout', apiCheckoutRoutes);
app.use('/api/reviews', apiReviewsRoutes);
app.use('/api/wishlist', apiWishlistRoutes);

// CSRF error handler
app.use(handleCsrfError);

// 403 page
app.use('/403', (req, res) => {
  res.status(403).render('403', {
    title: 'Access Denied',
    message: 'You do not have permission to access this page.'
  });
});

// 404 page
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.'
  });
});

// Create session table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
  )
`).catch(err => {
  console.error('Error creating session table:', err);
});

// Start the server
app.listen(port, () => {
  // // // console.log(`Server running at http://localhost:${port}`);
});
