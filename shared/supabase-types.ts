/**
 * Supabase Database Types for Miss & Mister Dour 2026
 * 
 * Auto-generated types for type-safe database access
 * 
 * Created by JS-Innov.IA - All rights reserved
 */

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
      profiles: {
        Row: {
          id: string
          user_id: string
          role: 'super_admin' | 'admin_director' | 'photographer' | 'candidate'
          full_name: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'super_admin' | 'admin_director' | 'photographer' | 'candidate'
          full_name: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'super_admin' | 'admin_director' | 'photographer' | 'candidate'
          full_name?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          profile_id: string
          category: 'miss' | 'mister'
          bio: string
          motivation: string
          photos_urls: string[]
          status: 'pending' | 'approved' | 'finalist' | 'winner'
          votes_count: number
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          category: 'miss' | 'mister'
          bio: string
          motivation: string
          photos_urls?: string[]
          status?: 'pending' | 'approved' | 'finalist' | 'winner'
          votes_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          category?: 'miss' | 'mister'
          bio?: string
          motivation?: string
          photos_urls?: string[]
          status?: 'pending' | 'approved' | 'finalist' | 'winner'
          votes_count?: number
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          candidate_id: string
          voter_email: string
          voter_ip_hash: string
          session_token: string
          voted_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          voter_email: string
          voter_ip_hash: string
          session_token: string
          voted_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          voter_email?: string
          voter_ip_hash?: string
          session_token?: string
          voted_at?: string
        }
      }
      media: {
        Row: {
          id: string
          uploader_id: string
          file_url: string
          file_type: string
          category: 'miss' | 'mister' | 'events' | 'backstage'
          status: 'pending' | 'approved' | 'rejected'
          approved_by: string | null
          rejection_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          uploader_id: string
          file_url: string
          file_type: string
          category: 'miss' | 'mister' | 'events' | 'backstage'
          status?: 'pending' | 'approved' | 'rejected'
          approved_by?: string | null
          rejection_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          uploader_id?: string
          file_url?: string
          file_type?: string
          category?: 'miss' | 'mister' | 'events' | 'backstage'
          status?: 'pending' | 'approved' | 'rejected'
          approved_by?: string | null
          rejection_reason?: string | null
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          type: 'candidate' | 'sponsor' | 'fan' | 'ai' | 'insurance'
          name: string
          email: string
          phone: string | null
          message: string
          status: 'new' | 'contacted' | 'converted' | 'archived'
          created_at: string
        }
        Insert: {
          id?: string
          type: 'candidate' | 'sponsor' | 'fan' | 'ai' | 'insurance'
          name: string
          email: string
          phone?: string | null
          message: string
          status?: 'new' | 'contacted' | 'converted' | 'archived'
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'candidate' | 'sponsor' | 'fan' | 'ai' | 'insurance'
          name?: string
          email?: string
          phone?: string | null
          message?: string
          status?: 'new' | 'contacted' | 'converted' | 'archived'
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          details_json: Json
          ip_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          details_json: Json
          ip_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          details_json?: Json
          ip_hash?: string
          created_at?: string
        }
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
  }
}
