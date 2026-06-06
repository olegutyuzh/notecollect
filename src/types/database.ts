export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      countries: {
        Row: {
          id: number
          name_en: string
          name_uk: string | null
          code: string | null
          flag_emoji: string | null
        }
        Insert: Omit<Database['public']['Tables']['countries']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['countries']['Insert']>
      }
      currencies: {
        Row: {
          id: number
          name_en: string
          name_uk: string | null
          code: string | null
          symbol: string | null
        }
        Insert: Omit<Database['public']['Tables']['currencies']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['currencies']['Insert']>
      }
      banknotes: {
        Row: {
          id: number
          country_id: number | null
          currency_id: number | null
          denomination: number
          denomination_text: string | null
          year_from: number | null
          year_to: number | null
          series: string | null
          pick_number: string | null
          issuer: string | null
          size_width_mm: number | null
          size_height_mm: number | null
          material: string | null
          obverse_description: string | null
          reverse_description: string | null
          watermark: string | null
          security_features: string | null
          printer: string | null
          image_obverse_url: string | null
          image_reverse_url: string | null
          created_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['banknotes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['banknotes']['Insert']>
      }
      user_collections: {
        Row: {
          id: number
          user_id: string
          banknote_id: number
          grade: string | null
          quantity: number
          purchase_price: number | null
          purchase_date: string | null
          notes: string | null
          public_notes: string | null
          serial_number: string | null
          grading_company: string | null
          grading_score: string | null
          designation: string | null
          cert_number: string | null
          image_url: string | null
          for_trade: boolean
          for_sale: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_collections']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_collections']['Insert']>
      }
      user_wishlists: {
        Row: {
          id: number
          user_id: string
          banknote_id: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_wishlists']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_wishlists']['Insert']>
      }
    }
  }
}

// Зручні аліаси
export type Country = Database['public']['Tables']['countries']['Row']
export type Currency = Database['public']['Tables']['currencies']['Row']
export type Banknote = Database['public']['Tables']['banknotes']['Row']
export type UserCollection = Database['public']['Tables']['user_collections']['Row']
export type UserWishlist = Database['public']['Tables']['user_wishlists']['Row']

export type BanknoteWithRelations = Banknote & {
  countries: Country | null
  currencies: Currency | null
}

export type CollectionItemWithBanknote = UserCollection & {
  banknotes: BanknoteWithRelations
}
