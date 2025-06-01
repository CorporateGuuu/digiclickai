// API route for outreach campaigns
import { createCampaign, getCampaign } from '../../../../utils/outreachEngine';
import { pool } from '../../../../utils/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return await handleGetCampaigns(req, res, session);
      case 'POST':
        return await handleCreateCampaign(req, res, session);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in campaigns API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handle GET request to fetch campaigns
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} session - Auth session
 * @returns {Promise<void>}
 */
async function handleGetCampaigns(req, res, session) {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || null;
    const search = req.query.search || null;
    
    // Build query
    let query = `
      SELECT c.*, 
        COUNT(DISTINCT cr.recipient_id) AS total_recipients,
        COUNT(DISTINCT CASE WHEN cr.status = 'sent' THEN cr.recipient_id END) AS sent_count,
        COUNT(DISTINCT CASE WHEN cr.status = 'failed' THEN cr.recipient_id END) AS failed_count,
        COUNT(DISTINCT CASE WHEN cr.status = 'pending' THEN cr.recipient_id END) AS pending_count
      FROM outreach_campaigns c
      LEFT JOIN campaign_recipients cr ON c.id = cr.campaign_id
    `;
    
    const queryParams = [];
    let whereClause = '';
    
    // Add status filter
    if (status) {
      whereClause += ' WHERE c.status = $1';
      queryParams.push(status);
    }
    
    // Add search filter
    if (search) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ` c.name ILIKE $${queryParams.length + 1}`;
      queryParams.push(`%${search}%`);
    }
    
    // Complete the query
    query += whereClause;
    query += ' GROUP BY c.id ORDER BY c.created_at DESC';
    
    // Add pagination
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Execute query
    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM outreach_campaigns c
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2));
    const totalCount = parseInt(countResult.rows[0].total);
    
    // Return results
    return res.status(200).json({
      campaigns: result.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
}

/**
 * Handle POST request to create a campaign
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} session - Auth session
 * @returns {Promise<void>}
 */
async function handleCreateCampaign(req, res, session) {
  try {
    const { name, description, channels, startDate, endDate, status } = req.body;
    
    // Validate required fields
    if (!name || !channels || !Array.isArray(channels) || channels.length === 0) {
      return res.status(400).json({ error: 'Name and at least one channel are required' });
    }
    
    // Create campaign
    const campaignData = {
      name,
      description,
      channels,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      status: status || 'draft',
      createdBy: session.user.id
    };
    
    const result = await createCampaign(campaignData);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error, details: result.details });
    }
    
    // Get the created campaign
    const campaign = await getCampaign(result.campaignId);
    
    return res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({ error: 'Failed to create campaign' });
  }
}
