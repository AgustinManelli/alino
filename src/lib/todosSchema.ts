// export type Json =
//   | string
//   | number
//   | boolean
//   | null
//   | { [key: string]: Json | undefined }
//   | Json[];

// // export type dataList = {
// //   url: string;
// //   icon: string;
// //   type: string;
// //   color: string;
// // };

// export type tasks = {
//   id: string;
//   category_id: string;
//   description: string;
//   completed: boolean;
//   index: number;
//   name: string;
//   created_at: string;
//   updated_at: string;
// };

// export type Database = {
//   public: {
//     Tables: {
//       todos_data: {
//         Row: {
//           color: string;
//           icon: string;
//           id: string;
//           index: number;
//           inserted_at: string;
//           name: string;
//           tasks: tasks[];
//           updated_at: string | null;
//           user_id: string;
//           pinned: boolean;
//         };
//         Insert: {
//           color?: string | null;
//           icon?: string | null;
//           id?: string;
//           index?: number;
//           inserted_at?: string;
//           name?: string | null;
//           tasks?: tasks[] | null;
//           updated_at?: string | null;
//           user_id: string;
//           pinned?: boolean;
//         };
//         Update: {
//           color?: string | null;
//           icon?: string | null;
//           id?: string;
//           index?: number;
//           inserted_at?: string;
//           name?: string | null;
//           tasks?: tasks[] | null;
//           updated_at?: string | null;
//           user_id?: string;
//           pinned?: boolean;
//         };
//         Relationships: [
//           {
//             foreignKeyName: "public_subjects_user_id_fkey";
//             columns: ["user_id"];
//             isOneToOne: false;
//             referencedRelation: "users";
//             referencedColumns: ["id"];
//           },
//           {
//             foreignKeyName: "public_subjects_user_id_fkey";
//             columns: ["user_id"];
//             isOneToOne: false;
//             referencedRelation: "users";
//             referencedColumns: ["id"];
//           },
//         ];
//       };
//       Relationships: [];
//     };
//   };
//   Functions: {
//     [_ in never]: never;
//   };
//   Enums: {
//     [_ in never]: never;
//   };
//   CompositeTypes: {
//     [_ in never]: never;
//   };
// };

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type tasks = {
  category_id: string;
  completed: boolean;
  created_at: string;
  description: string | null;
  id: string;
  index: number | null;
  name: string;
  updated_at: string | null;
  user_id: string;
};

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
          color: string | null;
          icon: string | null;
          id: string;
          index: number | null;
          inserted_at: string;
          name: string;
          pinned: boolean;
          tasks: Database["public"]["Tables"]["tasks"]["Row"][];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          color?: string | null;
          icon?: string | null;
          id?: string;
          index?: number | null;
          inserted_at?: string;
          name: string;
          pinned?: boolean;
          tasks?: Database["public"]["Tables"]["tasks"]["Row"][];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          color?: string | null;
          icon?: string | null;
          id?: string;
          index?: number | null;
          inserted_at?: string;
          name?: string;
          pinned?: boolean;
          tasks?: Database["public"]["Tables"]["tasks"]["Row"][];
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
