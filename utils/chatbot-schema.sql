-- Chatbot database schema

-- Conversations table
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active'
);

-- Messages table
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id SERIAL PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id),
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- Analytics table
CREATE TABLE IF NOT EXISTS chatbot_analytics (
  id SERIAL PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id),
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  intent VARCHAR(100) NOT NULL,
  timestamp TIMESTAMP NOT NULL
);

-- Support articles table
CREATE TABLE IF NOT EXISTS support_articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user_id ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_conversation_id ON chatbot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_analytics_conversation_id ON chatbot_analytics(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_analytics_intent ON chatbot_analytics(intent);
CREATE INDEX IF NOT EXISTS idx_support_articles_category ON support_articles(category);
CREATE INDEX IF NOT EXISTS idx_support_articles_title_content ON support_articles USING GIN (to_tsvector('english', title || ' ' || content));

-- Sample support articles
INSERT INTO support_articles (title, slug, summary, content, category, created_at, updated_at)
VALUES
  (
    'How to Replace an iPhone Screen',
    'how-to-replace-iphone-screen',
    'Step-by-step guide for replacing your iPhone screen at home.',
    'This comprehensive guide will walk you through the process of replacing your iPhone screen at home.

## Tools You''ll Need
- Replacement screen assembly
- Precision screwdriver set
- Pry tools
- Tweezers
- Heat gun or hair dryer (optional)
- Suction cup

## Step 1: Prepare Your Workspace
Find a clean, well-lit area to work. Lay out a soft cloth to prevent scratches and organize your screws as you remove them.

## Step 2: Power Off Your iPhone
Always turn off your iPhone before beginning any repair.

## Step 3: Remove the Display
1. Remove the two pentalobe screws at the bottom of your iPhone.
2. Use a suction cup to lift the display slightly.
3. Use a pry tool to carefully separate the display from the frame.
4. Slowly open the display like a book, being careful of the ribbon cables.

## Step 4: Disconnect the Battery
Always disconnect the battery before performing any repair to prevent electrical damage.

## Step 5: Remove the Display Assembly
Disconnect the display cables and remove any brackets securing them.

## Step 6: Install the New Display
1. Connect the display cables to the new screen.
2. Carefully place the new display onto the phone.
3. Reconnect the battery.
4. Close the display and secure it with the pentalobe screws.

## Step 7: Test Your New Screen
Power on your iPhone and test all functions of the new display.

For video tutorials and more detailed instructions, visit our support center at mdtstech.store/support.',
    'Repair Guides',
    NOW(),
    NOW()
  ),
  (
    'Troubleshooting iPhone Battery Issues',
    'troubleshooting-iphone-battery-issues',
    'Common battery problems and how to fix them.',
    'If you''re experiencing battery issues with your iPhone, try these troubleshooting steps before replacing the battery.

## Common Battery Issues
- Rapid battery drain
- iPhone shutting down unexpectedly
- Battery percentage jumping
- iPhone not charging
- Slow charging

## Basic Troubleshooting Steps

### 1. Check Battery Health
Go to Settings > Battery > Battery Health to check your battery''s maximum capacity. If it''s below 80%, your battery may need replacement.

### 2. Identify Battery-Draining Apps
Go to Settings > Battery to see which apps are using the most battery power. Consider limiting use of these apps or adjusting their background activity.

### 3. Restart Your iPhone
A simple restart can resolve many temporary issues.

### 4. Update iOS
Make sure your iPhone is running the latest version of iOS, as updates often include battery optimizations.

### 5. Reset All Settings
Go to Settings > General > Reset > Reset All Settings. This won''t delete your data but will reset system settings that might be causing battery drain.

## Charging Issues

### 1. Check Your Charging Cable and Adapter
Try different cables and adapters to rule out hardware issues.

### 2. Clean the Charging Port
Carefully remove lint or debris from the charging port using compressed air or a soft brush.

### 3. Try Different Power Sources
Some power sources may not provide enough power for proper charging.

## When to Replace Your Battery
If your battery health is below 80% or if troubleshooting doesn''t resolve your issues, it may be time to replace your battery.

For battery replacement services or DIY battery replacement kits, visit mdtstech.store/batteries.',
    'Troubleshooting',
    NOW(),
    NOW()
  ),
  (
    'Water Damage Repair Guide',
    'water-damage-repair-guide',
    'What to do if your device has water damage.',
    'If your device has been exposed to water or other liquids, follow these steps immediately to minimize damage.

## Immediate Actions

### 1. Power Off Your Device
Turn off your device immediately to prevent short circuits.

### 2. Remove the Battery (if possible)
If your device has a removable battery, take it out right away.

### 3. Remove SIM Card and Memory Cards
Take out any removable components to prevent data loss.

### 4. Dry the Exterior
Use a clean, absorbent cloth to dry the exterior of your device. Be gentle and avoid pushing liquid further into ports or openings.

### 5. Remove Excess Water
Gently shake your device to remove excess water from ports and openings.

## Drying Methods

### 1. Rice Method (Not Recommended)
Despite popular belief, rice is not very effective and can leave dust in your device.

### 2. Silica Gel Packets
Place your device in a container with silica gel packets for 48-72 hours.

### 3. Uncooked Instant Oatmeal
Instant oatmeal can absorb moisture effectively. Place your device in a container with uncooked instant oatmeal for 48-72 hours.

### 4. Professional Drying
For valuable devices, consider professional drying services.

## What NOT to Do
- Don''t use a hair dryer, microwave, or oven to dry your device
- Don''t shake the device vigorously
- Don''t press buttons repeatedly
- Don''t charge the device until completely dry (wait at least 48 hours)

## After Drying
1. Wait at least 48-72 hours before turning on your device
2. Check for visible corrosion or damage
3. If the device powers on, back up your data immediately
4. Monitor for unusual behavior

## Professional Repair
If your device doesn''t work properly after drying, professional repair may be necessary. Water damage can cause corrosion over time, so even if your device works initially, it may develop problems later.

For professional water damage repair services, visit mdtstech.store/repair-services or contact our support team.',
    'Repair Guides',
    NOW(),
    NOW()
  ),
  (
    'Understanding LCD vs. OLED Screens',
    'understanding-lcd-vs-oled-screens',
    'Differences between LCD and OLED screens and which is right for your device.',
    'When replacing your device''s screen, understanding the differences between LCD and OLED technologies can help you make the right choice.

## LCD Screens

### How LCD Works
LCD (Liquid Crystal Display) screens use a backlight that shines through colored liquid crystals to create images.

### Advantages of LCD
- Generally less expensive
- Better visibility in direct sunlight
- Longer lifespan
- No risk of screen burn-in
- Consistent brightness across the screen

### Disadvantages of LCD
- Less vibrant colors
- Lower contrast ratios
- Thicker design
- Higher power consumption
- Limited viewing angles

## OLED Screens

### How OLED Works
OLED (Organic Light Emitting Diode) screens have pixels that emit their own light, eliminating the need for a backlight.

### Advantages of OLED
- Perfect blacks and infinite contrast
- Vibrant, accurate colors
- Thinner and lighter design
- Lower power consumption (especially with dark content)
- Wider viewing angles
- Faster response times

### Disadvantages of OLED
- More expensive
- Risk of screen burn-in
- Shorter lifespan
- Less bright in direct sunlight

## Which Should You Choose?

### Choose LCD if:
- You''re on a budget
- Your device is frequently used in bright environments
- You display static images for long periods
- You need maximum brightness

### Choose OLED if:
- You want the best image quality
- You watch a lot of videos or play games
- You care about device thickness and weight
- Battery life is important to you
- You often use your device in darker environments

## Device-Specific Considerations
- iPhones: Models X and newer use OLED (except XR and 11, which use LCD)
- Samsung Galaxy: Most flagship models use OLED/AMOLED
- iPads: Most models use LCD, with newer iPad Pro models using mini-LED

For specific screen replacement options for your device, visit mdtstech.store/screens or contact our support team for recommendations.',
    'Product Information',
    NOW(),
    NOW()
  ),
  (
    'Shipping and Delivery FAQ',
    'shipping-and-delivery-faq',
    'Frequently asked questions about shipping and delivery.',
    '# Shipping and Delivery FAQ

## Shipping Options

### Standard Shipping
- Cost: Free for orders over $50, $4.99 for orders under $50
- Delivery Time: 3-5 business days
- Carrier: USPS or UPS, depending on location and package size

### Express Shipping
- Cost: $12.99
- Delivery Time: 1-2 business days
- Carrier: UPS or FedEx

### International Shipping
- Cost: Starting at $19.99, varies by country
- Delivery Time: 7-14 business days
- Carrier: DHL or FedEx International

## Order Processing

### Processing Time
All orders are processed within 1 business day. Orders placed before 2 PM EST Monday-Friday will typically ship the same day.

### Tracking Information
Tracking information will be emailed to you once your order ships. You can also track your order by logging into your account on our website.

### Shipping Cutoff Times
- Same-day shipping: Order by 2 PM EST Monday-Friday
- Weekend orders: Processed on the next business day

## Delivery Information

### Delivery Confirmation
All shipments include delivery confirmation.

### Signature Requirement
Orders over $100 require a signature upon delivery.

### Package Handling
If you''re not home, the carrier will follow their standard procedure:
- USPS: Leave in mailbox or at door, or leave a pickup notice
- UPS/FedEx: Attempt delivery up to 3 times, then hold at local facility

## International Shipping

### Countries We Ship To
We ship to most countries worldwide. For a complete list, please visit our international shipping page.

### Customs and Import Duties
International orders may be subject to import duties and taxes, which are the responsibility of the recipient. These charges vary by country and are not included in our shipping fees.

### International Tracking
All international shipments include tracking. Delivery times may vary based on customs processing.

## Shipping Policies

### Address Changes
To change your shipping address after placing an order, please contact us immediately at support@mdtstech.store or call +1 (240) 351-0511.

### Lost or Damaged Packages
If your package is lost or damaged during shipping, please contact us within 14 days of the expected delivery date.

### Shipping to P.O. Boxes
We can ship to P.O. Boxes via USPS, but not all items are eligible. Express shipping is not available for P.O. Boxes.

For more information about shipping and delivery, please contact our customer service team at support@mdtstech.store or call +1 (240) 351-0511.',
    'Customer Service',
    NOW(),
    NOW()
  );
