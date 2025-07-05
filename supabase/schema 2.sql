-- Create a schema for the MDTS application
CREATE SCHEMA IF NOT EXISTS mdts;

-- Set the search path to include the mdts schema
SET search_path TO mdts, public;

-- Create a table for products
CREATE TABLE IF NOT EXISTS mdts.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category_id UUID,
  brand_id UUID,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for categories
CREATE TABLE IF NOT EXISTS mdts.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES mdts.categories(id),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to products table
ALTER TABLE mdts.products
ADD CONSTRAINT fk_products_category
FOREIGN KEY (category_id) REFERENCES mdts.categories(id);

-- Create a table for brands
CREATE TABLE IF NOT EXISTS mdts.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint to products table
ALTER TABLE mdts.products
ADD CONSTRAINT fk_products_brand
FOREIGN KEY (brand_id) REFERENCES mdts.brands(id);

-- Create a table for users (extending Supabase auth.users)
CREATE TABLE IF NOT EXISTS mdts.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for orders
CREATE TABLE IF NOT EXISTS mdts.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address_id UUID,
  billing_address_id UUID,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for order items
CREATE TABLE IF NOT EXISTS mdts.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES mdts.orders(id),
  product_id UUID REFERENCES mdts.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for addresses
CREATE TABLE IF NOT EXISTS mdts.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  address_type VARCHAR(50) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  company VARCHAR(255),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints to orders table
ALTER TABLE mdts.orders
ADD CONSTRAINT fk_orders_shipping_address
FOREIGN KEY (shipping_address_id) REFERENCES mdts.addresses(id);

ALTER TABLE mdts.orders
ADD CONSTRAINT fk_orders_billing_address
FOREIGN KEY (billing_address_id) REFERENCES mdts.addresses(id);

-- Create a table for carts
CREATE TABLE IF NOT EXISTS mdts.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for cart items
CREATE TABLE IF NOT EXISTS mdts.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES mdts.carts(id),
  product_id UUID REFERENCES mdts.products(id),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for wishlists
CREATE TABLE IF NOT EXISTS mdts.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) DEFAULT 'Default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for wishlist items
CREATE TABLE IF NOT EXISTS mdts.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID REFERENCES mdts.wishlists(id),
  product_id UUID REFERENCES mdts.products(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for product reviews
CREATE TABLE IF NOT EXISTS mdts.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES mdts.products(id),
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for LCD buyback requests
CREATE TABLE IF NOT EXISTS mdts.lcd_buyback_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  device_type VARCHAR(100) NOT NULL,
  device_model VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  condition VARCHAR(50) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for tables
-- Products: Anyone can read, only authenticated users with admin role can write
ALTER TABLE mdts.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON mdts.products FOR SELECT
  USING (true);

CREATE POLICY "Products are editable by admins"
  ON mdts.products FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Categories: Anyone can read, only authenticated users with admin role can write
ALTER TABLE mdts.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON mdts.categories FOR SELECT
  USING (true);

CREATE POLICY "Categories are editable by admins"
  ON mdts.categories FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- User profiles: Users can read and update their own profiles, admins can read all
ALTER TABLE mdts.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON mdts.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON mdts.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON mdts.user_profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create a function to get the current version
CREATE OR REPLACE FUNCTION version()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('server_version');
END;
$$ LANGUAGE plpgsql;
