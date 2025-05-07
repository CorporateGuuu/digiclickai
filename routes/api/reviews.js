const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { isAuthenticated } = require('../../middleware/auth');
const { apiLimiter } = require('../../middleware/security');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store',
  ssl: false,
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get approved reviews with pagination
    const reviewsQuery = `
      SELECT r.id, r.rating, r.title, r.comment, r.is_verified_purchase, r.created_at,
             u.first_name, u.last_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 AND r.is_approved = true
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const reviewsResult = await pool.query(reviewsQuery, [productId, limit, offset]);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) FROM reviews
      WHERE product_id = $1 AND is_approved = true
    `;
    const countResult = await pool.query(countQuery, [productId]);
    const totalReviews = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalReviews / limit);
    
    // Get average rating
    const ratingQuery = `
      SELECT AVG(rating) as average_rating,
             COUNT(*) FILTER (WHERE rating = 5) as five_star,
             COUNT(*) FILTER (WHERE rating = 4) as four_star,
             COUNT(*) FILTER (WHERE rating = 3) as three_star,
             COUNT(*) FILTER (WHERE rating = 2) as two_star,
             COUNT(*) FILTER (WHERE rating = 1) as one_star
      FROM reviews
      WHERE product_id = $1 AND is_approved = true
    `;
    const ratingResult = await pool.query(ratingQuery, [productId]);
    
    res.json({
      success: true,
      reviews: reviewsResult.rows,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalReviews: totalReviews
      },
      ratings: {
        average: parseFloat(ratingResult.rows[0].average_rating) || 0,
        distribution: {
          5: parseInt(ratingResult.rows[0].five_star) || 0,
          4: parseInt(ratingResult.rows[0].four_star) || 0,
          3: parseInt(ratingResult.rows[0].three_star) || 0,
          2: parseInt(ratingResult.rows[0].two_star) || 0,
          1: parseInt(ratingResult.rows[0].one_star) || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews'
    });
  }
});

// Submit a review
router.post('/submit', isAuthenticated, apiLimiter, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = req.session.userId;
    
    if (!productId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review data'
      });
    }
    
    // Check if product exists
    const productQuery = 'SELECT id FROM products WHERE id = $1';
    const productResult = await pool.query(productQuery, [productId]);
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if user has already reviewed this product
    const existingReviewQuery = `
      SELECT id FROM reviews
      WHERE product_id = $1 AND user_id = $2
    `;
    const existingReviewResult = await pool.query(existingReviewQuery, [productId, userId]);
    
    if (existingReviewResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }
    
    // Check if user has purchased this product
    const purchaseQuery = `
      SELECT oi.id
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status IN ('delivered', 'completed')
    `;
    const purchaseResult = await pool.query(purchaseQuery, [userId, productId]);
    const isVerifiedPurchase = purchaseResult.rows.length > 0;
    
    // Insert review
    const insertQuery = `
      INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_purchase, is_approved)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    
    // Auto-approve verified purchases, otherwise require moderation
    const isApproved = isVerifiedPurchase;
    
    const insertResult = await pool.query(
      insertQuery,
      [productId, userId, rating, title, comment, isVerifiedPurchase, isApproved]
    );
    
    res.json({
      success: true,
      message: isApproved ? 'Review submitted successfully' : 'Review submitted and awaiting approval',
      reviewId: insertResult.rows[0].id
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting review'
    });
  }
});

// Get user's reviews
router.get('/user', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const reviewsQuery = `
      SELECT r.id, r.rating, r.title, r.comment, r.is_verified_purchase, r.is_approved, r.created_at,
             p.id as product_id, p.name as product_name, p.slug as product_slug, p.image_url
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;
    const reviewsResult = await pool.query(reviewsQuery, [userId]);
    
    res.json({
      success: true,
      reviews: reviewsResult.rows
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user reviews'
    });
  }
});

// Delete a review
router.delete('/:reviewId', isAuthenticated, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.session.userId;
    
    // Check if review exists and belongs to the user
    const reviewQuery = 'SELECT id FROM reviews WHERE id = $1 AND user_id = $2';
    const reviewResult = await pool.query(reviewQuery, [reviewId, userId]);
    
    if (reviewResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to delete it'
      });
    }
    
    // Delete review
    await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review'
    });
  }
});

module.exports = router;
