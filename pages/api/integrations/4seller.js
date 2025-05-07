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
  
  // GET - Fetch 4seller integration status
  if (req.method === 'GET') {
    try {
      // Get 4seller integration settings
      const settingsResult = await query(`
        SELECT * FROM integration_settings 
        WHERE integration_type = '4seller'
        LIMIT 1
      `);
      
      if (settingsResult.length === 0) {
        return res.status(200).json({
          success: true,
          status: 'disconnected',
          settings: null,
          stores: []
        });
      }
      
      const settings = settingsResult[0];
      
      // Get 4seller stores
      const storesResult = await query(`
        SELECT id, name, store_id, active
        FROM fourseller_stores
        ORDER BY name ASC
      `);
      
      return res.status(200).json({
        success: true,
        status: settings.status,
        settings: {
          apiKey: settings.api_key
        },
        stores: storesResult
      });
    } catch (error) {
      console.error('Error fetching 4seller integration:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  // POST - Connect 4seller integration
  if (req.method === 'POST') {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          message: 'API key is required'
        });
      }
      
      // Check if 4seller integration already exists
      const existingResult = await query(`
        SELECT id FROM integration_settings 
        WHERE integration_type = '4seller'
        LIMIT 1
      `);
      
      if (existingResult.length > 0) {
        // Update existing integration
        await query(`
          UPDATE integration_settings
          SET api_key = ?, status = 'connected', updated_at = NOW()
          WHERE integration_type = '4seller'
        `, [apiKey]);
      } else {
        // Create new integration
        await query(`
          INSERT INTO integration_settings (integration_type, api_key, status, created_at, updated_at)
          VALUES ('4seller', ?, 'connected', NOW(), NOW())
        `, [apiKey]);
      }
      
      return res.status(200).json({
        success: true,
        message: '4seller integration connected successfully'
      });
    } catch (error) {
      console.error('Error connecting 4seller integration:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  // PUT - Update 4seller store status
  if (req.method === 'PUT') {
    try {
      const { storeId, active } = req.body;
      
      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: 'Store ID is required'
        });
      }
      
      // Update store status
      await query(`
        UPDATE fourseller_stores
        SET active = ?, updated_at = NOW()
        WHERE id = ?
      `, [active ? 1 : 0, storeId]);
      
      return res.status(200).json({
        success: true,
        message: 'Store status updated successfully'
      });
    } catch (error) {
      console.error('Error updating 4seller store:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  // DELETE - Disconnect 4seller integration
  if (req.method === 'DELETE') {
    try {
      // Update integration status
      await query(`
        UPDATE integration_settings
        SET status = 'disconnected', updated_at = NOW()
        WHERE integration_type = '4seller'
      `);
      
      return res.status(200).json({
        success: true,
        message: '4seller integration disconnected successfully'
      });
    } catch (error) {
      console.error('Error disconnecting 4seller integration:', error);
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
