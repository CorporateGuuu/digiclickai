// API route for campaign recipients
import { addRecipientsToCampaign } from '../../../../../utils/outreachEngine';
import { pool } from '../../../../../utils/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get campaign ID from URL
    const { id } = req.query;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid campaign ID' });
    }
    
    const campaignId = parseInt(id);
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return await handleGetRecipients(req, res, campaignId);
      case 'POST':
        return await handleAddRecipients(req, res, campaignId, session);
      case 'DELETE':
        return await handleRemoveRecipients(req, res, campaignId, session);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in campaign recipients API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handle GET request to fetch campaign recipients
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} campaignId - Campaign ID
 * @returns {Promise<void>}
 */
async function handleGetRecipients(req, res, campaignId) {
  try {
    // Check if campaign exists
    const campaignQuery = `
      SELECT * FROM outreach_campaigns
      WHERE id = $1
    `;
    
    const campaignResult = await pool.query(campaignQuery, [campaignId]);
    
    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const status = req.query.status || null;
    const search = req.query.search || null;
    
    // Build query
    let query = `
      SELECT r.*, cr.status, cr.added_at
      FROM recipients r
      JOIN campaign_recipients cr ON r.id = cr.recipient_id
      WHERE cr.campaign_id = $1
    `;
    
    const queryParams = [campaignId];
    
    // Add status filter
    if (status) {
      query += ` AND cr.status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }
    
    // Add search filter
    if (search) {
      query += ` AND (
        r.name ILIKE $${queryParams.length + 1} OR
        r.email ILIKE $${queryParams.length + 1} OR
        r.phone ILIKE $${queryParams.length + 1}
      )`;
      queryParams.push(`%${search}%`);
    }
    
    // Add sorting and pagination
    query += ' ORDER BY cr.added_at DESC';
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Execute query
    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM recipients r
      JOIN campaign_recipients cr ON r.id = cr.recipient_id
      WHERE cr.campaign_id = $1
      ${status ? ' AND cr.status = $2' : ''}
      ${search ? ` AND (
        r.name ILIKE $${status ? 3 : 2} OR
        r.email ILIKE $${status ? 3 : 2} OR
        r.phone ILIKE $${status ? 3 : 2}
      )` : ''}
    `;
    
    const countParams = [campaignId];
    if (status) countParams.push(status);
    if (search) countParams.push(`%${search}%`);
    
    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].total);
    
    // Return results
    return res.status(200).json({
      recipients: result.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching campaign recipients:', error);
    return res.status(500).json({ error: 'Failed to fetch campaign recipients' });
  }
}

/**
 * Handle POST request to add recipients to a campaign
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} campaignId - Campaign ID
 * @param {Object} session - Auth session
 * @returns {Promise<void>}
 */
async function handleAddRecipients(req, res, campaignId, session) {
  try {
    const { recipients } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients array is required' });
    }
    
    // Check if campaign exists
    const campaignQuery = `
      SELECT * FROM outreach_campaigns
      WHERE id = $1
    `;
    
    const campaignResult = await pool.query(campaignQuery, [campaignId]);
    
    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Check if campaign is in a state where recipients can be added
    const campaign = campaignResult.rows[0];
    
    if (campaign.status === 'completed') {
      return res.status(400).json({ 
        error: 'Cannot add recipients to completed campaign',
        message: 'Campaign is already completed'
      });
    }
    
    // Add recipients to campaign
    const result = await addRecipientsToCampaign(campaignId, recipients);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error, details: result.details });
    }
    
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error adding recipients to campaign:', error);
    return res.status(500).json({ error: 'Failed to add recipients to campaign' });
  }
}

/**
 * Handle DELETE request to remove recipients from a campaign
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} campaignId - Campaign ID
 * @param {Object} session - Auth session
 * @returns {Promise<void>}
 */
async function handleRemoveRecipients(req, res, campaignId, session) {
  try {
    const { recipientIds } = req.body;
    
    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res.status(400).json({ error: 'Recipient IDs array is required' });
    }
    
    // Check if campaign exists
    const campaignQuery = `
      SELECT * FROM outreach_campaigns
      WHERE id = $1
    `;
    
    const campaignResult = await pool.query(campaignQuery, [campaignId]);
    
    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Check if campaign is in a state where recipients can be removed
    const campaign = campaignResult.rows[0];
    
    if (campaign.status === 'in_progress') {
      return res.status(400).json({ 
        error: 'Cannot remove recipients from in-progress campaign',
        message: 'Pause or stop the campaign first'
      });
    }
    
    // Remove recipients from campaign
    const deleteQuery = `
      DELETE FROM campaign_recipients
      WHERE campaign_id = $1 AND recipient_id = ANY($2)
    `;
    
    await pool.query(deleteQuery, [campaignId, recipientIds]);
    
    return res.status(200).json({
      success: true,
      message: `Removed ${recipientIds.length} recipients from campaign`
    });
  } catch (error) {
    console.error('Error removing recipients from campaign:', error);
    return res.status(500).json({ error: 'Failed to remove recipients from campaign' });
  }
}
