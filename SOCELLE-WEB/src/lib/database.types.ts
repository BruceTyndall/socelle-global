export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      brand_messages: {
        Row: {
          id: string
          brand_id: string
          business_id: string | null
          sender_id: string
          sender_type: 'brand' | 'retailer'
          content: string
          read_at: string | null
          created_at: string
          thread_id: string
          subject: string | null
          attachment_url: string | null
          is_broadcast: boolean
        }
        Insert: {
          id?: string
          brand_id: string
          business_id?: string | null
          sender_id: string
          sender_type: 'brand' | 'retailer'
          content: string
          read_at?: string | null
          created_at?: string
          thread_id?: string
          subject?: string | null
          attachment_url?: string | null
          is_broadcast?: boolean
        }
        Update: {
          id?: string
          brand_id?: string
          business_id?: string | null
          sender_id?: string
          sender_type?: 'brand' | 'retailer'
          content?: string
          read_at?: string | null
          created_at?: string
          thread_id?: string
          subject?: string | null
          attachment_url?: string | null
          is_broadcast?: boolean
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          status: 'active' | 'inactive' | 'pending'
          description: string | null
          logo_url: string | null
          website_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          status?: 'active' | 'inactive' | 'pending'
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          status?: 'active' | 'inactive' | 'pending'
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      business_plan_outputs: {
        Row: {
          id: string
          plan_id: string
          output_type: string
          output_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          output_type: string
          output_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          output_type?: string
          output_data?: Json
          created_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          name: string
          type: 'spa' | 'salon' | 'barbershop' | 'medspa' | 'wellness_center' | 'other'
          location: string | null
          created_by_user_id: string | null
          created_at: string
          updated_at: string
          slug: string | null
          website_url: string | null
          instagram_handle: string | null
          phone: string | null
          is_verified: boolean
          city: string | null
          state: string | null
          country: string
        }
        Insert: {
          id?: string
          name: string
          type?: 'spa' | 'salon' | 'barbershop' | 'medspa' | 'wellness_center' | 'other'
          location?: string | null
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
          slug?: string | null
          website_url?: string | null
          instagram_handle?: string | null
          phone?: string | null
          is_verified?: boolean
          city?: string | null
          state?: string | null
          country?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'spa' | 'salon' | 'barbershop' | 'medspa' | 'wellness_center' | 'other'
          location?: string | null
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
          slug?: string | null
          website_url?: string | null
          instagram_handle?: string | null
          phone?: string | null
          is_verified?: boolean
          city?: string | null
          state?: string | null
          country?: string
        }
      }
      canonical_protocols: {
        Row: {
          id: string
          protocol_name: string
          category: string
          target_concerns: string[]
          modalities_steps: Json | null
          typical_duration: string | null
          allowed_products: string[]
          contraindications: string[]
          created_at: string
        }
        Insert: {
          id?: string
          protocol_name: string
          category: string
          target_concerns?: string[]
          modalities_steps?: Json | null
          typical_duration?: string | null
          allowed_products?: string[]
          contraindications?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          protocol_name?: string
          category?: string
          target_concerns?: string[]
          modalities_steps?: Json | null
          typical_duration?: string | null
          allowed_products?: string[]
          contraindications?: string[]
          created_at?: string
        }
      }
      menu_uploads: {
        Row: {
          id: string
          plan_id: string
          source_type: string
          file_path: string | null
          raw_text: string
          parsed_services: Json | null
          extraction_meta: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          source_type: string
          file_path?: string | null
          raw_text: string
          parsed_services?: Json | null
          extraction_meta?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          source_type?: string
          file_path?: string | null
          raw_text?: string
          parsed_services?: Json | null
          extraction_meta?: Json | null
          created_at?: string
        }
      }
      mixing_rules: {
        Row: {
          id: string
          rule_type: string
          product_references: string[]
          rule_description: string
          severity: string
          created_at: string
        }
        Insert: {
          id?: string
          rule_type: string
          product_references?: string[]
          rule_description: string
          severity?: string
          created_at?: string
        }
        Update: {
          id?: string
          rule_type?: string
          product_references?: string[]
          rule_description?: string
          severity?: string
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_type: string
          product_id: string
          product_name: string
          sku: string | null
          unit_price: number
          qty: number
          line_total: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_type: string
          product_id: string
          product_name: string
          sku?: string | null
          unit_price: number
          qty?: number
          line_total: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_type?: string
          product_id?: string
          product_name?: string
          sku?: string | null
          unit_price?: number
          qty?: number
          line_total?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          brand_id: string | null
          business_id: string | null
          created_by: string | null
          status: 'pending_payment' | 'submitted' | 'reviewing' | 'sent_to_brand' | 'confirmed' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal: number
          commission_percent: number | null
          commission_total: number | null
          admin_fee: number | null
          notes: string | null
          admin_notes: string | null
          brand_notes: string | null
          created_at: string
          updated_at: string
          stripe_payment_intent_id: string | null
          payment_status: 'unpaid' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partial_refund'
          reseller_tier_at_order: 'active' | 'elite' | 'master' | null
          shipping_address: Json | null
          billing_address: Json | null
          tracking_number: string | null
          tracking_carrier: string | null
          shipped_at: string | null
          delivered_at: string | null
          return_requested_at: string | null
          return_status: 'none' | 'requested' | 'approved' | 'rejected'
          return_reason: string | null
          return_resolved_at: string | null
          return_resolved_by: string | null
        }
        Insert: {
          id?: string
          order_number?: string
          brand_id?: string | null
          business_id?: string | null
          created_by?: string | null
          status?: 'pending_payment' | 'submitted' | 'reviewing' | 'sent_to_brand' | 'confirmed' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal?: number
          commission_percent?: number | null
          commission_total?: number | null
          admin_fee?: number | null
          notes?: string | null
          admin_notes?: string | null
          brand_notes?: string | null
          created_at?: string
          updated_at?: string
          stripe_payment_intent_id?: string | null
          payment_status?: 'unpaid' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partial_refund'
          reseller_tier_at_order?: 'active' | 'elite' | 'master' | null
          shipping_address?: Json | null
          billing_address?: Json | null
          tracking_number?: string | null
          tracking_carrier?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          return_requested_at?: string | null
          return_status?: 'none' | 'requested' | 'approved' | 'rejected'
          return_reason?: string | null
          return_resolved_at?: string | null
          return_resolved_by?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          brand_id?: string | null
          business_id?: string | null
          created_by?: string | null
          status?: 'pending_payment' | 'submitted' | 'reviewing' | 'sent_to_brand' | 'confirmed' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          subtotal?: number
          commission_percent?: number | null
          commission_total?: number | null
          admin_fee?: number | null
          notes?: string | null
          admin_notes?: string | null
          brand_notes?: string | null
          created_at?: string
          updated_at?: string
          stripe_payment_intent_id?: string | null
          payment_status?: 'unpaid' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partial_refund'
          reseller_tier_at_order?: 'active' | 'elite' | 'master' | null
          shipping_address?: Json | null
          billing_address?: Json | null
          tracking_number?: string | null
          tracking_carrier?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          return_requested_at?: string | null
          return_status?: 'none' | 'requested' | 'approved' | 'rejected'
          return_reason?: string | null
          return_resolved_at?: string | null
          return_resolved_by?: string | null
        }
      }
      plans: {
        Row: {
          id: string
          business_user_id: string
          brand_id: string
          name: string
          status: string
          created_at: string
          updated_at: string
          business_id: string | null
          fit_score: number | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          business_user_id: string
          brand_id: string
          name: string
          status?: string
          created_at?: string
          updated_at?: string
          business_id?: string | null
          fit_score?: number | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          business_user_id?: string
          brand_id?: string
          name?: string
          status?: string
          created_at?: string
          updated_at?: string
          business_id?: string | null
          fit_score?: number | null
          completed_at?: string | null
        }
      }
      product_pricing: {
        Row: {
          id: string
          product_id: string
          product_type: 'pro' | 'retail'
          brand_id: string
          tier: 'msrp' | 'active' | 'elite' | 'master'
          price: number
          currency: string
          min_qty: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          product_type: 'pro' | 'retail'
          brand_id: string
          tier: 'msrp' | 'active' | 'elite' | 'master'
          price: number
          currency?: string
          min_qty?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          product_type?: 'pro' | 'retail'
          brand_id?: string
          tier?: 'msrp' | 'active' | 'elite' | 'master'
          price?: number
          currency?: string
          min_qty?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pro_products: {
        Row: {
          id: string
          product_name: string
          product_function: string
          key_ingredients: string[]
          in_service_usage_allowed: string
          contraindications: string[]
          created_at: string
          sku: string | null
          category: string | null
          msrp_price: number | null
          wholesale_price: number | null
          stock_count: number
          is_active: boolean
          is_bestseller: boolean
          brand_id: string | null
          sort_order: number
          search_vector: string | null
        }
        Insert: {
          id?: string
          product_name: string
          product_function: string
          key_ingredients?: string[]
          in_service_usage_allowed?: string
          contraindications?: string[]
          created_at?: string
          sku?: string | null
          category?: string | null
          msrp_price?: number | null
          wholesale_price?: number | null
          stock_count?: number
          is_active?: boolean
          is_bestseller?: boolean
          brand_id?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          product_name?: string
          product_function?: string
          key_ingredients?: string[]
          in_service_usage_allowed?: string
          contraindications?: string[]
          created_at?: string
          sku?: string | null
          category?: string | null
          msrp_price?: number | null
          wholesale_price?: number | null
          stock_count?: number
          is_active?: boolean
          is_bestseller?: boolean
          brand_id?: string | null
          sort_order?: number
        }
      }
      retail_products: {
        Row: {
          id: string
          product_name: string
          product_function: string
          target_concerns: string[]
          key_ingredients: string[]
          regimen_placement: string | null
          created_at: string
          sku: string | null
          category: string | null
          msrp_price: number | null
          wholesale_price: number | null
          stock_count: number
          is_active: boolean
          is_bestseller: boolean
          brand_id: string | null
          sort_order: number
          search_vector: string | null
        }
        Insert: {
          id?: string
          product_name: string
          product_function: string
          target_concerns?: string[]
          key_ingredients?: string[]
          regimen_placement?: string | null
          created_at?: string
          sku?: string | null
          category?: string | null
          msrp_price?: number | null
          wholesale_price?: number | null
          stock_count?: number
          is_active?: boolean
          is_bestseller?: boolean
          brand_id?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          product_name?: string
          product_function?: string
          target_concerns?: string[]
          key_ingredients?: string[]
          regimen_placement?: string | null
          created_at?: string
          sku?: string | null
          category?: string | null
          msrp_price?: number | null
          wholesale_price?: number | null
          stock_count?: number
          is_active?: boolean
          is_bestseller?: boolean
          brand_id?: string | null
          sort_order?: number
        }
      }
      service_mappings: {
        Row: {
          id: string
          service_id: string
          solution_type: string
          solution_reference: string
          match_type: string
          confidence: string
          rationale: string
          custom_build_details: Json | null
          retail_attach: string[]
          cogs_status: string
          cogs_amount: number | null
          pricing_guidance: string | null
          created_at: string
        }
        Insert: {
          id?: string
          service_id: string
          solution_type: string
          solution_reference: string
          match_type: string
          confidence: string
          rationale: string
          custom_build_details?: Json | null
          retail_attach?: string[]
          cogs_status?: string
          cogs_amount?: number | null
          pricing_guidance?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          solution_type?: string
          solution_reference?: string
          match_type?: string
          confidence?: string
          rationale?: string
          custom_build_details?: Json | null
          retail_attach?: string[]
          cogs_status?: string
          cogs_amount?: number | null
          pricing_guidance?: string | null
          created_at?: string
        }
      }
      spa_menus: {
        Row: {
          id: string
          spa_name: string
          upload_date: string
          raw_menu_data: string
          parse_status: string
          created_at: string
        }
        Insert: {
          id?: string
          spa_name: string
          upload_date?: string
          raw_menu_data: string
          parse_status?: string
          created_at?: string
        }
        Update: {
          id?: string
          spa_name?: string
          upload_date?: string
          raw_menu_data?: string
          parse_status?: string
          created_at?: string
        }
      }
      spa_services: {
        Row: {
          id: string
          menu_id: string
          service_name: string
          category: string
          duration: string | null
          price: number | null
          description: string | null
          keywords: string[]
          created_at: string
        }
        Insert: {
          id?: string
          menu_id: string
          service_name: string
          category: string
          duration?: string | null
          price?: number | null
          description?: string | null
          keywords?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          menu_id?: string
          service_name?: string
          category?: string
          duration?: string | null
          price?: number | null
          description?: string | null
          keywords?: string[]
          created_at?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price_cents: number
          interval: string
          stripe_price_id: string | null
          features: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          price_cents: number
          interval?: string
          stripe_price_id?: string | null
          features?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price_cents?: number
          interval?: string
          stripe_price_id?: string | null
          features?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      treatment_costs: {
        Row: {
          id: string
          item_type: string
          item_reference: string
          cost_per_unit: number | null
          unit_type: string | null
          typical_usage_amount: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          item_type: string
          item_reference: string
          cost_per_unit?: number | null
          unit_type?: string | null
          typical_usage_amount?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          item_type?: string
          item_reference?: string
          cost_per_unit?: number | null
          unit_type?: string | null
          typical_usage_amount?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string | null
          role: string | null
          created_at: string | null
          brand_id: string | null
          business_id: string | null
          reseller_tier: 'active' | 'elite' | 'master' | null
          brand_tier: 'emerging' | 'pro' | 'premium' | null
        }
        Insert: {
          id: string
          email?: string | null
          role?: string | null
          created_at?: string | null
          brand_id?: string | null
          business_id?: string | null
          reseller_tier?: 'active' | 'elite' | 'master' | null
          brand_tier?: 'emerging' | 'pro' | 'premium' | null
        }
        Update: {
          id?: string
          email?: string | null
          role?: string | null
          created_at?: string | null
          brand_id?: string | null
          business_id?: string | null
          reseller_tier?: 'active' | 'elite' | 'master' | null
          brand_tier?: 'emerging' | 'pro' | 'premium' | null
        }
      }
      // ── W11-13: Square Bookings operator sync ────────────────────────────────
      square_oauth_states: {
        Row: {
          state: string
          business_id: string
          return_path: string
          expires_at: string
          created_at: string
        }
        Insert: {
          state: string
          business_id: string
          return_path?: string
          expires_at?: string
          created_at?: string
        }
        Update: {
          state?: string
          business_id?: string
          return_path?: string
          expires_at?: string
          created_at?: string
        }
      }
      square_connections: {
        Row: {
          id: string
          business_id: string
          square_merchant_id: string
          square_location_id: string | null
          access_token: string
          refresh_token: string | null
          token_expires_at: string | null
          oauth_scope: string | null
          status: 'active' | 'disconnected' | 'error' | 'pending'
          connected_at: string
          last_synced_at: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          square_merchant_id: string
          square_location_id?: string | null
          access_token: string
          refresh_token?: string | null
          token_expires_at?: string | null
          oauth_scope?: string | null
          status?: 'active' | 'disconnected' | 'error' | 'pending'
          connected_at?: string
          last_synced_at?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          square_merchant_id?: string
          square_location_id?: string | null
          access_token?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          oauth_scope?: string | null
          status?: 'active' | 'disconnected' | 'error' | 'pending'
          connected_at?: string
          last_synced_at?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      square_appointments_cache: {
        Row: {
          id: string
          square_connection_id: string
          business_id: string
          square_booking_id: string
          service_name: string | null
          service_variation_id: string | null
          team_member_id: string | null
          location_id: string | null
          start_at: string | null
          duration_minutes: number | null
          price_amount: number | null
          currency: string
          booking_status: string | null
          source: string
          synced_at: string
          created_at: string
        }
        Insert: {
          id?: string
          square_connection_id: string
          business_id: string
          square_booking_id: string
          service_name?: string | null
          service_variation_id?: string | null
          team_member_id?: string | null
          location_id?: string | null
          start_at?: string | null
          duration_minutes?: number | null
          price_amount?: number | null
          currency?: string
          booking_status?: string | null
          source?: string
          synced_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          square_connection_id?: string
          business_id?: string
          square_booking_id?: string
          service_name?: string | null
          service_variation_id?: string | null
          team_member_id?: string | null
          location_id?: string | null
          start_at?: string | null
          duration_minutes?: number | null
          price_amount?: number | null
          currency?: string
          booking_status?: string | null
          source?: string
          synced_at?: string
          created_at?: string
        }
      }
      // ── W10-08: RSS ingestion pipeline ──────────────────────────────────────
      rss_sources: {
        Row: {
          id: string
          name: string
          feed_url: string
          category: 'professional_beauty' | 'medspa_aesthetic' | 'skincare_brands' | 'wellness' | 'beauty_tech' | 'cosmetic_surgery' | 'trade_industry'
          verticals: string[]
          refresh_minutes: number
          last_fetched_at: string | null
          last_item_count: number
          error_count: number
          status: 'active' | 'paused' | 'deprecated'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          feed_url: string
          category: 'professional_beauty' | 'medspa_aesthetic' | 'skincare_brands' | 'wellness' | 'beauty_tech' | 'cosmetic_surgery' | 'trade_industry'
          verticals?: string[]
          refresh_minutes?: number
          last_fetched_at?: string | null
          last_item_count?: number
          error_count?: number
          status?: 'active' | 'paused' | 'deprecated'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          feed_url?: string
          category?: 'professional_beauty' | 'medspa_aesthetic' | 'skincare_brands' | 'wellness' | 'beauty_tech' | 'cosmetic_surgery' | 'trade_industry'
          verticals?: string[]
          refresh_minutes?: number
          last_fetched_at?: string | null
          last_item_count?: number
          error_count?: number
          status?: 'active' | 'paused' | 'deprecated'
          created_at?: string
        }
      }
      rss_items: {
        Row: {
          id: string
          source_id: string
          guid: string
          title: string
          link: string | null
          description: string | null
          content: string | null
          author: string | null
          published_at: string | null
          image_url: string | null
          sentiment_score: number | null
          relevance_score: number | null
          brand_mentions: string[]
          ingredient_mentions: string[]
          treatment_mentions: string[]
          vertical_tags: string[]
          is_new: boolean
          confidence_score: number
          attribution_text: string
          search_vector: string | null
          created_at: string
        }
        Insert: {
          id?: string
          source_id: string
          guid: string
          title: string
          link?: string | null
          description?: string | null
          content?: string | null
          author?: string | null
          published_at?: string | null
          image_url?: string | null
          sentiment_score?: number | null
          relevance_score?: number | null
          brand_mentions?: string[]
          ingredient_mentions?: string[]
          treatment_mentions?: string[]
          vertical_tags?: string[]
          is_new?: boolean
          confidence_score?: number
          attribution_text?: string
          created_at?: string
        }
        Update: {
          id?: string
          source_id?: string
          guid?: string
          title?: string
          link?: string | null
          description?: string | null
          content?: string | null
          author?: string | null
          published_at?: string | null
          image_url?: string | null
          sentiment_score?: number | null
          relevance_score?: number | null
          brand_mentions?: string[]
          ingredient_mentions?: string[]
          treatment_mentions?: string[]
          vertical_tags?: string[]
          is_new?: boolean
          confidence_score?: number
          attribution_text?: string
          created_at?: string
        }
      }
      // ── W10-09: Open Beauty Facts — ingredient intelligence ──────────────
      ingredients: {
        Row: {
          id: string
          inci_name: string
          common_name: string | null
          cas_number: string | null
          cosing_id: string | null
          pubchem_cid: string | null
          function: string[]
          restrictions: string | null
          eu_status: 'allowed' | 'restricted' | 'banned' | null
          safety_score: number | null
          trending_score: number | null
          description: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          inci_name: string
          common_name?: string | null
          cas_number?: string | null
          cosing_id?: string | null
          pubchem_cid?: string | null
          function?: string[]
          restrictions?: string | null
          eu_status?: 'allowed' | 'restricted' | 'banned' | null
          safety_score?: number | null
          trending_score?: number | null
          description?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          inci_name?: string
          common_name?: string | null
          cas_number?: string | null
          cosing_id?: string | null
          pubchem_cid?: string | null
          function?: string[]
          restrictions?: string | null
          eu_status?: 'allowed' | 'restricted' | 'banned' | null
          safety_score?: number | null
          trending_score?: number | null
          description?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      ingredient_identifiers: {
        Row: {
          ingredient_id: string
          identifier_type: 'inci' | 'cas' | 'cosing' | 'pubchem' | 'einecs'
          identifier_value: string
        }
        Insert: {
          ingredient_id: string
          identifier_type: 'inci' | 'cas' | 'cosing' | 'pubchem' | 'einecs'
          identifier_value: string
        }
        Update: {
          ingredient_id?: string
          identifier_type?: 'inci' | 'cas' | 'cosing' | 'pubchem' | 'einecs'
          identifier_value?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          price_cents: number
          compare_at_price_cents: number | null
          currency: string
          sku: string | null
          stock_quantity: number
          track_inventory: boolean
          is_active: boolean
          is_featured: boolean
          category_id: string | null
          brand_id: string | null
          images: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          price_cents: number
          compare_at_price_cents?: number | null
          currency?: string
          sku?: string | null
          stock_quantity?: number
          track_inventory?: boolean
          is_active?: boolean
          is_featured?: boolean
          category_id?: string | null
          brand_id?: string | null
          images?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          price_cents?: number
          compare_at_price_cents?: number | null
          currency?: string
          sku?: string | null
          stock_quantity?: number
          track_inventory?: boolean
          is_active?: boolean
          is_featured?: boolean
          category_id?: string | null
          brand_id?: string | null
          images?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      product_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          sort_order: number
          image_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          parent_id?: string | null
          sort_order?: number
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          parent_id?: string | null
          sort_order?: number
          image_url?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          sku: string | null
          price_cents: number
          stock_quantity: number
          attributes: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          sku?: string | null
          price_cents: number
          stock_quantity?: number
          attributes?: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          sku?: string | null
          price_cents?: number
          stock_quantity?: number
          attributes?: Json
          is_active?: boolean
          created_at?: string
        }
      }
      carts: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          status: 'active' | 'converted' | 'abandoned'
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          status?: 'active' | 'converted' | 'abandoned'
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          status?: 'active' | 'converted' | 'abandoned'
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string | null
          variant_id: string | null
          quantity: number
          unit_price_cents: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id?: string | null
          variant_id?: string | null
          quantity: number
          unit_price_cents: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          product_id?: string | null
          variant_id?: string | null
          quantity?: number
          unit_price_cents?: number
          created_at?: string
          updated_at?: string
        }
      }
      discount_codes: {
        Row: {
          id: string
          code: string
          type: 'percentage' | 'fixed_amount' | 'free_shipping'
          value_cents: number | null
          percentage: number | null
          minimum_order_cents: number | null
          maximum_uses: number | null
          current_uses: number
          is_active: boolean
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          type: 'percentage' | 'fixed_amount' | 'free_shipping'
          value_cents?: number | null
          percentage?: number | null
          minimum_order_cents?: number | null
          maximum_uses?: number | null
          current_uses?: number
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          type?: 'percentage' | 'fixed_amount' | 'free_shipping'
          value_cents?: number | null
          percentage?: number | null
          minimum_order_cents?: number | null
          maximum_uses?: number | null
          current_uses?: number
          is_active?: boolean
          expires_at?: string | null
          created_at?: string
        }
      }
      shipping_methods: {
        Row: {
          id: string
          name: string
          description: string | null
          carrier: string | null
          estimated_days_min: number | null
          estimated_days_max: number | null
          base_rate_cents: number
          per_item_rate_cents: number
          free_above_cents: number | null
          is_active: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          carrier?: string | null
          estimated_days_min?: number | null
          estimated_days_max?: number | null
          base_rate_cents: number
          per_item_rate_cents?: number
          free_above_cents?: number | null
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          carrier?: string | null
          estimated_days_min?: number | null
          estimated_days_max?: number | null
          base_rate_cents?: number
          per_item_rate_cents?: number
          free_above_cents?: number | null
          is_active?: boolean
          sort_order?: number
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          order_id: string | null
          rating: number
          title: string | null
          body: string | null
          is_verified_purchase: boolean
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          order_id?: string | null
          rating: number
          title?: string | null
          body?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          order_id?: string | null
          rating?: number
          title?: string | null
          body?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          created_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          name: string
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          is_public?: boolean
          created_at?: string
        }
      }
      wishlist_items: {
        Row: {
          id: string
          wishlist_id: string
          product_id: string | null
          variant_id: string | null
          added_at: string
        }
        Insert: {
          id?: string
          wishlist_id: string
          product_id?: string | null
          variant_id?: string | null
          added_at?: string
        }
        Update: {
          id?: string
          wishlist_id?: string
          product_id?: string | null
          variant_id?: string | null
          added_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      resolve_product_price: {
        Args: {
          p_product_id: string
          p_product_type: string
          p_tier?: string
        }
        Returns: {
          resolved_tier: string
          price: number
          currency: string
          min_qty: number
        }[]
      }
    }
    Enums: {
      brand_status: 'active' | 'inactive' | 'pending'
      business_type: 'spa' | 'salon' | 'barbershop' | 'medspa' | 'wellness_center' | 'other'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
