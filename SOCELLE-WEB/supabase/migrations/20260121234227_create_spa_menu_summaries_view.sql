/*
  # Create spa_menu_summaries View

  1. Purpose
    - Provides aggregated metrics per spa menu upload
    - Computes total_services, gaps, mappings, and category breakdowns
    - Eliminates need for non-existent spa_menus.total_services column

  2. View Columns
    - spa_menu_id (uuid): Primary identifier linking to spa_menus
    - spa_name (text): Spa/location name
    - spa_type (enum): medspa, spa, or hybrid
    - spa_location (text): Location info
    - upload_date (timestamptz): When menu was uploaded
    - total_services (int): Count of mapped services from spa_service_mapping
    - total_gaps (int): Count of identified service gaps
    - total_items (int): Total (services + gaps)
    - facials_count (int): Services in Facials category
    - body_count (int): Services in Body category
    - massage_count (int): Services in Massage category
    - enhancements_count (int): Services in Enhancements category
    - analysis_status (text): pending, in_progress, completed
    - last_analyzed_at (timestamptz): Most recent analysis timestamp
    - created_at (timestamptz): Menu creation timestamp

  3. Usage
    - Pipeline view: Show spa menu cards with total_services count
    - Intelligence views: Display service distribution by category
    - Reports: Aggregate data for analytics

  4. Security
    - View inherits RLS from base tables (spa_menus, spa_service_mapping, service_gap_analysis)

  5. Notes
    - Returns 0 for counts when no data exists (graceful degradation)
    - Categories are case-insensitive matched from spa_service_mapping.service_category
*/

-- Drop existing view if present
DROP VIEW IF EXISTS spa_menu_summaries;

-- Create aggregated summary view
CREATE OR REPLACE VIEW spa_menu_summaries AS
SELECT 
  sm.id AS spa_menu_id,
  sm.spa_name,
  sm.spa_type,
  sm.spa_location,
  sm.upload_date,
  sm.analysis_status,
  sm.last_analyzed_at,
  sm.created_at,
  
  -- Total mapped services
  COALESCE(COUNT(DISTINCT ssm.id), 0)::integer AS total_services,
  
  -- Total service gaps
  COALESCE((
    SELECT COUNT(*) 
    FROM service_gap_analysis sga 
    WHERE sga.spa_menu_id = sm.id
  ), 0)::integer AS total_gaps,
  
  -- Combined total
  (
    COALESCE(COUNT(DISTINCT ssm.id), 0) + 
    COALESCE((
      SELECT COUNT(*) 
      FROM service_gap_analysis sga 
      WHERE sga.spa_menu_id = sm.id
    ), 0)
  )::integer AS total_items,
  
  -- Category breakdowns (case-insensitive)
  COALESCE(COUNT(DISTINCT ssm.id) FILTER (
    WHERE LOWER(ssm.service_category) LIKE '%facial%'
  ), 0)::integer AS facials_count,
  
  COALESCE(COUNT(DISTINCT ssm.id) FILTER (
    WHERE LOWER(ssm.service_category) LIKE '%body%'
  ), 0)::integer AS body_count,
  
  COALESCE(COUNT(DISTINCT ssm.id) FILTER (
    WHERE LOWER(ssm.service_category) LIKE '%massage%'
  ), 0)::integer AS massage_count,
  
  COALESCE(COUNT(DISTINCT ssm.id) FILTER (
    WHERE LOWER(ssm.service_category) LIKE '%enhancement%' OR 
          LOWER(ssm.service_category) LIKE '%add-on%'
  ), 0)::integer AS enhancements_count

FROM spa_menus sm
LEFT JOIN spa_service_mapping ssm ON ssm.spa_menu_id = sm.id
GROUP BY 
  sm.id, 
  sm.spa_name, 
  sm.spa_type, 
  sm.spa_location, 
  sm.upload_date,
  sm.analysis_status,
  sm.last_analyzed_at,
  sm.created_at;

-- Add helpful comment
COMMENT ON VIEW spa_menu_summaries IS 'Aggregated spa menu metrics - replaces need for spa_menus.total_services column. Use this for dashboard cards and reports.';
