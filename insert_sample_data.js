const { Pool } = require('pg');

// Create a connection to the database
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/phone_electronics_store'
});

// Sample categories
const categories = [
  {
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Latest smartphones and mobile devices',
    image_url: '/placeholder.svg?height=400&width=300'
  },
  {
    name: 'Audio',
    slug: 'audio',
    description: 'Headphones, earbuds, and speakers',
    image_url: '/placeholder.svg?height=400&width=300'
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Cases, chargers, and other accessories',
    image_url: '/placeholder.svg?height=400&width=300'
  },
  {
    name: 'Wearables',
    slug: 'wearables',
    description: 'Smartwatches and fitness trackers',
    image_url: '/placeholder.svg?height=400&width=300'
  }
];

// Sample products
const products = [
  {
    name: 'Quantum Pro X',
    slug: 'quantum-pro-x',
    sku: 'QTM-PRO-X-001',
    description: 'The latest flagship smartphone with advanced features',
    price: 1299.99,
    discount_percentage: 5.0,
    stock_quantity: 50,
    is_featured: true,
    is_new: true,
    image_url: '/placeholder.svg?height=300&width=300',
    brand: 'TechX'
  },
  {
    name: 'Elite Wireless Earbuds',
    slug: 'elite-wireless-earbuds',
    sku: 'ELT-WL-EB-002',
    description: 'Premium wireless earbuds with noise cancellation',
    price: 249.99,
    discount_percentage: 0,
    stock_quantity: 100,
    is_featured: true,
    is_new: false,
    image_url: '/placeholder.svg?height=300&width=300',
    brand: 'SoundMaster'
  },
  {
    name: 'PowerMax Charging Dock',
    slug: 'powermax-charging-dock',
    sku: 'PWR-MAX-CD-003',
    description: 'Fast charging dock for multiple devices',
    price: 89.99,
    discount_percentage: 10.0,
    stock_quantity: 200,
    is_featured: true,
    is_new: false,
    image_url: '/placeholder.svg?height=300&width=300',
    brand: 'PowerTech'
  },
  {
    name: 'Titanium Phone Case',
    slug: 'titanium-phone-case',
    sku: 'TTN-PH-CS-004',
    description: 'Durable titanium case for ultimate protection',
    price: 59.99,
    discount_percentage: 0,
    stock_quantity: 150,
    is_featured: true,
    is_new: true,
    image_url: '/placeholder.svg?height=300&width=300',
    brand: 'ArmorTech'
  },
  {
    name: 'SmartWatch Pro',
    slug: 'smartwatch-pro',
    sku: 'SMT-WCH-PR-005',
    description: 'Advanced smartwatch with health monitoring',
    price: 349.99,
    discount_percentage: 15.0,
    stock_quantity: 75,
    is_featured: false,
    is_new: true,
    image_url: '/placeholder.svg?height=300&width=300',
    brand: 'FitTech'
  },
  {
    name: 'Ultra HD Camera Phone',
    slug: 'ultra-hd-camera-phone',
    sku: 'UHD-CAM-PH-006',
    description: 'Smartphone with professional-grade camera',
    price: 1099.99,
    discount_percentage: 0,
    stock_quantity: 30,
    is_featured: false,
    is_new: true,
    image_url: '/placeholder.svg?height=300&width=300',
    brand: 'PixelMaster'
  },
  {
    name: 'Noise-Cancelling Headphones',
    slug: 'noise-cancelling-headphones',
    sku: 'NC-HDPH-007',
    description: 'Over-ear headphones with premium sound quality',
    price: 299.99,
    discount_percentage: 10.0,
    stock_quantity: 120,
    is_featured: false,
    is_new: false,
    image_url: '/placeholder.svg?height=300&width=300',
    brand: 'SoundMaster'
  },
  {
    name: 'Fast Wireless Charger',
    slug: 'fast-wireless-charger',
    sku: 'FST-WL-CHG-008',
    description: '15W wireless charging pad for all compatible devices',
    price: 49.99,
    discount_percentage: 0,
    stock_quantity: 200,
    is_featured: false,
    is_new: false,
    image_url: '/placeholder.svg?height=300&width=300',
    brand: 'PowerTech'
  }
];

// Product specifications
const specifications = [
  {
    product_slug: 'quantum-pro-x',
    display: '6.7" AMOLED, 120Hz',
    processor: 'Octa-core 3.0GHz',
    memory: '12GB RAM',
    storage: '256GB',
    camera: '108MP main + 48MP ultra-wide + 12MP telephoto',
    battery: '5000mAh',
    connectivity: '5G, Wi-Fi 6, Bluetooth 5.2',
    operating_system: 'Android 13'
  },
  {
    product_slug: 'elite-wireless-earbuds',
    display: 'LED indicators',
    processor: 'Custom audio chip',
    memory: 'N/A',
    storage: 'N/A',
    camera: 'N/A',
    battery: 'Up to 8 hours (30 with case)',
    connectivity: 'Bluetooth 5.2',
    operating_system: 'Compatible with iOS and Android'
  },
  {
    product_slug: 'smartwatch-pro',
    display: '1.4" AMOLED, Always-on',
    processor: 'Dual-core 1.2GHz',
    memory: '1GB RAM',
    storage: '16GB',
    camera: 'N/A',
    battery: 'Up to 3 days',
    connectivity: 'Bluetooth 5.0, Wi-Fi, NFC',
    operating_system: 'WearOS'
  },
  {
    product_slug: 'ultra-hd-camera-phone',
    display: '6.5" AMOLED, 120Hz',
    processor: 'Octa-core 2.8GHz',
    memory: '8GB RAM',
    storage: '128GB',
    camera: '200MP main + 50MP ultra-wide + 10MP telephoto',
    battery: '4800mAh',
    connectivity: '5G, Wi-Fi 6, Bluetooth 5.2',
    operating_system: 'Android 13'
  }
];

// Insert data into the database
async function insertData() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // // // console.log('Inserting categories...');
    for (const category of categories) {
      const result = await client.query(
        `INSERT INTO categories (name, slug, description, image_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           image_url = EXCLUDED.image_url
         RETURNING id`,
        [category.name, category.slug, category.description, category.image_url]
      );

      category.id = result.rows[0].id;
    }

    // // // console.log('Inserting products...');
    for (const product of products) {
      // Find category ID based on product type
      let categoryId = null;
      if (product.name.toLowerCase().includes('phone') || product.name.toLowerCase().includes('smartphone')) {
        categoryId = categories.find(c => c.slug === 'smartphones')?.id;
      } else if (product.name.toLowerCase().includes('earbud') || product.name.toLowerCase().includes('headphone')) {
        categoryId = categories.find(c => c.slug === 'audio')?.id;
      } else if (product.name.toLowerCase().includes('watch')) {
        categoryId = categories.find(c => c.slug === 'wearables')?.id;
      } else {
        categoryId = categories.find(c => c.slug === 'accessories')?.id;
      }

      const result = await client.query(
        `INSERT INTO products (
           name, slug, sku, description, price, discount_percentage,
           stock_quantity, is_featured, is_new, image_url, category_id, brand
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           sku = EXCLUDED.sku,
           description = EXCLUDED.description,
           price = EXCLUDED.price,
           discount_percentage = EXCLUDED.discount_percentage,
           stock_quantity = EXCLUDED.stock_quantity,
           is_featured = EXCLUDED.is_featured,
           is_new = EXCLUDED.is_new,
           image_url = EXCLUDED.image_url,
           category_id = EXCLUDED.category_id,
           brand = EXCLUDED.brand
         RETURNING id`,
        [
          product.name,
          product.slug,
          product.sku,
          product.description,
          product.price,
          product.discount_percentage,
          product.stock_quantity,
          product.is_featured,
          product.is_new,
          product.image_url,
          categoryId,
          product.brand
        ]
      );

      product.id = result.rows[0].id;
    }

    // // // console.log('Inserting product specifications...');
    for (const spec of specifications) {
      // Find product ID based on slug
      const product = products.find(p => p.slug === spec.product_slug);
      if (!product) continue;

      // First check if a specification already exists for this product
      const checkResult = await client.query(
        `SELECT 1 FROM product_specifications WHERE product_id = $1`,
        [product.id]
      );

      if (checkResult.rows.length > 0) {
        // Update existing specification
        await client.query(
          `UPDATE product_specifications SET
             display = $2,
             processor = $3,
             memory = $4,
             storage = $5,
             camera = $6,
             battery = $7,
             connectivity = $8,
             operating_system = $9
           WHERE product_id = $1`,
          [
            product.id,
            spec.display,
            spec.processor,
            spec.memory,
            spec.storage,
            spec.camera,
            spec.battery,
            spec.connectivity,
            spec.operating_system
          ]
        );
      } else {
        // Insert new specification
        await client.query(
          `INSERT INTO product_specifications (
             product_id, display, processor, memory, storage,
             camera, battery, connectivity, operating_system
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            product.id,
            spec.display,
            spec.processor,
            spec.memory,
            spec.storage,
            spec.camera,
            spec.battery,
            spec.connectivity,
            spec.operating_system
          ]
        );
      }
    }

    await client.query('COMMIT');
    // // // console.log('Sample data inserted successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error inserting sample data:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the insertion
insertData();
