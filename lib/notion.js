import { Client } from '@notionhq/client';

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Database IDs
const PRODUCTS_DATABASE_ID = process.env.NOTION_PRODUCTS_DATABASE_ID;
const ORDERS_DATABASE_ID = process.env.NOTION_ORDERS_DATABASE_ID;
const CUSTOMERS_DATABASE_ID = process.env.NOTION_CUSTOMERS_DATABASE_ID;
const CONTENT_DATABASE_ID = process.env.NOTION_CONTENT_DATABASE_ID;

/**
 * Get a page from Notion by ID
 */
export async function getPage(pageId) {
  try {
    const response = await notion.pages.retrieve({ page_id: pageId });
    return { data: response, error: null };
  } catch (error) {
    console.error('Error getting Notion page:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get page content (blocks)
 */
export async function getPageContent(pageId) {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });
    return { data: response.results, error: null };
  } catch (error) {
    console.error('Error getting Notion page content:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Query a database
 */
export async function queryDatabase(databaseId, filter = {}, sorts = []) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: filter,
      sorts: sorts,
    });
    return { data: response.results, error: null };
  } catch (error) {
    console.error('Error querying Notion database:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Create a page in a database
 */
export async function createPage(databaseId, properties, children = []) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: properties,
      children: children,
    });
    return { data: response, error: null };
  } catch (error) {
    console.error('Error creating Notion page:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update a page
 */
export async function updatePage(pageId, properties) {
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      properties: properties,
    });
    return { data: response, error: null };
  } catch (error) {
    console.error('Error updating Notion page:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get all products from Notion
 */
export async function getProducts(filter = {}, sorts = []) {
  return await queryDatabase(PRODUCTS_DATABASE_ID, filter, sorts);
}

/**
 * Get a single product by ID
 */
export async function getProduct(productId) {
  return await getPage(productId);
}

/**
 * Create a new product
 */
export async function createProduct(productData) {
  const properties = {
    Name: { title: [{ text: { content: productData.name } }] },
    Price: { number: productData.price },
    Category: { select: { name: productData.category } },
    Description: { rich_text: [{ text: { content: productData.description || '' } }] },
    'In Stock': { checkbox: productData.inStock || true },
    SKU: { rich_text: [{ text: { content: productData.sku || '' } }] },
  };

  if (productData.imageUrl) {
    properties['Image'] = { url: productData.imageUrl };
  }

  return await createPage(PRODUCTS_DATABASE_ID, properties);
}

/**
 * Create a new order in Notion
 */
export async function createOrder(orderData) {
  const properties = {
    'Order Number': { title: [{ text: { content: orderData.orderNumber } }] },
    Status: { select: { name: orderData.status || 'Pending' } },
    'Total Amount': { number: orderData.totalAmount },
    Customer: { rich_text: [{ text: { content: orderData.customerName } }] },
    Email: { email: orderData.email },
    'Order Date': { date: { start: new Date().toISOString() } },
  };

  // Create order items as children blocks
  const children = [
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: 'Order Items' } }]
      }
    }
  ];

  // Add each order item as a bulleted list
  orderData.items.forEach(item => {
    children.push({
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: `${item.quantity}x ${item.name} - $${item.price.toFixed(2)} each`
            }
          }
        ]
      }
    });
  });

  return await createPage(ORDERS_DATABASE_ID, properties, children);
}

/**
 * Create or update a customer in Notion
 */
export async function upsertCustomer(customerData) {
  // First, check if customer exists by email
  const { data: existingCustomers } = await queryDatabase(CUSTOMERS_DATABASE_ID, {
    property: 'Email',
    email: {
      equals: customerData.email
    }
  });

  if (existingCustomers && existingCustomers.length > 0) {
    // Update existing customer
    const customerId = existingCustomers[0].id;
    const properties = {
      Name: { title: [{ text: { content: customerData.name } }] },
      Phone: { phone_number: customerData.phone || '' },
      'Total Orders': { number: customerData.totalOrders || 0 },
      'Total Spent': { number: customerData.totalSpent || 0 },
    };

    return await updatePage(customerId, properties);
  } else {
    // Create new customer
    const properties = {
      Name: { title: [{ text: { content: customerData.name } }] },
      Email: { email: customerData.email },
      Phone: { phone_number: customerData.phone || '' },
      'Total Orders': { number: customerData.totalOrders || 0 },
      'Total Spent': { number: customerData.totalSpent || 0 },
      'Created At': { date: { start: new Date().toISOString() } },
    };

    return await createPage(CUSTOMERS_DATABASE_ID, properties);
  }
}

/**
 * Get content pages (blog posts, FAQs, etc.)
 */
export async function getContentPages(filter = {}, sorts = []) {
  return await queryDatabase(CONTENT_DATABASE_ID, filter, sorts);
}

/**
 * Get a single content page by ID
 */
export async function getContentPage(pageId) {
  const { data: page, error: pageError } = await getPage(pageId);
  
  if (pageError) {
    return { data: null, error: pageError };
  }
  
  const { data: content, error: contentError } = await getPageContent(pageId);
  
  if (contentError) {
    return { data: { page, content: [] }, error: contentError };
  }
  
  return { data: { page, content }, error: null };
}

export default notion;
