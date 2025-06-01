// API route for specific outreach campaign
import { getCampaign, scheduleCampaign, executeCampaignNow } from '../../../../utils/outreachEngine';
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
    
    // Get campaign ID from URL
    const { id } = req.query;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid campaign ID' });
    }
    
    const campaignId = parseInt(id);
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return await handleGetCampaign(req, res, campaignId);
      case 'PUT':
        return await handleUpdateCampaign(req, res, campaignId, session);
      case 'DELETE':
        return await handleDeleteCampaign(req, res, campaignId, session);
      case 'POST':
        return await handleCampaignAction(req, res, campaignId, session);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in campaign API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handle GET request to fetch a specific campaign
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} campaignId - Campaign ID
 * @returns {Promise<void>}
 */
async function handleGetCampaign(req, res, campaignId) {
  try {
    // Get campaign details
    const campaignResult = await getCampaign(campaignId);
    
    if (!campaignResult.success) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Get campaign messages
    const messagesQuery = `
      SELECT * FROM outreach_messages
      WHERE campaign_id = $1
    `;
    
    const messagesResult = await pool.query(messagesQuery, [campaignId]);
    
    // Get recipient statistics
    const statsQuery = `
      SELECT 
        COUNT(*) AS total,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) AS sent,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) AS failed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending
      FROM campaign_recipients
      WHERE campaign_id = $1
    `;
    
    const statsResult = await pool.query(statsQuery, [campaignId]);
    
    // Return campaign with additional data
    return res.status(200).json({
      ...campaignResult.campaign,
      messages: messagesResult.rows,
      recipientStats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return res.status(500).json({ error: 'Failed to fetch campaign' });
  }
}

/**
 * Handle PUT request to update a campaign
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} campaignId - Campaign ID
 * @param {Object} session - Auth session
 * @returns {Promise<void>}
 */
async function handleUpdateCampaign(req, res, campaignId, session) {
  try {
    const { name, description, channels, startDate, endDate, status } = req.body;
    
    // Check if campaign exists
    const checkQuery = `
      SELECT * FROM outreach_campaigns
      WHERE id = $1
    `;
    
    const checkResult = await pool.query(checkQuery, [campaignId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Validate status transition
    const currentStatus = checkResult.rows[0].status;
    
    if (status && !isValidStatusTransition(currentStatus, status)) {
      return res.status(400).json({ 
        error: 'Invalid status transition',
        message: `Cannot change status from '${currentStatus}' to '${status}'`
      });
    }
    
    // Update campaign
    const updateQuery = `
      UPDATE outreach_campaigns
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        channels = COALESCE($3, channels),
        start_date = COALESCE($4, start_date),
        end_date = COALESCE($5, end_date),
        status = COALESCE($6, status),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    
    const updateValues = [
      name,
      description,
      channels ? JSON.stringify(channels) : null,
      startDate,
      endDate,
      status,
      campaignId
    ];
    
    const updateResult = await pool.query(updateQuery, updateValues);
    
    // Get updated campaign with additional data
    return await handleGetCampaign(req, res, campaignId);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return res.status(500).json({ error: 'Failed to update campaign' });
  }
}

/**
 * Handle DELETE request to delete a campaign
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} campaignId - Campaign ID
 * @param {Object} session - Auth session
 * @returns {Promise<void>}
 */
async function handleDeleteCampaign(req, res, campaignId, session) {
  try {
    // Check if campaign exists
    const checkQuery = `
      SELECT * FROM outreach_campaigns
      WHERE id = $1
    `;
    
    const checkResult = await pool.query(checkQuery, [campaignId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Check if campaign can be deleted
    const campaign = checkResult.rows[0];
    
    if (['in_progress', 'scheduled'].includes(campaign.status)) {
      return res.status(400).json({ 
        error: 'Cannot delete active campaign',
        message: 'Campaign must be stopped before it can be deleted'
      });
    }
    
    // Delete campaign (using transaction to ensure all related data is deleted)
    await pool.query('BEGIN');
    
    try {
      // Delete campaign recipients
      await pool.query('DELETE FROM campaign_recipients WHERE campaign_id = $1', [campaignId]);
      
      // Delete campaign messages
      await pool.query('DELETE FROM outreach_messages WHERE campaign_id = $1', [campaignId]);
      
      // Delete campaign metrics
      await pool.query('DELETE FROM campaign_metrics WHERE campaign_id = $1', [campaignId]);
      await pool.query('DELETE FROM campaign_channel_metrics WHERE campaign_id = $1', [campaignId]);
      
      // Delete campaign
      await pool.query('DELETE FROM outreach_campaigns WHERE id = $1', [campaignId]);
      
      await pool.query('COMMIT');
      
      return res.status(200).json({ success: true, message: 'Campaign deleted successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return res.status(500).json({ error: 'Failed to delete campaign' });
  }
}

/**
 * Handle POST request for campaign actions
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} campaignId - Campaign ID
 * @param {Object} session - Auth session
 * @returns {Promise<void>}
 */
async function handleCampaignAction(req, res, campaignId, session) {
  try {
    const { action } = req.body;
    
    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }
    
    // Check if campaign exists
    const campaignResult = await getCampaign(campaignId);
    
    if (!campaignResult.success) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    const campaign = campaignResult.campaign;
    
    // Handle different actions
    switch (action) {
      case 'schedule':
        return await handleScheduleCampaign(req, res, campaignId, campaign);
      
      case 'execute':
        return await handleExecuteCampaign(req, res, campaignId, campaign);
      
      case 'pause':
        return await handlePauseCampaign(req, res, campaignId, campaign);
      
      case 'resume':
        return await handleResumeCampaign(req, res, campaignId, campaign);
      
      case 'stop':
        return await handleStopCampaign(req, res, campaignId, campaign);
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error performing campaign action:', error);
    return res.status(500).json({ error: 'Failed to perform campaign action' });
  }
}

/**
 * Handle scheduling a campaign
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} campaignId - Campaign ID
 * @param {Object} campaign - Campaign data
 * @returns {Promise<void>}
 */
async function handleScheduleCampaign(req, res, campaignId, campaign) {
  try {
    const { scheduleOptions } = req.body;
    
    if (!scheduleOptions) {
      return res.status(400).json({ error: 'Schedule options are required' });
    }
    
    // Validate current status
    if (campaign.status !== 'draft' && campaign.status !== 'paused' && campaign.status !== 'stopped') {
      return res.status(400).json({ 
        error: 'Invalid campaign status',
        message: `Cannot schedule campaign with status '${campaign.status}'`
      });
    }
    
    // Schedule the campaign
    const result = await scheduleCampaign(campaignId, scheduleOptions);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error, details: result.details });
    }
    
    // Get updated campaign
    const updatedCampaign = await getCampaign(campaignId);
    
    return res.status(200).json({
      success: true,
      message: 'Campaign scheduled successfully',
      campaign: updatedCampaign.campaign
    });
  } catch (error) {
    console.error('Error scheduling campaign:', error);
    return res.status(500).json({ error: 'Failed to schedule campaign' });
  }
}

/**
 * Handle executing a campaign immediately
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} campaignId - Campaign ID
 * @param {Object} campaign - Campaign data
 * @returns {Promise<void>}
 */
async function handleExecuteCampaign(req, res, campaignId, campaign) {
  try {
    // Validate current status
    if (campaign.status !== 'draft' && campaign.status !== 'paused' && campaign.status !== 'scheduled') {
      return res.status(400).json({ 
        error: 'Invalid campaign status',
        message: `Cannot execute campaign with status '${campaign.status}'`
      });
    }
    
    // Execute the campaign
    const result = await executeCampaignNow(campaignId);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error, details: result.details });
    }
    
    // Get updated campaign
    const updatedCampaign = await getCampaign(campaignId);
    
    return res.status(200).json({
      success: true,
      message: 'Campaign executed successfully',
      results: result.results,
      campaign: updatedCampaign.campaign
    });
  } catch (error) {
    console.error('Error executing campaign:', error);
    return res.status(500).json({ error: 'Failed to execute campaign' });
  }
}

/**
 * Handle pausing a campaign
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} campaignId - Campaign ID
 * @param {Object} campaign - Campaign data
 * @returns {Promise<void>}
 */
async function handlePauseCampaign(req, res, campaignId, campaign) {
  try {
    // Validate current status
    if (campaign.status !== 'scheduled' && campaign.status !== 'in_progress') {
      return res.status(400).json({ 
        error: 'Invalid campaign status',
        message: `Cannot pause campaign with status '${campaign.status}'`
      });
    }
    
    // Update campaign status
    const updateQuery = `
      UPDATE outreach_campaigns
      SET status = 'paused', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    await pool.query(updateQuery, [campaignId]);
    
    // Get updated campaign
    const updatedCampaign = await getCampaign(campaignId);
    
    return res.status(200).json({
      success: true,
      message: 'Campaign paused successfully',
      campaign: updatedCampaign.campaign
    });
  } catch (error) {
    console.error('Error pausing campaign:', error);
    return res.status(500).json({ error: 'Failed to pause campaign' });
  }
}

/**
 * Handle resuming a campaign
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} campaignId - Campaign ID
 * @param {Object} campaign - Campaign data
 * @returns {Promise<void>}
 */
async function handleResumeCampaign(req, res, campaignId, campaign) {
  try {
    // Validate current status
    if (campaign.status !== 'paused') {
      return res.status(400).json({ 
        error: 'Invalid campaign status',
        message: `Cannot resume campaign with status '${campaign.status}'`
      });
    }
    
    // Update campaign status
    const updateQuery = `
      UPDATE outreach_campaigns
      SET status = 'scheduled', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    await pool.query(updateQuery, [campaignId]);
    
    // Reschedule the campaign if it has schedule options
    if (campaign.schedule_options) {
      await scheduleCampaign(campaignId, JSON.parse(campaign.schedule_options));
    }
    
    // Get updated campaign
    const updatedCampaign = await getCampaign(campaignId);
    
    return res.status(200).json({
      success: true,
      message: 'Campaign resumed successfully',
      campaign: updatedCampaign.campaign
    });
  } catch (error) {
    console.error('Error resuming campaign:', error);
    return res.status(500).json({ error: 'Failed to resume campaign' });
  }
}

/**
 * Handle stopping a campaign
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {number} campaignId - Campaign ID
 * @param {Object} campaign - Campaign data
 * @returns {Promise<void>}
 */
async function handleStopCampaign(req, res, campaignId, campaign) {
  try {
    // Validate current status
    if (campaign.status !== 'scheduled' && campaign.status !== 'in_progress' && campaign.status !== 'paused') {
      return res.status(400).json({ 
        error: 'Invalid campaign status',
        message: `Cannot stop campaign with status '${campaign.status}'`
      });
    }
    
    // Update campaign status
    const updateQuery = `
      UPDATE outreach_campaigns
      SET status = 'stopped', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    await pool.query(updateQuery, [campaignId]);
    
    // Get updated campaign
    const updatedCampaign = await getCampaign(campaignId);
    
    return res.status(200).json({
      success: true,
      message: 'Campaign stopped successfully',
      campaign: updatedCampaign.campaign
    });
  } catch (error) {
    console.error('Error stopping campaign:', error);
    return res.status(500).json({ error: 'Failed to stop campaign' });
  }
}

/**
 * Check if a status transition is valid
 * @param {string} currentStatus - Current status
 * @param {string} newStatus - New status
 * @returns {boolean} - Whether the transition is valid
 */
function isValidStatusTransition(currentStatus, newStatus) {
  // Define valid transitions
  const validTransitions = {
    'draft': ['scheduled', 'in_progress', 'stopped'],
    'scheduled': ['in_progress', 'paused', 'stopped', 'completed'],
    'in_progress': ['paused', 'stopped', 'completed'],
    'paused': ['scheduled', 'stopped', 'completed'],
    'stopped': ['draft', 'scheduled'],
    'completed': ['draft']
  };
  
  // Check if transition is valid
  return validTransitions[currentStatus]?.includes(newStatus) || false;
}
