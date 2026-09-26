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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      booking_experiences: {
        Row: {
          booking_id: string
          created_at: string
          experience_id: string
          id: string
          participants: number
          price_at_booking: number
          scheduled_date: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          experience_id: string
          id?: string
          participants?: number
          price_at_booking: number
          scheduled_date: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          experience_id?: string
          id?: string
          participants?: number
          price_at_booking?: number
          scheduled_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_experiences_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_experiences_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          guest_id: string
          guests_count: number
          id: string
          property_id: string
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          updated_at: string
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          guest_id: string
          guests_count?: number
          id?: string
          property_id: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_price: number
          updated_at?: string
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          guest_id?: string
          guests_count?: number
          id?: string
          property_id?: string
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          guest_id: string
          host_id: string
          id: string
          property_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guest_id: string
          host_id: string
          id?: string
          property_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guest_id?: string
          host_id?: string
          id?: string
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_ledger: {
        Row: {
          commission_rate: number
          created_at: string
          host_id: string
          host_payout_amount: number
          id: string
          payment_id: string
          platform_fee: number
          release_due_at: string
          released_at: string | null
          status: string
          total_amount: number
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          host_id: string
          host_payout_amount: number
          id?: string
          payment_id: string
          platform_fee?: number
          release_due_at: string
          released_at?: string | null
          status?: string
          total_amount: number
        }
        Update: {
          commission_rate?: number
          created_at?: string
          host_id?: string
          host_payout_amount?: number
          id?: string
          payment_id?: string
          platform_fee?: number
          release_due_at?: string
          released_at?: string | null
          status?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "escrow_ledger_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_ledger_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          guest_id: string
          id: string
          status: string
          tickets_count: number
          total_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          guest_id: string
          id?: string
          status?: string
          tickets_count?: number
          total_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          guest_id?: string
          id?: string
          status?: string
          tickets_count?: number
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "farm_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rsvps_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          created_at: string
          description: string | null
          duration_hours: number
          id: string
          is_active: boolean
          max_participants: number
          name: string
          price: number
          property_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_hours?: number
          id?: string
          is_active?: boolean
          max_participants?: number
          name: string
          price: number
          property_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_hours?: number
          id?: string
          is_active?: boolean
          max_participants?: number
          name?: string
          price?: number
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_events: {
        Row: {
          category: string
          created_at: string
          description: string | null
          end_time: string
          event_date: string
          farm_id: string
          id: string
          images: string[] | null
          is_active: boolean
          max_capacity: number
          start_time: string
          ticket_price: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          end_time: string
          event_date: string
          farm_id: string
          id?: string
          images?: string[] | null
          is_active?: boolean
          max_capacity: number
          start_time: string
          ticket_price?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          end_time?: string
          event_date?: string
          farm_id?: string
          id?: string
          images?: string[] | null
          is_active?: boolean
          max_capacity?: number
          start_time?: string
          ticket_price?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_events_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_follows: {
        Row: {
          created_at: string
          farm_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_follows_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farm_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          farm_id: string
          id: string
          images: string[] | null
          tagged_property_id: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          farm_id: string
          id?: string
          images?: string[] | null
          tagged_property_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          farm_id?: string
          id?: string
          images?: string[] | null
          tagged_property_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_posts_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farm_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_posts_tagged_property_id_fkey"
            columns: ["tagged_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          certifications: string[] | null
          cover_image_url: string | null
          created_at: string
          crops: string[] | null
          facilities: string[] | null
          farm_name: string
          host_id: string
          id: string
          is_verified: boolean
          latitude: number | null
          livestock: string[] | null
          location: string
          longitude: number | null
          operating_hours: Json | null
          social_links: Json | null
          story: string | null
          tagline: string | null
          terroir_notes: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          certifications?: string[] | null
          cover_image_url?: string | null
          created_at?: string
          crops?: string[] | null
          facilities?: string[] | null
          farm_name: string
          host_id: string
          id?: string
          is_verified?: boolean
          latitude?: number | null
          livestock?: string[] | null
          location: string
          longitude?: number | null
          operating_hours?: Json | null
          social_links?: Json | null
          story?: string | null
          tagline?: string | null
          terroir_notes?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          certifications?: string[] | null
          cover_image_url?: string | null
          created_at?: string
          crops?: string[] | null
          facilities?: string[] | null
          farm_name?: string
          host_id?: string
          id?: string
          is_verified?: boolean
          latitude?: number | null
          livestock?: string[] | null
          location?: string
          longitude?: number | null
          operating_hours?: Json | null
          social_links?: Json | null
          story?: string | null
          tagline?: string | null
          terroir_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_profiles_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_reels: {
        Row: {
          aspect_ratio: string | null
          author_id: string
          caption: string | null
          created_at: string
          duration_seconds: number | null
          farm_id: string
          id: string
          tagged_property_id: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          video_url: string
          views_count: number
        }
        Insert: {
          aspect_ratio?: string | null
          author_id: string
          caption?: string | null
          created_at?: string
          duration_seconds?: number | null
          farm_id: string
          id?: string
          tagged_property_id?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          video_url: string
          views_count?: number
        }
        Update: {
          aspect_ratio?: string | null
          author_id?: string
          caption?: string | null
          created_at?: string
          duration_seconds?: number | null
          farm_id?: string
          id?: string
          tagged_property_id?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          video_url?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "farm_reels_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_reels_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farm_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_reels_tagged_property_id_fkey"
            columns: ["tagged_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      kitchen_menus: {
        Row: {
          advance_notice_hours: number
          created_at: string
          description: string | null
          dietary_tags: string[] | null
          dish_name: string
          farm_id: string
          id: string
          image_url: string | null
          ingredients: string[] | null
          is_available: boolean
          price: number
          updated_at: string
        }
        Insert: {
          advance_notice_hours?: number
          created_at?: string
          description?: string | null
          dietary_tags?: string[] | null
          dish_name: string
          farm_id: string
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_available?: boolean
          price: number
          updated_at?: string
        }
        Update: {
          advance_notice_hours?: number
          created_at?: string
          description?: string | null
          dietary_tags?: string[] | null
          dish_name?: string
          farm_id?: string
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_available?: boolean
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kitchen_menus_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
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
      moderation_queue: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          moderator_notes: string | null
          reason: string
          reported_by: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          moderator_notes?: string | null
          reason: string
          reported_by: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          moderator_notes?: string | null
          reason?: string
          reported_by?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          item_name: string
          menu_id: string | null
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          item_name: string
          menu_id?: string | null
          order_id: string
          product_id?: string | null
          quantity: number
          unit_price: number
        }
        Update: {
          id?: string
          item_name?: string
          menu_id?: string | null
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "kitchen_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string
          farm_id: string
          fulfillment_type: string
          id: string
          order_type: string
          special_instructions: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          farm_id: string
          fulfillment_type?: string
          id?: string
          order_type: string
          special_instructions?: string | null
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          farm_id?: string
          fulfillment_type?: string
          id?: string
          order_type?: string
          special_instructions?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          currency: string
          id: string
          idempotency_key: string | null
          metadata: Json | null
          order_id: string | null
          payment_intent_id: string | null
          payment_method: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json | null
          order_id?: string | null
          payment_intent_id?: string | null
          payment_method: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string | null
          metadata?: Json | null
          order_id?: string | null
          payment_intent_id?: string | null
          payment_method?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          currency: string
          host_id: string
          id: string
          payout_method: string
          payout_reference: string | null
          processed_at: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          host_id: string
          id?: string
          payout_method?: string
          payout_reference?: string | null
          processed_at?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          host_id?: string
          id?: string
          payout_method?: string
          payout_reference?: string | null
          processed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string | null
          reel_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id?: string | null
          reel_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string | null
          reel_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "farm_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "farm_reels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          reel_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          reel_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          reel_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "farm_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "farm_reels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          farm_id: string
          id: string
          images: string[] | null
          is_available: boolean
          name: string
          perishable_claim_hours: number
          price: number
          stock_quantity: number
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          farm_id: string
          id?: string
          images?: string[] | null
          is_available?: boolean
          name: string
          perishable_claim_hours?: number
          price: number
          stock_quantity?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          farm_id?: string
          id?: string
          images?: string[] | null
          is_available?: boolean
          name?: string
          perishable_claim_hours?: number
          price?: number
          stock_quantity?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          additional_rules: string | null
          address: string | null
          amenities: string[] | null
          bathrooms: number
          bedrooms: number
          cancellation_policy:
            | Database["public"]["Enums"]["cancellation_policy"]
            | null
          category: Database["public"]["Enums"]["property_category"]
          check_in_time: string | null
          check_out_time: string | null
          created_at: string
          description: string | null
          farm_id: string | null
          host_id: string
          house_rules: string[] | null
          id: string
          is_published: boolean
          latitude: number | null
          listing_type: Database["public"]["Enums"]["property_listing_type"]
          location: string
          longitude: number | null
          max_guests: number
          name: string
          price_per_night: number
          safety_features: string[] | null
          subcategory: Database["public"]["Enums"]["farmstay_subcategory"]
          updated_at: string
        }
        Insert: {
          additional_rules?: string | null
          address?: string | null
          amenities?: string[] | null
          bathrooms?: number
          bedrooms?: number
          cancellation_policy?:
            | Database["public"]["Enums"]["cancellation_policy"]
            | null
          category?: Database["public"]["Enums"]["property_category"]
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          description?: string | null
          farm_id?: string | null
          host_id: string
          house_rules?: string[] | null
          id?: string
          is_published?: boolean
          latitude?: number | null
          listing_type?: Database["public"]["Enums"]["property_listing_type"]
          location: string
          longitude?: number | null
          max_guests?: number
          name: string
          price_per_night: number
          safety_features?: string[] | null
          subcategory?: Database["public"]["Enums"]["farmstay_subcategory"]
          updated_at?: string
        }
        Update: {
          additional_rules?: string | null
          address?: string | null
          amenities?: string[] | null
          bathrooms?: number
          bedrooms?: number
          cancellation_policy?:
            | Database["public"]["Enums"]["cancellation_policy"]
            | null
          category?: Database["public"]["Enums"]["property_category"]
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string
          description?: string | null
          farm_id?: string | null
          host_id?: string
          house_rules?: string[] | null
          id?: string
          is_published?: boolean
          latitude?: number | null
          listing_type?: Database["public"]["Enums"]["property_listing_type"]
          location?: string
          longitude?: number | null
          max_guests?: number
          name?: string
          price_per_night?: number
          safety_features?: string[] | null
          subcategory?: Database["public"]["Enums"]["farmstay_subcategory"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          caption: string | null
          category: Database["public"]["Enums"]["image_category"] | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_primary: boolean
          property_id: string
        }
        Insert: {
          caption?: string | null
          category?: Database["public"]["Enums"]["image_category"] | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_primary?: boolean
          property_id: string
        }
        Update: {
          caption?: string | null
          category?: Database["public"]["Enums"]["image_category"] | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_primary?: boolean
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          key: string
          last_updated: string
          tokens: number
        }
        Insert: {
          key: string
          last_updated?: string
          tokens: number
        }
        Update: {
          key?: string
          last_updated?: string
          tokens?: number
        }
        Relationships: []
      }
      review_responses: {
        Row: {
          content: string
          created_at: string
          host_id: string
          id: string
          review_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          host_id: string
          id?: string
          review_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          host_id?: string
          id?: string
          review_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          farm_comment: string | null
          farm_rating: number | null
          farmer_comment: string | null
          farmer_id: string | null
          farmer_rating: number | null
          id: string
          photo_urls: string[] | null
          property_id: string
          rating: number
          reviewer_id: string
          sub_scores: Json | null
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          farm_comment?: string | null
          farm_rating?: number | null
          farmer_comment?: string | null
          farmer_id?: string | null
          farmer_rating?: number | null
          id?: string
          photo_urls?: string[] | null
          property_id: string
          rating: number
          reviewer_id: string
          sub_scores?: Json | null
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          farm_comment?: string | null
          farm_rating?: number | null
          farmer_comment?: string | null
          farmer_id?: string | null
          farmer_rating?: number | null
          id?: string
          photo_urls?: string[] | null
          property_id?: string
          rating?: number
          reviewer_id?: string
          sub_scores?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      farm_ratings: {
        Row: {
          average_farm_rating: number | null
          farm_review_count: number | null
          property_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_hospitality_ratings: {
        Row: {
          average_hospitality_rating: number | null
          farmer_id: string | null
          hospitality_review_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_ratings: {
        Row: {
          average_rating: number | null
          property_id: string | null
          review_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_property_owner: { Args: { _property_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "guest" | "host" | "moderator" | "admin"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      cancellation_policy: "flexible" | "moderate" | "strict" | "non_refundable"
      farmstay_subcategory:
        | "agrifarm"
        | "aquafarm"
        | "homestay"
        | "kubo_hut"
        | "farm_cottage"
        | "camp_stay"
        | "dorm_shared"
        | "kitchen"
      image_category:
        | "exterior"
        | "living_area"
        | "bedroom"
        | "bathroom"
        | "kitchen"
        | "outdoor"
        | "amenities"
        | "farm_animals"
      property_category:
        | "farmstay"
        | "agri_tourism_farm"
        | "integrated_farm"
        | "working_farm"
        | "nature_farm"
        | "homestead_farm"
        | "crop_farm"
        | "livestock_farm"
        | "mixed_farm"
        | "educational_farm"
      property_listing_type: "farm_stay" | "farm_experience" | "farm_tour"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["guest", "host", "moderator", "admin"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      cancellation_policy: ["flexible", "moderate", "strict", "non_refundable"],
      farmstay_subcategory: [
        "agrifarm",
        "aquafarm",
        "homestay",
        "kubo_hut",
        "farm_cottage",
        "camp_stay",
        "dorm_shared",
        "kitchen",
      ],
      image_category: [
        "exterior",
        "living_area",
        "bedroom",
        "bathroom",
        "kitchen",
        "outdoor",
        "amenities",
        "farm_animals",
      ],
      property_category: [
        "farmstay",
        "agri_tourism_farm",
        "integrated_farm",
        "working_farm",
        "nature_farm",
        "homestead_farm",
        "crop_farm",
        "livestock_farm",
        "mixed_farm",
        "educational_farm",
      ],
      property_listing_type: ["farm_stay", "farm_experience", "farm_tour"],
    },
  },
} as const
