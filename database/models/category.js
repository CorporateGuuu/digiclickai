const db = require('../config');

const CategoryModel = {
  // Get all categories
  async getAllCategories() {
    const query = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c
      ORDER BY c.name
    `;
    const { rows } = await db.query(query);
    return rows;
  },
  
  // Get category by ID
  async getCategoryById(id) {
    const query = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c
      WHERE c.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },
  
  // Get category by slug
  async getCategoryBySlug(slug) {
    const query = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count
      FROM categories c
      WHERE c.slug = $1
    `;
    const { rows } = await db.query(query, [slug]);
    return rows[0] || null;
  },
  
  // Create a new category
  async createCategory(categoryData) {
    const query = `
      INSERT INTO categories (
        name, slug, description, image_url, parent_id
      ) VALUES (
        $1, $2, $3, $4, $5
      ) RETURNING *
    `;
    
    const slug = categoryData.slug || categoryData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const values = [
      categoryData.name,
      slug,
      categoryData.description || null,
      categoryData.image_url || null,
      categoryData.parent_id || null
    ];
    
    const { rows } = await db.query(query, values);
    return rows[0];
  },
  
  // Update a category
  async updateCategory(id, categoryData) {
    const query = `
      UPDATE categories SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        image_url = COALESCE($4, image_url),
        parent_id = COALESCE($5, parent_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    
    let slug = null;
    if (categoryData.name) {
      slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    const values = [
      categoryData.name || null,
      categoryData.slug || slug,
      categoryData.description || null,
      categoryData.image_url || null,
      categoryData.parent_id || null,
      id
    ];
    
    const { rows } = await db.query(query, values);
    return rows[0] || null;
  },
  
  // Delete a category
  async deleteCategory(id) {
    // Check if category has products
    const checkQuery = `
      SELECT COUNT(*) FROM products WHERE category_id = $1
    `;
    const checkResult = await db.query(checkQuery, [id]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      throw new Error('Cannot delete category with associated products');
    }
    
    // Check if category has child categories
    const checkChildrenQuery = `
      SELECT COUNT(*) FROM categories WHERE parent_id = $1
    `;
    const checkChildrenResult = await db.query(checkChildrenQuery, [id]);
    
    if (parseInt(checkChildrenResult.rows[0].count) > 0) {
      throw new Error('Cannot delete category with child categories');
    }
    
    // Delete the category
    const query = `
      DELETE FROM categories
      WHERE id = $1
      RETURNING *
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },
  
  // Get category hierarchy
  async getCategoryHierarchy() {
    // Get all categories
    const allCategories = await this.getAllCategories();
    
    // Build hierarchy
    const categoryMap = {};
    const rootCategories = [];
    
    // First pass: create map of id -> category
    allCategories.forEach(category => {
      categoryMap[category.id] = {
        ...category,
        children: []
      };
    });
    
    // Second pass: build hierarchy
    allCategories.forEach(category => {
      if (category.parent_id) {
        // This is a child category
        if (categoryMap[category.parent_id]) {
          categoryMap[category.parent_id].children.push(categoryMap[category.id]);
        }
      } else {
        // This is a root category
        rootCategories.push(categoryMap[category.id]);
      }
    });
    
    return rootCategories;
  }
};

module.exports = CategoryModel;
