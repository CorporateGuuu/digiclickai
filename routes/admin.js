const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { parseProductsCSV } = require('../utils/csvParser');
const path = require('path');
const fs = require('fs');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store',
  ssl: false,
});

// Admin dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    // Get counts for dashboard
    const productCountQuery = 'SELECT COUNT(*) FROM products';
    const categoryCountQuery = 'SELECT COUNT(*) FROM categories';
    const userCountQuery = 'SELECT COUNT(*) FROM users';
    const orderCountQuery = 'SELECT COUNT(*) FROM orders';
    
    const [productCount, categoryCount, userCount, orderCount] = await Promise.all([
      pool.query(productCountQuery),
      pool.query(categoryCountQuery),
      pool.query(userCountQuery),
      pool.query(orderCountQuery)
    ]);
    
    // Get recent orders
    const recentOrdersQuery = `
      SELECT o.id, o.total_amount, o.status, o.created_at, 
             u.email, u.first_name, u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `;
    const recentOrders = await pool.query(recentOrdersQuery);
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      productCount: productCount.rows[0].count,
      categoryCount: categoryCount.rows[0].count,
      userCount: userCount.rows[0].count,
      orderCount: orderCount.rows[0].count,
      recentOrders: recentOrders.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).send('Server error');
  }
});

// Product management
router.get('/products', isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
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
    
    res.render('admin/products', {
      title: 'Manage Products',
      products: productsResult.rows,
      currentPage: page,
      totalPages: totalPages,
      totalProducts: totalProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Server error');
  }
});

// CSV upload form
router.get('/products/upload', isAdmin, async (req, res) => {
  try {
    // Get categories for the form
    const categoriesQuery = 'SELECT id, name FROM categories ORDER BY name';
    const categoriesResult = await pool.query(categoriesQuery);
    
    res.render('admin/upload', {
      title: 'Upload Products CSV',
      categories: categoriesResult.rows,
      message: req.query.message,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send('Server error');
  }
});

// Handle CSV upload
router.post('/products/upload', isAdmin, upload.single('csv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.redirect('/admin/products/upload?error=No file uploaded');
    }
    
    const result = await parseProductsCSV(req.file.path);
    
    // Delete the file after processing
    fs.unlinkSync(req.file.path);
    
    res.redirect(`/admin/products/upload?message=${encodeURIComponent(result.message)}`);
  } catch (error) {
    console.error('Error processing CSV:', error);
    res.redirect(`/admin/products/upload?error=${encodeURIComponent(error.message || 'Error processing CSV')}`);
  }
});

// Add product form
router.get('/products/add', isAdmin, async (req, res) => {
  try {
    // Get categories for the form
    const categoriesQuery = 'SELECT id, name FROM categories ORDER BY name';
    const categoriesResult = await pool.query(categoriesQuery);
    
    res.render('admin/product-form', {
      title: 'Add Product',
      product: {},
      categories: categoriesResult.rows,
      isNew: true
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send('Server error');
  }
});

// Edit product form
router.get('/products/edit/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get product details
    const productQuery = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;
    const productResult = await pool.query(productQuery, [id]);
    
    if (productResult.rows.length === 0) {
      return res.status(404).render('404', { message: 'Product not found' });
    }
    
    const product = productResult.rows[0];
    
    // Get product specifications
    const specsQuery = `
      SELECT * FROM product_specifications
      WHERE product_id = $1
    `;
    const specsResult = await pool.query(specsQuery, [id]);
    
    // Get categories for the form
    const categoriesQuery = 'SELECT id, name FROM categories ORDER BY name';
    const categoriesResult = await pool.query(categoriesQuery);
    
    res.render('admin/product-form', {
      title: 'Edit Product',
      product: product,
      specifications: specsResult.rows[0] || {},
      categories: categoriesResult.rows,
      isNew: false
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send('Server error');
  }
});

// Save product (add or update)
router.post('/products/save', isAdmin, async (req, res) => {
  try {
    const {
      id,
      name,
      slug,
      sku,
      description,
      price,
      discount_percentage,
      stock_quantity,
      is_featured,
      is_new,
      image_url,
      brand,
      category_id,
      // Specifications
      display,
      processor,
      memory,
      storage,
      camera,
      battery,
      connectivity,
      operating_system
    } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      let productId = id;
      
      if (id) {
        // Update existing product
        await client.query(
          `UPDATE products SET 
           name = $1, 
           slug = $2, 
           sku = $3, 
           description = $4, 
           price = $5, 
           discount_percentage = $6, 
           stock_quantity = $7, 
           is_featured = $8, 
           is_new = $9, 
           image_url = $10, 
           brand = $11, 
           category_id = $12,
           updated_at = CURRENT_TIMESTAMP
           WHERE id = $13`,
          [
            name,
            slug,
            sku,
            description,
            parseFloat(price) || 0,
            parseFloat(discount_percentage) || 0,
            parseInt(stock_quantity) || 0,
            is_featured === 'on',
            is_new === 'on',
            image_url,
            brand,
            category_id,
            id
          ]
        );
      } else {
        // Insert new product
        const result = await client.query(
          `INSERT INTO products 
           (name, slug, sku, description, price, discount_percentage, stock_quantity, 
            is_featured, is_new, image_url, brand, category_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           RETURNING id`,
          [
            name,
            slug,
            sku,
            description,
            parseFloat(price) || 0,
            parseFloat(discount_percentage) || 0,
            parseInt(stock_quantity) || 0,
            is_featured === 'on',
            is_new === 'on',
            image_url,
            brand,
            category_id
          ]
        );
        
        productId = result.rows[0].id;
      }
      
      // Check if specifications exist
      const specsExist = await client.query(
        'SELECT id FROM product_specifications WHERE product_id = $1',
        [productId]
      );
      
      if (specsExist.rows.length > 0) {
        // Update specifications
        await client.query(
          `UPDATE product_specifications SET 
           display = $1, 
           processor = $2, 
           memory = $3, 
           storage = $4, 
           camera = $5, 
           battery = $6, 
           connectivity = $7, 
           operating_system = $8
           WHERE product_id = $9`,
          [
            display,
            processor,
            memory,
            storage,
            camera,
            battery,
            connectivity,
            operating_system,
            productId
          ]
        );
      } else {
        // Insert specifications
        await client.query(
          `INSERT INTO product_specifications 
           (product_id, display, processor, memory, storage, camera, battery, connectivity, operating_system)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            productId,
            display,
            processor,
            memory,
            storage,
            camera,
            battery,
            connectivity,
            operating_system
          ]
        );
      }
      
      await client.query('COMMIT');
      
      res.redirect('/admin/products');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).send('Server error');
  }
});

// Delete product
router.post('/products/delete/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send('Server error');
  }
});

// Category management
router.get('/categories', isAdmin, async (req, res) => {
  try {
    // Get categories
    const categoriesQuery = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c
      ORDER BY c.name
    `;
    const categoriesResult = await pool.query(categoriesQuery);
    
    res.render('admin/categories', {
      title: 'Manage Categories',
      categories: categoriesResult.rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send('Server error');
  }
});

// Add/Edit category form
router.get('/categories/edit/:id?', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id) {
      // Edit existing category
      const categoryQuery = 'SELECT * FROM categories WHERE id = $1';
      const categoryResult = await pool.query(categoryQuery, [id]);
      
      if (categoryResult.rows.length === 0) {
        return res.status(404).render('404', { message: 'Category not found' });
      }
      
      res.render('admin/category-form', {
        title: 'Edit Category',
        category: categoryResult.rows[0],
        isNew: false
      });
    } else {
      // Add new category
      res.render('admin/category-form', {
        title: 'Add Category',
        category: {},
        isNew: true
      });
    }
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).send('Server error');
  }
});

// Save category (add or update)
router.post('/categories/save', isAdmin, async (req, res) => {
  try {
    const { id, name, slug, description, image_url } = req.body;
    
    if (id) {
      // Update existing category
      await pool.query(
        `UPDATE categories SET 
         name = $1, 
         slug = $2, 
         description = $3, 
         image_url = $4,
         updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [name, slug, description, image_url, id]
      );
    } else {
      // Insert new category
      await pool.query(
        `INSERT INTO categories 
         (name, slug, description, image_url)
         VALUES ($1, $2, $3, $4)`,
        [name, slug, description, image_url]
      );
    }
    
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error saving category:', error);
    res.status(500).send('Server error');
  }
});

// Delete category
router.post('/categories/delete/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has products
    const productCountQuery = 'SELECT COUNT(*) FROM products WHERE category_id = $1';
    const productCountResult = await pool.query(productCountQuery, [id]);
    
    if (parseInt(productCountResult.rows[0].count) > 0) {
      return res.status(400).send('Cannot delete category with products. Please reassign or delete the products first.');
    }
    
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).send('Server error');
  }
});

// User management
router.get('/users', isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Get users with pagination
    const usersQuery = `
      SELECT id, email, first_name, last_name, is_admin, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const usersResult = await pool.query(usersQuery, [limit, offset]);
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM users`;
    const countResult = await pool.query(countQuery);
    const totalUsers = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalUsers / limit);
    
    res.render('admin/users', {
      title: 'Manage Users',
      users: usersResult.rows,
      currentPage: page,
      totalPages: totalPages,
      totalUsers: totalUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Server error');
  }
});

// Add/Edit user form
router.get('/users/edit/:id?', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id) {
      // Edit existing user
      const userQuery = 'SELECT id, email, first_name, last_name, phone, is_admin FROM users WHERE id = $1';
      const userResult = await pool.query(userQuery, [id]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).render('404', { message: 'User not found' });
      }
      
      res.render('admin/user-form', {
        title: 'Edit User',
        user: userResult.rows[0],
        isNew: false
      });
    } else {
      // Add new user
      res.render('admin/user-form', {
        title: 'Add User',
        user: {},
        isNew: true
      });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Server error');
  }
});

// Save user (add or update)
router.post('/users/save', isAdmin, async (req, res) => {
  try {
    const { id, email, password, first_name, last_name, phone, is_admin } = req.body;
    
    if (id) {
      // Update existing user
      if (password) {
        // Update with new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.query(
          `UPDATE users SET 
           email = $1, 
           password_hash = $2, 
           first_name = $3, 
           last_name = $4, 
           phone = $5, 
           is_admin = $6,
           updated_at = CURRENT_TIMESTAMP
           WHERE id = $7`,
          [email, hashedPassword, first_name, last_name, phone, is_admin === 'on', id]
        );
      } else {
        // Update without changing password
        await pool.query(
          `UPDATE users SET 
           email = $1, 
           first_name = $2, 
           last_name = $3, 
           phone = $4, 
           is_admin = $5,
           updated_at = CURRENT_TIMESTAMP
           WHERE id = $6`,
          [email, first_name, last_name, phone, is_admin === 'on', id]
        );
      }
    } else {
      // Insert new user
      if (!password) {
        return res.status(400).send('Password is required for new users');
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await pool.query(
        `INSERT INTO users 
         (email, password_hash, first_name, last_name, phone, is_admin)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [email, hashedPassword, first_name, last_name, phone, is_admin === 'on']
      );
    }
    
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).send('Server error');
  }
});

// Delete user
router.post('/users/delete/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if this is the last admin
    if (req.session.userId === parseInt(id)) {
      return res.status(400).send('You cannot delete your own account while logged in.');
    }
    
    const adminCountQuery = 'SELECT COUNT(*) FROM users WHERE is_admin = true';
    const adminCountResult = await pool.query(adminCountQuery);
    
    const isAdminQuery = 'SELECT is_admin FROM users WHERE id = $1';
    const isAdminResult = await pool.query(isAdminQuery, [id]);
    
    if (parseInt(adminCountResult.rows[0].count) <= 1 && isAdminResult.rows[0].is_admin) {
      return res.status(400).send('Cannot delete the last admin user.');
    }
    
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Server error');
  }
});

// Order management
router.get('/orders', isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Get orders with pagination
    const ordersQuery = `
      SELECT o.id, o.total_amount, o.status, o.created_at, 
             u.email, u.first_name, u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const ordersResult = await pool.query(ordersQuery, [limit, offset]);
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM orders`;
    const countResult = await pool.query(countQuery);
    const totalOrders = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalOrders / limit);
    
    res.render('admin/orders', {
      title: 'Manage Orders',
      orders: ordersResult.rows,
      currentPage: page,
      totalPages: totalPages,
      totalOrders: totalOrders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Server error');
  }
});

// Order details
router.get('/orders/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get order details
    const orderQuery = `
      SELECT o.*, 
             u.email, u.first_name, u.last_name, u.phone,
             a.address_line1, a.address_line2, a.city, a.state, a.postal_code, a.country
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN user_addresses a ON o.address_id = a.id
      WHERE o.id = $1
    `;
    const orderResult = await pool.query(orderQuery, [id]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).render('404', { message: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    // Get order items
    const itemsQuery = `
      SELECT oi.*, p.name, p.slug, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `;
    const itemsResult = await pool.query(itemsQuery, [id]);
    
    res.render('admin/order-detail', {
      title: `Order #${id}`,
      order: order,
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).send('Server error');
  }
});

// Update order status
router.post('/orders/:id/status', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );
    
    res.redirect(`/admin/orders/${id}`);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
