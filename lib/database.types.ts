export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
      boards: {
        Row: {
          id: string
          title: string
          description: string | null
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          owner_id?: string
          created_at?: string
        }
      }
      board_members: {
        Row: {
          board_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          board_id: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          board_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      columns: {
        Row: {
          id: string
          board_id: string
          title: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          board_id: string
          title: string
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          title?: string
          order?: number
          created_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          column_id: string
          title: string
          description: string | null
          image_url: string | null
          script: string | null
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          column_id: string
          title: string
          description?: string | null
          image_url?: string | null
          script?: string | null
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          column_id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          script?: string | null
          order?: number
          created_at?: string
        }
      }
    }
  }
}

export type Card = Database["public"]["Tables"]["cards"]["Row"]
export type Column = Database["public"]["Tables"]["columns"]["Row"] & { cards: Card[] }
