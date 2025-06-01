const request = require('supertest');
const express = require('express');
const session = require('express-session');
const { setupTestDatabase, teardownTestDatabase, pool } = require('../setup');

// Create a test app
const app = express();
app.use(express.json());
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: true
}));

// Import cart API routes
const apiCartRoutes = require('../../routes/api/cart');
app.use('/api/cart', apiCartRoutes);

describe('Cart API Routes', () => {
  beforeAll(async () => {
    await setupTestDatabase();
    
    // Create test user
    await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES ('test@example.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9MQICm3X3FYzQNuY7xTfV2XfzS/vZ4O', 'Test', 'User')
      ON CONFLICT (email) DO NOTHING
    `);
    
    // Create test product
    await pool.query(`
      INSERT INTO categories (name, slug, description)
      VALUES ('Test Category', 'test-category', 'Test category description')
      ON CONFLICT (slug) DO NOTHING
    `);
    
    const categoryResult = await pool.query(`SELECT id FROM categories WHERE slug = 'test-category'`);
    const categoryId = categoryResult.rows[0].id;
    
    await pool.query(`
      INSERT INTO products (name, slug, price, category_id, stock_quantity)
      VALUES ('Test Product', 'test-product', 99.99, $1, 10)
      ON CONFLICT (slug) DO NOTHING
    `, [categoryId]);
  });
  
  afterAll(async () => {
    await teardownTestDatabase();
  });
  
  describe('GET /api/cart', () => {
    test('should return an empty cart for a new session', async () => {
      const response = await request(app)
        .get('/api/cart')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.items).toEqual([]);
      expect(response.body.subtotal).toBe(0);
    });
  });
  
  describe('POST /api/cart/add', () => {
    test('should add a product to the cart', async () => {
      // Get product ID
      const productResult = await pool.query(`SELECT id FROM products WHERE slug = 'test-product'`);
      const productId = productResult.rows[0].id;
      
      const response = await request(app)
        .post('/api/cart/add')
        .send({ product_id: productId, quantity: 2 })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Item added to cart');
    });
  });
});
