export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      countries: {
        Row: {
          id: number
          name_en: string
          name_uk: string | null
          name_local: string | null
          code: string | null
          alpha3: string | null
          flag_emoji: string | null
        }
        Insert: Omit<Database['public']['Tables']['countries']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['countries']['Insert']>
      }
      issuers: {
        Row: {
          id: number
          name_en: string
          is_section: boolean
          code: string | null
          wikidata_id: string | null
          start_year: number | null
          end_year: number | null
          parent_id: number | null
          flag_url: string | null
        }
        Insert: Omit<Database['public']['Tables']['issuers']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['issuers']['Insert']>
      }
      collectibles: {
        Row: {
          id: number
          title: string
          category: string                 // 'banknote' | 'coin' | 'exonumia'
          object_type_id: number | null
          object_type_name: string | null
          issuer_code: string | null
          issuer_name: string | null
          min_year: number | null
          max_year: number | null
          obverse_thumbnail: string | null
          reverse_thumbnail: string | null
          country_id: number | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['collectibles']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['collectibles']['Insert']>
      }
      collectible_details: {
        Row: {
          collectible_id: number
          description: string | null
          obverse_description: string | null
          reverse_description: string | null
          obverse_picture: string | null
          reverse_picture: string | null
          demonetized: boolean | null
          demonetization_date: string | null
          denominations: Json | null
          references_data: Json | null
          series: Json | null
          size: number | null
          weight: number | null
          raw_data: Json | null
          fetched_at: string | null
          collectible_type_id: number | null
          issuer_code: string | null
          title: string | null
          category: string | null
          references: Json | null
        }
        Insert: Database['public']['Tables']['collectible_details']['Row']
        Update: Partial<Database['public']['Tables']['collectible_details']['Row']>
      }
      collectible_variations: {
        Row: {
          id: number
          collectible_id: number
          is_dated: boolean
          year: number | null
          gregorian_year: number | null
          signatures: Json
          comment: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['collectible_variations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['collectible_variations']['Insert']>
      }
      collected_items: {
        Row: {
          id: number
          user_id: string
          collectible_id: number
          collectible_variation_id: number | null
          quantity: number
          for_swap: boolean
          grade: string | null
          price_value: number | null
          price_currency: string | null
          serial_number: string | null
          private_comment: string | null
          public_comment: string | null
          pictures: Json
          grading_company_id: number | null
          grading_company: string | null
          slab_grade: string | null
          slab_number: string | null
          grading_designations: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['collected_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['collected_items']['Insert']>
      }
      currencies: {
        Row: {
          id: number
          name_en: string | null
          name_uk: string | null
          code: string | null
          symbol: string | null
          status: string | null
          valid_from: string | null
          valid_to: string | null
          replaced_by_code: string | null
          numeric_code: string | null
        }
        Insert: Omit<Database['public']['Tables']['currencies']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['currencies']['Insert']>
      }
    }
  }
}

// ── Convenience aliases ────────────────────────────────────────────────────
export type Country              = Database['public']['Tables']['countries']['Row']
export type Currency             = Database['public']['Tables']['currencies']['Row']
export type Issuer               = Database['public']['Tables']['issuers']['Row']
export type Collectible          = Database['public']['Tables']['collectibles']['Row']
export type CollectibleVariation = Database['public']['Tables']['collectible_variations']['Row']
export type CollectedItem        = Database['public']['Tables']['collected_items']['Row']

// ── With relations ─────────────────────────────────────────────────────────
export type CollectibleWithRelations = Collectible & {
  countries: Country | null
}
/** @deprecated use CollectibleWithRelations */
export type BanknoteWithRelations = CollectibleWithRelations

export type CollectedItemWithCollectible = CollectedItem & {
  collectibles: CollectibleWithRelations
}

export type CollectedItemFull = CollectedItem & {
  collectibles: CollectibleWithRelations
  collectible_variations: CollectibleVariation | null
}

// ── Helper types ───────────────────────────────────────────────────────────
export type NumistaSignature = {
  signer_name: string
  title?: string
}

export type NumistaPicture = {
  url: string
  thumbnail_url?: string
}

export type GradingDesignation = {
  id: number
  value: string
}
