export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)";
  };
  public: {
    Tables: {
      list_invitations: {
        Row: {
          created_at: string;
          expires_at: string | null;
          invitation_id: string;
          invited_user_id: string;
          inviter_user: string;
          list_id: string;
          responded_at: string | null;
          role: Database["public"]["Enums"]["roles_types"];
          status: Database["public"]["Enums"]["status_shared_types"];
        };
        Insert: {
          created_at?: string;
          expires_at?: string | null;
          invitation_id?: string;
          invited_user_id: string;
          inviter_user: string;
          list_id: string;
          responded_at?: string | null;
          role: Database["public"]["Enums"]["roles_types"];
          status: Database["public"]["Enums"]["status_shared_types"];
        };
        Update: {
          created_at?: string;
          expires_at?: string | null;
          invitation_id?: string;
          invited_user_id?: string;
          inviter_user?: string;
          list_id?: string;
          responded_at?: string | null;
          role?: Database["public"]["Enums"]["roles_types"];
          status?: Database["public"]["Enums"]["status_shared_types"];
        };
        Relationships: [
          {
            foreignKeyName: "list_invitations_invited_user_id_fkey";
            columns: ["invited_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "list_invitations_inviter_user_fkey";
            columns: ["inviter_user"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "list_invitations_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "lists";
            referencedColumns: ["list_id"];
          },
        ];
      };
      list_memberships: {
        Row: {
          index: number;
          list_id: string;
          pinned: boolean;
          role: Database["public"]["Enums"]["roles_types"];
          shared_by: string | null;
          shared_since: string;
          status: Database["public"]["Enums"]["status_shared_types"];
          user_id: string;
        };
        Insert: {
          index?: number;
          list_id: string;
          pinned?: boolean;
          role?: Database["public"]["Enums"]["roles_types"];
          shared_by?: string | null;
          shared_since?: string;
          status?: Database["public"]["Enums"]["status_shared_types"];
          user_id: string;
        };
        Update: {
          index?: number;
          list_id?: string;
          pinned?: boolean;
          role?: Database["public"]["Enums"]["roles_types"];
          shared_by?: string | null;
          shared_since?: string;
          status?: Database["public"]["Enums"]["status_shared_types"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "list_memberships_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "lists";
            referencedColumns: ["list_id"];
          },
          {
            foreignKeyName: "list_memberships_shared_by_fkey";
            columns: ["shared_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "list_memberships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      lists: {
        Row: {
          color: string;
          created_at: string;
          icon: string | null;
          list_id: string;
          list_name: string;
          owner_id: string;
          updated_at: string | null;
        };
        Insert: {
          color?: string;
          created_at?: string;
          icon?: string | null;
          list_id?: string;
          list_name: string;
          owner_id: string;
          updated_at?: string | null;
        };
        Update: {
          color?: string;
          created_at?: string;
          icon?: string | null;
          list_id?: string;
          list_name?: string;
          owner_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "lists_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      settings: {
        Row: {
          description: string | null;
          setting: string;
          value: number;
        };
        Insert: {
          description?: string | null;
          setting?: string;
          value: number;
        };
        Update: {
          description?: string | null;
          setting?: string;
          value?: number;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          completed: boolean;
          created_at: string;
          created_by: string | null;
          description: string | null;
          index: number;
          list_id: string;
          target_date: string | null;
          task_content: string;
          task_id: string;
          updated_at: string | null;
        };
        Insert: {
          completed?: boolean;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          index?: number;
          list_id: string;
          target_date?: string | null;
          task_content: string;
          task_id?: string;
          updated_at?: string | null;
        };
        Update: {
          completed?: boolean;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          index?: number;
          list_id?: string;
          target_date?: string | null;
          task_content?: string;
          task_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "tasks_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "lists";
            referencedColumns: ["list_id"];
          },
        ];
      };
      username_history: {
        Row: {
          changed_at: string;
          id: string;
          new_username: string;
          old_username: string | null;
          user_id: string;
        };
        Insert: {
          changed_at?: string;
          id?: string;
          new_username: string;
          old_username?: string | null;
          user_id?: string;
        };
        Update: {
          changed_at?: string;
          id?: string;
          new_username?: string;
          old_username?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "usernames_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          biography: string | null;
          created_at: string;
          display_name: string;
          updated_at: string | null;
          user_id: string;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          biography?: string | null;
          created_at?: string;
          display_name: string;
          updated_at?: string | null;
          user_id?: string;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          biography?: string | null;
          created_at?: string;
          display_name?: string;
          updated_at?: string | null;
          user_id?: string;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_edit_tasks: {
        Args: { p_list_id: string };
        Returns: boolean;
      };
      check_is_list_admin: {
        Args: { p_list_id: string };
        Returns: boolean;
      };
      check_is_list_member: {
        Args: { p_list_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      notifications_types:
        | "share_group"
        | "share_list"
        | "role_request"
        | "general"
        | "new_version";
      plan_types: "pro" | "student";
      roles_types: "admin" | "editor" | "reader" | "owner";
      status_shared_types: "pending" | "accepted" | "rejected";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      notifications_types: [
        "share_group",
        "share_list",
        "role_request",
        "general",
        "new_version",
      ],
      plan_types: ["pro", "student"],
      roles_types: ["admin", "editor", "reader", "owner"],
      status_shared_types: ["pending", "accepted", "rejected"],
    },
  },
} as const;
