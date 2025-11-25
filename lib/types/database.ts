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
      tournaments: {
        Row: {
          id: string
          venue_name: string
          venue_location: string | null
          tournament_date: string
          start_time: string | null
          num_tables: number
          num_rounds: number
          status: 'setup' | 'in_progress' | 'completed'
          tournament_format: 'round_robin' | 'pool_playoff'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          venue_name: string
          venue_location?: string | null
          tournament_date: string
          start_time?: string | null
          num_tables: number
          num_rounds: number
          status?: 'setup' | 'in_progress' | 'completed'
          tournament_format?: 'round_robin' | 'pool_playoff'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          venue_name?: string
          venue_location?: string | null
          tournament_date?: string
          start_time?: string | null
          num_tables?: number
          num_rounds?: number
          status?: 'setup' | 'in_progress' | 'completed'
          tournament_format?: 'round_robin' | 'pool_playoff'
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          tournament_id: string
          player1_name: string
          player2_name: string
          points: number
          wins: number
          losses: number
          pool_group: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          player1_name: string
          player2_name: string
          points?: number
          wins?: number
          losses?: number
          pool_group?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          player1_name?: string
          player2_name?: string
          points?: number
          wins?: number
          losses?: number
          pool_group?: string | null
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          tournament_id: string
          round_number: number
          table_number: number
          team1_id: string
          team2_id: string
          winner_id: string | null
          completed_at: string | null
          stage: 'pool' | 'quarterfinal' | 'semifinal' | 'final' | 'third_place' | 'tiebreaker'
          bracket_position: number | null
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          round_number: number
          table_number: number
          team1_id: string
          team2_id: string
          winner_id?: string | null
          completed_at?: string | null
          stage?: 'pool' | 'quarterfinal' | 'semifinal' | 'final' | 'third_place'
          bracket_position?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          round_number?: number
          table_number?: number
          team1_id?: string
          team2_id?: string
          winner_id?: string | null
          completed_at?: string | null
          stage?: 'pool' | 'quarterfinal' | 'semifinal' | 'final' | 'third_place'
          bracket_position?: number | null
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
