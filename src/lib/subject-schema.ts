export type Json = string | string | string | string | string;

export interface SubjectSchema {
  public: {
    Tables: {
      subjects: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          color: string;
          inserted_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          subject?: string;
          color?: string;
          inserted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          color?: string;
          inserted_at?: string;
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
