/*
  # Add Backbar/Professional Pricing Data

  ## Overview
  Extends the pro_products table with pricing, inventory, and compliance fields, then populates
  with complete Naturopathica professional/backbar product catalog and pricing for 2026.

  ## Changes

  ### Schema Extensions
  1. Add new columns to `pro_products`:
     - `category` (text) - Product category (Cleanser, Mask, Peel, Serum, Oil, Moisturizer, Balm, Mist)
     - `size` (text) - Product size/unit
     - `pro_price` (numeric) - Professional/backbar cost (not for resale)
     - `status` (text) - Product availability (Active/Out_of_Stock/Discontinued/Clearance)
     - `notes` (text) - Compliance or inventory flags

  ### Data Population
  2. Insert 28 professional/backbar products with complete pricing:
     - 6 Cleansers (includes discontinued and out-of-stock items)
     - 4 Masks
     - 5 Peels (enzyme and chemical peels)
     - 4 Serums
     - 3 Facial Oils
     - 3 Moisturizers/Balms
     - 2 Mists/Toners
     - 1 Special status item (Oat Polish - out of stock, expected Jan 2026)

  ## Important Notes
  - Professional prices are backbar costs, not retail pricing
  - Some products marked "not for resale" shipped in retail cartons
  - Discontinued items tracked with expected runout dates
  - Out-of-stock items tracked with expected return dates
  - Professional sizes typically larger than retail equivalents
*/

-- Add backbar pricing and inventory columns to pro_products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_products' AND column_name = 'category'
  ) THEN
    ALTER TABLE pro_products ADD COLUMN category text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_products' AND column_name = 'size'
  ) THEN
    ALTER TABLE pro_products ADD COLUMN size text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_products' AND column_name = 'pro_price'
  ) THEN
    ALTER TABLE pro_products ADD COLUMN pro_price numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_products' AND column_name = 'status'
  ) THEN
    ALTER TABLE pro_products ADD COLUMN status text DEFAULT 'Active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pro_products' AND column_name = 'notes'
  ) THEN
    ALTER TABLE pro_products ADD COLUMN notes text;
  END IF;
END $$;

-- Drop the unique constraint on product_name if it exists (allow size variations)
ALTER TABLE pro_products DROP CONSTRAINT IF EXISTS pro_products_product_name_key;

-- Add unique constraint on product_name + size combination
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'pro_products_product_name_size_key'
  ) THEN
    ALTER TABLE pro_products ADD CONSTRAINT pro_products_product_name_size_key 
      UNIQUE (product_name, size);
  END IF;
END $$;

-- Insert professional/backbar products with pricing
INSERT INTO pro_products (product_name, category, size, pro_price, status, notes, product_function, in_service_usage_allowed) VALUES
-- Cleansers
('Aloe Vera Cleansing Gel PRO', 'Cleanser', '7.8 oz', 34, 'Active', 'Professional size', 'Gentle gel cleanser for all skin types - professional size', 'yes'),
('Chamomile Cleansing Milk PRO', 'Cleanser', '7.8 oz', 34, 'Active', 'Professional size', 'Calming milky cleanser for sensitive skin - professional size', 'yes'),
('Colloidal Silver & Salicylic Acid Acne Cleanser PRO', 'Cleanser', '4.73 oz', 23, 'Active', 'Ships in retail carton; not for resale', 'Clarifying cleanser for acne-prone skin', 'yes'),
('Manuka Honey Cleansing Balm PRO', 'Cleanser', '6.6 oz', 69, 'Active', 'Professional size', 'Nourishing balm cleanser with manuka honey - professional size', 'yes'),
('Marshmallow & Probiotic Sensitivity Cleanser PRO', 'Cleanser', '4.8 oz', 50, 'Discontinued', 'Size discontinued; expected runout June 2027', 'Ultra-gentle cleanser for reactive skin - being phased out', 'yes'),
('Oat Cleansing Facial Polish PRO', 'Cleanser', '5.0 oz', 33, 'Out_of_Stock', 'Expected back Jan 2026; not for resale', 'Gentle exfoliating cleanser with oat powder', 'yes'),

-- Masks
('Aloe Vera Replenishing Gel Mask PRO', 'Mask', '16.9 oz', 58, 'Active', 'Cooling post-procedure mask', 'Cooling hydrating gel mask for post-procedure recovery', 'yes'),
('Manuka Honey Peel-Off Mask PRO', 'Mask', '16.9 oz', 85, 'Active', 'Hydration + recovery', 'Purifying peel-off mask with manuka honey for hydration and recovery', 'yes'),
('White Tea Antioxidant Mask PRO', 'Mask', '16.9 oz', 93, 'Active', 'Post-laser / antioxidant support', 'Antioxidant treatment mask for post-laser support', 'yes'),
('Watercress & Spirulina Detox Mask PRO', 'Mask', '16.9 oz', 72, 'Active', 'Acne / congestion protocols', 'Detoxifying mask for acne and congested skin protocols', 'yes'),

-- Enzyme Peels
('Pumpkin Enzyme Peel 3% PRO', 'Peel', '8.4 oz', 114, 'Active', 'Facial room staple', 'Enzymatic peel for gentle exfoliation - 3% concentration', 'yes'),
('Sweet Cherry Enzyme Peel 5% PRO', 'Peel', '8.4 oz', 114, 'Active', 'Gentle enzyme peel', 'Gentle enzyme peel with fruit acids - 5% concentration', 'yes'),

-- Chemical Peels
('20% Glycolic Peel PRO', 'Peel', '4 oz', 131, 'Active', 'Core chemical peel', 'Professional glycolic acid peel - 20% concentration', 'yes'),
('30% Pumpkin Peel PRO', 'Peel', '4 oz', 158, 'Active', 'Advanced peel', 'Advanced pumpkin peel - 30% concentration', 'yes'),
('40% Pumpkin Peel PRO', 'Peel', '4 oz', 195, 'Active', 'Advanced protocols only', 'Professional pumpkin peel - 40% concentration for advanced protocols only', 'yes'),

-- Serums
('Vitamin C15 Wrinkle Remedy Serum PRO', 'Serum', '1 oz', 61, 'Active', 'Professional application', 'Professional-strength vitamin C serum - 15% concentration', 'yes'),
('Plant Stem Cell Booster Serum PRO', 'Serum', '1 oz', 46, 'Active', 'Firming / rejuvenation', 'Advanced anti-aging serum with plant stem cells for firming and rejuvenation', 'yes'),
('Marshmallow & Ceramide Sensitivity Serum PRO', 'Serum', '1 oz', 36, 'Active', 'Post-laser / post-peel recovery', 'Soothing serum for sensitive skin and post-procedure recovery', 'yes'),
('Colloidal Silver & Salicylic Acid Acne Serum PRO', 'Serum', '1 oz', 30, 'Active', 'Acne protocols', 'Clarifying serum for acne treatment protocols', 'yes'),

-- Facial Oils
('Carrot Seed Soothing Facial Oil PRO', 'Oil', '1 oz', 103, 'Active', 'Post-procedure recovery', 'Soothing facial oil for post-procedure recovery and barrier support', 'yes'),
('Rosehip Seed & Immortelle Regenerating Facial Oil PRO', 'Oil', '1 oz', 103, 'Active', 'Barrier repair', 'Regenerating facial oil for barrier repair and skin recovery', 'yes'),
('Holy Basil & Bakuchiol Ageless Night Oil PRO', 'Oil', '1 oz', 65, 'Active', 'Retinol alternative', 'Anti-aging night oil with bakuchiol as retinol alternative', 'yes'),

-- Moisturizers/Balms
('Calendula Essential Hydrating Cream PRO', 'Moisturizer', '1.69 oz', 55, 'Active', 'Universal hydration', 'Daily moisturizer for all skin types - professional size', 'yes'),
('Marshmallow & Microalgae Sensitivity Crème PRO', 'Moisturizer', '1.69 oz', 41, 'Active', 'Barrier repair', 'Soothing moisturizer for sensitive skin and barrier repair', 'yes'),
('Gotu Kola Intense Repair Balm PRO', 'Balm', '1.69 oz', 66, 'Active', 'Post-procedure essential', 'Rich repair balm for post-procedure care and compromised skin', 'yes'),

-- Mists/Toners
('Lavender & Manuka Honey Balancing Mist PRO', 'Mist', '16.9 oz', 23, 'Active', 'Microbiome support', 'Balancing mist for microbiome support and hydration', 'yes'),
('Carrot Seed Hydrating Mist PRO', 'Mist', '16.9 oz', 23, 'Active', 'Hydration support', 'Hydrating facial mist for moisture and soothing', 'yes')

ON CONFLICT (product_name, size) DO UPDATE SET
  category = EXCLUDED.category,
  pro_price = EXCLUDED.pro_price,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes,
  product_function = EXCLUDED.product_function,
  in_service_usage_allowed = EXCLUDED.in_service_usage_allowed;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_pro_products_category ON pro_products(category);
CREATE INDEX IF NOT EXISTS idx_pro_products_status ON pro_products(status);
CREATE INDEX IF NOT EXISTS idx_pro_products_pro_price ON pro_products(pro_price);
