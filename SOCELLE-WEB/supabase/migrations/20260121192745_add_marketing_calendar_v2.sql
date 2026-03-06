/*
  # Add Marketing Calendar Schema

  ## Overview
  Creates a comprehensive marketing calendar system to track monthly themes, featured products,
  protocols, webinars, and promotional strategies throughout 2026.

  ## New Tables

  ### marketing_calendar
  - `id` (uuid, primary key) - Unique identifier
  - `month` (integer, 1-12) - Calendar month
  - `month_name` (text) - Month name for display
  - `year` (integer) - Calendar year
  - `theme` (text) - Monthly marketing theme
  - `focus_moment` (text) - Key focus area or moment
  - `featured_products` (text[]) - Array of featured product names
  - `featured_protocols` (text[]) - Array of featured protocol names
  - `new_launches` (text[]) - Array of new product launches
  - `webinar_title` (text) - Webinar topic
  - `webinar_date` (text) - Webinar date/time
  - `quarter` (integer, 1-4) - Calendar quarter
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on marketing_calendar table
  - Add policies for authenticated users to read data
  - Add policies for authenticated users to manage calendar entries

  ## Important Notes
  - Calendar helps align service recommendations with seasonal marketing
  - Integrated with protocols and products for cohesive planning
  - Webinar dates track training opportunities
  - New launches highlight promotional opportunities
*/

-- Create marketing calendar table
CREATE TABLE IF NOT EXISTS marketing_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  month_name text NOT NULL,
  year integer NOT NULL DEFAULT 2026,
  theme text NOT NULL,
  focus_moment text,
  featured_products text[] DEFAULT '{}',
  featured_protocols text[] DEFAULT '{}',
  new_launches text[] DEFAULT '{}',
  webinar_title text,
  webinar_date text,
  quarter integer CHECK (quarter >= 1 AND quarter <= 4),
  created_at timestamptz DEFAULT now(),
  UNIQUE(year, month)
);

ALTER TABLE marketing_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read marketing_calendar"
  ON marketing_calendar FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read access to marketing_calendar"
  ON marketing_calendar FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users to insert marketing_calendar"
  ON marketing_calendar FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update marketing_calendar"
  ON marketing_calendar FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete marketing_calendar"
  ON marketing_calendar FOR DELETE
  TO authenticated
  USING (true);

-- Insert 2026 marketing calendar data
INSERT INTO marketing_calendar (month, month_name, year, theme, focus_moment, featured_products, featured_protocols, new_launches, webinar_title, webinar_date, quarter) VALUES

-- Q1
(1, 'January', 2026, 'Skin Longevity & Protection', 'Support Long-Term Skin Health with Regenerative & Protective Ingredients',
  ARRAY['Vitamin C15 Wrinkle Remedy Serum', 'Vitamin C Revitalizing Lotion', 'Vitamin C & Neroli Dry Body Oil'],
  ARRAY['Advanced Wrinkle Remedy Facial'],
  ARRAY['Calendula Essential Hydrating Lotion SPF 30'],
  'Mature Skin Upgrade: Strategies for Rebuilding Radiance',
  '1/26/26 - 9am PDT', 1),

(2, 'February', 2026, 'Nourishment, Repair & Ritual Care', 'Nature''s Remedy: The Magic of Manuka Honey',
  ARRAY['Manuka Honey Rituals Kit'],
  ARRAY['Manuka Honey Moisture Drench Facial', 'Manuka Honey Moisture Drench Body Therapy'],
  ARRAY[]::text[],
  'The Manuka Advantage: Treating Today''s Skin with Traditional Remedies',
  '2/9/26 - 9am PDT', 1),

(3, 'March', 2026, 'Strategic Services & Best Practices', 'Keep Clients Coming Back with Results-Oriented Products & Strategies',
  ARRAY['Vitamin C15 Wrinkle Remedy Serum', 'Vitamin C Revitalizing Lotion', 'Vitamin C & Neroli Dry Body Oil'],
  ARRAY['Vitamin C Radiance Facial'],
  ARRAY[]::text[],
  'The Loyalty Loop: Turning First-Time Guests into Lifelong Clients',
  '3/16/26 - 9am PDT', 1),

-- Q2
(4, 'April', 2026, 'Skin Strengthening & Balance', 'Strengthening and Reparative Ingredients to Rebalance & Optimize Skin Function',
  ARRAY['Gotu Kola + Fruit Exosome Hydrating Toner', 'Gotu Kola + Fruit Exosome Gel Moisturizer'],
  ARRAY['Gotu Kola + Fruit Exosome Facial'],
  ARRAY['Gotu Kola + Fruit Exosome Hydrating Toner', 'Gotu Kola + Fruit Exosome Gel Moisturizer'],
  'Exosomes 101: What They Do & Why They Matter',
  'TBD', 2),

(5, 'May', 2026, 'Understanding Skin Needs at Every Age', 'Developing Better Skincare Habits in Youth & Fine Tuning Skincare Habits in the Later Years',
  ARRAY['Aloe Vera Cleansing Gel', 'Aloe Vera Replenishing Gel Mask', 'Alpine Arnica Bath & Body Oil'],
  ARRAY['Tween / Teen Facial'],
  ARRAY['Tween / Teen Facial'],
  'Tween & Teen Skin: Age-Appropriate Care That Works',
  'TBD', 2),

(6, 'June', 2026, 'Men''s Skincare Tips & Tricks', 'Advanced Strategies & Products to Maximize Men''s Skincare',
  ARRAY['Aloe Vera Cleansing Gel', 'Aloe Vera Replenishing Gel Mask', 'Alpine Arnica Bath & Body Oil'],
  ARRAY['Gentleman''s Facial'],
  ARRAY[]::text[],
  'Mastering Men''s Facials: Shaving Challenges, Sensitivity, and Simplicity',
  'TBD', 2),

-- Q3
(7, 'July', 2026, 'Botanical Balance', 'The Power of Apothecary Botanicals',
  ARRAY['Calendula Essential Cleansing Oil'],
  ARRAY['Calendula Apothecary Facial'],
  ARRAY['Calendula Essential Cleansing Oil'],
  'The Calendula Effect: Why Calendula Still Reigns in Modern Skincare',
  'TBD', 3),

(8, 'August', 2026, 'Soothing & Relaxing Care', 'Targeted Skin & Body Care for Sensitivity and Stress',
  ARRAY[]::text[],
  ARRAY['Marshmallow & Calendula Soothing Facial', 'Nirvana Stress Relief Massage'],
  ARRAY[]::text[],
  'Fragile Skin Fundamentals: Sensitive & Sensitized Care',
  'TBD', 3),

(9, 'September', 2026, 'Recovery, Repair & Seasonal Transition', 'Supporting Recovery During Seasonal Shifts',
  ARRAY['Pumpkin Purifying Enzyme Peel'],
  ARRAY['Pumpkin Purifying Enzyme Peel', 'Pumpkin Harvest Fall Facial'],
  ARRAY['Pumpkin Harvest Fall Facial'],
  'Autumn Service Strategy: Skin Changes & Maximizing a Seasonal Menu',
  'TBD', 3),

-- Q4
(10, 'October', 2026, 'Strategies for the Holidays: Kits, Events, and Retailing', 'Prepping for Holiday Events with New Express Services',
  ARRAY['Holiday Kits'],
  ARRAY['Skincare Starter Express Facials (4 Versions based on holiday kits)'],
  ARRAY['Skincare Starter Express Facials (4 Versions based on holiday kits)'],
  'High Impact, Low-Time: Communication for Event & Express Services',
  'TBD', 4),

(11, 'November', 2026, 'Strategies for the Holidays: Kits, Events, and Retailing', 'Retailing Tips & Tricks',
  ARRAY['Holiday Kits', 'NEW: Teas'],
  ARRAY['Express Services (Chair Massages)'],
  ARRAY['Express Services (Chair Massages)', 'Teas'],
  'From Treatment to Take-Home: Smart Retailing for Better Results',
  'TBD', 4),

(12, 'December', 2026, 'Year-End Repair & Renewal', 'Renewal-Focused Care to Repair, Restore, and Reset the Skin',
  ARRAY['Holiday Kits (cont.)', 'Enzyme Peel Collection', 'NEW: Teas'],
  ARRAY['Pure Results Facial'],
  ARRAY[]::text[],
  'The Inflammatory Connection: Skin & Whole-Body Effects',
  'TBD', 4)

ON CONFLICT (year, month) DO UPDATE SET
  theme = EXCLUDED.theme,
  focus_moment = EXCLUDED.focus_moment,
  featured_products = EXCLUDED.featured_products,
  featured_protocols = EXCLUDED.featured_protocols,
  new_launches = EXCLUDED.new_launches,
  webinar_title = EXCLUDED.webinar_title,
  webinar_date = EXCLUDED.webinar_date,
  quarter = EXCLUDED.quarter;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_marketing_calendar_month ON marketing_calendar(month);
CREATE INDEX IF NOT EXISTS idx_marketing_calendar_quarter ON marketing_calendar(quarter);
CREATE INDEX IF NOT EXISTS idx_marketing_calendar_year_month ON marketing_calendar(year, month);
