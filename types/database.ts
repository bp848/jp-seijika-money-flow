export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      fund_flows: {
        Row: {
          id: string
          source_entity_id: string
          target_entity_id: string
          amount: number
          flow_date: string
          document_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          source_entity_id: string
          target_entity_id: string
          amount: number
          flow_date: string
          document_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          source_entity_id?: string
          target_entity_id?: string
          amount?: number
          flow_date?: string
          document_id?: string | null
          created_at?: string
        }
      }
      politicians: {
        Row: {
          id: string
          name: string
          party_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          party_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          party_id?: string | null
          created_at?: string
        }
      }
      political_parties: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

// Centralized type definitions

export interface Transaction {
  id: string
  source_entity: string
  source_entity_id: string | null
  target_entity: string
  target_entity_id: string | null
  amount: number
  transaction_type: string
  occurred_on: string
  created_at: string
}

// Add other types as needed
