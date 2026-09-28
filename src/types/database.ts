/**
 * Typage du schéma PostgreSQL exposé par Supabase.
 *
 * Ce fichier peut être régénéré à tout moment avec :
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 *
 * Il est maintenu à la main ici pour éviter une dépendance à la CLI Supabase
 * lors du premier démarrage du projet.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      experts: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          nationality_raw: string;
          nationality: string;
          country: string;
          country_code: string | null;
          region: string;
          institution: string | null;
          profession_raw: string;
          profession_category: string;
          domain: string;
          specialty_raw: string;
          cv_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          nationality_raw: string;
          nationality: string;
          country: string;
          country_code?: string | null;
          region: string;
          institution?: string | null;
          profession_raw: string;
          profession_category: string;
          domain: string;
          specialty_raw: string;
          cv_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["experts"]["Insert"]>;
        Relationships: [];
      };
      admin_users: {
        Row: {
          user_id: string;
          email: string | null;
          full_name: string | null;
          role: "admin" | "super_admin";
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          email?: string | null;
          full_name?: string | null;
          role?: "admin" | "super_admin";
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { uid?: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
