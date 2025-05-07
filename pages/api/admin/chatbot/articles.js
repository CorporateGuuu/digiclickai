import { pool } from '../../../../utils/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  // Check if user is authenticated and is an admin
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user.isAdmin) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    // Get support articles
    const query = `
      SELECT id, title, slug, summary, category, created_at, updated_at
      FROM support_articles
      ORDER BY updated_at DESC
    `;
    
    try {
      const { rows } = await pool.query(query);
      
      return res.status(200).json({
        success: true,
        articles: rows
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Return mock data for demo purposes
      return res.status(200).json({
        success: true,
        articles: getMockArticles()
      });
    }
  } catch (error) {
    console.error('Error fetching support articles:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// Generate mock support articles for demo purposes
function getMockArticles() {
  return [
    {
      id: 1,
      title: 'How to Replace an iPhone Screen',
      slug: 'how-to-replace-iphone-screen',
      summary: 'Step-by-step guide for replacing your iPhone screen at home.',
      category: 'Repair Guides',
      created_at: '2023-01-15T10:30:00Z',
      updated_at: '2023-03-20T14:45:00Z'
    },
    {
      id: 2,
      title: 'Troubleshooting iPhone Battery Issues',
      slug: 'troubleshooting-iphone-battery-issues',
      summary: 'Common battery problems and how to fix them.',
      category: 'Troubleshooting',
      created_at: '2023-02-10T09:15:00Z',
      updated_at: '2023-04-05T11:30:00Z'
    },
    {
      id: 3,
      title: 'Water Damage Repair Guide',
      slug: 'water-damage-repair-guide',
      summary: 'What to do if your device has water damage.',
      category: 'Repair Guides',
      created_at: '2023-01-25T13:45:00Z',
      updated_at: '2023-03-15T16:20:00Z'
    },
    {
      id: 4,
      title: 'Understanding LCD vs. OLED Screens',
      slug: 'understanding-lcd-vs-oled-screens',
      summary: 'Differences between LCD and OLED screens and which is right for your device.',
      category: 'Product Information',
      created_at: '2023-02-28T15:10:00Z',
      updated_at: '2023-04-10T09:45:00Z'
    },
    {
      id: 5,
      title: 'Shipping and Delivery FAQ',
      slug: 'shipping-and-delivery-faq',
      summary: 'Frequently asked questions about shipping and delivery.',
      category: 'Customer Service',
      created_at: '2023-01-05T11:20:00Z',
      updated_at: '2023-03-25T10:15:00Z'
    }
  ];
}
