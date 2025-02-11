export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          category_id: string;
          completed: boolean;
          created_at: string;
          description: string | null;
          id: string;
          index: number | null;
          name: string;
          target_date: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          category_id?: string;
          completed?: boolean;
          created_at?: string;
          description?: string | null;
          id?: string;
          index?: number | null;
          name: string;
          target_date?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          category_id?: string;
          completed?: boolean;
          created_at?: string;
          description?: string | null;
          id?: string;
          index?: number | null;
          name?: string;
          target_date?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "todos_data";
            referencedColumns: ["id"];
          },
        ];
      };
      todos_data: {
        Row: {
          color: string;
          icon: string | null;
          id: string;
          index: number | null;
          created_at: string;
          name: string;
          pinned: boolean;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          color?: string;
          icon?: string | null;
          id?: string;
          index?: number | null;
          created_at?: string;
          name: string;
          pinned?: boolean;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          color?: string;
          icon?: string | null;
          id?: string;
          index?: number | null;
          created_at?: string;
          name?: string;
          pinned?: boolean;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      update_todos_indices: {
        Args: {
          p_user_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];
