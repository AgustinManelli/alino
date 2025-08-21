export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
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
          inviter_avatar_url: string | null;
          inviter_display_name: string;
          inviter_user_id: string;
          inviter_username: string;
          list_id: string;
          list_name: string;
          responded_at: string | null;
          status: Database["public"]["Enums"]["status_shared_types"];
        };
        Insert: {
          created_at?: string;
          expires_at?: string | null;
          invitation_id?: string;
          invited_user_id: string;
          inviter_avatar_url?: string | null;
          inviter_display_name: string;
          inviter_user_id: string;
          inviter_username: string;
          list_id: string;
          list_name: string;
          responded_at?: string | null;
          status?: Database["public"]["Enums"]["status_shared_types"];
        };
        Update: {
          created_at?: string;
          expires_at?: string | null;
          invitation_id?: string;
          invited_user_id?: string;
          inviter_avatar_url?: string | null;
          inviter_display_name?: string;
          inviter_user_id?: string;
          inviter_username?: string;
          list_id?: string;
          list_name?: string;
          responded_at?: string | null;
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
            columns: ["inviter_user_id"];
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
          user_id: string;
        };
        Insert: {
          index?: number;
          list_id: string;
          pinned?: boolean;
          role?: Database["public"]["Enums"]["roles_types"];
          shared_by?: string | null;
          shared_since?: string;
          user_id: string;
        };
        Update: {
          index?: number;
          list_id?: string;
          pinned?: boolean;
          role?: Database["public"]["Enums"]["roles_types"];
          shared_by?: string | null;
          shared_since?: string;
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
          is_shared: boolean;
          list_id: string;
          list_name: string;
          non_owner_count: number;
          owner_id: string;
          updated_at: string | null;
        };
        Insert: {
          color?: string;
          created_at?: string;
          icon?: string | null;
          is_shared?: boolean;
          list_id?: string;
          list_name: string;
          non_owner_count?: number;
          owner_id?: string;
          updated_at?: string | null;
        };
        Update: {
          color?: string;
          created_at?: string;
          icon?: string | null;
          is_shared?: boolean;
          list_id?: string;
          list_name?: string;
          non_owner_count?: number;
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
          completed: boolean | null;
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
          completed?: boolean | null;
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
          completed?: boolean | null;
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
      user_private: {
        Row: {
          created_at: string;
          initial_username_prompt_shown: boolean;
          preferences: Json | null;
          updated_at: string | null;
          user_id: string;
          initial_guide_show: boolean;
        };
        Insert: {
          created_at?: string;
          initial_username_prompt_shown?: boolean;
          preferences?: Json | null;
          updated_at?: string | null;
          user_id?: string;
          initial_guide_show?: boolean;
        };
        Update: {
          created_at?: string;
          initial_username_prompt_shown?: boolean;
          preferences?: Json | null;
          updated_at?: string | null;
          user_id?: string;
          initial_guide_show?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "user_private_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["user_id"];
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
      create_list_invitation_by_username: {
        Args: { p_list_id: string; p_invited_username: string };
        Returns: Json;
      };
      get_list_members_users: {
        Args: { p_list_id: string };
        Returns: {
          user_id: string;
          username: string;
          display_name: string;
          avatar_url: string;
          role: string;
          shared_since: string;
        }[];
      };
      get_my_pending_notifications: {
        Args: Record<PropertyKey, never>;
        Returns: {
          invitation_id: string;
          list_id: string;
          inviter_user_id: string;
          invited_user_id: string;
          status: Database["public"]["Enums"]["status_shared_types"];
          created_at: string;
          list_name: string;
          username: string;
          display_name: string;
          avatar_url: string;
        }[];
      };
      get_setting_int: {
        Args: { p_setting: string };
        Returns: number;
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

export type MembershipRow =
  Database["public"]["Tables"]["list_memberships"]["Row"];
export type ListsRow = Database["public"]["Tables"]["lists"]["Row"];
export type ListsType = MembershipRow & { list: ListsRow };

export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
export type UserProfile = Pick<
  Database["public"]["Tables"]["users"]["Row"],
  "user_id" | "display_name" | "username" | "avatar_url"
>;
export type TaskType = Omit<TaskRow, "created_by"> & {
  created_by: UserProfile | null;
};

type MembershipInfo = Pick<MembershipRow, "role" | "shared_since">;
export type UserWithMembershipRole = UserProfile & MembershipInfo;

export type UserType = Database["public"]["Tables"]["users"]["Row"] & {
  user_private: Database["public"]["Tables"]["user_private"]["Row"] | null;
};
