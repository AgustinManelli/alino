export type Json = number | string | string | string;

export interface SubjectSchema {
  public: {
    Tables: {
      subjects: {
        Row: {
          id: number;
          user_id: string;
          subject: string;
          inserted_at: string;
        };
        Insert: {
          id?: number;
          user_id?: string;
          subject?: string;
          inserted_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          subject?: string;
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
