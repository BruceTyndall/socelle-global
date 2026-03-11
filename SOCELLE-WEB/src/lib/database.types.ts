export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_requests: {
        Row: {
          business_name: string | null
          business_type: string | null
          contact_name: string | null
          created_at: string
          email: string
          id: string
          notes: string | null
          quiz_answers: Json | null
          referral_source: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          zip_code: string | null
        }
        Insert: {
          business_name?: string | null
          business_type?: string | null
          contact_name?: string | null
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          quiz_answers?: Json | null
          referral_source?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          zip_code?: string | null
        }
        Update: {
          business_name?: string | null
          business_type?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          quiz_answers?: Json | null
          referral_source?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      admin_activity_log: {
        Row: {
          activity_details: Json | null
          activity_type: string
          admin_user_id: string
          created_at: string | null
          id: string
          submission_id: string
        }
        Insert: {
          activity_details?: Json | null
          activity_type: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          submission_id: string
        }
        Update: {
          activity_details?: Json | null
          activity_type?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_log_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "plan_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_clicks: {
        Row: {
          affiliate_code: string | null
          created_at: string
          distributor_id: string | null
          id: string
          ip_address: string | null
          product_id: string | null
          target_url: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          affiliate_code?: string | null
          created_at?: string
          distributor_id?: string | null
          id?: string
          ip_address?: string | null
          product_id?: string | null
          target_url: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          affiliate_code?: string | null
          created_at?: string
          distributor_id?: string | null
          id?: string
          ip_address?: string | null
          product_id?: string | null
          target_url?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_concierge_approved_tables: {
        Row: {
          allowed_modes: string[] | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          table_name: string
        }
        Insert: {
          allowed_modes?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          table_name: string
        }
        Update: {
          allowed_modes?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          table_name?: string
        }
        Relationships: []
      }
      ai_concierge_chat_logs: {
        Row: {
          ai_response: string
          confidence_level: string
          context_page: string | null
          created_at: string | null
          id: string
          missing_data_flags: string[] | null
          mode_used: string
          source_tables: string[] | null
          spa_id: string | null
          user_question: string
          user_role: string
        }
        Insert: {
          ai_response: string
          confidence_level: string
          context_page?: string | null
          created_at?: string | null
          id?: string
          missing_data_flags?: string[] | null
          mode_used: string
          source_tables?: string[] | null
          spa_id?: string | null
          user_question: string
          user_role?: string
        }
        Update: {
          ai_response?: string
          confidence_level?: string
          context_page?: string | null
          created_at?: string | null
          id?: string
          missing_data_flags?: string[] | null
          mode_used?: string
          source_tables?: string[] | null
          spa_id?: string | null
          user_question?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_concierge_chat_logs_spa_id_fkey"
            columns: ["spa_id"]
            isOneToOne: false
            referencedRelation: "spa_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_concierge_starter_questions: {
        Row: {
          context_page: string
          created_at: string | null
          id: string
          is_active: boolean | null
          mode: string
          priority: number | null
          question_text: string
        }
        Insert: {
          context_page: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mode: string
          priority?: number | null
          question_text: string
        }
        Update: {
          context_page?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mode?: string
          priority?: number | null
          question_text?: string
        }
        Relationships: []
      }
      ai_credit_ledger: {
        Row: {
          amount_usd: number
          balance_after: number
          created_at: string
          feature: string | null
          id: string
          model: string
          provider: string
          request_id: string | null
          tier: number
          tokens_in: number
          tokens_out: number
          user_id: string
        }
        Insert: {
          amount_usd: number
          balance_after: number
          created_at?: string
          feature?: string | null
          id?: string
          model: string
          provider: string
          request_id?: string | null
          tier: number
          tokens_in?: number
          tokens_out?: number
          user_id: string
        }
        Update: {
          amount_usd?: number
          balance_after?: number
          created_at?: string
          feature?: string | null
          id?: string
          model?: string
          provider?: string
          request_id?: string | null
          tier?: number
          tokens_in?: number
          tokens_out?: number
          user_id?: string
        }
        Relationships: []
      }
      api_registry: {
        Row: {
          api_key_vault_ref: string | null
          base_url: string | null
          category: string
          created_at: string | null
          docs_url: string | null
          environment: string
          id: string
          is_active: boolean | null
          last_test_latency_ms: number | null
          last_test_status: string | null
          last_tested_at: string | null
          name: string
          notes: string | null
          provider: string
          updated_at: string | null
        }
        Insert: {
          api_key_vault_ref?: string | null
          base_url?: string | null
          category: string
          created_at?: string | null
          docs_url?: string | null
          environment?: string
          id?: string
          is_active?: boolean | null
          last_test_latency_ms?: number | null
          last_test_status?: string | null
          last_tested_at?: string | null
          name: string
          notes?: string | null
          provider: string
          updated_at?: string | null
        }
        Update: {
          api_key_vault_ref?: string | null
          base_url?: string | null
          category?: string
          created_at?: string | null
          docs_url?: string | null
          environment?: string
          id?: string
          is_active?: boolean | null
          last_test_latency_ms?: number | null
          last_test_status?: string | null
          last_tested_at?: string | null
          name?: string
          notes?: string | null
          provider?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      api_route_map: {
        Row: {
          api_registry_id: string | null
          auth_required: boolean | null
          created_at: string | null
          description: string | null
          edge_function_name: string | null
          id: string
          is_active: boolean | null
          method: string
          rate_limit_rpm: number | null
          route: string
          updated_at: string | null
        }
        Insert: {
          api_registry_id?: string | null
          auth_required?: boolean | null
          created_at?: string | null
          description?: string | null
          edge_function_name?: string | null
          id?: string
          is_active?: boolean | null
          method?: string
          rate_limit_rpm?: number | null
          route: string
          updated_at?: string | null
        }
        Update: {
          api_registry_id?: string | null
          auth_required?: boolean | null
          created_at?: string | null
          description?: string | null
          edge_function_name?: string | null
          id?: string
          is_active?: boolean | null
          method?: string
          rate_limit_rpm?: number | null
          route?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_route_map_api_registry_id_fkey"
            columns: ["api_registry_id"]
            isOneToOne: false
            referencedRelation: "api_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          resource: string | null
          resource_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          resource?: string | null
          resource_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          resource?: string | null
          resource_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      brand_analytics: {
        Row: {
          avg_order_value: number | null
          brand_id: string
          businesses_matched: number | null
          businesses_reached: number | null
          converted_leads: number | null
          created_at: string | null
          gross_revenue: number | null
          id: string
          lead_conversion_rate: number | null
          new_businesses: number | null
          new_leads: number | null
          new_orders: number | null
          period_end: string
          period_start: string
          period_type: string
          product_views: number | null
          protocol_match_rate: number | null
          qualified_leads: number | null
          reorder_rate: number | null
          repeat_orders: number | null
          return_rate: number | null
          returning_businesses: number | null
          search_appearances: number | null
          storefront_views: number | null
          total_orders: number | null
        }
        Insert: {
          avg_order_value?: number | null
          brand_id: string
          businesses_matched?: number | null
          businesses_reached?: number | null
          converted_leads?: number | null
          created_at?: string | null
          gross_revenue?: number | null
          id?: string
          lead_conversion_rate?: number | null
          new_businesses?: number | null
          new_leads?: number | null
          new_orders?: number | null
          period_end: string
          period_start: string
          period_type: string
          product_views?: number | null
          protocol_match_rate?: number | null
          qualified_leads?: number | null
          reorder_rate?: number | null
          repeat_orders?: number | null
          return_rate?: number | null
          returning_businesses?: number | null
          search_appearances?: number | null
          storefront_views?: number | null
          total_orders?: number | null
        }
        Update: {
          avg_order_value?: number | null
          brand_id?: string
          businesses_matched?: number | null
          businesses_reached?: number | null
          converted_leads?: number | null
          created_at?: string | null
          gross_revenue?: number | null
          id?: string
          lead_conversion_rate?: number | null
          new_businesses?: number | null
          new_leads?: number | null
          new_orders?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          product_views?: number | null
          protocol_match_rate?: number | null
          qualified_leads?: number | null
          reorder_rate?: number | null
          repeat_orders?: number | null
          return_rate?: number | null
          returning_businesses?: number | null
          search_appearances?: number | null
          storefront_views?: number | null
          total_orders?: number | null
        }
        Relationships: []
      }
      brand_assets: {
        Row: {
          alt_text: string | null
          brand_id: string
          caption: string | null
          collection: string | null
          created_at: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          is_featured: boolean | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          brand_id: string
          caption?: string | null
          collection?: string | null
          created_at?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          is_featured?: boolean | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          brand_id?: string
          caption?: string | null
          collection?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          is_featured?: boolean | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_assets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_commercial_assets: {
        Row: {
          asset_type: string
          brand_id: string
          created_at: string | null
          id: string
          is_internal_only: boolean | null
          notes: string | null
          resource_url: string | null
          sort_order: number
          title: string
          updated_at: string | null
        }
        Insert: {
          asset_type: string
          brand_id: string
          created_at?: string | null
          id?: string
          is_internal_only?: boolean | null
          notes?: string | null
          resource_url?: string | null
          sort_order?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          asset_type?: string
          brand_id?: string
          created_at?: string | null
          id?: string
          is_internal_only?: boolean | null
          notes?: string | null
          resource_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_commercial_assets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_differentiation_points: {
        Row: {
          created_at: string | null
          created_by: string | null
          evidence_references: Json | null
          grounded_in_features: Json | null
          grounded_in_protocols: Json | null
          headline: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          point_category: string
          source_trace: Json
          spa_type: string | null
          supporting_points: Json
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          evidence_references?: Json | null
          grounded_in_features?: Json | null
          grounded_in_protocols?: Json | null
          headline: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          point_category: string
          source_trace?: Json
          spa_type?: string | null
          supporting_points?: Json
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          evidence_references?: Json | null
          grounded_in_features?: Json | null
          grounded_in_protocols?: Json | null
          headline?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          point_category?: string
          source_trace?: Json
          spa_type?: string | null
          supporting_points?: Json
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      brand_interest_signals: {
        Row: {
          brand_id: string
          business_id: string
          created_at: string
          id: string
          message: string | null
          signal_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id: string
          business_id: string
          created_at?: string
          id?: string
          message?: string | null
          signal_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string
          business_id?: string
          created_at?: string
          id?: string
          message?: string | null
          signal_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_interest_signals_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_interest_signals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_page_modules: {
        Row: {
          brand_id: string
          config: Json | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          layout_variant: string | null
          module_type: string
          sort_order: number
          title: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          config?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          layout_variant?: string | null
          module_type: string
          sort_order?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          config?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          layout_variant?: string | null
          module_type?: string
          sort_order?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_page_modules_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_seed_content: {
        Row: {
          accepted_at: string | null
          brand_id: string
          content_data: Json
          content_type: string
          created_at: string
          created_by: string
          id: string
          rejected_reason: string | null
          source_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          brand_id: string
          content_data: Json
          content_type: string
          created_at?: string
          created_by: string
          id?: string
          rejected_reason?: string | null
          source_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          brand_id?: string
          content_data?: Json
          content_type?: string
          created_at?: string
          created_by?: string
          id?: string
          rejected_reason?: string | null
          source_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_seed_content_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_shop_settings: {
        Row: {
          brand_id: string
          created_at: string
          featured_product_ids: string[] | null
          fulfillment_email: string | null
          fulfillment_notes: string | null
          fulfillment_phone: string | null
          id: string
          max_order_quantity: number | null
          min_order_amount: number | null
          order_note: string | null
          product_sort_order: string
          shop_enabled: boolean
          show_pro_products: boolean
          show_retail_products: boolean
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          featured_product_ids?: string[] | null
          fulfillment_email?: string | null
          fulfillment_notes?: string | null
          fulfillment_phone?: string | null
          id?: string
          max_order_quantity?: number | null
          min_order_amount?: number | null
          order_note?: string | null
          product_sort_order?: string
          shop_enabled?: boolean
          show_pro_products?: boolean
          show_retail_products?: boolean
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          featured_product_ids?: string[] | null
          fulfillment_email?: string | null
          fulfillment_notes?: string | null
          fulfillment_phone?: string | null
          id?: string
          max_order_quantity?: number | null
          min_order_amount?: number | null
          order_note?: string | null
          product_sort_order?: string
          shop_enabled?: boolean
          show_pro_products?: boolean
          show_retail_products?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_shop_settings_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_training_modules: {
        Row: {
          brand_id: string
          created_at: string | null
          description: string | null
          duration: string | null
          format: string
          id: string
          is_published: boolean | null
          level: string
          resource_url: string | null
          sort_order: number
          title: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          format: string
          id?: string
          is_published?: boolean | null
          level: string
          resource_url?: string | null
          sort_order?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          format?: string
          id?: string
          is_published?: boolean | null
          level?: string
          resource_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_training_modules_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          category_tags: string[] | null
          claimed_at: string | null
          claimed_by: string | null
          contact_email: string | null
          created_at: string | null
          description: string | null
          hero_image_url: string | null
          hero_video_url: string | null
          id: string
          is_published: boolean | null
          logo_url: string | null
          long_description: string | null
          name: string
          outreach_status: string | null
          published_at: string | null
          seeded_by: string | null
          service_tier: string
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["brand_status"] | null
          theme: Json | null
          updated_at: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
          website_url: string | null
        }
        Insert: {
          category_tags?: string[] | null
          claimed_at?: string | null
          claimed_by?: string | null
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          hero_image_url?: string | null
          hero_video_url?: string | null
          id?: string
          is_published?: boolean | null
          logo_url?: string | null
          long_description?: string | null
          name: string
          outreach_status?: string | null
          published_at?: string | null
          seeded_by?: string | null
          service_tier?: string
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["brand_status"] | null
          theme?: Json | null
          updated_at?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Update: {
          category_tags?: string[] | null
          claimed_at?: string | null
          claimed_by?: string | null
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          hero_image_url?: string | null
          hero_video_url?: string | null
          id?: string
          is_published?: boolean | null
          logo_url?: string | null
          long_description?: string | null
          name?: string
          outreach_status?: string | null
          published_at?: string | null
          seeded_by?: string | null
          service_tier?: string
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["brand_status"] | null
          theme?: Json | null
          updated_at?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      business_analytics: {
        Row: {
          avg_order_value: number | null
          brands_matched: number | null
          brands_ordered: number | null
          brands_viewed: number | null
          business_id: string
          created_at: string | null
          id: string
          mapped_services: number | null
          menu_coverage_rate: number | null
          period_end: string
          period_start: string
          period_type: string
          plans_activated: number | null
          plans_created: number | null
          retail_revenue: number | null
          retail_uplift_pct: number | null
          total_orders: number | null
          total_services: number | null
          total_spend: number | null
          unmapped_services: number | null
        }
        Insert: {
          avg_order_value?: number | null
          brands_matched?: number | null
          brands_ordered?: number | null
          brands_viewed?: number | null
          business_id: string
          created_at?: string | null
          id?: string
          mapped_services?: number | null
          menu_coverage_rate?: number | null
          period_end: string
          period_start: string
          period_type: string
          plans_activated?: number | null
          plans_created?: number | null
          retail_revenue?: number | null
          retail_uplift_pct?: number | null
          total_orders?: number | null
          total_services?: number | null
          total_spend?: number | null
          unmapped_services?: number | null
        }
        Update: {
          avg_order_value?: number | null
          brands_matched?: number | null
          brands_ordered?: number | null
          brands_viewed?: number | null
          business_id?: string
          created_at?: string | null
          id?: string
          mapped_services?: number | null
          menu_coverage_rate?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          plans_activated?: number | null
          plans_created?: number | null
          retail_revenue?: number | null
          retail_uplift_pct?: number | null
          total_orders?: number | null
          total_services?: number | null
          total_spend?: number | null
          unmapped_services?: number | null
        }
        Relationships: []
      }
      business_interest_signals: {
        Row: {
          brand_id: string
          business_id: string
          created_at: string
          id: string
          internal_note: string | null
          signal_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id: string
          business_id: string
          created_at?: string
          id?: string
          internal_note?: string | null
          signal_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string
          business_id?: string
          created_at?: string
          id?: string
          internal_note?: string | null
          signal_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_interest_signals_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_interest_signals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_plan_outputs: {
        Row: {
          created_at: string | null
          id: string
          output_data: Json
          output_type: string
          plan_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          output_data: Json
          output_type: string
          plan_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          output_data?: Json
          output_type?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_plan_outputs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      business_seed_content: {
        Row: {
          accepted_at: string | null
          business_id: string
          content_data: Json
          content_type: string
          created_at: string
          created_by: string
          id: string
          rejected_reason: string | null
          source_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          business_id: string
          content_data: Json
          content_type: string
          created_at?: string
          created_by: string
          id?: string
          rejected_reason?: string | null
          source_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          business_id?: string
          content_data?: Json
          content_type?: string
          created_at?: string
          created_by?: string
          id?: string
          rejected_reason?: string | null
          source_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_seed_content_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          business_type: string | null
          city: string | null
          claimed_at: string | null
          claimed_by: string | null
          country: string | null
          created_at: string | null
          created_by_user_id: string | null
          id: string
          instagram_handle: string | null
          integration_sync_status: string | null
          integration_type: string | null
          is_verified: boolean | null
          latitude: number | null
          license_expiration_date: string | null
          license_number: string | null
          license_state: string | null
          location: string | null
          longitude: number | null
          name: string
          npi_number: string | null
          npi_verified: boolean | null
          npi_verified_at: string | null
          phone: string | null
          seeded_by: string | null
          slug: string | null
          state: string | null
          type: Database["public"]["Enums"]["business_type"] | null
          updated_at: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
          website_url: string | null
        }
        Insert: {
          business_type?: string | null
          city?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          country?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          id?: string
          instagram_handle?: string | null
          integration_sync_status?: string | null
          integration_type?: string | null
          is_verified?: boolean | null
          latitude?: number | null
          license_expiration_date?: string | null
          license_number?: string | null
          license_state?: string | null
          location?: string | null
          longitude?: number | null
          name: string
          npi_number?: string | null
          npi_verified?: boolean | null
          npi_verified_at?: string | null
          phone?: string | null
          seeded_by?: string | null
          slug?: string | null
          state?: string | null
          type?: Database["public"]["Enums"]["business_type"] | null
          updated_at?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Update: {
          business_type?: string | null
          city?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          country?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          id?: string
          instagram_handle?: string | null
          integration_sync_status?: string | null
          integration_type?: string | null
          is_verified?: boolean | null
          latitude?: number | null
          license_expiration_date?: string | null
          license_number?: string | null
          license_state?: string | null
          location?: string | null
          longitude?: number | null
          name?: string
          npi_number?: string | null
          npi_verified?: boolean | null
          npi_verified_at?: string | null
          phone?: string | null
          seeded_by?: string | null
          slug?: string | null
          state?: string | null
          type?: Database["public"]["Enums"]["business_type"] | null
          updated_at?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      canonical_protocol_step_products: {
        Row: {
          brand_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          product_id: string | null
          product_name: string
          product_type: string
          protocol_step_id: string
          usage_amount: string | null
          usage_unit: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name: string
          product_type: string
          protocol_step_id: string
          usage_amount?: string | null
          usage_unit?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          product_name?: string
          product_type?: string
          protocol_step_id?: string
          usage_amount?: string | null
          usage_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "canonical_protocol_step_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "canonical_protocol_step_products_protocol_step_id_fkey"
            columns: ["protocol_step_id"]
            isOneToOne: false
            referencedRelation: "canonical_protocol_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      canonical_protocol_steps: {
        Row: {
          brand_id: string | null
          canonical_protocol_id: string
          created_at: string | null
          id: string
          step_instructions: string
          step_number: number
          step_title: string
          technique_notes: string | null
          timing_minutes: number | null
        }
        Insert: {
          brand_id?: string | null
          canonical_protocol_id: string
          created_at?: string | null
          id?: string
          step_instructions: string
          step_number: number
          step_title: string
          technique_notes?: string | null
          timing_minutes?: number | null
        }
        Update: {
          brand_id?: string | null
          canonical_protocol_id?: string
          created_at?: string | null
          id?: string
          step_instructions?: string
          step_number?: number
          step_title?: string
          technique_notes?: string | null
          timing_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "canonical_protocol_steps_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "canonical_protocol_steps_canonical_protocol_id_fkey"
            columns: ["canonical_protocol_id"]
            isOneToOne: false
            referencedRelation: "canonical_protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "canonical_protocol_steps_canonical_protocol_id_fkey"
            columns: ["canonical_protocol_id"]
            isOneToOne: false
            referencedRelation: "protocol_complete_details"
            referencedColumns: ["protocol_id"]
          },
        ]
      }
      canonical_protocols: {
        Row: {
          allowed_products: string[] | null
          brand_id: string | null
          category: string
          certification_required: boolean | null
          certification_type: string | null
          completed_at: string | null
          completed_by: string | null
          completion_status: Database["public"]["Enums"]["protocol_completion_status"]
          contraindications: string[] | null
          created_at: string | null
          embedding: string | null
          embedding_updated_at: string | null
          estimated_training_hours: number | null
          id: string
          last_edited_at: string | null
          last_edited_by: string | null
          manual_entry_notes: string | null
          modalities_steps: Json | null
          protocol_name: string
          source_file: string | null
          target_concerns: string[] | null
          training_notes: string | null
          training_required: boolean | null
          training_type: string | null
          typical_duration: string | null
        }
        Insert: {
          allowed_products?: string[] | null
          brand_id?: string | null
          category: string
          certification_required?: boolean | null
          certification_type?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_status?: Database["public"]["Enums"]["protocol_completion_status"]
          contraindications?: string[] | null
          created_at?: string | null
          embedding?: string | null
          embedding_updated_at?: string | null
          estimated_training_hours?: number | null
          id?: string
          last_edited_at?: string | null
          last_edited_by?: string | null
          manual_entry_notes?: string | null
          modalities_steps?: Json | null
          protocol_name: string
          source_file?: string | null
          target_concerns?: string[] | null
          training_notes?: string | null
          training_required?: boolean | null
          training_type?: string | null
          typical_duration?: string | null
        }
        Update: {
          allowed_products?: string[] | null
          brand_id?: string | null
          category?: string
          certification_required?: boolean | null
          certification_type?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completion_status?: Database["public"]["Enums"]["protocol_completion_status"]
          contraindications?: string[] | null
          created_at?: string | null
          embedding?: string | null
          embedding_updated_at?: string | null
          estimated_training_hours?: number | null
          id?: string
          last_edited_at?: string | null
          last_edited_by?: string | null
          manual_entry_notes?: string | null
          modalities_steps?: Json | null
          protocol_name?: string
          source_file?: string | null
          target_concerns?: string[] | null
          training_notes?: string | null
          training_required?: boolean | null
          training_type?: string | null
          typical_duration?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "canonical_protocols_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          unit_price_cents: number
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity: number
          unit_price_cents: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          unit_price_cents?: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          session_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cms_assets: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          filename: string
          height: number | null
          id: string
          mime_type: string
          size_bytes: number | null
          storage_path: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          filename: string
          height?: number | null
          id?: string
          mime_type: string
          size_bytes?: number | null
          storage_path: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          filename?: string
          height?: number | null
          id?: string
          mime_type?: string
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      cms_blocks: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          id: string
          is_reusable: boolean | null
          name: string | null
          type: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_reusable?: boolean | null
          name?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_reusable?: boolean | null
          name?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_docs: {
        Row: {
          author_id: string | null
          body: string | null
          category: string | null
          created_at: string
          id: string
          metadata: Json | null
          slug: string
          space_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body?: string | null
          category?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          slug: string
          space_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string | null
          category?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          slug?: string
          space_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_docs_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "cms_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_page_blocks: {
        Row: {
          block_id: string
          created_at: string
          id: string
          overrides: Json | null
          page_id: string
          position: number
        }
        Insert: {
          block_id: string
          created_at?: string
          id?: string
          overrides?: Json | null
          page_id: string
          position: number
        }
        Update: {
          block_id?: string
          created_at?: string
          id?: string
          overrides?: Json | null
          page_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "cms_page_blocks_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "cms_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cms_page_blocks_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "cms_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_pages: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          published_at: string | null
          seo_canonical: string | null
          seo_description: string | null
          seo_og_image: string | null
          seo_schema_type: string | null
          seo_title: string | null
          slug: string
          space_id: string
          status: string
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          published_at?: string | null
          seo_canonical?: string | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_schema_type?: string | null
          seo_title?: string | null
          slug: string
          space_id: string
          status?: string
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          published_at?: string | null
          seo_canonical?: string | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_schema_type?: string | null
          seo_title?: string | null
          slug?: string
          space_id?: string
          status?: string
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_pages_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "cms_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cms_pages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "cms_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_posts: {
        Row: {
          author_id: string | null
          body: string | null
          category: string | null
          created_at: string
          excerpt: string | null
          featured: boolean | null
          hero_image: string | null
          id: string
          metadata: Json | null
          published_at: string | null
          reading_time: number | null
          seo_canonical: string | null
          seo_description: string | null
          seo_og_image: string | null
          seo_title: string | null
          slug: string
          source_type: string | null
          space_id: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body?: string | null
          category?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          hero_image?: string | null
          id?: string
          metadata?: Json | null
          published_at?: string | null
          reading_time?: number | null
          seo_canonical?: string | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_title?: string | null
          slug: string
          source_type?: string | null
          space_id: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string | null
          category?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          hero_image?: string | null
          id?: string
          metadata?: Json | null
          published_at?: string | null
          reading_time?: number | null
          seo_canonical?: string | null
          seo_description?: string | null
          seo_og_image?: string | null
          seo_title?: string | null
          slug?: string
          source_type?: string | null
          space_id?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_posts_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "cms_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_spaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_templates: {
        Row: {
          block_schema: Json
          created_at: string
          description: string | null
          id: string
          name: string
          preview_image: string | null
          seo_defaults: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          block_schema?: Json
          created_at?: string
          description?: string | null
          id?: string
          name: string
          preview_image?: string | null
          seo_defaults?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          block_schema?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          preview_image?: string | null
          seo_defaults?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          brand_id: string | null
          created_at: string
          id: string
          is_archived: boolean
          last_message_at: string | null
          last_message_preview: string | null
          order_id: string | null
          participant_one_id: string | null
          participant_two_id: string | null
          subject: string | null
          type: string
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean
          last_message_at?: string | null
          last_message_preview?: string | null
          order_id?: string | null
          participant_one_id?: string | null
          participant_two_id?: string | null
          subject?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean
          last_message_at?: string | null
          last_message_preview?: string | null
          order_id?: string | null
          participant_one_id?: string | null
          participant_two_id?: string | null
          subject?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      data_feeds: {
        Row: {
          api_key_env_var: string | null
          attribution_label: string | null
          category: string
          consecutive_failures: number | null
          created_at: string | null
          display_order: number
          domain: string | null
          endpoint_url: string | null
          feed_type: string
          health_status: string | null
          id: string
          is_enabled: boolean | null
          last_error: string | null
          last_fetched_at: string | null
          last_success_at: string | null
          name: string
          poll_interval_minutes: number | null
          priority: number | null
          provenance_tier: number | null
          signal_count: number | null
          tier_min: string | null
          updated_at: string | null
          vertical: string | null
        }
        Insert: {
          api_key_env_var?: string | null
          attribution_label?: string | null
          category: string
          consecutive_failures?: number | null
          created_at?: string | null
          display_order?: number
          domain?: string | null
          endpoint_url?: string | null
          feed_type: string
          health_status?: string | null
          id?: string
          is_enabled?: boolean | null
          last_error?: string | null
          last_fetched_at?: string | null
          last_success_at?: string | null
          name: string
          poll_interval_minutes?: number | null
          priority?: number | null
          provenance_tier?: number | null
          signal_count?: number | null
          tier_min?: string | null
          updated_at?: string | null
          vertical?: string | null
        }
        Update: {
          api_key_env_var?: string | null
          attribution_label?: string | null
          category?: string
          consecutive_failures?: number | null
          created_at?: string | null
          display_order?: number
          domain?: string | null
          endpoint_url?: string | null
          feed_type?: string
          health_status?: string | null
          id?: string
          is_enabled?: boolean | null
          last_error?: string | null
          last_fetched_at?: string | null
          last_success_at?: string | null
          name?: string
          poll_interval_minutes?: number | null
          priority?: number | null
          provenance_tier?: number | null
          signal_count?: number | null
          tier_min?: string | null
          updated_at?: string | null
          vertical?: string | null
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          maximum_uses: number | null
          minimum_order_cents: number | null
          percentage: number | null
          type: string
          value_cents: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          maximum_uses?: number | null
          minimum_order_cents?: number | null
          percentage?: number | null
          type: string
          value_cents?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          maximum_uses?: number | null
          minimum_order_cents?: number | null
          percentage?: number | null
          type?: string
          value_cents?: number | null
        }
        Relationships: []
      }
      document_ingestion_log: {
        Row: {
          created_at: string | null
          doc_type: string
          exceptions: Json | null
          extracted_at: string | null
          extraction_confidence: string | null
          id: string
          metadata: Json | null
          source_file: string
          status: string
        }
        Insert: {
          created_at?: string | null
          doc_type: string
          exceptions?: Json | null
          extracted_at?: string | null
          extraction_confidence?: string | null
          id?: string
          metadata?: Json | null
          source_file: string
          status?: string
        }
        Update: {
          created_at?: string | null
          doc_type?: string
          exceptions?: Json | null
          extracted_at?: string | null
          extraction_confidence?: string | null
          id?: string
          metadata?: Json | null
          source_file?: string
          status?: string
        }
        Relationships: []
      }
      embedding_queue: {
        Row: {
          created_at: string
          error_message: string | null
          id: number
          processed_at: string | null
          row_id: string
          status: string
          table_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: number
          processed_at?: string | null
          row_id: string
          status?: string
          table_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: number
          processed_at?: string | null
          row_id?: string
          status?: string
          table_name?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          attendees: string | null
          created_at: string
          date: string
          date_end: string | null
          description: string
          featured: boolean
          id: string
          location: string
          name: string
          type: string
          updated_at: string
          url: string
          verticals: string[]
        }
        Insert: {
          attendees?: string | null
          created_at?: string
          date: string
          date_end?: string | null
          description: string
          featured?: boolean
          id: string
          location: string
          name: string
          type: string
          updated_at?: string
          url: string
          verticals?: string[]
        }
        Update: {
          attendees?: string | null
          created_at?: string
          date?: string
          date_end?: string | null
          description?: string
          featured?: boolean
          id?: string
          location?: string
          name?: string
          type?: string
          updated_at?: string
          url?: string
          verticals?: string[]
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          conditions: Json | null
          created_at: string | null
          description: string | null
          enabled: boolean | null
          flag_key: string
          id: string
          rollout_pct: number | null
          updated_at: string | null
        }
        Insert: {
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          flag_key: string
          id?: string
          rollout_pct?: number | null
          updated_at?: string | null
        }
        Update: {
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          flag_key?: string
          id?: string
          rollout_pct?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      feed_dlq: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          error_message: string | null
          feed_id: string | null
          feed_url: string
          id: string
          raw_payload: Json | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          error_message?: string | null
          feed_id?: string | null
          feed_url: string
          id?: string
          raw_payload?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          error_message?: string | null
          feed_id?: string | null
          feed_url?: string
          id?: string
          raw_payload?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_dlq_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "data_feeds"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_run_log: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          feed_id: string | null
          finished_at: string | null
          id: string
          items_fetched: number | null
          signals_created: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          feed_id?: string | null
          finished_at?: string | null
          id?: string
          items_fetched?: number | null
          signals_created?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          feed_id?: string | null
          finished_at?: string | null
          id?: string
          items_fetched?: number | null
          signals_created?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_run_log_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "data_feeds"
            referencedColumns: ["id"]
          },
        ]
      }
      firebase_uid_map: {
        Row: {
          firebase_uid: string
          id: string
          linked_at: string
          linked_email: string | null
          supabase_uid: string
        }
        Insert: {
          firebase_uid: string
          id?: string
          linked_at?: string
          linked_email?: string | null
          supabase_uid: string
        }
        Update: {
          firebase_uid?: string
          id?: string
          linked_at?: string
          linked_email?: string | null
          supabase_uid?: string
        }
        Relationships: []
      }
      implementation_readiness: {
        Row: {
          admin_adjusted: boolean | null
          admin_notes: string | null
          admin_reviewed: boolean | null
          canonical_protocol_id: string | null
          confidence_level: string | null
          contraindication_sensitivity: string
          created_at: string | null
          equipment_required: Json | null
          estimated_training_hours: number | null
          gap_id: string | null
          id: string
          missing_data_flags: Json | null
          overall_implementation_risk_score: number
          prerequisites: string | null
          product_count_required: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_mapping_id: string | null
          source_trace: Json
          spa_menu_id: string
          staff_skill_level_required: string
          training_complexity: string
          updated_at: string | null
        }
        Insert: {
          admin_adjusted?: boolean | null
          admin_notes?: string | null
          admin_reviewed?: boolean | null
          canonical_protocol_id?: string | null
          confidence_level?: string | null
          contraindication_sensitivity: string
          created_at?: string | null
          equipment_required?: Json | null
          estimated_training_hours?: number | null
          gap_id?: string | null
          id?: string
          missing_data_flags?: Json | null
          overall_implementation_risk_score: number
          prerequisites?: string | null
          product_count_required?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_mapping_id?: string | null
          source_trace?: Json
          spa_menu_id: string
          staff_skill_level_required: string
          training_complexity: string
          updated_at?: string | null
        }
        Update: {
          admin_adjusted?: boolean | null
          admin_notes?: string | null
          admin_reviewed?: boolean | null
          canonical_protocol_id?: string | null
          confidence_level?: string | null
          contraindication_sensitivity?: string
          created_at?: string | null
          equipment_required?: Json | null
          estimated_training_hours?: number | null
          gap_id?: string | null
          id?: string
          missing_data_flags?: Json | null
          overall_implementation_risk_score?: number
          prerequisites?: string | null
          product_count_required?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_mapping_id?: string | null
          source_trace?: Json
          spa_menu_id?: string
          staff_skill_level_required?: string
          training_complexity?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "implementation_readiness_canonical_protocol_id_fkey"
            columns: ["canonical_protocol_id"]
            isOneToOne: false
            referencedRelation: "canonical_protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "implementation_readiness_canonical_protocol_id_fkey"
            columns: ["canonical_protocol_id"]
            isOneToOne: false
            referencedRelation: "protocol_complete_details"
            referencedColumns: ["protocol_id"]
          },
          {
            foreignKeyName: "implementation_readiness_gap_id_fkey"
            columns: ["gap_id"]
            isOneToOne: false
            referencedRelation: "service_gap_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "implementation_readiness_service_mapping_id_fkey"
            columns: ["service_mapping_id"]
            isOneToOne: false
            referencedRelation: "spa_service_mapping"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "implementation_readiness_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menu_summaries"
            referencedColumns: ["spa_menu_id"]
          },
          {
            foreignKeyName: "implementation_readiness_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_identifiers: {
        Row: {
          identifier_type: string
          identifier_value: string
          ingredient_id: string
        }
        Insert: {
          identifier_type: string
          identifier_value: string
          ingredient_id: string
        }
        Update: {
          identifier_type?: string
          identifier_value?: string
          ingredient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_identifiers_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          cas_number: string | null
          common_name: string | null
          cosing_id: string | null
          created_at: string
          description: string | null
          eu_status: string | null
          function: string[]
          id: string
          inci_name: string
          metadata: Json
          pubchem_cid: string | null
          restrictions: string | null
          safety_score: number | null
          trending_score: number | null
          updated_at: string
        }
        Insert: {
          cas_number?: string | null
          common_name?: string | null
          cosing_id?: string | null
          created_at?: string
          description?: string | null
          eu_status?: string | null
          function?: string[]
          id?: string
          inci_name: string
          metadata?: Json
          pubchem_cid?: string | null
          restrictions?: string | null
          safety_score?: number | null
          trending_score?: number | null
          updated_at?: string
        }
        Update: {
          cas_number?: string | null
          common_name?: string | null
          cosing_id?: string | null
          created_at?: string
          description?: string | null
          eu_status?: string | null
          function?: string[]
          id?: string
          inci_name?: string
          metadata?: Json
          pubchem_cid?: string | null
          restrictions?: string | null
          safety_score?: number | null
          trending_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      job_postings: {
        Row: {
          company: string
          created_at: string
          description: string
          featured: boolean
          location: string
          posted_at: string
          requirements: string[]
          salary_max: number | null
          salary_min: number | null
          salary_period: string
          slug: string
          title: string
          type: string
          updated_at: string
          vertical: string
        }
        Insert: {
          company: string
          created_at?: string
          description: string
          featured?: boolean
          location: string
          posted_at?: string
          requirements?: string[]
          salary_max?: number | null
          salary_min?: number | null
          salary_period?: string
          slug: string
          title: string
          type: string
          updated_at?: string
          vertical: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string
          featured?: boolean
          location?: string
          posted_at?: string
          requirements?: string[]
          salary_max?: number | null
          salary_min?: number | null
          salary_period?: string
          slug?: string
          title?: string
          type?: string
          updated_at?: string
          vertical?: string
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          activity_date: string | null
          activity_description: string | null
          activity_title: string
          activity_type: string
          created_at: string | null
          created_by: string
          follow_up_completed: boolean | null
          follow_up_date: string | null
          id: string
          related_plan_id: string | null
          spa_lead_id: string
        }
        Insert: {
          activity_date?: string | null
          activity_description?: string | null
          activity_title: string
          activity_type: string
          created_at?: string | null
          created_by: string
          follow_up_completed?: boolean | null
          follow_up_date?: string | null
          id?: string
          related_plan_id?: string | null
          spa_lead_id: string
        }
        Update: {
          activity_date?: string | null
          activity_description?: string | null
          activity_title?: string
          activity_type?: string
          created_at?: string | null
          created_by?: string
          follow_up_completed?: boolean | null
          follow_up_date?: string | null
          id?: string
          related_plan_id?: string | null
          spa_lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_related_plan_id_fkey"
            columns: ["related_plan_id"]
            isOneToOne: false
            referencedRelation: "plan_outputs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_spa_lead_id_fkey"
            columns: ["spa_lead_id"]
            isOneToOne: false
            referencedRelation: "spa_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      mapping_analytics: {
        Row: {
          accepted: boolean | null
          brand_id: string | null
          business_id: string | null
          created_at: string | null
          feedback: string | null
          id: string
          match_score: number | null
          match_type: string | null
          plan_id: string | null
          protocol_id: string | null
          rejected: boolean | null
          service_name: string
        }
        Insert: {
          accepted?: boolean | null
          brand_id?: string | null
          business_id?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          match_score?: number | null
          match_type?: string | null
          plan_id?: string | null
          protocol_id?: string | null
          rejected?: boolean | null
          service_name: string
        }
        Update: {
          accepted?: boolean | null
          brand_id?: string | null
          business_id?: string | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          match_score?: number | null
          match_type?: string | null
          plan_id?: string | null
          protocol_id?: string | null
          rejected?: boolean | null
          service_name?: string
        }
        Relationships: []
      }
      market_signals: {
        Row: {
          active: boolean
          category: string | null
          confidence: number | null
          confidence_score: number | null
          confidence_tier: string | null
          created_at: string
          data_source: string | null
          description: string
          direction: Database["public"]["Enums"]["signal_direction_enum"]
          display_order: number | null
          expires_at: string | null
          external_id: string | null
          fingerprint: string | null
          geo_country: string | null
          geo_region: string | null
          id: string
          image_url: string | null
          impact_score: number | null
          is_duplicate: boolean
          magnitude: number
          provenance_tier: number
          region: string | null
          related_brands: string[] | null
          related_products: string[] | null
          signal_key: string
          signal_type: Database["public"]["Enums"]["signal_type_enum"]
          source: string | null
          source_domain: string | null
          source_feed_id: string | null
          source_name: string | null
          source_type: string | null
          source_url: string | null
          status: string | null
          thumbnail_url: string | null
          tier_min: string | null
          tier_visibility: string | null
          title: string
          topic: string | null
          updated_at: string
          vertical: string | null
          why_it_matters: string | null
        }
        Insert: {
          active?: boolean
          category?: string | null
          confidence?: number | null
          confidence_score?: number | null
          confidence_tier?: string | null
          created_at?: string
          data_source?: string | null
          description: string
          direction: Database["public"]["Enums"]["signal_direction_enum"]
          display_order?: number | null
          expires_at?: string | null
          external_id?: string | null
          fingerprint?: string | null
          geo_country?: string | null
          geo_region?: string | null
          id?: string
          image_url?: string | null
          impact_score?: number | null
          is_duplicate?: boolean
          magnitude: number
          provenance_tier?: number
          region?: string | null
          related_brands?: string[] | null
          related_products?: string[] | null
          signal_key: string
          signal_type: Database["public"]["Enums"]["signal_type_enum"]
          source?: string | null
          source_domain?: string | null
          source_feed_id?: string | null
          source_name?: string | null
          source_type?: string | null
          source_url?: string | null
          status?: string | null
          thumbnail_url?: string | null
          tier_min?: string | null
          tier_visibility?: string | null
          title: string
          topic?: string | null
          updated_at?: string
          vertical?: string | null
          why_it_matters?: string | null
        }
        Update: {
          active?: boolean
          category?: string | null
          confidence?: number | null
          confidence_score?: number | null
          confidence_tier?: string | null
          created_at?: string
          data_source?: string | null
          description?: string
          direction?: Database["public"]["Enums"]["signal_direction_enum"]
          display_order?: number | null
          expires_at?: string | null
          external_id?: string | null
          fingerprint?: string | null
          geo_country?: string | null
          geo_region?: string | null
          id?: string
          image_url?: string | null
          impact_score?: number | null
          is_duplicate?: boolean
          magnitude?: number
          provenance_tier?: number
          region?: string | null
          related_brands?: string[] | null
          related_products?: string[] | null
          signal_key?: string
          signal_type?: Database["public"]["Enums"]["signal_type_enum"]
          source?: string | null
          source_domain?: string | null
          source_feed_id?: string | null
          source_name?: string | null
          source_type?: string | null
          source_url?: string | null
          status?: string | null
          thumbnail_url?: string | null
          tier_min?: string | null
          tier_visibility?: string | null
          title?: string
          topic?: string | null
          updated_at?: string
          vertical?: string | null
          why_it_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_signals_source_feed_id_fkey"
            columns: ["source_feed_id"]
            isOneToOne: false
            referencedRelation: "data_feeds"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_calendar: {
        Row: {
          brand_id: string | null
          created_at: string | null
          featured_products: string[] | null
          featured_protocols: string[] | null
          focus_moment: string | null
          id: string
          month: number
          month_name: string
          new_launches: string[] | null
          quarter: number | null
          theme: string
          webinar_date: string | null
          webinar_title: string | null
          year: number
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          featured_products?: string[] | null
          featured_protocols?: string[] | null
          focus_moment?: string | null
          id?: string
          month: number
          month_name: string
          new_launches?: string[] | null
          quarter?: number | null
          theme: string
          webinar_date?: string | null
          webinar_title?: string | null
          year?: number
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          featured_products?: string[] | null
          featured_protocols?: string[] | null
          focus_moment?: string | null
          id?: string
          month?: number
          month_name?: string
          new_launches?: string[] | null
          quarter?: number | null
          theme?: string
          webinar_date?: string | null
          webinar_title?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketing_calendar_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      medspa_product_kits: {
        Row: {
          created_at: string | null
          id: string
          kit_name: string
          product_names: string[] | null
          rationale: string
          total_value: number
          use_case: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          kit_name: string
          product_names?: string[] | null
          rationale: string
          total_value: number
          use_case: string
        }
        Update: {
          created_at?: string | null
          id?: string
          kit_name?: string
          product_names?: string[] | null
          rationale?: string
          total_value?: number
          use_case?: string
        }
        Relationships: []
      }
      medspa_products: {
        Row: {
          backbar_price: number | null
          category: string
          created_at: string | null
          id: string
          medspa_application: string
          priority: string | null
          product_name: string
          retail_price: number | null
          size: string | null
          value_proposition: string
          why_excels: string | null
        }
        Insert: {
          backbar_price?: number | null
          category: string
          created_at?: string | null
          id?: string
          medspa_application: string
          priority?: string | null
          product_name: string
          retail_price?: number | null
          size?: string | null
          value_proposition: string
          why_excels?: string | null
        }
        Update: {
          backbar_price?: number | null
          category?: string
          created_at?: string | null
          id?: string
          medspa_application?: string
          priority?: string | null
          product_name?: string
          retail_price?: number | null
          size?: string | null
          value_proposition?: string
          why_excels?: string | null
        }
        Relationships: []
      }
      medspa_treatments: {
        Row: {
          created_at: string | null
          id: string
          post_treatment_products: string[] | null
          pre_treatment_products: string[] | null
          retail_extension: string[] | null
          treatment_name: string
          treatment_type: string
          why_popular: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_treatment_products?: string[] | null
          pre_treatment_products?: string[] | null
          retail_extension?: string[] | null
          treatment_name: string
          treatment_type: string
          why_popular: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_treatment_products?: string[] | null
          pre_treatment_products?: string[] | null
          retail_extension?: string[] | null
          treatment_name?: string
          treatment_type?: string
          why_popular?: string
        }
        Relationships: []
      }
      menu_uploads: {
        Row: {
          created_at: string | null
          extraction_meta: Json | null
          file_path: string | null
          id: string
          parsed_services: Json | null
          plan_id: string
          raw_text: string
          source_type: string
        }
        Insert: {
          created_at?: string | null
          extraction_meta?: Json | null
          file_path?: string | null
          id?: string
          parsed_services?: Json | null
          plan_id: string
          raw_text: string
          source_type: string
        }
        Update: {
          created_at?: string | null
          extraction_meta?: Json | null
          file_path?: string | null
          id?: string
          parsed_services?: Json | null
          plan_id?: string
          raw_text?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_uploads_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      message_read_status: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          last_read_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          last_read_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          last_read_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_status_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json
          body: string
          body_html: string | null
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          read_at: string | null
          sender_id: string | null
          sender_role: string | null
          updated_at: string
        }
        Insert: {
          attachments?: Json
          body: string
          body_html?: string | null
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string | null
          sender_role?: string | null
          updated_at?: string
        }
        Update: {
          attachments?: Json
          body?: string
          body_html?: string | null
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string | null
          sender_role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      mixing_rules: {
        Row: {
          brand_id: string | null
          created_at: string | null
          id: string
          product_references: string[] | null
          rule_description: string
          rule_type: string
          severity: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          product_references?: string[] | null
          rule_description: string
          rule_type: string
          severity?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          product_references?: string[] | null
          rule_description?: string
          rule_type?: string
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mixing_rules_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_orders: {
        Row: {
          admin_notes: string | null
          admin_reviewed: boolean | null
          backbar_products: Json
          created_at: string | null
          estimated_backbar_investment: number | null
          estimated_retail_investment: number | null
          id: string
          launch_checklist: Json
          missing_data_flags: Json | null
          recommended_launch_window: string | null
          retail_products: Json
          reviewed_at: string | null
          reviewed_by: string | null
          rollout_plan_id: string
          seasonal_rationale: string | null
          setup_checklist: Json
          source_trace: Json
          spa_menu_id: string
          total_estimated_investment: number | null
          training_checklist: Json
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          admin_reviewed?: boolean | null
          backbar_products?: Json
          created_at?: string | null
          estimated_backbar_investment?: number | null
          estimated_retail_investment?: number | null
          id?: string
          launch_checklist?: Json
          missing_data_flags?: Json | null
          recommended_launch_window?: string | null
          retail_products?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          rollout_plan_id: string
          seasonal_rationale?: string | null
          setup_checklist?: Json
          source_trace?: Json
          spa_menu_id: string
          total_estimated_investment?: number | null
          training_checklist?: Json
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          admin_reviewed?: boolean | null
          backbar_products?: Json
          created_at?: string | null
          estimated_backbar_investment?: number | null
          estimated_retail_investment?: number | null
          id?: string
          launch_checklist?: Json
          missing_data_flags?: Json | null
          recommended_launch_window?: string | null
          retail_products?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          rollout_plan_id?: string
          seasonal_rationale?: string | null
          setup_checklist?: Json
          source_trace?: Json
          spa_menu_id?: string
          total_estimated_investment?: number | null
          training_checklist?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opening_orders_rollout_plan_id_fkey"
            columns: ["rollout_plan_id"]
            isOneToOne: false
            referencedRelation: "phased_rollout_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opening_orders_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menu_summaries"
            referencedColumns: ["spa_menu_id"]
          },
          {
            foreignKeyName: "opening_orders_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          line_total: number
          order_id: string
          product_id: string
          product_name: string
          product_type: string
          qty: number
          sku: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          line_total: number
          order_id: string
          product_id: string
          product_name: string
          product_type: string
          qty?: number
          sku?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string
          product_name?: string
          product_type?: string
          qty?: number
          sku?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_fee: number | null
          admin_notes: string | null
          billing_address: Json | null
          brand_id: string | null
          brand_notes: string | null
          business_id: string | null
          commission_percent: number | null
          commission_total: number | null
          created_at: string | null
          created_by: string | null
          delivered_at: string | null
          id: string
          notes: string | null
          order_number: string
          payment_status: string
          reseller_tier_at_order: string | null
          return_reason: string | null
          return_requested_at: string | null
          return_resolved_at: string | null
          return_resolved_by: string | null
          return_status: string
          shipped_at: string | null
          shipping_address: Json | null
          status: string
          stripe_payment_intent_id: string | null
          subtotal: number
          tracking_carrier: string | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          admin_fee?: number | null
          admin_notes?: string | null
          billing_address?: Json | null
          brand_id?: string | null
          brand_notes?: string | null
          business_id?: string | null
          commission_percent?: number | null
          commission_total?: number | null
          created_at?: string | null
          created_by?: string | null
          delivered_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_status?: string
          reseller_tier_at_order?: string | null
          return_reason?: string | null
          return_requested_at?: string | null
          return_resolved_at?: string | null
          return_resolved_by?: string | null
          return_status?: string
          shipped_at?: string | null
          shipping_address?: Json | null
          status?: string
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tracking_carrier?: string | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_fee?: number | null
          admin_notes?: string | null
          billing_address?: Json | null
          brand_id?: string | null
          brand_notes?: string | null
          business_id?: string | null
          commission_percent?: number | null
          commission_total?: number | null
          created_at?: string | null
          created_by?: string | null
          delivered_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_status?: string
          reseller_tier_at_order?: string | null
          return_reason?: string | null
          return_requested_at?: string | null
          return_resolved_at?: string | null
          return_resolved_by?: string | null
          return_status?: string
          shipped_at?: string | null
          shipping_address?: Json | null
          status?: string
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tracking_carrier?: string | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      phased_rollout_plans: {
        Row: {
          admin_approved: boolean | null
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          avg_risk_score: number | null
          created_at: string | null
          id: string
          missing_data_flags: Json | null
          phase_assignment_logic: Json
          plan_name: string
          source_trace: Json
          spa_menu_id: string
          spa_type: string | null
          status: string | null
          total_phases: number | null
          total_products_required: number | null
          total_services: number | null
          total_training_hours: number | null
          updated_at: string | null
        }
        Insert: {
          admin_approved?: boolean | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avg_risk_score?: number | null
          created_at?: string | null
          id?: string
          missing_data_flags?: Json | null
          phase_assignment_logic?: Json
          plan_name: string
          source_trace?: Json
          spa_menu_id: string
          spa_type?: string | null
          status?: string | null
          total_phases?: number | null
          total_products_required?: number | null
          total_services?: number | null
          total_training_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          admin_approved?: boolean | null
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          avg_risk_score?: number | null
          created_at?: string | null
          id?: string
          missing_data_flags?: Json | null
          phase_assignment_logic?: Json
          plan_name?: string
          source_trace?: Json
          spa_menu_id?: string
          spa_type?: string | null
          status?: string | null
          total_phases?: number | null
          total_products_required?: number | null
          total_services?: number | null
          total_training_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phased_rollout_plans_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menu_summaries"
            referencedColumns: ["spa_menu_id"]
          },
          {
            foreignKeyName: "phased_rollout_plans_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_outputs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          brand_differentiation_section: Json | null
          brand_id: string | null
          confidence_summary: Json | null
          created_at: string | null
          custom_branding: Json | null
          data_assumptions_section: Json | null
          executive_summary: Json | null
          generation_trace: Json | null
          growth_opportunities_section: Json | null
          id: string
          implementation_roadmap_section: Json | null
          include_internal_notes: boolean | null
          include_pricing: boolean | null
          menu_validation_section: Json | null
          opening_order_section: Json | null
          pdf_generated: boolean | null
          pdf_url: string | null
          plan_status: string | null
          plan_title: string
          plan_version: number | null
          rollout_plan_id: string | null
          sent_to_spa_at: string | null
          shareable_link_active: boolean | null
          shareable_link_token: string | null
          spa_lead_id: string
          spa_menu_id: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          brand_differentiation_section?: Json | null
          brand_id?: string | null
          confidence_summary?: Json | null
          created_at?: string | null
          custom_branding?: Json | null
          data_assumptions_section?: Json | null
          executive_summary?: Json | null
          generation_trace?: Json | null
          growth_opportunities_section?: Json | null
          id?: string
          implementation_roadmap_section?: Json | null
          include_internal_notes?: boolean | null
          include_pricing?: boolean | null
          menu_validation_section?: Json | null
          opening_order_section?: Json | null
          pdf_generated?: boolean | null
          pdf_url?: string | null
          plan_status?: string | null
          plan_title: string
          plan_version?: number | null
          rollout_plan_id?: string | null
          sent_to_spa_at?: string | null
          shareable_link_active?: boolean | null
          shareable_link_token?: string | null
          spa_lead_id: string
          spa_menu_id: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          brand_differentiation_section?: Json | null
          brand_id?: string | null
          confidence_summary?: Json | null
          created_at?: string | null
          custom_branding?: Json | null
          data_assumptions_section?: Json | null
          executive_summary?: Json | null
          generation_trace?: Json | null
          growth_opportunities_section?: Json | null
          id?: string
          implementation_roadmap_section?: Json | null
          include_internal_notes?: boolean | null
          include_pricing?: boolean | null
          menu_validation_section?: Json | null
          opening_order_section?: Json | null
          pdf_generated?: boolean | null
          pdf_url?: string | null
          plan_status?: string | null
          plan_title?: string
          plan_version?: number | null
          rollout_plan_id?: string | null
          sent_to_spa_at?: string | null
          shareable_link_active?: boolean | null
          shareable_link_token?: string | null
          spa_lead_id?: string
          spa_menu_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_outputs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_outputs_rollout_plan_id_fkey"
            columns: ["rollout_plan_id"]
            isOneToOne: false
            referencedRelation: "phased_rollout_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_outputs_spa_lead_id_fkey"
            columns: ["spa_lead_id"]
            isOneToOne: false
            referencedRelation: "spa_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_outputs_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menu_summaries"
            referencedColumns: ["spa_menu_id"]
          },
          {
            foreignKeyName: "plan_outputs_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_sections: {
        Row: {
          created_at: string | null
          id: string
          include_in_output: boolean | null
          plan_output_id: string
          section_content: Json
          section_key: string
          section_order: number | null
          section_template: string | null
          section_title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          include_in_output?: boolean | null
          plan_output_id: string
          section_content?: Json
          section_key: string
          section_order?: number | null
          section_template?: string | null
          section_title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          include_in_output?: boolean | null
          plan_output_id?: string
          section_content?: Json
          section_key?: string
          section_order?: number | null
          section_template?: string | null
          section_title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_sections_plan_output_id_fkey"
            columns: ["plan_output_id"]
            isOneToOne: false
            referencedRelation: "plan_outputs"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_submissions: {
        Row: {
          admin_notes: string | null
          analysis_completed: boolean | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          last_viewed_at: string | null
          last_viewed_by_admin: string | null
          menu_file_url: string | null
          menu_uploaded: boolean | null
          plan_generated: boolean | null
          plan_output_id: string | null
          spa_location: string | null
          spa_menu_id: string | null
          spa_name: string
          spa_type: Database["public"]["Enums"]["spa_type_enum"] | null
          submission_status:
            | Database["public"]["Enums"]["submission_status"]
            | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          analysis_completed?: boolean | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          last_viewed_at?: string | null
          last_viewed_by_admin?: string | null
          menu_file_url?: string | null
          menu_uploaded?: boolean | null
          plan_generated?: boolean | null
          plan_output_id?: string | null
          spa_location?: string | null
          spa_menu_id?: string | null
          spa_name: string
          spa_type?: Database["public"]["Enums"]["spa_type_enum"] | null
          submission_status?:
            | Database["public"]["Enums"]["submission_status"]
            | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          analysis_completed?: boolean | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          last_viewed_at?: string | null
          last_viewed_by_admin?: string | null
          menu_file_url?: string | null
          menu_uploaded?: boolean | null
          plan_generated?: boolean | null
          plan_output_id?: string | null
          spa_location?: string | null
          spa_menu_id?: string | null
          spa_name?: string
          spa_type?: Database["public"]["Enums"]["spa_type_enum"] | null
          submission_status?:
            | Database["public"]["Enums"]["submission_status"]
            | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_submissions_plan_output_id_fkey"
            columns: ["plan_output_id"]
            isOneToOne: false
            referencedRelation: "plan_outputs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_submissions_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menu_summaries"
            referencedColumns: ["spa_menu_id"]
          },
          {
            foreignKeyName: "plan_submissions_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          brand_id: string
          business_id: string | null
          business_user_id: string
          completed_at: string | null
          created_at: string | null
          fit_score: number | null
          id: string
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          business_id?: string | null
          business_user_id: string
          completed_at?: string | null
          created_at?: string | null
          fit_score?: number | null
          id?: string
          name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          business_id?: string | null
          business_user_id?: string
          completed_at?: string | null
          created_at?: string | null
          fit_score?: number | null
          id?: string
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plans_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_events: {
        Row: {
          created_at: string | null
          event_category: string
          event_type: string
          id: string
          ip_hash: string | null
          org_id: string | null
          page_path: string | null
          properties: Json | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_category: string
          event_type: string
          id?: string
          ip_hash?: string | null
          org_id?: string | null
          page_path?: string | null
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_category?: string
          event_type?: string
          id?: string
          ip_hash?: string | null
          org_id?: string | null
          page_path?: string | null
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      platform_health: {
        Row: {
          active_brands: number | null
          active_businesses: number | null
          avg_match_rate: number | null
          avg_order_value: number | null
          avg_session_duration: string | null
          bounce_rate: number | null
          created_at: string | null
          dau: number | null
          error_rate: number | null
          gmv: number | null
          id: string
          mau: number | null
          menus_uploaded: number | null
          new_users: number | null
          plans_created: number | null
          protocol_matches: number | null
          snapshot_date: string
          total_brands: number | null
          total_businesses: number | null
          total_orders: number | null
          total_products: number | null
          total_users: number | null
        }
        Insert: {
          active_brands?: number | null
          active_businesses?: number | null
          avg_match_rate?: number | null
          avg_order_value?: number | null
          avg_session_duration?: string | null
          bounce_rate?: number | null
          created_at?: string | null
          dau?: number | null
          error_rate?: number | null
          gmv?: number | null
          id?: string
          mau?: number | null
          menus_uploaded?: number | null
          new_users?: number | null
          plans_created?: number | null
          protocol_matches?: number | null
          snapshot_date: string
          total_brands?: number | null
          total_businesses?: number | null
          total_orders?: number | null
          total_products?: number | null
          total_users?: number | null
        }
        Update: {
          active_brands?: number | null
          active_businesses?: number | null
          avg_match_rate?: number | null
          avg_order_value?: number | null
          avg_session_duration?: string | null
          bounce_rate?: number | null
          created_at?: string | null
          dau?: number | null
          error_rate?: number | null
          gmv?: number | null
          id?: string
          mau?: number | null
          menus_uploaded?: number | null
          new_users?: number | null
          plans_created?: number | null
          protocol_matches?: number | null
          snapshot_date?: string
          total_brands?: number | null
          total_businesses?: number | null
          total_orders?: number | null
          total_products?: number | null
          total_users?: number | null
        }
        Relationships: []
      }
      pricing_uplift_rules: {
        Row: {
          base_to_custom_uplift_percent: number | null
          brand_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          seasonal_premium_percent: number | null
          spa_type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          base_to_custom_uplift_percent?: number | null
          brand_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          seasonal_premium_percent?: number | null
          spa_type: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          base_to_custom_uplift_percent?: number | null
          brand_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          seasonal_premium_percent?: number | null
          spa_type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_uplift_rules_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_products: {
        Row: {
          brand_id: string | null
          category: string | null
          contraindications: string[] | null
          created_at: string | null
          embedding: string | null
          embedding_updated_at: string | null
          id: string
          in_service_usage_allowed: string | null
          key_ingredients: string[] | null
          notes: string | null
          pro_price: number | null
          product_function: string
          product_name: string
          size: string | null
          status: string | null
        }
        Insert: {
          brand_id?: string | null
          category?: string | null
          contraindications?: string[] | null
          created_at?: string | null
          embedding?: string | null
          embedding_updated_at?: string | null
          id?: string
          in_service_usage_allowed?: string | null
          key_ingredients?: string[] | null
          notes?: string | null
          pro_price?: number | null
          product_function: string
          product_name: string
          size?: string | null
          status?: string | null
        }
        Update: {
          brand_id?: string | null
          category?: string | null
          contraindications?: string[] | null
          created_at?: string | null
          embedding?: string | null
          embedding_updated_at?: string | null
          id?: string
          in_service_usage_allowed?: string | null
          key_ingredients?: string[] | null
          notes?: string | null
          pro_price?: number | null
          product_function?: string
          product_name?: string
          size?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pro_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_metrics: {
        Row: {
          add_to_cart: number | null
          brand_id: string | null
          id: string
          metric_date: string
          orders: number | null
          page_views: number | null
          product_id: string
          product_type: string
          protocol_matches: number | null
          return_rate: number | null
          revenue: number | null
          unique_views: number | null
          units_sold: number | null
          updated_at: string | null
          wishlist_adds: number | null
        }
        Insert: {
          add_to_cart?: number | null
          brand_id?: string | null
          id?: string
          metric_date: string
          orders?: number | null
          page_views?: number | null
          product_id: string
          product_type: string
          protocol_matches?: number | null
          return_rate?: number | null
          revenue?: number | null
          unique_views?: number | null
          units_sold?: number | null
          updated_at?: string | null
          wishlist_adds?: number | null
        }
        Update: {
          add_to_cart?: number | null
          brand_id?: string | null
          id?: string
          metric_date?: string
          orders?: number | null
          page_views?: number | null
          product_id?: string
          product_type?: string
          protocol_matches?: number | null
          return_rate?: number | null
          revenue?: number | null
          unique_views?: number | null
          units_sold?: number | null
          updated_at?: string | null
          wishlist_adds?: number | null
        }
        Relationships: []
      }
      product_pricing: {
        Row: {
          brand_id: string
          created_at: string
          currency: string
          id: string
          is_active: boolean
          min_qty: number
          price: number
          product_id: string
          product_type: string
          tier: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          min_qty?: number
          price: number
          product_id: string
          product_type: string
          tier: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          min_qty?: number
          price?: number
          product_id?: string
          product_type?: string
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_pricing_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          attributes: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          price_cents: number
          product_id: string
          sku: string | null
          stock_quantity: number | null
        }
        Insert: {
          attributes?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price_cents: number
          product_id: string
          sku?: string | null
          stock_quantity?: number | null
        }
        Update: {
          attributes?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_cents?: number
          product_id?: string
          sku?: string | null
          stock_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string | null
          category_id: string | null
          compare_at_price_cents: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          images: Json | null
          is_active: boolean | null
          is_featured: boolean | null
          metadata: Json | null
          name: string
          price_cents: number
          short_description: string | null
          sku: string | null
          slug: string
          stock_quantity: number | null
          track_inventory: boolean | null
          updated_at: string | null
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          compare_at_price_cents?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          name: string
          price_cents: number
          short_description?: string | null
          sku?: string | null
          slug: string
          stock_quantity?: number | null
          track_inventory?: boolean | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          compare_at_price_cents?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          name?: string
          price_cents?: number
          short_description?: string | null
          sku?: string | null
          slug?: string
          stock_quantity?: number | null
          track_inventory?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      protocol_costing: {
        Row: {
          brand_id: string | null
          canonical_protocol_id: string
          cogs_confidence: string | null
          cost_notes: string | null
          created_at: string | null
          estimated_cogs: number | null
          id: string
          last_updated: string | null
          source_reference: string | null
        }
        Insert: {
          brand_id?: string | null
          canonical_protocol_id: string
          cogs_confidence?: string | null
          cost_notes?: string | null
          created_at?: string | null
          estimated_cogs?: number | null
          id?: string
          last_updated?: string | null
          source_reference?: string | null
        }
        Update: {
          brand_id?: string | null
          canonical_protocol_id?: string
          cogs_confidence?: string | null
          cost_notes?: string | null
          created_at?: string | null
          estimated_cogs?: number | null
          id?: string
          last_updated?: string | null
          source_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "protocol_costing_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocol_costing_canonical_protocol_id_fkey"
            columns: ["canonical_protocol_id"]
            isOneToOne: true
            referencedRelation: "canonical_protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocol_costing_canonical_protocol_id_fkey"
            columns: ["canonical_protocol_id"]
            isOneToOne: true
            referencedRelation: "protocol_complete_details"
            referencedColumns: ["protocol_id"]
          },
        ]
      }
      retail_attach_recommendations: {
        Row: {
          admin_approved: boolean | null
          admin_notes: string | null
          admin_override: boolean | null
          admin_reviewed: boolean | null
          canonical_protocol_id: string | null
          confidence_score: number
          created_at: string | null
          gap_id: string | null
          id: string
          is_seasonally_relevant: boolean | null
          matching_criteria: Json | null
          missing_data_flags: Json | null
          rank: number
          rationale: string
          retail_product_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          seasonal_rationale: string | null
          service_mapping_id: string | null
          source_trace: Json
          spa_menu_id: string | null
          updated_at: string | null
        }
        Insert: {
          admin_approved?: boolean | null
          admin_notes?: string | null
          admin_override?: boolean | null
          admin_reviewed?: boolean | null
          canonical_protocol_id?: string | null
          confidence_score: number
          created_at?: string | null
          gap_id?: string | null
          id?: string
          is_seasonally_relevant?: boolean | null
          matching_criteria?: Json | null
          missing_data_flags?: Json | null
          rank: number
          rationale: string
          retail_product_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          seasonal_rationale?: string | null
          service_mapping_id?: string | null
          source_trace?: Json
          spa_menu_id?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_approved?: boolean | null
          admin_notes?: string | null
          admin_override?: boolean | null
          admin_reviewed?: boolean | null
          canonical_protocol_id?: string | null
          confidence_score?: number
          created_at?: string | null
          gap_id?: string | null
          id?: string
          is_seasonally_relevant?: boolean | null
          matching_criteria?: Json | null
          missing_data_flags?: Json | null
          rank?: number
          rationale?: string
          retail_product_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          seasonal_rationale?: string | null
          service_mapping_id?: string | null
          source_trace?: Json
          spa_menu_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retail_attach_recommendations_canonical_protocol_id_fkey"
            columns: ["canonical_protocol_id"]
            isOneToOne: false
            referencedRelation: "canonical_protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retail_attach_recommendations_canonical_protocol_id_fkey"
            columns: ["canonical_protocol_id"]
            isOneToOne: false
            referencedRelation: "protocol_complete_details"
            referencedColumns: ["protocol_id"]
          },
          {
            foreignKeyName: "retail_attach_recommendations_gap_id_fkey"
            columns: ["gap_id"]
            isOneToOne: false
            referencedRelation: "service_gap_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retail_attach_recommendations_retail_product_id_fkey"
            columns: ["retail_product_id"]
            isOneToOne: false
            referencedRelation: "retail_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retail_attach_recommendations_service_mapping_id_fkey"
            columns: ["service_mapping_id"]
            isOneToOne: false
            referencedRelation: "spa_service_mapping"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retail_attach_recommendations_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menu_summaries"
            referencedColumns: ["spa_menu_id"]
          },
          {
            foreignKeyName: "retail_attach_recommendations_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      retail_products: {
        Row: {
          brand_id: string | null
          category: string | null
          created_at: string | null
          embedding: string | null
          embedding_updated_at: string | null
          id: string
          key_ingredients: string[] | null
          msrp: number | null
          product_function: string
          product_name: string
          regimen_placement: string | null
          size: string | null
          status: string | null
          target_concerns: string[] | null
          wholesale: number | null
        }
        Insert: {
          brand_id?: string | null
          category?: string | null
          created_at?: string | null
          embedding?: string | null
          embedding_updated_at?: string | null
          id?: string
          key_ingredients?: string[] | null
          msrp?: number | null
          product_function: string
          product_name: string
          regimen_placement?: string | null
          size?: string | null
          status?: string | null
          target_concerns?: string[] | null
          wholesale?: number | null
        }
        Update: {
          brand_id?: string | null
          category?: string | null
          created_at?: string | null
          embedding?: string | null
          embedding_updated_at?: string | null
          id?: string
          key_ingredients?: string[] | null
          msrp?: number | null
          product_function?: string
          product_name?: string
          regimen_placement?: string | null
          size?: string | null
          status?: string | null
          target_concerns?: string[] | null
          wholesale?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "retail_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_attribution: {
        Row: {
          attribution_channel: string | null
          attribution_source: string
          brand_id: string | null
          business_id: string | null
          commission_amount: number | null
          created_at: string | null
          days_to_conversion: number | null
          first_touch_event_id: string | null
          id: string
          last_touch_event_id: string | null
          order_id: string
          order_value: number | null
        }
        Insert: {
          attribution_channel?: string | null
          attribution_source: string
          brand_id?: string | null
          business_id?: string | null
          commission_amount?: number | null
          created_at?: string | null
          days_to_conversion?: number | null
          first_touch_event_id?: string | null
          id?: string
          last_touch_event_id?: string | null
          order_id: string
          order_value?: number | null
        }
        Update: {
          attribution_channel?: string | null
          attribution_source?: string
          brand_id?: string | null
          business_id?: string | null
          commission_amount?: number | null
          created_at?: string | null
          days_to_conversion?: number | null
          first_touch_event_id?: string | null
          id?: string
          last_touch_event_id?: string | null
          order_id?: string
          order_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_attribution_first_touch_event_id_fkey"
            columns: ["first_touch_event_id"]
            isOneToOne: false
            referencedRelation: "platform_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_attribution_last_touch_event_id_fkey"
            columns: ["last_touch_event_id"]
            isOneToOne: false
            referencedRelation: "platform_events"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_model_defaults: {
        Row: {
          assumptions: string | null
          created_at: string | null
          created_by: string | null
          default_attach_rate: number | null
          default_retail_conversion_rate: number | null
          default_utilization_per_month: number | null
          id: string
          is_active: boolean | null
          notes: string | null
          spa_type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          assumptions?: string | null
          created_at?: string | null
          created_by?: string | null
          default_attach_rate?: number | null
          default_retail_conversion_rate?: number | null
          default_utilization_per_month?: number | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          spa_type: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          assumptions?: string | null
          created_at?: string | null
          created_by?: string | null
          default_attach_rate?: number | null
          default_retail_conversion_rate?: number | null
          default_utilization_per_month?: number | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          spa_type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string
          rating: number
          title: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id: string
          rating: number
          title?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string
          rating?: number
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      rollout_plan_items: {
        Row: {
          created_at: string | null
          dependencies: string | null
          estimated_revenue: number | null
          gap_id: string | null
          id: string
          implementation_readiness_id: string | null
          item_type: string
          phase_name: string
          phase_number: number
          phase_rationale: string
          protocol_name: string | null
          risk_score: number | null
          rollout_plan_id: string
          service_mapping_id: string | null
          service_name: string
          sort_order: number | null
          training_hours: number | null
        }
        Insert: {
          created_at?: string | null
          dependencies?: string | null
          estimated_revenue?: number | null
          gap_id?: string | null
          id?: string
          implementation_readiness_id?: string | null
          item_type: string
          phase_name: string
          phase_number: number
          phase_rationale: string
          protocol_name?: string | null
          risk_score?: number | null
          rollout_plan_id: string
          service_mapping_id?: string | null
          service_name: string
          sort_order?: number | null
          training_hours?: number | null
        }
        Update: {
          created_at?: string | null
          dependencies?: string | null
          estimated_revenue?: number | null
          gap_id?: string | null
          id?: string
          implementation_readiness_id?: string | null
          item_type?: string
          phase_name?: string
          phase_number?: number
          phase_rationale?: string
          protocol_name?: string | null
          risk_score?: number | null
          rollout_plan_id?: string
          service_mapping_id?: string | null
          service_name?: string
          sort_order?: number | null
          training_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rollout_plan_items_gap_id_fkey"
            columns: ["gap_id"]
            isOneToOne: false
            referencedRelation: "service_gap_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rollout_plan_items_implementation_readiness_id_fkey"
            columns: ["implementation_readiness_id"]
            isOneToOne: false
            referencedRelation: "implementation_readiness"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rollout_plan_items_rollout_plan_id_fkey"
            columns: ["rollout_plan_id"]
            isOneToOne: false
            referencedRelation: "phased_rollout_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rollout_plan_items_service_mapping_id_fkey"
            columns: ["service_mapping_id"]
            isOneToOne: false
            referencedRelation: "spa_service_mapping"
            referencedColumns: ["id"]
          },
        ]
      }
      rss_items: {
        Row: {
          attribution_text: string
          author: string | null
          brand_mentions: string[]
          confidence_score: number
          content: string | null
          created_at: string
          description: string | null
          guid: string
          id: string
          image_url: string | null
          ingredient_mentions: string[]
          is_new: boolean
          link: string | null
          published_at: string | null
          relevance_score: number | null
          search_vector: unknown
          sentiment_score: number | null
          source_id: string
          title: string
          treatment_mentions: string[]
          vertical_tags: string[]
        }
        Insert: {
          attribution_text?: string
          author?: string | null
          brand_mentions?: string[]
          confidence_score?: number
          content?: string | null
          created_at?: string
          description?: string | null
          guid: string
          id?: string
          image_url?: string | null
          ingredient_mentions?: string[]
          is_new?: boolean
          link?: string | null
          published_at?: string | null
          relevance_score?: number | null
          search_vector?: unknown
          sentiment_score?: number | null
          source_id: string
          title: string
          treatment_mentions?: string[]
          vertical_tags?: string[]
        }
        Update: {
          attribution_text?: string
          author?: string | null
          brand_mentions?: string[]
          confidence_score?: number
          content?: string | null
          created_at?: string
          description?: string | null
          guid?: string
          id?: string
          image_url?: string | null
          ingredient_mentions?: string[]
          is_new?: boolean
          link?: string | null
          published_at?: string | null
          relevance_score?: number | null
          search_vector?: unknown
          sentiment_score?: number | null
          source_id?: string
          title?: string
          treatment_mentions?: string[]
          vertical_tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "rss_items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "rss_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      rss_sources: {
        Row: {
          category: string
          created_at: string
          error_count: number
          feed_url: string
          id: string
          last_fetched_at: string | null
          last_item_count: number
          name: string
          refresh_minutes: number
          status: string
          verticals: string[]
        }
        Insert: {
          category: string
          created_at?: string
          error_count?: number
          feed_url: string
          id?: string
          last_fetched_at?: string | null
          last_item_count?: number
          name: string
          refresh_minutes?: number
          status?: string
          verticals?: string[]
        }
        Update: {
          category?: string
          created_at?: string
          error_count?: number
          feed_url?: string
          id?: string
          last_fetched_at?: string | null
          last_item_count?: number
          name?: string
          refresh_minutes?: number
          status?: string
          verticals?: string[]
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          clicked_result: string | null
          converted: boolean | null
          created_at: string | null
          filters_applied: Json | null
          id: string
          query: string
          query_type: string | null
          result_count: number | null
          result_position: number | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          clicked_result?: string | null
          converted?: boolean | null
          created_at?: string | null
          filters_applied?: Json | null
          id?: string
          query: string
          query_type?: string | null
          result_count?: number | null
          result_position?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_result?: string | null
          converted?: boolean | null
          created_at?: string | null
          filters_applied?: Json | null
          id?: string
          query?: string
          query_type?: string | null
          result_count?: number | null
          result_position?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_category_benchmarks: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          min_service_count: number
          notes: string | null
          priority_level: string | null
          rationale: string | null
          spa_type: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          min_service_count?: number
          notes?: string | null
          priority_level?: string | null
          rationale?: string | null
          spa_type: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          min_service_count?: number
          notes?: string | null
          priority_level?: string | null
          rationale?: string | null
          spa_type?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      service_gap_analysis: {
        Row: {
          admin_action: string | null
          admin_notes: string | null
          admin_reviewed: boolean | null
          created_at: string | null
          estimated_monthly_profit: number | null
          estimated_monthly_revenue: number | null
          estimated_revenue_impact: string | null
          gap_category: string
          gap_description: string
          gap_type: Database["public"]["Enums"]["gap_type_enum"]
          id: string
          impact_confidence: string | null
          impact_missing_data: Json | null
          implementation_complexity: string | null
          is_seasonal: boolean | null
          marketing_theme: string | null
          priority_level: Database["public"]["Enums"]["priority_level_enum"]
          rationale: string
          recommended_protocol_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          seasonal_window: string | null
          source_trace: Json | null
          spa_menu_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_action?: string | null
          admin_notes?: string | null
          admin_reviewed?: boolean | null
          created_at?: string | null
          estimated_monthly_profit?: number | null
          estimated_monthly_revenue?: number | null
          estimated_revenue_impact?: string | null
          gap_category: string
          gap_description: string
          gap_type: Database["public"]["Enums"]["gap_type_enum"]
          id?: string
          impact_confidence?: string | null
          impact_missing_data?: Json | null
          implementation_complexity?: string | null
          is_seasonal?: boolean | null
          marketing_theme?: string | null
          priority_level?: Database["public"]["Enums"]["priority_level_enum"]
          rationale: string
          recommended_protocol_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seasonal_window?: string | null
          source_trace?: Json | null
          spa_menu_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_action?: string | null
          admin_notes?: string | null
          admin_reviewed?: boolean | null
          created_at?: string | null
          estimated_monthly_profit?: number | null
          estimated_monthly_revenue?: number | null
          estimated_revenue_impact?: string | null
          gap_category?: string
          gap_description?: string
          gap_type?: Database["public"]["Enums"]["gap_type_enum"]
          id?: string
          impact_confidence?: string | null
          impact_missing_data?: Json | null
          implementation_complexity?: string | null
          is_seasonal?: boolean | null
          marketing_theme?: string | null
          priority_level?: Database["public"]["Enums"]["priority_level_enum"]
          rationale?: string
          recommended_protocol_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seasonal_window?: string | null
          source_trace?: Json | null
          spa_menu_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_gap_analysis_recommended_protocol_id_fkey"
            columns: ["recommended_protocol_id"]
            isOneToOne: false
            referencedRelation: "canonical_protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_gap_analysis_recommended_protocol_id_fkey"
            columns: ["recommended_protocol_id"]
            isOneToOne: false
            referencedRelation: "protocol_complete_details"
            referencedColumns: ["protocol_id"]
          },
          {
            foreignKeyName: "service_gap_analysis_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menu_summaries"
            referencedColumns: ["spa_menu_id"]
          },
          {
            foreignKeyName: "service_gap_analysis_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      service_mappings: {
        Row: {
          cogs_amount: number | null
          cogs_status: string | null
          confidence: string
          created_at: string | null
          custom_build_details: Json | null
          id: string
          match_type: string
          missing_data_flags: Json | null
          pricing_guidance: string | null
          rationale: string
          retail_attach: string[] | null
          service_id: string | null
          solution_reference: string
          solution_type: string
        }
        Insert: {
          cogs_amount?: number | null
          cogs_status?: string | null
          confidence: string
          created_at?: string | null
          custom_build_details?: Json | null
          id?: string
          match_type: string
          missing_data_flags?: Json | null
          pricing_guidance?: string | null
          rationale: string
          retail_attach?: string[] | null
          service_id?: string | null
          solution_reference: string
          solution_type: string
        }
        Update: {
          cogs_amount?: number | null
          cogs_status?: string | null
          confidence?: string
          created_at?: string | null
          custom_build_details?: Json | null
          id?: string
          match_type?: string
          missing_data_flags?: Json | null
          pricing_guidance?: string | null
          rationale?: string
          retail_attach?: string[] | null
          service_id?: string | null
          solution_reference?: string
          solution_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_mappings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "spa_services"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_methods: {
        Row: {
          base_rate_cents: number
          carrier: string | null
          description: string | null
          estimated_days_max: number | null
          estimated_days_min: number | null
          free_above_cents: number | null
          id: string
          is_active: boolean | null
          name: string
          per_item_rate_cents: number | null
          sort_order: number | null
        }
        Insert: {
          base_rate_cents: number
          carrier?: string | null
          description?: string | null
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          free_above_cents?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          per_item_rate_cents?: number | null
          sort_order?: number | null
        }
        Update: {
          base_rate_cents?: number
          carrier?: string | null
          description?: string | null
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          free_above_cents?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          per_item_rate_cents?: number | null
          sort_order?: number | null
        }
        Relationships: []
      }
      spa_leads: {
        Row: {
          analysis_completed: boolean | null
          assigned_to: string | null
          brand_id: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          current_plan_id: string | null
          estimated_value: number | null
          expected_close_date: string | null
          id: string
          internal_notes: string | null
          last_activity_at: string | null
          lead_source: string | null
          lead_status: string | null
          location: string | null
          menu_upload_completed: boolean | null
          plan_generated: boolean | null
          probability_percent: number | null
          spa_menu_id: string | null
          spa_name: string
          spa_type: string | null
          updated_at: string | null
        }
        Insert: {
          analysis_completed?: boolean | null
          assigned_to?: string | null
          brand_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          current_plan_id?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          internal_notes?: string | null
          last_activity_at?: string | null
          lead_source?: string | null
          lead_status?: string | null
          location?: string | null
          menu_upload_completed?: boolean | null
          plan_generated?: boolean | null
          probability_percent?: number | null
          spa_menu_id?: string | null
          spa_name: string
          spa_type?: string | null
          updated_at?: string | null
        }
        Update: {
          analysis_completed?: boolean | null
          assigned_to?: string | null
          brand_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          current_plan_id?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          internal_notes?: string | null
          last_activity_at?: string | null
          lead_source?: string | null
          lead_status?: string | null
          location?: string | null
          menu_upload_completed?: boolean | null
          plan_generated?: boolean | null
          probability_percent?: number | null
          spa_menu_id?: string | null
          spa_name?: string
          spa_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spa_leads_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spa_leads_current_plan_id_fkey"
            columns: ["current_plan_id"]
            isOneToOne: false
            referencedRelation: "plan_outputs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spa_leads_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menu_summaries"
            referencedColumns: ["spa_menu_id"]
          },
          {
            foreignKeyName: "spa_leads_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      spa_menus: {
        Row: {
          analysis_status: string | null
          created_at: string | null
          id: string
          last_analyzed_at: string | null
          parse_status: string | null
          raw_menu_data: string
          spa_location: string | null
          spa_name: string
          spa_type: Database["public"]["Enums"]["spa_type_enum"]
          upload_date: string | null
        }
        Insert: {
          analysis_status?: string | null
          created_at?: string | null
          id?: string
          last_analyzed_at?: string | null
          parse_status?: string | null
          raw_menu_data: string
          spa_location?: string | null
          spa_name: string
          spa_type?: Database["public"]["Enums"]["spa_type_enum"]
          upload_date?: string | null
        }
        Update: {
          analysis_status?: string | null
          created_at?: string | null
          id?: string
          last_analyzed_at?: string | null
          parse_status?: string | null
          raw_menu_data?: string
          spa_location?: string | null
          spa_name?: string
          spa_type?: Database["public"]["Enums"]["spa_type_enum"]
          upload_date?: string | null
        }
        Relationships: []
      }
      spa_service_mapping: {
        Row: {
          admin_notes: string | null
          admin_override: boolean | null
          admin_reviewed: boolean | null
          canonical_protocol_id: string | null
          category_match_score: number | null
          concern_match_score: number | null
          confidence_score: number
          created_at: string | null
          duration_match_score: number | null
          id: string
          is_seasonally_relevant: boolean | null
          mapping_notes: string
          match_type: Database["public"]["Enums"]["match_type_enum"]
          missing_data_flags: string[] | null
          name_similarity_score: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          seasonal_rationale: string | null
          service_category: string | null
          service_description: string | null
          service_duration: string | null
          service_name: string
          service_price: number | null
          spa_menu_id: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          admin_override?: boolean | null
          admin_reviewed?: boolean | null
          canonical_protocol_id?: string | null
          category_match_score?: number | null
          concern_match_score?: number | null
          confidence_score?: number
          created_at?: string | null
          duration_match_score?: number | null
          id?: string
          is_seasonally_relevant?: boolean | null
          mapping_notes: string
          match_type?: Database["public"]["Enums"]["match_type_enum"]
          missing_data_flags?: string[] | null
          name_similarity_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seasonal_rationale?: string | null
          service_category?: string | null
          service_description?: string | null
          service_duration?: string | null
          service_name: string
          service_price?: number | null
          spa_menu_id: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          admin_override?: boolean | null
          admin_reviewed?: boolean | null
          canonical_protocol_id?: string | null
          category_match_score?: number | null
          concern_match_score?: number | null
          confidence_score?: number
          created_at?: string | null
          duration_match_score?: number | null
          id?: string
          is_seasonally_relevant?: boolean | null
          mapping_notes?: string
          match_type?: Database["public"]["Enums"]["match_type_enum"]
          missing_data_flags?: string[] | null
          name_similarity_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seasonal_rationale?: string | null
          service_category?: string | null
          service_description?: string | null
          service_duration?: string | null
          service_name?: string
          service_price?: number | null
          spa_menu_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spa_service_mapping_canonical_protocol_id_fkey"
            columns: ["canonical_protocol_id"]
            isOneToOne: false
            referencedRelation: "canonical_protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spa_service_mapping_canonical_protocol_id_fkey"
            columns: ["canonical_protocol_id"]
            isOneToOne: false
            referencedRelation: "protocol_complete_details"
            referencedColumns: ["protocol_id"]
          },
          {
            foreignKeyName: "spa_service_mapping_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menu_summaries"
            referencedColumns: ["spa_menu_id"]
          },
          {
            foreignKeyName: "spa_service_mapping_spa_menu_id_fkey"
            columns: ["spa_menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      spa_services: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          keywords: string[] | null
          menu_id: string | null
          price: number | null
          service_name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          keywords?: string[] | null
          menu_id?: string | null
          price?: number | null
          service_name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          keywords?: string[] | null
          menu_id?: string | null
          price?: number | null
          service_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "spa_services_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menu_summaries"
            referencedColumns: ["spa_menu_id"]
          },
          {
            foreignKeyName: "spa_services_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "spa_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          interval: string
          is_active: boolean | null
          name: string
          price_cents: number
          stripe_price_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id: string
          interval?: string
          is_active?: boolean | null
          name: string
          price_cents: number
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string
          is_active?: boolean | null
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_balances: {
        Row: {
          created_at: string
          credit_balance_usd: number
          id: string
          last_request_at: string | null
          lifetime_requests: number
          lifetime_spent_usd: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credit_balance_usd?: number
          id?: string
          last_request_at?: string | null
          lifetime_requests?: number
          lifetime_spent_usd?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credit_balance_usd?: number
          id?: string
          last_request_at?: string | null
          lifetime_requests?: number
          lifetime_spent_usd?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      treatment_costs: {
        Row: {
          cost_per_unit: number | null
          created_at: string | null
          id: string
          item_reference: string
          item_type: string
          notes: string | null
          typical_usage_amount: number | null
          unit_type: string | null
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          item_reference: string
          item_type: string
          notes?: string | null
          typical_usage_amount?: number | null
          unit_type?: string | null
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          item_reference?: string
          item_type?: string
          notes?: string | null
          typical_usage_amount?: number | null
          unit_type?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          brand_id: string | null
          brand_tier: string | null
          business_id: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          email: string | null
          gap_analysis_count_month: number
          gap_analysis_reset_at: string | null
          id: string
          reseller_tier: string | null
          role: Database["public"]["Enums"]["user_role"]
          spa_name: string | null
          updated_at: string | null
        }
        Insert: {
          brand_id?: string | null
          brand_tier?: string | null
          business_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          email?: string | null
          gap_analysis_count_month?: number
          gap_analysis_reset_at?: string | null
          id: string
          reseller_tier?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          spa_name?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string | null
          brand_tier?: string | null
          business_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          email?: string | null
          gap_analysis_count_month?: number
          gap_analysis_reset_at?: string | null
          id?: string
          reseller_tier?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          spa_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          added_at: string | null
          id: string
          product_id: string | null
          variant_id: string | null
          wishlist_id: string
        }
        Insert: {
          added_at?: string | null
          id?: string
          product_id?: string | null
          variant_id?: string | null
          wishlist_id: string
        }
        Update: {
          added_at?: string | null
          id?: string
          product_id?: string | null
          variant_id?: string | null
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          is_public: boolean | null
          name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          name?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      mv_top_brands_weekly: {
        Row: {
          avg_match_rate: number | null
          brand_id: string | null
          total_matches: number | null
          total_orders: number | null
          total_revenue: number | null
          total_views: number | null
        }
        Relationships: []
      }
      protocol_complete_details: {
        Row: {
          category: string | null
          cogs_confidence: string | null
          estimated_cogs: number | null
          protocol_id: string | null
          protocol_name: string | null
          steps: Json | null
          target_concerns: string[] | null
          typical_duration: string | null
        }
        Relationships: []
      }
      spa_menu_summaries: {
        Row: {
          analysis_status: string | null
          body_count: number | null
          created_at: string | null
          enhancements_count: number | null
          facials_count: number | null
          last_analyzed_at: string | null
          massage_count: number | null
          spa_location: string | null
          spa_menu_id: string | null
          spa_name: string | null
          spa_type: Database["public"]["Enums"]["spa_type_enum"] | null
          total_gaps: number | null
          total_items: number | null
          total_services: number | null
          upload_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      claim_brand: { Args: { p_brand_id: string }; Returns: Json }
      claim_business: { Args: { p_business_id: string }; Returns: Json }
      deduct_credits: {
        Args: {
          p_amount_usd: number
          p_feature?: string
          p_model: string
          p_provider: string
          p_request_id?: string
          p_tier: number
          p_tokens_in?: number
          p_tokens_out?: number
          p_user_id: string
        }
        Returns: number
      }
      get_my_role: { Args: never; Returns: string }
      get_or_create_order_conversation: {
        Args: { p_order_id: string }
        Returns: Json
      }
      increment_gap_analysis_count: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      request_return: {
        Args: { p_order_id: string; p_reason: string }
        Returns: Json
      }
      resolve_product_price: {
        Args: { p_product_id: string; p_product_type: string; p_tier?: string }
        Returns: {
          currency: string
          min_qty: number
          price: number
          resolved_tier: string
        }[]
      }
      resolve_return: {
        Args: { p_approve: boolean; p_order_id: string }
        Returns: Json
      }
      slugify: { Args: { input_text: string }; Returns: string }
      top_up_credits: {
        Args: { p_amount_usd: number; p_request_id?: string; p_user_id: string }
        Returns: number
      }
    }
    Enums: {
      brand_status: "active" | "inactive" | "pending"
      business_type:
        | "spa"
        | "salon"
        | "barbershop"
        | "medspa"
        | "wellness_center"
        | "other"
      gap_type_enum:
        | "category_gap"
        | "seasonal_gap"
        | "treatment_type_gap"
        | "signature_missing"
        | "enhancement_missing"
      match_type_enum: "Exact" | "Partial" | "Candidate" | "No Match"
      priority_level_enum: "High" | "Medium" | "Low"
      protocol_completion_status:
        | "incomplete"
        | "steps_complete"
        | "fully_complete"
      signal_direction_enum: "up" | "down" | "stable"
      signal_type_enum:
        | "product_velocity"
        | "treatment_trend"
        | "ingredient_momentum"
        | "brand_adoption"
        | "regional"
        | "pricing_benchmark"
        | "regulatory_alert"
        | "education"
        | "industry_news"
        | "brand_update"
        | "press_release"
        | "social_trend"
        | "job_market"
        | "event_signal"
        | "research_insight"
        | "ingredient_trend"
        | "market_data"
        | "regional_market"
        | "supply_chain"
      spa_type_enum: "medspa" | "spa" | "hybrid"
      submission_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "completed"
      user_role:
        | "spa_user"
        | "admin"
        | "business_user"
        | "brand_admin"
        | "platform_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      brand_status: ["active", "inactive", "pending"],
      business_type: [
        "spa",
        "salon",
        "barbershop",
        "medspa",
        "wellness_center",
        "other",
      ],
      gap_type_enum: [
        "category_gap",
        "seasonal_gap",
        "treatment_type_gap",
        "signature_missing",
        "enhancement_missing",
      ],
      match_type_enum: ["Exact", "Partial", "Candidate", "No Match"],
      priority_level_enum: ["High", "Medium", "Low"],
      protocol_completion_status: [
        "incomplete",
        "steps_complete",
        "fully_complete",
      ],
      signal_direction_enum: ["up", "down", "stable"],
      signal_type_enum: [
        "product_velocity",
        "treatment_trend",
        "ingredient_momentum",
        "brand_adoption",
        "regional",
        "pricing_benchmark",
        "regulatory_alert",
        "education",
        "industry_news",
        "brand_update",
        "press_release",
        "social_trend",
        "job_market",
        "event_signal",
        "research_insight",
        "ingredient_trend",
        "market_data",
        "regional_market",
        "supply_chain",
      ],
      spa_type_enum: ["medspa", "spa", "hybrid"],
      submission_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "completed",
      ],
      user_role: [
        "spa_user",
        "admin",
        "business_user",
        "brand_admin",
        "platform_admin",
      ],
    },
  },
} as const
