# MDTS Tech Store Integrations Setup Guide

This guide provides instructions for setting up Firebase, Notion, and Zapier integrations for the MDTS Tech Store.

## Table of Contents
1. [Firebase Setup](#firebase-setup)
2. [Notion Setup](#notion-setup)
3. [Zapier Setup](#zapier-setup)
4. [Environment Variables](#environment-variables)
5. [Testing the Integrations](#testing-the-integrations)

## Firebase Setup

### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Google Analytics if desired

### 2. Set Up Authentication
1. In the Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable the "Email/Password" sign-in method
4. Optionally enable other sign-in methods like Google, Facebook, etc.

### 3. Set Up Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Start in production mode or test mode (you can change this later)
4. Choose a location for your database

### 4. Set Up Storage
1. Go to "Storage"
2. Click "Get started"
3. Follow the setup wizard

### 5. Get Your Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web app icon (</>) if you haven't already added a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 6. Set Up Security Rules
1. Go to Firestore Database > Rules
2. Set up appropriate security rules, for example:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    // Add more rules as needed
  }
}
```

## Notion Setup

### 1. Create a Notion Integration
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Name your integration (e.g., "MDTS Tech Store")
4. Select the workspace where you want to use the integration
5. Set the capabilities (Read content, Update content, Insert content)
6. Click "Submit" to create the integration
7. Copy the "Internal Integration Token" (this is your NOTION_API_KEY)

### 2. Create Databases in Notion
You need to create four databases in your Notion workspace:

#### Products Database
Create a database with these properties:
- Name (title)
- Price (number)
- Category (select)
- Description (text)
- In Stock (checkbox)
- SKU (text)
- Image (URL)

#### Orders Database
Create a database with these properties:
- Order Number (title)
- Status (select: Pending, Processing, Shipped, Delivered, Cancelled)
- Total Amount (number)
- Customer (text)
- Email (email)
- Order Date (date)

#### Customers Database
Create a database with these properties:
- Name (title)
- Email (email)
- Phone (phone number)
- Total Orders (number)
- Total Spent (number)
- Created At (date)

#### Content Database
Create a database with these properties:
- Title (title)
- Slug (text)
- Type (select: Blog, FAQ, Page)
- Publish Date (date)
- Author (text)
- Excerpt (text)
- Featured Image (URL)

### 3. Share Databases with Your Integration
1. Open each database in Notion
2. Click "Share" in the top right
3. In the "Add people, groups, or integrations" field, select your integration
4. Click "Invite"

### 4. Get Database IDs
For each database:
1. Open the database in full page view
2. Look at the URL: https://www.notion.so/workspace/[database-id]?v=[view-id]
3. Copy the database ID (it's a 32-character string)

## Zapier Setup

### 1. Create a Zapier Account
1. Go to [Zapier](https://zapier.com/) and sign up or log in

### 2. Create Webhooks for Each Event Type
For each event type (new_order, low_inventory, etc.), create a webhook:

#### New Order Webhook
1. Create a new Zap
2. For the trigger, select "Webhooks by Zapier" and "Catch Hook"
3. Copy the webhook URL provided
4. Set up actions based on the order data (e.g., send an email, create a task in Trello, etc.)

#### Low Inventory Webhook
1. Create a new Zap
2. For the trigger, select "Webhooks by Zapier" and "Catch Hook"
3. Copy the webhook URL provided
4. Set up actions to notify about low inventory (e.g., send an email, create a task, etc.)

#### New Customer Webhook
1. Create a new Zap
2. For the trigger, select "Webhooks by Zapier" and "Catch Hook"
3. Copy the webhook URL provided
4. Set up actions for new customers (e.g., add to a mailing list, send a welcome email, etc.)

#### Abandoned Cart Webhook
1. Create a new Zap
2. For the trigger, select "Webhooks by Zapier" and "Catch Hook"
3. Copy the webhook URL provided
4. Set up actions for abandoned carts (e.g., send a reminder email)

#### Product Review Webhook
1. Create a new Zap
2. For the trigger, select "Webhooks by Zapier" and "Catch Hook"
3. Copy the webhook URL provided
4. Set up actions for product reviews (e.g., notify team, update a spreadsheet)

#### Support Request Webhook
1. Create a new Zap
2. For the trigger, select "Webhooks by Zapier" and "Catch Hook"
3. Copy the webhook URL provided
4. Set up actions for support requests (e.g., create a ticket in a help desk system)

## Environment Variables

Add the following environment variables to your `.env.local` file:

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Notion
NOTION_API_KEY=your-notion-api-key
NOTION_PRODUCTS_DATABASE_ID=your-products-database-id
NOTION_ORDERS_DATABASE_ID=your-orders-database-id
NOTION_CUSTOMERS_DATABASE_ID=your-customers-database-id
NOTION_CONTENT_DATABASE_ID=your-content-database-id

# Zapier Webhooks
ZAPIER_WEBHOOK_NEW_ORDER=https://hooks.zapier.com/hooks/catch/your-hook-id/new-order/
ZAPIER_WEBHOOK_LOW_INVENTORY=https://hooks.zapier.com/hooks/catch/your-hook-id/low-inventory/
ZAPIER_WEBHOOK_NEW_CUSTOMER=https://hooks.zapier.com/hooks/catch/your-hook-id/new-customer/
ZAPIER_WEBHOOK_ABANDONED_CART=https://hooks.zapier.com/hooks/catch/your-hook-id/abandoned-cart/
ZAPIER_WEBHOOK_PRODUCT_REVIEW=https://hooks.zapier.com/hooks/catch/your-hook-id/product-review/
ZAPIER_WEBHOOK_SUPPORT_REQUEST=https://hooks.zapier.com/hooks/catch/your-hook-id/support-request/
```

## Testing the Integrations

### Testing Firebase Integration
1. Test authentication:
```
curl -X POST http://localhost:3000/api/firebase/auth?action=signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

2. Test product creation:
```
curl -X POST http://localhost:3000/api/firebase/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":99.99,"category":"Test Category","description":"This is a test product"}'
```

### Testing Notion Integration
1. Test fetching products:
```
curl http://localhost:3000/api/notion/products
```

2. Test creating an order:
```
curl -X POST http://localhost:3000/api/notion/orders?action=create \
  -H "Content-Type: application/json" \
  -d '{"orderNumber":"ORD-12345","totalAmount":99.99,"customerName":"Test Customer","email":"test@example.com","items":[{"name":"Test Product","quantity":1,"price":99.99}]}'
```

### Testing Zapier Integration
1. Test sending a new order notification:
```
curl -X POST http://localhost:3000/api/zapier/webhooks?event=new_order \
  -H "Content-Type: application/json" \
  -d '{"orderNumber":"ORD-12345","totalAmount":99.99,"customerName":"Test Customer","email":"test@example.com","items":[{"name":"Test Product","quantity":1,"price":99.99}]}'
```

2. Test sending a low inventory notification:
```
curl -X POST http://localhost:3000/api/zapier/webhooks?event=low_inventory \
  -H "Content-Type: application/json" \
  -d '{"id":"prod-123","name":"Test Product","quantity":2,"threshold":5}'
```

## Conclusion

You have now set up Firebase, Notion, and Zapier integrations for your MDTS Tech Store. These integrations provide:

1. **Firebase**: Authentication, database, and storage
2. **Notion**: Content management and business data organization
3. **Zapier**: Automation for various business processes

For any issues or questions, please refer to the official documentation for each service:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Notion API Documentation](https://developers.notion.com/)
- [Zapier Documentation](https://zapier.com/help)
