import { getSession } from 'next-auth/react';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  // Check if user is authenticated and is an admin
  if (!session || !session.user.isAdmin) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }
  
  // GET - Fetch n8n integration status
  if (req.method === 'GET') {
    try {
      // Get n8n integration settings
      const settingsResult = await query(`
        SELECT * FROM integration_settings 
        WHERE integration_type = 'n8n'
        LIMIT 1
      `);
      
      if (settingsResult.length === 0) {
        return res.status(200).json({
          success: true,
          status: 'disconnected',
          settings: null,
          workflows: []
        });
      }
      
      const settings = settingsResult[0];
      
      // Get n8n workflows
      const workflowsResult = await query(`
        SELECT id, name, workflow_id, active
        FROM n8n_workflows
        ORDER BY name ASC
      `);
      
      return res.status(200).json({
        success: true,
        status: settings.status,
        settings: {
          url: settings.api_url,
          key: settings.api_key
        },
        workflows: workflowsResult
      });
    } catch (error) {
      console.error('Error fetching n8n integration:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  // POST - Connect n8n integration
  if (req.method === 'POST') {
    try {
      const { url, apiKey } = req.body;
      
      if (!url || !apiKey) {
        return res.status(400).json({
          success: false,
          message: 'URL and API key are required'
        });
      }
      
      // Check if n8n integration already exists
      const existingResult = await query(`
        SELECT id FROM integration_settings 
        WHERE integration_type = 'n8n'
        LIMIT 1
      `);
      
      if (existingResult.length > 0) {
        // Update existing integration
        await query(`
          UPDATE integration_settings
          SET api_url = ?, api_key = ?, status = 'connected', updated_at = NOW()
          WHERE integration_type = 'n8n'
        `, [url, apiKey]);
      } else {
        // Create new integration
        await query(`
          INSERT INTO integration_settings (integration_type, api_url, api_key, status, created_at, updated_at)
          VALUES ('n8n', ?, ?, 'connected', NOW(), NOW())
        `, [url, apiKey]);
      }
      
      return res.status(200).json({
        success: true,
        message: 'n8n integration connected successfully'
      });
    } catch (error) {
      console.error('Error connecting n8n integration:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  // PUT - Update n8n workflow status
  if (req.method === 'PUT') {
    try {
      const { workflowId, active } = req.body;
      
      if (!workflowId) {
        return res.status(400).json({
          success: false,
          message: 'Workflow ID is required'
        });
      }
      
      // Update workflow status
      await query(`
        UPDATE n8n_workflows
        SET active = ?, updated_at = NOW()
        WHERE id = ?
      `, [active ? 1 : 0, workflowId]);
      
      return res.status(200).json({
        success: true,
        message: 'Workflow status updated successfully'
      });
    } catch (error) {
      console.error('Error updating n8n workflow:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  // DELETE - Disconnect n8n integration
  if (req.method === 'DELETE') {
    try {
      // Update integration status
      await query(`
        UPDATE integration_settings
        SET status = 'disconnected', updated_at = NOW()
        WHERE integration_type = 'n8n'
      `);
      
      return res.status(200).json({
        success: true,
        message: 'n8n integration disconnected successfully'
      });
    } catch (error) {
      console.error('Error disconnecting n8n integration:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}
