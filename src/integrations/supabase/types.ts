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
      company_reports: {
        Row: {
          company_name: string | null
          comparable_companies: Json | null
          created_at: string
          id: string
          report_data: Json
          ticker: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          comparable_companies?: Json | null
          created_at?: string
          id?: string
          report_data: Json
          ticker: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          comparable_companies?: Json | null
          created_at?: string
          id?: string
          report_data?: Json
          ticker?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          company: string
          company_size: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          job_title: string | null
          last_name: string
          message: string | null
        }
        Insert: {
          company: string
          company_size?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          job_title?: string | null
          last_name: string
          message?: string | null
        }
        Update: {
          company?: string
          company_size?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          job_title?: string | null
          last_name?: string
          message?: string | null
        }
        Relationships: []
      }
      financial_files: {
        Row: {
          file_key: string
          file_type: string
          filename: string
          id: string
          statement_type: string | null
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          file_key: string
          file_type: string
          filename: string
          id?: string
          statement_type?: string | null
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          file_key?: string
          file_type?: string
          filename?: string
          id?: string
          statement_type?: string | null
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_model_audit: {
        Row: {
          agent_version_hash: string | null
          created_at: string | null
          id: string
          llm_prompt_tokens: number | null
          llm_response_tokens: number | null
          notes: string | null
          prompt_version: string | null
          run_id: string | null
        }
        Insert: {
          agent_version_hash?: string | null
          created_at?: string | null
          id?: string
          llm_prompt_tokens?: number | null
          llm_response_tokens?: number | null
          notes?: string | null
          prompt_version?: string | null
          run_id?: string | null
        }
        Update: {
          agent_version_hash?: string | null
          created_at?: string | null
          id?: string
          llm_prompt_tokens?: number | null
          llm_response_tokens?: number | null
          notes?: string | null
          prompt_version?: string | null
          run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_model_audit_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "financial_model_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_model_runs: {
        Row: {
          assumptions: Json | null
          checks: Json | null
          company_name: string | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          dcf_summary: Json | null
          error_text: string | null
          external_data: Json | null
          fiscal_year_end: string | null
          id: string
          inputs: Json | null
          provenance: Json | null
          result_json: Json | null
          status: string | null
          ticker: string
          user_id: string
          workflow_id: string | null
        }
        Insert: {
          assumptions?: Json | null
          checks?: Json | null
          company_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          dcf_summary?: Json | null
          error_text?: string | null
          external_data?: Json | null
          fiscal_year_end?: string | null
          id?: string
          inputs?: Json | null
          provenance?: Json | null
          result_json?: Json | null
          status?: string | null
          ticker: string
          user_id: string
          workflow_id?: string | null
        }
        Update: {
          assumptions?: Json | null
          checks?: Json | null
          company_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          dcf_summary?: Json | null
          error_text?: string | null
          external_data?: Json | null
          fiscal_year_end?: string | null
          id?: string
          inputs?: Json | null
          provenance?: Json | null
          result_json?: Json | null
          status?: string | null
          ticker?: string
          user_id?: string
          workflow_id?: string | null
        }
        Relationships: []
      }
      negotiation_approvals: {
        Row: {
          created_at: string
          decision: string
          id: string
          negotiation_id: string
          reason: string
          revision: number
          user_id: string
        }
        Insert: {
          created_at?: string
          decision: string
          id?: string
          negotiation_id: string
          reason: string
          revision: number
          user_id: string
        }
        Update: {
          created_at?: string
          decision?: string
          id?: string
          negotiation_id?: string
          reason?: string
          revision?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "negotiation_approvals_negotiation_id_fkey"
            columns: ["negotiation_id"]
            isOneToOne: false
            referencedRelation: "negotiations"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiation_audit: {
        Row: {
          action: string
          created_at: string
          id: string
          negotiation_id: string
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          negotiation_id: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          negotiation_id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "negotiation_audit_negotiation_id_fkey"
            columns: ["negotiation_id"]
            isOneToOne: false
            referencedRelation: "negotiations"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiation_revisions: {
        Row: {
          created_at: string
          id: string
          inputs: Json
          negotiation_id: string
          results: Json | null
          revision: number
          risk_flags: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          inputs?: Json
          negotiation_id: string
          results?: Json | null
          revision: number
          risk_flags?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          inputs?: Json
          negotiation_id?: string
          results?: Json | null
          revision?: number
          risk_flags?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "negotiation_revisions_negotiation_id_fkey"
            columns: ["negotiation_id"]
            isOneToOne: false
            referencedRelation: "negotiations"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiation_usage: {
        Row: {
          created_at: string
          id: string
          last_used_at: string | null
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_used_at?: string | null
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_used_at?: string | null
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      negotiations: {
        Row: {
          company: Json
          created_at: string
          current_revision: number
          id: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: Json
          created_at?: string
          current_revision?: number
          id?: string
          state?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: Json
          created_at?: string
          current_revision?: number
          id?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_research_usage: {
        Row: {
          created_at: string
          id: string
          last_used_at: string | null
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_used_at?: string | null
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_used_at?: string | null
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
