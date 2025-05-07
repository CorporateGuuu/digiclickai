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
  
  // GET - Fetch marketplace integrations
  if (req.method === 'GET') {
    try {
      // Get marketplace integrations
      const integrationsResult = await query(`
        SELECT * FROM integration_settings 
        WHERE integration_type IN ('amazon', 'ebay', 'tiktok')
      `);
      
      // Initialize marketplace data
      const marketplaces = {
        amazon: {
          status: 'disconnected',
          settings: null,
          accounts: []
        },
        ebay: {
          status: 'disconnected',
          settings: null,
          accounts: []
        },
        tiktok: {
          status: 'disconnected',
          settings: null
        }
      };
      
      // Process integration settings
      integrationsResult.forEach(integration => {
        if (integration.integration_type === 'amazon') {
          marketplaces.amazon.status = integration.status;
          marketplaces.amazon.settings = {
            apiKey: integration.api_key,
            secretKey: integration.api_secret
          };
        } else if (integration.integration_type === 'ebay') {
          marketplaces.ebay.status = integration.status;
          marketplaces.ebay.settings = {
            apiKey: integration.api_key,
            secretKey: integration.api_secret
          };
        } else if (integration.integration_type === 'tiktok') {
          marketplaces.tiktok.status = integration.status;
          marketplaces.tiktok.settings = {
            apiKey: integration.api_key,
            secretKey: integration.api_secret
          };
        }
      });
      
      // Get Amazon accounts
      if (marketplaces.amazon.status === 'connected') {
        const amazonAccountsResult = await query(`
          SELECT id, name, account_id, active
          FROM marketplace_accounts
          WHERE marketplace = 'amazon'
          ORDER BY name ASC
        `);
        
        marketplaces.amazon.accounts = amazonAccountsResult;
      }
      
      // Get eBay accounts
      if (marketplaces.ebay.status === 'connected') {
        const ebayAccountsResult = await query(`
          SELECT id, name, account_id, active
          FROM marketplace_accounts
          WHERE marketplace = 'ebay'
          ORDER BY name ASC
        `);
        
        marketplaces.ebay.accounts = ebayAccountsResult;
      }
      
      return res.status(200).json({
        success: true,
        marketplaces
      });
    } catch (error) {
      console.error('Error fetching marketplace integrations:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  // POST - Connect marketplace integration
  if (req.method === 'POST') {
    try {
      const { marketplace, apiKey, secretKey } = req.body;
      
      if (!marketplace || !apiKey || !secretKey) {
        return res.status(400).json({
          success: false,
          message: 'Marketplace, API key, and secret key are required'
        });
      }
      
      if (!['amazon', 'ebay', 'tiktok'].includes(marketplace)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid marketplace'
        });
      }
      
      // Check if marketplace integration already exists
      const existingResult = await query(`
        SELECT id FROM integration_settings 
        WHERE integration_type = ?
        LIMIT 1
      `, [marketplace]);
      
      if (existingResult.length > 0) {
        // Update existing integration
        await query(`
          UPDATE integration_settings
          SET api_key = ?, api_secret = ?, status = 'connected', updated_at = NOW()
          WHERE integration_type = ?
        `, [apiKey, secretKey, marketplace]);
      } else {
        // Create new integration
        await query(`
          INSERT INTO integration_settings (integration_type, api_key, api_secret, status, created_at, updated_at)
          VALUES (?, ?, ?, 'connected', NOW(), NOW())
        `, [marketplace, apiKey, secretKey]);
      }
      
      return res.status(200).json({
        success: true,
        message: `${marketplace} integration connected successfully`
      });
    } catch (error) {
      console.error('Error connecting marketplace integration:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  // PUT - Update marketplace account status
  if (req.method === 'PUT') {
    try {
      const { accountId, active } = req.body;
      
      if (!accountId) {
        return res.status(400).json({
          success: false,
          message: 'Account ID is required'
        });
      }
      
      // Update account status
      await query(`
        UPDATE marketplace_accounts
        SET active = ?, updated_at = NOW()
        WHERE id = ?
      `, [active ? 1 : 0, accountId]);
      
      return res.status(200).json({
        success: true,
        message: 'Account status updated successfully'
      });
    } catch (error) {
      console.error('Error updating marketplace account:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  
  // DELETE - Disconnect marketplace integration
  if (req.method === 'DELETE') {
    try {
      const { marketplace } = req.body;
      
      if (!marketplace) {
        return res.status(400).json({
          success: false,
          message: 'Marketplace is required'
        });
      }
      
      if (!['amazon', 'ebay', 'tiktok'].includes(marketplace)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid marketplace'
        });
      }
      
      // Update integration status
      await query(`
        UPDATE integration_settings
        SET status = 'disconnected', updated_at = NOW()
        WHERE integration_type = ?
      `, [marketplace]);
      
      return res.status(200).json({
        success: true,
        message: `${marketplace} integration disconnected successfully`
      });
    } catch (error) {
      console.error('Error disconnecting marketplace integration:', error);
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
