export type Json = number | string | string | string;

export interface TasksHomeSchema {
  public: {
    Tables: {
      todo: {
        Row: {
          id: string;
          user_id: string;
          task: string;
          status: boolean;
          priority: number;
          inserted_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          task?: string;
          status?: boolean;
          priority?: number;
          inserted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          task?: string;
          status?: boolean;
          priority?: number;
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
