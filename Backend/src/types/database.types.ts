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
      business_profiles: {
        Row: {
          ai_clarification_pending: boolean
          ai_clarification_question: string | null
          bpom_image_path: string | null
          business_name: string | null
          business_type: Database["public"]["Enums"]["business_type_enum"]
          city: string | null
          created_at: string
          description: string | null
          description_quality_score: number | null
          description_validated_at: string | null
          district: string | null
          employee_count: number
          halal_image_path: string | null
          has_bpom: boolean
          has_halal: boolean
          has_merek: boolean
          has_nib: boolean
          has_pirt: boolean
          id: string
          kbli_code: string | null
          level: Database["public"]["Enums"]["level_enum"]
          merek_image_path: string | null
          monthly_revenue_estimate: number | null
          nib_image_path: string | null
          onboarding_completed: boolean
          pirt_image_path: string | null
          production_location: string | null
          province: string | null
          score: number
          streak_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_clarification_pending?: boolean
          ai_clarification_question?: string | null
          bpom_image_path?: string | null
          business_name?: string | null
          business_type: Database["public"]["Enums"]["business_type_enum"]
          city?: string | null
          created_at?: string
          description?: string | null
          description_quality_score?: number | null
          description_validated_at?: string | null
          district?: string | null
          employee_count?: number
          halal_image_path?: string | null
          has_bpom?: boolean
          has_halal?: boolean
          has_merek?: boolean
          has_nib?: boolean
          has_pirt?: boolean
          id?: string
          kbli_code?: string | null
          level?: Database["public"]["Enums"]["level_enum"]
          merek_image_path?: string | null
          monthly_revenue_estimate?: number | null
          nib_image_path?: string | null
          onboarding_completed?: boolean
          pirt_image_path?: string | null
          production_location?: string | null
          province?: string | null
          score?: number
          streak_days?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_clarification_pending?: boolean
          ai_clarification_question?: string | null
          bpom_image_path?: string | null
          business_name?: string | null
          business_type?: Database["public"]["Enums"]["business_type_enum"]
          city?: string | null
          created_at?: string
          description?: string | null
          description_quality_score?: number | null
          description_validated_at?: string | null
          district?: string | null
          employee_count?: number
          halal_image_path?: string | null
          has_bpom?: boolean
          has_halal?: boolean
          has_merek?: boolean
          has_nib?: boolean
          has_pirt?: boolean
          id?: string
          kbli_code?: string | null
          level?: Database["public"]["Enums"]["level_enum"]
          merek_image_path?: string | null
          monthly_revenue_estimate?: number | null
          nib_image_path?: string | null
          onboarding_completed?: boolean
          pirt_image_path?: string | null
          production_location?: string | null
          province?: string | null
          score?: number
          streak_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          context_step_type:
            | Database["public"]["Enums"]["step_type_enum"]
            | null
          created_at: string
          id: string
          messages: Json
          session_type: Database["public"]["Enums"]["session_type_enum"]
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context_step_type?:
            | Database["public"]["Enums"]["step_type_enum"]
            | null
          created_at?: string
          id?: string
          messages?: Json
          session_type: Database["public"]["Enums"]["session_type_enum"]
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          context_step_type?:
            | Database["public"]["Enums"]["step_type_enum"]
            | null
          created_at?: string
          id?: string
          messages?: Json
          session_type?: Database["public"]["Enums"]["session_type_enum"]
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_knowledge: {
        Row: {
          category: string
          content: string
          created_at: string
          domain: string
          embedding: string | null
          id: string
          metadata: Json
          title: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          domain: string
          embedding?: string | null
          id?: string
          metadata?: Json
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          domain?: string
          embedding?: string | null
          id?: string
          metadata?: Json
          title?: string
        }
        Relationships: []
      }
      financial_records: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          id: string
          product_name: string | null
          profile_id: string
          quantity: number | null
          raw_input: string | null
          record_date: string
          type: Database["public"]["Enums"]["financial_type_enum"]
          unit_price: number | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          id?: string
          product_name?: string | null
          profile_id: string
          quantity?: number | null
          raw_input?: string | null
          record_date?: string
          type: Database["public"]["Enums"]["financial_type_enum"]
          unit_price?: number | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          id?: string
          product_name?: string | null
          profile_id?: string
          quantity?: number | null
          raw_input?: string | null
          record_date?: string
          type?: Database["public"]["Enums"]["financial_type_enum"]
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      formalization_steps: {
        Row: {
          completed_at: string | null
          created_at: string
          current_substep: number
          id: string
          is_required: boolean
          profile_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["step_status_enum"]
          step_order: number
          step_type: Database["public"]["Enums"]["step_type_enum"]
          total_substeps: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_substep?: number
          id?: string
          is_required?: boolean
          profile_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["step_status_enum"]
          step_order: number
          step_type: Database["public"]["Enums"]["step_type_enum"]
          total_substeps?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_substep?: number
          id?: string
          is_required?: boolean
          profile_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["step_status_enum"]
          step_order?: number
          step_type?: Database["public"]["Enums"]["step_type_enum"]
          total_substeps?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "formalization_steps_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      idempotency_keys: {
        Row: {
          created_at: string
          idempotency_key: string
          profile_id: string
          response_body: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          idempotency_key: string
          profile_id: string
          response_body?: Json | null
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          idempotency_key?: string
          profile_id?: string
          response_body?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "idempotency_keys_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          additional_requirements: string[]
          business_types: Database["public"]["Enums"]["business_type_enum"][]
          category: Database["public"]["Enums"]["opportunity_category_enum"]
          created_at: string
          deadline: string | null
          description: string | null
          estimated_value: string | null
          id: string
          is_active: boolean
          last_verified: string
          max_annual_revenue: number
          min_annual_revenue: number
          nice_to_have_steps: Database["public"]["Enums"]["step_type_enum"][]
          provider: string
          region: string
          required_steps: Database["public"]["Enums"]["step_type_enum"][]
          source_url: string | null
          title: string
          updated_at: string
          value_description: string | null
        }
        Insert: {
          additional_requirements?: string[]
          business_types?: Database["public"]["Enums"]["business_type_enum"][]
          category: Database["public"]["Enums"]["opportunity_category_enum"]
          created_at?: string
          deadline?: string | null
          description?: string | null
          estimated_value?: string | null
          id?: string
          is_active?: boolean
          last_verified?: string
          max_annual_revenue?: number
          min_annual_revenue?: number
          nice_to_have_steps?: Database["public"]["Enums"]["step_type_enum"][]
          provider: string
          region?: string
          required_steps?: Database["public"]["Enums"]["step_type_enum"][]
          source_url?: string | null
          title: string
          updated_at?: string
          value_description?: string | null
        }
        Update: {
          additional_requirements?: string[]
          business_types?: Database["public"]["Enums"]["business_type_enum"][]
          category?: Database["public"]["Enums"]["opportunity_category_enum"]
          created_at?: string
          deadline?: string | null
          description?: string | null
          estimated_value?: string | null
          id?: string
          is_active?: boolean
          last_verified?: string
          max_annual_revenue?: number
          min_annual_revenue?: number
          nice_to_have_steps?: Database["public"]["Enums"]["step_type_enum"][]
          provider?: string
          region?: string
          required_steps?: Database["public"]["Enums"]["step_type_enum"][]
          source_url?: string | null
          title?: string
          updated_at?: string
          value_description?: string | null
        }
        Relationships: []
      }
      user_opportunity_matches: {
        Row: {
          clicked_at: string | null
          created_at: string
          id: string
          match_score: number
          match_status: Database["public"]["Enums"]["match_status_enum"]
          missing_steps: Database["public"]["Enums"]["step_type_enum"][]
          opportunity_id: string
          seen_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string
          id?: string
          match_score?: number
          match_status: Database["public"]["Enums"]["match_status_enum"]
          missing_steps?: Database["public"]["Enums"]["step_type_enum"][]
          opportunity_id: string
          seen_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          clicked_at?: string | null
          created_at?: string
          id?: string
          match_score?: number
          match_status?: Database["public"]["Enums"]["match_status_enum"]
          missing_steps?: Database["public"]["Enums"]["step_type_enum"][]
          opportunity_id?: string
          seen_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_opportunity_matches_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_opportunity_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          name: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_knowledge: {
        Args: {
          match_count?: number
          match_domain?: string
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: string
          content: string
          domain: string
          id: string
          similarity: number
          title: string
        }[]
      }
    }
    Enums: {
      business_type_enum:
        | "kuliner"
        | "fashion_craft"
        | "jasa_personal_care"
        | "lainnya"
      financial_type_enum: "income" | "expense"
      level_enum: "starter" | "growing" | "established" | "pro" | "enterprise"
      match_status_enum: "eligible" | "almost" | "locked"
      opportunity_category_enum:
        | "pembiayaan"
        | "vendor_supply_chain"
        | "marketplace"
        | "program_pemerintah"
        | "event_pameran"
      session_type_enum: "onboarding" | "copilot" | "financial_parser"
      step_status_enum: "locked" | "unlocked" | "in_progress" | "completed"
      step_type_enum:
        | "nib"
        | "spp_irt"
        | "halal"
        | "bpom"
        | "merek"
        | "sertifikat_standar"
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
      business_type_enum: [
        "kuliner",
        "fashion_craft",
        "jasa_personal_care",
        "lainnya",
      ],
      financial_type_enum: ["income", "expense"],
      level_enum: ["starter", "growing", "established", "pro", "enterprise"],
      match_status_enum: ["eligible", "almost", "locked"],
      opportunity_category_enum: [
        "pembiayaan",
        "vendor_supply_chain",
        "marketplace",
        "program_pemerintah",
        "event_pameran",
      ],
      session_type_enum: ["onboarding", "copilot", "financial_parser"],
      step_status_enum: ["locked", "unlocked", "in_progress", "completed"],
      step_type_enum: [
        "nib",
        "spp_irt",
        "halal",
        "bpom",
        "merek",
        "sertifikat_standar",
      ],
    },
  },
} as const
