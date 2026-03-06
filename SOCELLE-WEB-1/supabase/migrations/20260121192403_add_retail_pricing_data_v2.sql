/*
  # Add Retail Pricing Data

  ## Overview
  Extends the retail_products table with pricing and inventory fields, then populates
  with complete Naturopathica retail product catalog and pricing for 2026.

  ## Changes

  ### Schema Extensions
  1. Modify `retail_products` table:
     - Remove unique constraint on product_name (products can have multiple sizes)
     - Add new columns: category, size, msrp, wholesale, status
     - Add unique constraint on (product_name, size) combination

  ### Data Population
  2. Insert 48 retail product entries (some products have multiple sizes):
     - 1 Accessories product
     - 7 Body products (including size variations)
     - 6 Cleansers
     - 5 Eye products
     - 7 Face Creams (including size variations)
     - 4 Face Masks
     - 3 Exfoliants
     - 2 Lip products

  ## Important Notes
  - Wholesale pricing follows standard 50% margin (MSRP / 2)
  - One product (Oat Cleansing Facial Polish) is marked Out_of_Stock
  - All other products are Active
  - Products with multiple sizes are stored as separate entries
  - Prices are in USD
*/

-- Add pricing and inventory columns to retail_products
DO $$
BEGIN
  -- Add category column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'retail_products' AND column_name = 'category'
  ) THEN
    ALTER TABLE retail_products ADD COLUMN category text;
  END IF;

  -- Add size column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'retail_products' AND column_name = 'size'
  ) THEN
    ALTER TABLE retail_products ADD COLUMN size text;
  END IF;

  -- Add msrp column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'retail_products' AND column_name = 'msrp'
  ) THEN
    ALTER TABLE retail_products ADD COLUMN msrp numeric;
  END IF;

  -- Add wholesale column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'retail_products' AND column_name = 'wholesale'
  ) THEN
    ALTER TABLE retail_products ADD COLUMN wholesale numeric;
  END IF;

  -- Add status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'retail_products' AND column_name = 'status'
  ) THEN
    ALTER TABLE retail_products ADD COLUMN status text DEFAULT 'Active';
  END IF;
END $$;

-- Drop the unique constraint on product_name if it exists
ALTER TABLE retail_products DROP CONSTRAINT IF EXISTS retail_products_product_name_key;

-- Add unique constraint on product_name + size combination
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'retail_products_product_name_size_key'
  ) THEN
    ALTER TABLE retail_products ADD CONSTRAINT retail_products_product_name_size_key 
      UNIQUE (product_name, size);
  END IF;
END $$;

-- Insert retail products with pricing
INSERT INTO retail_products (product_name, category, size, msrp, wholesale, status, product_function, target_concerns) VALUES
-- Accessories
('Facial Cleansing Brush', 'Accessories', '1 unit', 36, 18, 'Active', 'Manual cleansing tool for enhanced facial cleansing', ARRAY['Deep cleansing', 'Exfoliation']),

-- Body
('Calendula Essential Hydrating Lotion SPF 30', 'Body', '1.69 oz', 68, 34, 'Active', 'Lightweight hydrating body lotion with SPF 30 sun protection', ARRAY['Hydration', 'Sun protection', 'Sensitive skin']),
('Calendula Essential Hydrating Lotion SPF 30', 'Body', '6.25 oz', 98, 49, 'Active', 'Lightweight hydrating body lotion with SPF 30 sun protection', ARRAY['Hydration', 'Sun protection', 'Sensitive skin']),
('Geranium Tuberose Firming Body Cream', 'Body', '8.8 oz', 78, 39, 'Active', 'Rich firming body cream with aromatic botanicals', ARRAY['Firming', 'Hydration', 'Mature skin']),
('Gotu Kola Healing Body Balm', 'Body', '8.8 oz', 74, 37, 'Active', 'Intensive healing balm for dry, compromised skin', ARRAY['Healing', 'Barrier repair', 'Dry skin']),
('Jasmine Gardenia Body Oil', 'Body', '8.45 oz', 74, 37, 'Active', 'Luxurious aromatic body oil for nourishment', ARRAY['Nourishment', 'Aromatherapy', 'Dry skin']),
('Lemongrass Mimosa Body Scrub', 'Body', '8.8 oz', 70, 35, 'Active', 'Exfoliating body scrub with uplifting citrus scent', ARRAY['Exfoliation', 'Texture', 'Dullness']),
('Rosemary Citron Sea Salt Scrub', 'Body', '8.8 oz', 62, 31, 'Active', 'Mineral-rich sea salt scrub for body exfoliation', ARRAY['Exfoliation', 'Circulation', 'Texture']),

-- Cleanser
('Aloe Vera Cleansing Gel', 'Cleanser', '4.73 oz', 48, 24, 'Active', 'Gentle gel cleanser for all skin types', ARRAY['Daily cleansing', 'Soothing', 'Balance']),
('Chamomile Cleansing Milk', 'Cleanser', '4.73 oz', 48, 24, 'Active', 'Calming milky cleanser for sensitive skin', ARRAY['Sensitive skin', 'Redness', 'Gentle cleansing']),
('Colloidal Silver & Salicylic Acid Acne Cleanser', 'Cleanser', '4.73 oz', 48, 24, 'Active', 'Clarifying cleanser for acne-prone skin', ARRAY['Acne', 'Blemishes', 'Oil control']),
('Manuka Honey Cleansing Balm', 'Cleanser', '2.8 oz', 70, 35, 'Active', 'Nourishing balm cleanser with manuka honey', ARRAY['Deep cleansing', 'Nourishment', 'Dry skin']),
('Marshmallow & Probiotic Sensitivity Cleanser', 'Cleanser', '2.8 oz', 70, 35, 'Active', 'Ultra-gentle cleanser for reactive skin', ARRAY['Sensitivity', 'Barrier support', 'Redness']),
('Oat Cleansing Facial Polish', 'Cleanser', '5.0 oz', 70, 35, 'Out_of_Stock', 'Gentle exfoliating cleanser with oat powder', ARRAY['Exfoliation', 'Texture', 'Dullness']),

-- Eye
('Vitamin K Brightening Eye Serum', 'Eye', '0.5 oz', 72, 36, 'Active', 'Brightening serum for dark circles', ARRAY['Dark circles', 'Brightness', 'Discoloration']),
('Plant Stem Cell Eye Serum', 'Eye', '0.5 oz', 110, 55, 'Active', 'Advanced anti-aging eye serum with plant stem cells', ARRAY['Fine lines', 'Firmness', 'Anti-aging']),
('Primrose Eye & Lip Treatment', 'Eye', '0.5 oz', 64, 32, 'Active', 'Nourishing treatment for eye and lip areas', ARRAY['Hydration', 'Fine lines', 'Delicate skin']),
('White Tea Eye Treatment', 'Eye', '0.5 oz', 72, 36, 'Active', 'Antioxidant-rich eye treatment', ARRAY['Puffiness', 'Antioxidant protection', 'Fine lines']),
('Manuka Honey Eye Treatment', 'Eye', '0.5 oz', 72, 36, 'Active', 'Hydrating eye treatment with manuka honey', ARRAY['Hydration', 'Nourishment', 'Dry under-eyes']),

-- Face Cream
('Calendula Essential Hydrating Cream', 'Face Cream', '1.69 oz', 74, 37, 'Active', 'Daily moisturizer for all skin types', ARRAY['Hydration', 'Balance', 'Daily care']),
('Calendula Essential Hydrating Cream SPF 30', 'Face Cream', '1.69 oz', 68, 34, 'Active', 'Daily moisturizer with broad spectrum SPF 30', ARRAY['Hydration', 'Sun protection', 'Daily care']),
('Marshmallow & Microalgae Sensitivity Crème', 'Face Cream', '1.69 oz', 86, 43, 'Active', 'Soothing moisturizer for sensitive skin', ARRAY['Sensitivity', 'Redness', 'Barrier support']),
('Gotu Kola Intense Repair Balm', 'Face Cream', '1.69 oz', 74, 37, 'Active', 'Rich repair balm for compromised skin', ARRAY['Healing', 'Barrier repair', 'Dry skin']),
('Persian Rose Ultra Nourishing Face Cream', 'Face Cream', '1.69 oz', 94, 47, 'Active', 'Luxurious nourishing cream for dry skin', ARRAY['Nourishment', 'Dry skin', 'Anti-aging']),
('Sicilian Bergamot Oil-Free Moisturizer', 'Face Cream', '1.69 oz', 72, 36, 'Active', 'Lightweight oil-free moisturizer', ARRAY['Oil control', 'Hydration', 'Oily skin']),
('White Tea Antioxidant Moisturizer', 'Face Cream', '1.69 oz', 74, 37, 'Active', 'Antioxidant-rich daily moisturizer', ARRAY['Antioxidant protection', 'Environmental defense', 'Anti-aging']),

-- Face Mask
('Aloe Vera Replenishing Gel Mask', 'Face Mask', '1.69 oz', 68, 34, 'Active', 'Cooling hydrating gel mask', ARRAY['Hydration', 'Soothing', 'Calming']),
('Manuka Honey Peel-Off Mask', 'Face Mask', '1.69 oz', 68, 34, 'Active', 'Purifying peel-off mask with manuka honey', ARRAY['Deep cleansing', 'Pore refinement', 'Texture']),
('Watercress & Spirulina Detox Mask', 'Face Mask', '1.69 oz', 68, 34, 'Active', 'Detoxifying mask for congested skin', ARRAY['Detox', 'Congestion', 'Dullness']),
('White Tea Antioxidant Mask', 'Face Mask', '1.69 oz', 68, 34, 'Active', 'Antioxidant treatment mask', ARRAY['Antioxidant boost', 'Radiance', 'Environmental stress']),

-- Exfoliant
('Pumpkin Enzyme Peel', 'Exfoliant', '1.69 oz', 68, 34, 'Active', 'Enzymatic peel for gentle exfoliation', ARRAY['Exfoliation', 'Brightness', 'Texture']),
('Sweet Cherry Enzyme Peel', 'Exfoliant', '1.69 oz', 68, 34, 'Active', 'Gentle enzyme peel with fruit acids', ARRAY['Exfoliation', 'Radiance', 'Sensitive skin']),
('10% Glycolic + Aloe Vera Resurfacing Pads', 'Exfoliant', '60 pads', 75, 37.5, 'Active', 'Daily acid pads for texture refinement', ARRAY['Exfoliation', 'Texture', 'Tone']),

-- Lip
('Sweet Cherry Conditioning Lip Butter', 'Lip', '0.5 oz', 26, 13, 'Active', 'Nourishing lip treatment', ARRAY['Lip hydration', 'Conditioning', 'Softness']),
('Honey Vanilla Lip Balm', 'Lip', '0.15 oz', 18, 9, 'Active', 'Daily lip balm with honey', ARRAY['Lip protection', 'Daily care', 'Hydration'])

ON CONFLICT (product_name, size) DO UPDATE SET
  category = EXCLUDED.category,
  msrp = EXCLUDED.msrp,
  wholesale = EXCLUDED.wholesale,
  status = EXCLUDED.status,
  product_function = EXCLUDED.product_function,
  target_concerns = EXCLUDED.target_concerns;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_retail_products_category ON retail_products(category);
CREATE INDEX IF NOT EXISTS idx_retail_products_status ON retail_products(status);
CREATE INDEX IF NOT EXISTS idx_retail_products_msrp ON retail_products(msrp);
