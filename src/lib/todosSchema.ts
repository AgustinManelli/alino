export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type dataList = {
  url: string;
  icon: string;
  type: string;
  color: string;
};

export type tasks = {
  id: string;
  category_id: string;
  description: string;
  completed: boolean;
  index: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      todos_data: {
        Row: {
          color: string;
          data: dataList;
          id: string;
          index: number | null;
          inserted_at: string;
          name: string;
          tasks: tasks[];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          data?: dataList | null;
          id?: string;
          index?: number | null;
          inserted_at?: string;
          name?: string | null;
          tasks?: tasks[] | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          color?: string | null;
          data?: dataList | null;
          id?: string;
          index?: number | null;
          inserted_at?: string;
          name?: string | null;
          tasks?: tasks[] | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_subjects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "public_subjects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      Relationships: [];
    };
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
