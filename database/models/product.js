const db = require('../config');

const ProductModel = {
  // Get all products with optional pagination
  async getAllProducts(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const { rows } = await db.query(query, [limit, offset]);
    return rows;
  },
  
  // Get product by ID
  async getProductById(id) {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    // Get product specifications
    const specsQuery = `
      SELECT * FROM product_specifications
      WHERE product_id = $1
    `;
    const specsResult = await db.query(specsQuery, [id]);
    
    // Get product images
    const imagesQuery = `
      SELECT * FROM product_images
      WHERE product_id = $1
      ORDER BY is_primary DESC, display_order ASC
    `;
    const imagesResult = await db.query(imagesQuery, [id]);
    
    // Get product variants
    const variantsQuery = `
      SELECT * FROM product_variants
      WHERE product_id = $1
    `;
    const variantsResult = await db.query(variantsQuery, [id]);
    
    // Get product reviews
    const reviewsQuery = `
      SELECT r.*, u.first_name, u.last_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `;
    const reviewsResult = await db.query(reviewsQuery, [id]);
    
    // Combine all data
    return {
      ...rows[0],
      specifications: specsResult.rows[0] || {},
      images: imagesResult.rows,
      variants: variantsResult.rows,
      reviews: reviewsResult.rows
    };
  },
  
  // Get products by category
  async getProductsByCategory(categoryId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const { rows } = await db.query(query, [categoryId, limit, offset]);
    return rows;
  },
  
  // Search products
  async searchProducts(searchTerm, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const query = `
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 
        p.name ILIKE $1 OR 
        p.description ILIKE $1 OR
        c.name ILIKE $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const { rows } = await db.query(query, [`%${searchTerm}%`, limit, offset]);
    return rows;
  },
  
  // Create a new product
  async createProduct(productData) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Insert product
      const productQuery = `
        INSERT INTO products (
          name, slug, sku, description, price, discount_percentage,
          stock_quantity, is_featured, is_new, image_url, weight,
          dimensions, category_id, brand
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        ) RETURNING id
      `;
      
      const slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const productValues = [
        productData.name,
        productData.slug || slug,
        productData.sku,
        productData.description,
        productData.price,
        productData.discount_percentage || null,
        productData.stock_quantity || 0,
        productData.is_featured || false,
        productData.is_new || false,
        productData.image_url,
        productData.weight || null,
        productData.dimensions || null,
        productData.category_id,
        productData.brand
      ];
      
      const productResult = await client.query(productQuery, productValues);
      const productId = productResult.rows[0].id;
      
      // Insert specifications if provided
      if (productData.specifications) {
        const specsQuery = `
          INSERT INTO product_specifications (
            product_id, display, processor, memory, storage,
            camera, battery, connectivity, operating_system, additional_features
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          )
        `;
        
        const specsValues = [
          productId,
          productData.specifications.display || null,
          productData.specifications.processor || null,
          productData.specifications.memory || null,
          productData.specifications.storage || null,
          productData.specifications.camera || null,
          productData.specifications.battery || null,
          productData.specifications.connectivity || null,
          productData.specifications.operating_system || null,
          productData.specifications.additional_features || null
        ];
        
        await client.query(specsQuery, specsValues);
      }
      
      // Insert additional images if provided
      if (productData.images && Array.isArray(productData.images)) {
        for (let i = 0; i < productData.images.length; i++) {
          const image = productData.images[i];
          const imageQuery = `
            INSERT INTO product_images (
              product_id, image_url, is_primary, display_order
            ) VALUES (
              $1, $2, $3, $4
            )
          `;
          
          await client.query(imageQuery, [
            productId,
            image.image_url,
            image.is_primary || false,
            image.display_order || i
          ]);
        }
      }
      
      // Insert variants if provided
      if (productData.variants && Array.isArray(productData.variants)) {
        for (const variant of productData.variants) {
          const variantQuery = `
            INSERT INTO product_variants (
              product_id, variant_type, variant_value, 
              price_adjustment, stock_quantity, sku
            ) VALUES (
              $1, $2, $3, $4, $5, $6
            )
          `;
          
          await client.query(variantQuery, [
            productId,
            variant.variant_type,
            variant.variant_value,
            variant.price_adjustment || 0,
            variant.stock_quantity || 0,
            variant.sku || null
          ]);
        }
      }
      
      await client.query('COMMIT');
      
      // Return the created product
      return this.getProductById(productId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  // Update a product
  async updateProduct(id, productData) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Update product
      const productQuery = `
        UPDATE products SET
          name = COALESCE($1, name),
          slug = COALESCE($2, slug),
          sku = COALESCE($3, sku),
          description = COALESCE($4, description),
          price = COALESCE($5, price),
          discount_percentage = COALESCE($6, discount_percentage),
          stock_quantity = COALESCE($7, stock_quantity),
          is_featured = COALESCE($8, is_featured),
          is_new = COALESCE($9, is_new),
          image_url = COALESCE($10, image_url),
          weight = COALESCE($11, weight),
          dimensions = COALESCE($12, dimensions),
          category_id = COALESCE($13, category_id),
          brand = COALESCE($14, brand),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $15
        RETURNING *
      `;
      
      let slug = null;
      if (productData.name) {
        slug = productData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      
      const productValues = [
        productData.name || null,
        productData.slug || slug,
        productData.sku || null,
        productData.description || null,
        productData.price || null,
        productData.discount_percentage || null,
        productData.stock_quantity || null,
        productData.is_featured !== undefined ? productData.is_featured : null,
        productData.is_new !== undefined ? productData.is_new : null,
        productData.image_url || null,
        productData.weight || null,
        productData.dimensions || null,
        productData.category_id || null,
        productData.brand || null,
        id
      ];
      
      const productResult = await client.query(productQuery, productValues);
      
      if (productResult.rows.length === 0) {
        throw new Error(`Product with ID ${id} not found`);
      }
      
      // Update specifications if provided
      if (productData.specifications) {
        // Check if specifications exist
        const specsCheckQuery = `
          SELECT 1 FROM product_specifications WHERE product_id = $1
        `;
        const specsCheckResult = await client.query(specsCheckQuery, [id]);
        
        if (specsCheckResult.rows.length > 0) {
          // Update existing specifications
          const specsQuery = `
            UPDATE product_specifications SET
              display = COALESCE($2, display),
              processor = COALESCE($3, processor),
              memory = COALESCE($4, memory),
              storage = COALESCE($5, storage),
              camera = COALESCE($6, camera),
              battery = COALESCE($7, battery),
              connectivity = COALESCE($8, connectivity),
              operating_system = COALESCE($9, operating_system),
              additional_features = COALESCE($10, additional_features)
            WHERE product_id = $1
          `;
          
          const specsValues = [
            id,
            productData.specifications.display || null,
            productData.specifications.processor || null,
            productData.specifications.memory || null,
            productData.specifications.storage || null,
            productData.specifications.camera || null,
            productData.specifications.battery || null,
            productData.specifications.connectivity || null,
            productData.specifications.operating_system || null,
            productData.specifications.additional_features || null
          ];
          
          await client.query(specsQuery, specsValues);
        } else {
          // Insert new specifications
          const specsQuery = `
            INSERT INTO product_specifications (
              product_id, display, processor, memory, storage,
              camera, battery, connectivity, operating_system, additional_features
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
            )
          `;
          
          const specsValues = [
            id,
            productData.specifications.display || null,
            productData.specifications.processor || null,
            productData.specifications.memory || null,
            productData.specifications.storage || null,
            productData.specifications.camera || null,
            productData.specifications.battery || null,
            productData.specifications.connectivity || null,
            productData.specifications.operating_system || null,
            productData.specifications.additional_features || null
          ];
          
          await client.query(specsQuery, specsValues);
        }
      }
      
      await client.query('COMMIT');
      
      // Return the updated product
      return this.getProductById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  // Delete a product
  async deleteProduct(id) {
    const query = `
      DELETE FROM products
      WHERE id = $1
      RETURNING *
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },
  
  // Import products from CSV data
  async importProductsFromCsv(productsData) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      for (const productData of productsData) {
        // Check if product with the same SKU already exists
        if (productData.sku) {
          const existingQuery = `
            SELECT id FROM products WHERE sku = $1
          `;
          const existingResult = await client.query(existingQuery, [productData.sku]);
          
          if (existingResult.rows.length > 0) {
            // Update existing product
            await this.updateProduct(existingResult.rows[0].id, productData);
            continue;
          }
        }
        
        // Create new product
        await this.createProduct(productData);
      }
      
      await client.query('COMMIT');
      return { success: true, message: `Imported ${productsData.length} products` };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = ProductModel;
