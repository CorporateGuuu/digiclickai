# Supabase Setup for MDTS E-commerce

This document provides instructions for setting up Supabase for the MDTS E-commerce platform.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project

## Environment Variables

Add the following environment variables to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema

Execute the following SQL in the Supabase SQL Editor to create the necessary tables:

```sql
-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    parent_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sku VARCHAR(50) UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(255),
    weight DECIMAL(8, 2),
    dimensions VARCHAR(50),
    category_id INTEGER REFERENCES categories(id),
    brand VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product Specifications Table
CREATE TABLE product_specifications (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    display VARCHAR(255),
    processor VARCHAR(255),
    memory VARCHAR(255),
    storage VARCHAR(255),
    camera VARCHAR(255),
    battery VARCHAR(255),
    connectivity VARCHAR(255),
    operating_system VARCHAR(255),
    additional_features TEXT
);

-- Product Images Table (for multiple images per product)
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0
);

-- Product Variants Table (for color, size, etc.)
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_type VARCHAR(50) NOT NULL, -- e.g., 'color', 'size', 'capacity'
    variant_value VARCHAR(50) NOT NULL,
    price_adjustment DECIMAL(10, 2) DEFAULT 0.00,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    sku VARCHAR(50) UNIQUE
);

-- User Addresses Table
CREATE TABLE user_addresses (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    address_type VARCHAR(20) DEFAULT 'shipping' -- 'shipping', 'billing', 'both'
);

-- Shopping Cart Table
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(100), -- For guest users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cart Items Table
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_addition DECIMAL(10, 2) NOT NULL
);

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address_id INTEGER REFERENCES user_addresses(id),
    billing_address_id INTEGER REFERENCES user_addresses(id),
    shipping_method VARCHAR(50),
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL
);

-- Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist Table
CREATE TABLE wishlists (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wishlist Items Table
CREATE TABLE wishlist_items (
    id SERIAL PRIMARY KEY,
    wishlist_id INTEGER REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_is_new ON products(is_new);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

## User Management

Supabase provides built-in authentication. The application uses the Supabase Auth API for user management.

## Row Level Security (RLS)

Set up Row Level Security policies to secure your data:

```sql
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Public read access for products and categories
CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT USING (true);

CREATE POLICY "Categories are viewable by everyone" 
ON categories FOR SELECT USING (true);

CREATE POLICY "Product specifications are viewable by everyone" 
ON product_specifications FOR SELECT USING (true);

CREATE POLICY "Product images are viewable by everyone" 
ON product_images FOR SELECT USING (true);

CREATE POLICY "Product variants are viewable by everyone" 
ON product_variants FOR SELECT USING (true);

CREATE POLICY "Reviews are viewable by everyone" 
ON reviews FOR SELECT USING (true);

-- User address policies
CREATE POLICY "Users can view their own addresses"
ON user_addresses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
ON user_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
ON user_addresses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
ON user_addresses FOR DELETE USING (auth.uid() = user_id);

-- Cart policies
CREATE POLICY "Users can view their own carts"
ON carts FOR SELECT USING (auth.uid() = user_id OR session_id = current_setting('request.headers')::json->>'cart-session-id');

CREATE POLICY "Users can insert their own carts"
ON carts FOR INSERT WITH CHECK (auth.uid() = user_id OR session_id = current_setting('request.headers')::json->>'cart-session-id');

CREATE POLICY "Users can update their own carts"
ON carts FOR UPDATE USING (auth.uid() = user_id OR session_id = current_setting('request.headers')::json->>'cart-session-id');

CREATE POLICY "Users can delete their own carts"
ON carts FOR DELETE USING (auth.uid() = user_id OR session_id = current_setting('request.headers')::json->>'cart-session-id');

-- Cart items policies
CREATE POLICY "Users can view their own cart items"
ON cart_items FOR SELECT USING (
  cart_id IN (
    SELECT id FROM carts WHERE user_id = auth.uid() OR session_id = current_setting('request.headers')::json->>'cart-session-id'
  )
);

CREATE POLICY "Users can insert their own cart items"
ON cart_items FOR INSERT WITH CHECK (
  cart_id IN (
    SELECT id FROM carts WHERE user_id = auth.uid() OR session_id = current_setting('request.headers')::json->>'cart-session-id'
  )
);

CREATE POLICY "Users can update their own cart items"
ON cart_items FOR UPDATE USING (
  cart_id IN (
    SELECT id FROM carts WHERE user_id = auth.uid() OR session_id = current_setting('request.headers')::json->>'cart-session-id'
  )
);

CREATE POLICY "Users can delete their own cart items"
ON cart_items FOR DELETE USING (
  cart_id IN (
    SELECT id FROM carts WHERE user_id = auth.uid() OR session_id = current_setting('request.headers')::json->>'cart-session-id'
  )
);

-- Order policies
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their own order items"
ON order_items FOR SELECT USING (
  order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  )
);

-- Wishlist policies
CREATE POLICY "Users can view their own wishlists"
ON wishlists FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlists"
ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlists"
ON wishlists FOR DELETE USING (auth.uid() = user_id);

-- Wishlist items policies
CREATE POLICY "Users can view their own wishlist items"
ON wishlist_items FOR SELECT USING (
  wishlist_id IN (
    SELECT id FROM wishlists WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own wishlist items"
ON wishlist_items FOR INSERT WITH CHECK (
  wishlist_id IN (
    SELECT id FROM wishlists WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own wishlist items"
ON wishlist_items FOR DELETE USING (
  wishlist_id IN (
    SELECT id FROM wishlists WHERE user_id = auth.uid()
  )
);

-- Review policies
CREATE POLICY "Users can view all reviews"
ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews"
ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON reviews FOR DELETE USING (auth.uid() = user_id);
```

## Storage

Set up storage buckets for product images:

1. Create a new storage bucket called `product-images`
2. Set the bucket's privacy to "Public"
3. Add the following policy to allow public read access:

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
```

4. Add a policy to allow authenticated users to upload images:

```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);
```

## Next Steps

1. Import your product data using the Supabase dashboard or API
2. Set up authentication with social providers if needed
3. Configure email templates for authentication emails
