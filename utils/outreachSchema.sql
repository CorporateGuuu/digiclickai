-- Outreach System Database Schema

-- Channel configuration
CREATE TABLE IF NOT EXISTS outreach_channel_config (
  id SERIAL PRIMARY KEY,
  channel VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  settings JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Senders
CREATE TABLE IF NOT EXISTS outreach_senders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  channel VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  linkedin_id VARCHAR(100),
  facebook_id VARCHAR(100),
  instagram_id VARCHAR(100),
  telegram_id VARCHAR(100),
  is_default BOOLEAN DEFAULT false,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipients
CREATE TABLE IF NOT EXISTS recipients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  platform VARCHAR(50),
  platform_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for recipients
CREATE INDEX IF NOT EXISTS idx_recipients_email ON recipients(email);
CREATE INDEX IF NOT EXISTS idx_recipients_phone ON recipients(phone);
CREATE INDEX IF NOT EXISTS idx_recipients_platform_id ON recipients(platform, platform_id);

-- Campaigns
CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  channels JSONB NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'draft',
  schedule_options JSONB,
  created_by INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Recipients
CREATE TABLE IF NOT EXISTS campaign_recipients (
  campaign_id INTEGER REFERENCES outreach_campaigns(id),
  recipient_id INTEGER REFERENCES recipients(id),
  status VARCHAR(50) DEFAULT 'pending',
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (campaign_id, recipient_id)
);

-- Outreach Messages
CREATE TABLE IF NOT EXISTS outreach_messages (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES outreach_campaigns(id),
  channel VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  template TEXT NOT NULL,
  template_variables JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outreach Attempts
CREATE TABLE IF NOT EXISTS outreach_attempts (
  id SERIAL PRIMARY KEY,
  channel VARCHAR(50) NOT NULL,
  recipient_id INTEGER REFERENCES recipients(id),
  campaign_id INTEGER REFERENCES outreach_campaigns(id),
  message_id INTEGER,
  status VARCHAR(50) NOT NULL,
  error_details TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  message_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for outreach attempts
CREATE INDEX IF NOT EXISTS idx_outreach_attempts_recipient ON outreach_attempts(recipient_id);
CREATE INDEX IF NOT EXISTS idx_outreach_attempts_campaign ON outreach_attempts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_attempts_status ON outreach_attempts(status);

-- Email Logs
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  recipient_id INTEGER REFERENCES recipients(id),
  recipient_email VARCHAR(255) NOT NULL,
  sender_id INTEGER,
  sender_email VARCHAR(255),
  subject VARCHAR(255),
  message_id VARCHAR(255),
  campaign_id INTEGER REFERENCES outreach_campaigns(id),
  status VARCHAR(50) NOT NULL,
  error_details TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WhatsApp Logs
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id SERIAL PRIMARY KEY,
  recipient_id INTEGER REFERENCES recipients(id),
  recipient_phone VARCHAR(50) NOT NULL,
  message_id VARCHAR(255),
  campaign_id INTEGER REFERENCES outreach_campaigns(id),
  status VARCHAR(50) NOT NULL,
  error_details TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LinkedIn Logs
CREATE TABLE IF NOT EXISTS linkedin_logs (
  id SERIAL PRIMARY KEY,
  recipient_id INTEGER REFERENCES recipients(id),
  recipient_linkedin_id VARCHAR(100) NOT NULL,
  sender_id INTEGER,
  sender_linkedin_id VARCHAR(100),
  message_id VARCHAR(255),
  campaign_id INTEGER REFERENCES outreach_campaigns(id),
  status VARCHAR(50) NOT NULL,
  error_details TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facebook Logs
CREATE TABLE IF NOT EXISTS facebook_logs (
  id SERIAL PRIMARY KEY,
  recipient_id INTEGER REFERENCES recipients(id),
  recipient_facebook_id VARCHAR(100) NOT NULL,
  sender_id INTEGER,
  sender_facebook_id VARCHAR(100),
  message_id VARCHAR(255),
  campaign_id INTEGER REFERENCES outreach_campaigns(id),
  status VARCHAR(50) NOT NULL,
  error_details TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instagram Logs
CREATE TABLE IF NOT EXISTS instagram_logs (
  id SERIAL PRIMARY KEY,
  recipient_id INTEGER REFERENCES recipients(id),
  recipient_instagram_id VARCHAR(100) NOT NULL,
  sender_id INTEGER,
  sender_instagram_id VARCHAR(100),
  message_id VARCHAR(255),
  campaign_id INTEGER REFERENCES outreach_campaigns(id),
  status VARCHAR(50) NOT NULL,
  error_details TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Telegram Logs
CREATE TABLE IF NOT EXISTS telegram_logs (
  id SERIAL PRIMARY KEY,
  recipient_id INTEGER REFERENCES recipients(id),
  recipient_telegram_id VARCHAR(100) NOT NULL,
  sender_id INTEGER,
  sender_telegram_id VARCHAR(100),
  message_id VARCHAR(255),
  campaign_id INTEGER REFERENCES outreach_campaigns(id),
  status VARCHAR(50) NOT NULL,
  error_details TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics
CREATE TABLE IF NOT EXISTS outreach_analytics (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  channel VARCHAR(50) NOT NULL,
  campaign_id INTEGER REFERENCES outreach_campaigns(id),
  recipient_id INTEGER REFERENCES recipients(id),
  sender_id INTEGER,
  message_id VARCHAR(255),
  success BOOLEAN,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Metrics
CREATE TABLE IF NOT EXISTS campaign_metrics (
  campaign_id INTEGER REFERENCES outreach_campaigns(id) PRIMARY KEY,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_replied INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign Channel Metrics
CREATE TABLE IF NOT EXISTS campaign_channel_metrics (
  campaign_id INTEGER REFERENCES outreach_campaigns(id),
  channel VARCHAR(50) NOT NULL,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_replied INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (campaign_id, channel)
);

-- Channel Metrics
CREATE TABLE IF NOT EXISTS channel_metrics (
  channel VARCHAR(50) PRIMARY KEY,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_replied INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipient Metrics
CREATE TABLE IF NOT EXISTS recipient_metrics (
  recipient_id INTEGER REFERENCES recipients(id) PRIMARY KEY,
  total_received INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_replied INTEGER DEFAULT 0,
  last_interaction TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Templates
CREATE TABLE IF NOT EXISTS message_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  channel VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  variables JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook Events
CREATE TABLE IF NOT EXISTS webhook_events (
  id SERIAL PRIMARY KEY,
  channel VARCHAR(50) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for analytics and metrics
CREATE INDEX IF NOT EXISTS idx_outreach_analytics_campaign ON outreach_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_analytics_recipient ON outreach_analytics(recipient_id);
CREATE INDEX IF NOT EXISTS idx_outreach_analytics_event_type ON outreach_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_outreach_analytics_channel ON outreach_analytics(channel);
