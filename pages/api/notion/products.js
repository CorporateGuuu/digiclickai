import { getProducts, getProduct, createProduct } from '../../../lib/notion';

export default async function handler(req, res) {
  // GET request - fetch products from Notion
  if (req.method === 'GET') {
    const { id, category } = req.query;

    // Get a single product by ID
    if (id) {
      const { data, error } = await getProduct(id);

      if (error) {
        return res.status(500).json({ success: false, message: error });
      }

      if (!data) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      return res.status(200).json({ success: true, product: data });
    }

    // Get products, optionally filtered by category
    let filter = {};
    if (category) {
      filter = {
        property: 'Category',
        select: {
          equals: category
        }
      };
    }

    const { data, error } = await getProducts(filter);

    if (error) {
      return res.status(500).json({ success: false, message: error });
    }

    // Transform Notion data to a more usable format
    const products = data ? data.map(page => {
      const properties = page.properties;
      return {
        id: page.id,
        name: properties.Name?.title?.[0]?.plain_text || '',
        price: properties.Price?.number || 0,
        category: properties.Category?.select?.name || '',
        description: properties.Description?.rich_text?.[0]?.plain_text || '',
        inStock: properties['In Stock']?.checkbox || false,
        sku: properties.SKU?.rich_text?.[0]?.plain_text || '',
        imageUrl: properties.Image?.url || ''
      };
    }) : [];

    return res.status(200).json({ success: true, products });
  }

  // POST request - create a new product in Notion
  if (req.method === 'POST') {
    const productData = req.body;

    if (!productData.name || !productData.price) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }

    const { data, error } = await createProduct(productData);

    if (error) {
      return res.status(500).json({ success: false, message: error });
    }

    return res.status(201).json({ 
      success: true, 
      id: data.id, 
      message: 'Product created successfully in Notion' 
    });
  }

  // Method not allowed
  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
