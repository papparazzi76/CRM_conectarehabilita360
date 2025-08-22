import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_user_id: string;
          email: string;
          role: 'ADMIN' | 'EMPRESA';
          company_name: string | null;
          nif_cif: string | null;
          phone: string | null;
          status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
          two_factor_enabled: boolean;
          two_factor_secret: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          email: string;
          role?: 'ADMIN' | 'EMPRESA';
          company_name?: string | null;
          nif_cif?: string | null;
          phone?: string | null;
          status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
          two_factor_enabled?: boolean;
          two_factor_secret?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          email?: string;
          role?: 'ADMIN' | 'EMPRESA';
          company_name?: string | null;
          nif_cif?: string | null;
          phone?: string | null;
          status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
          two_factor_enabled?: boolean;
          two_factor_secret?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          province_id: number | null;
          municipality_id: number | null;
          work_type_id: number | null;
          ce_letter_current: string | null;
          ce_letter_target: string | null;
          estimated_budget: number;
          desired_timeline: string | null;
          is_urgent: boolean;
          project_value: number;
          publication_status: 'DISPONIBLE' | 'AGOTADO' | 'OCULTO';
          max_shared_companies: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          province_id?: number | null;
          municipality_id?: number | null;
          work_type_id?: number | null;
          ce_letter_current?: string | null;
          ce_letter_target?: string | null;
          estimated_budget: number;
          desired_timeline?: string | null;
          is_urgent?: boolean;
          project_value: number;
          publication_status?: 'DISPONIBLE' | 'AGOTADO' | 'OCULTO';
          max_shared_companies?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          province_id?: number | null;
          municipality_id?: number | null;
          work_type_id?: number | null;
          ce_letter_current?: string | null;
          ce_letter_target?: string | null;
          estimated_budget?: number;
          desired_timeline?: string | null;
          is_urgent?: boolean;
          project_value?: number;
          publication_status?: 'DISPONIBLE' | 'AGOTADO' | 'OCULTO';
          max_shared_companies?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};