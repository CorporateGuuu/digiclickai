import { getDocuments, getDocument, addDocument, updateDocument, deleteDocument } from '../../../lib/firebase';

export default async function handler(req, res) {
  // GET request - fetch products
  if (req.method === 'GET') {
    const { id, category } = req.query;

    // Get a single product by ID
    if (id) {
      const { data, error } = await getDocument('products', id);

      if (error) {
        return res.status(500).json({ success: false, message: error });
      }

      if (!data) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      return res.status(200).json({ success: true, product: data });
    }

    // Get products, optionally filtered by category
    const conditions = [];
    if (category) {
      conditions.push({
        field: 'category',
        operator: '==',
        value: category
      });
    }

    const { data, error } = await getDocuments('products', conditions);

    if (error) {
      return res.status(500).json({ success: false, message: error });
    }

    return res.status(200).json({ success: true, products: data || [] });
  }

  // POST request - create a new product
  if (req.method === 'POST') {
    const productData = req.body;

    if (!productData.name || !productData.price) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }

    const { id, error } = await addDocument('products', productData);

    if (error) {
      return res.status(500).json({ success: false, message: error });
    }

    return res.status(201).json({ success: true, id, message: 'Product created successfully' });
  }

  // PUT request - update a product
  if (req.method === 'PUT') {
    const { id } = req.query;
    const productData = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const { error } = await updateDocument('products', id, productData);

    if (error) {
      return res.status(500).json({ success: false, message: error });
    }

    return res.status(200).json({ success: true, message: 'Product updated successfully' });
  }

  // DELETE request - delete a product
  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const { error } = await deleteDocument('products', id);

    if (error) {
      return res.status(500).json({ success: false, message: error });
    }

    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  }

  // Method not allowed
  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
