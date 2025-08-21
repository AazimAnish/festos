export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          email: string | null
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          website: string | null
          twitter_handle: string | null
          discord_handle: string | null
          is_verified: boolean
          is_banned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          email?: string | null
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          twitter_handle?: string | null
          discord_handle?: string | null
          is_verified?: boolean
          is_banned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          email?: string | null
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          twitter_handle?: string | null
          discord_handle?: string | null
          is_verified?: boolean
          is_banned?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          location: string
          start_date: string
          end_date: string
          max_capacity: number
          current_attendees: number
          ticket_price: string
          require_approval: boolean
          has_poap: boolean
          poap_metadata: string | null
          visibility: 'public' | 'private' | 'unlisted'
          timezone: string
          banner_image: string | null
          category: string | null
          tags: string[]
          creator_id: string
          status: 'draft' | 'active' | 'cancelled' | 'completed'
          contract_event_id: number | null
          contract_address: string | null
          contract_chain_id: number | null
          transaction_hash: string | null
          web3storage_metadata_cid: string | null
          web3storage_image_cid: string | null
          creator_did: string | null
          space_did: string | null
          slug: string | null
          seo_title: string | null
          seo_description: string | null
          views_count: number
          likes_count: number
          shares_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          location: string
          start_date: string
          end_date: string
          max_capacity: number
          ticket_price: string
          require_approval?: boolean
          has_poap?: boolean
          poap_metadata?: string | null
          visibility?: 'public' | 'private'
          timezone?: string
          banner_image?: string | null
          category?: string | null
          tags?: string[]
          creator_id: string
          status?: 'draft' | 'active' | 'cancelled' | 'completed'
          contract_event_id?: number | null
          contract_address?: string | null
          contract_chain_id?: number | null
          web3storage_metadata_cid?: string | null
          web3storage_image_cid?: string | null
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          location?: string
          start_date?: string
          end_date?: string
          max_capacity?: number
          ticket_price?: string
          require_approval?: boolean
          has_poap?: boolean
          poap_metadata?: string | null
          visibility?: 'public' | 'private'
          timezone?: string
          banner_image?: string | null
          category?: string | null
          tags?: string[]
          creator_id?: string
          status?: 'draft' | 'active' | 'cancelled' | 'completed'
          contract_event_id?: number | null
          contract_address?: string | null
          contract_chain_id?: number | null
          web3storage_metadata_cid?: string | null
          web3storage_image_cid?: string | null
          slug?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tickets: {
        Row: {
          id: string
          event_id: string
          attendee_id: string
          contract_ticket_id: number | null
          contract_address: string | null
          contract_chain_id: number | null
          price_paid: string
          is_used: boolean
          is_approved: boolean
          purchase_time: string
          used_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          attendee_id: string
          contract_ticket_id?: number | null
          contract_address?: string | null
          contract_chain_id?: number | null
          price_paid: string
          is_used?: boolean
          is_approved?: boolean
          purchase_time?: string
          used_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          attendee_id?: string
          contract_ticket_id?: number | null
          contract_address?: string | null
          contract_chain_id?: number | null
          price_paid?: string
          is_used?: boolean
          is_approved?: boolean
          purchase_time?: string
          used_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_attendee_id_fkey"
            columns: ["attendee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 