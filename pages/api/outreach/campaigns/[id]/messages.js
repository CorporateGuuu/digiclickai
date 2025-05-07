// API route for campaign messages
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
        return await handleGetMessages(req, res, campaignId);
      case 'POST':
        return await handleCreateMessage(req, res, campaignId, session);
      case 'PUT':
        return await handleUpdateMessage(req, res, campaignId, session);
      case 'DELETE':
        return await handleDeleteMessage(req, res, campaignId, session);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in campaign messages API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handle GET request to fetch campaign messages
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} campaignId - Campaign ID
 * @returns {Promise<void>}
 */
async function handleGetMessages(req, res, campaignId) {
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
    
    // Get messages for the campaign
    const messagesQuery = `
      SELECT * FROM outreach_messages
      WHERE campaign_id = $1
      ORDER BY channel
    `;
    
    const messagesResult = await pool.query(messagesQuery, [campaignId]);
    
    return res.status(200).json({
      messages: messagesResult.rows
    });
  } catch (error) {
    console.error('Error fetching campaign messages:', error);
    return res.status(500).json({ error: 'Failed to fetch campaign messages' });
  }
}

/**
 * Handle POST request to create a campaign message
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} campaignId - Campaign ID
 * @param {Object} session - Auth session
 * @returns {Promise<void>}
 */
async function handleCreateMessage(req, res, campaignId, session) {
  try {
    const { channel, subject, template, templateVariables } = req.body;
    
    // Validate required fields
    if (!channel || !template) {
      return res.status(400).json({ error: 'Channel and template are required' });
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
    
    // Check if a message for this channel already exists
    const existingQuery = `
      SELECT * FROM outreach_messages
      WHERE campaign_id = $1 AND channel = $2
    `;
    
    const existingResult = await pool.query(existingQuery, [campaignId, channel]);
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Message already exists',
        message: `A message for channel '${channel}' already exists for this campaign`
      });
    }
    
    // Create the message
    const createQuery = `
      INSERT INTO outreach_messages (
        campaign_id,
        channel,
        subject,
        template,
        template_variables,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    
    const createValues = [
      campaignId,
      channel,
      subject,
      template,
      templateVariables ? JSON.stringify(templateVariables) : null
    ];
    
    const createResult = await pool.query(createQuery, createValues);
    
    return res.status(201).json({
      message: createResult.rows[0]
    });
  } catch (error) {
    console.error('Error creating campaign message:', error);
    return res.status(500).json({ error: 'Failed to create campaign message' });
  }
}

/**
 * Handle PUT request to update a campaign message
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} campaignId - Campaign ID
 * @param {Object} session - Auth session
 * @returns {Promise<void>}
 */
async function handleUpdateMessage(req, res, campaignId, session) {
  try {
    const { messageId, subject, template, templateVariables } = req.body;
    
    // Validate required fields
    if (!messageId) {
      return res.status(400).json({ error: 'Message ID is required' });
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
    
    // Check if message exists and belongs to the campaign
    const messageQuery = `
      SELECT * FROM outreach_messages
      WHERE id = $1 AND campaign_id = $2
    `;
    
    const messageResult = await pool.query(messageQuery, [messageId, campaignId]);
    
    if (messageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Update the message
    const updateQuery = `
      UPDATE outreach_messages
      SET
        subject = COALESCE($1, subject),
        template = COALESCE($2, template),
        template_variables = COALESCE($3, template_variables),
        updated_at = NOW()
      WHERE id = $4 AND campaign_id = $5
      RETURNING *
    `;
    
    const updateValues = [
      subject,
      template,
      templateVariables ? JSON.stringify(templateVariables) : null,
      messageId,
      campaignId
    ];
    
    const updateResult = await pool.query(updateQuery, updateValues);
    
    return res.status(200).json({
      message: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Error updating campaign message:', error);
    return res.status(500).json({ error: 'Failed to update campaign message' });
  }
}

/**
 * Handle DELETE request to delete a campaign message
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} campaignId - Campaign ID
 * @param {Object} session - Auth session
 * @returns {Promise<void>}
 */
async function handleDeleteMessage(req, res, campaignId, session) {
  try {
    const { messageId } = req.body;
    
    // Validate required fields
    if (!messageId) {
      return res.status(400).json({ error: 'Message ID is required' });
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
    
    // Check if message exists and belongs to the campaign
    const messageQuery = `
      SELECT * FROM outreach_messages
      WHERE id = $1 AND campaign_id = $2
    `;
    
    const messageResult = await pool.query(messageQuery, [messageId, campaignId]);
    
    if (messageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Delete the message
    const deleteQuery = `
      DELETE FROM outreach_messages
      WHERE id = $1 AND campaign_id = $2
    `;
    
    await pool.query(deleteQuery, [messageId, campaignId]);
    
    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting campaign message:', error);
    return res.status(500).json({ error: 'Failed to delete campaign message' });
  }
}
