export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      app_updates: {
        Row: {
          category: Database["public"]["Enums"]["app_update_category"]
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean
          published_at: string | null
          title: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["app_update_category"]
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          title: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["app_update_category"]
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      list_folders: {
        Row: {
          created_at: string
          folder_color: string | null
          folder_description: string | null
          folder_id: string
          folder_name: string
          index: number
          rank: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          folder_color?: string | null
          folder_description?: string | null
          folder_id?: string
          folder_name: string
          index?: number
          rank?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          folder_color?: string | null
          folder_description?: string | null
          folder_id?: string
          folder_name?: string
          index?: number
          rank?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_folders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "list_folders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      list_invitations: {
        Row: {
          created_at: string
          expires_at: string | null
          invitation_id: string
          invited_user_id: string
          inviter_avatar_url: string | null
          inviter_display_name: string
          inviter_user_id: string
          inviter_username: string
          list_id: string
          list_name: string
          responded_at: string | null
          status: Database["public"]["Enums"]["status_shared_types"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          invitation_id?: string
          invited_user_id: string
          inviter_avatar_url?: string | null
          inviter_display_name: string
          inviter_user_id: string
          inviter_username: string
          list_id: string
          list_name: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["status_shared_types"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          invitation_id?: string
          invited_user_id?: string
          inviter_avatar_url?: string | null
          inviter_display_name?: string
          inviter_user_id?: string
          inviter_username?: string
          list_id?: string
          list_name?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["status_shared_types"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "list_invitations_invited_user_id_fkey"
            columns: ["invited_user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "list_invitations_invited_user_id_fkey"
            columns: ["invited_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "list_invitations_inviter_user_fkey"
            columns: ["inviter_user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "list_invitations_inviter_user_fkey"
            columns: ["inviter_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "list_invitations_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["list_id"]
          },
        ]
      }
      list_memberships: {
        Row: {
          folder: string | null
          index: number
          list_id: string
          pinned: boolean
          rank: string | null
          role: Database["public"]["Enums"]["roles_types"]
          shared_by: string | null
          shared_since: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          folder?: string | null
          index?: number
          list_id: string
          pinned?: boolean
          rank?: string | null
          role?: Database["public"]["Enums"]["roles_types"]
          shared_by?: string | null
          shared_since?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          folder?: string | null
          index?: number
          list_id?: string
          pinned?: boolean
          rank?: string | null
          role?: Database["public"]["Enums"]["roles_types"]
          shared_by?: string | null
          shared_since?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_memberships_folder_fkey"
            columns: ["folder"]
            isOneToOne: false
            referencedRelation: "list_folders"
            referencedColumns: ["folder_id"]
          },
          {
            foreignKeyName: "list_memberships_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["list_id"]
          },
          {
            foreignKeyName: "list_memberships_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "list_memberships_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "list_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "list_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lists: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string | null
          is_shared: boolean
          list_id: string
          list_name: string
          non_owner_count: number
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          is_shared?: boolean
          list_id?: string
          list_name: string
          non_owner_count?: number
          owner_id?: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          is_shared?: boolean
          list_id?: string
          list_name?: string
          non_owner_count?: number
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lists_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lists_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          expires_at: string | null
          id: string
          is_global: boolean
          metadata: Json | null
          target_user_id: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_global?: boolean
          metadata?: Json | null
          target_user_id?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_global?: boolean
          metadata?: Json | null
          target_user_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      predefined_widgets: {
        Row: {
          category: string
          created_at: string
          default_layout_lg: Json | null
          default_layout_md: Json | null
          default_layout_xs: Json | null
          description: string | null
          id: string
          is_active: boolean
          is_resizable: boolean
          name: string
          sort_order: number
          tier_required: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          default_layout_lg?: Json | null
          default_layout_md?: Json | null
          default_layout_xs?: Json | null
          description?: string | null
          id: string
          is_active?: boolean
          is_resizable?: boolean
          name: string
          sort_order?: number
          tier_required?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          default_layout_lg?: Json | null
          default_layout_md?: Json | null
          default_layout_xs?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_resizable?: boolean
          name?: string
          sort_order?: number
          tier_required?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      settings: {
        Row: {
          description: string | null
          setting: string
          value: number
        }
        Insert: {
          description?: string | null
          setting?: string
          value: number
        }
        Update: {
          description?: string | null
          setting?: string
          value?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          customer_id: string | null
          id: string
          status: Database["public"]["Enums"]["subscription_status"]
          subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed: boolean | null
          created_at: string
          created_by: string | null
          description: string | null
          index: number
          list_id: string
          target_date: string | null
          task_content: string
          task_id: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          index?: number
          list_id: string
          target_date?: string | null
          task_content: string
          task_id?: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          index?: number
          list_id?: string
          target_date?: string | null
          task_content?: string
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["list_id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string
          deleted: boolean | null
          deleted_at: string | null
          notification_id: string
          read: boolean | null
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted?: boolean | null
          deleted_at?: string | null
          notification_id: string
          read?: boolean | null
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          deleted?: boolean | null
          deleted_at?: string | null
          notification_id?: string
          read?: boolean | null
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_private: {
        Row: {
          active_widgets: Json | null
          created_at: string
          dashboard_layout: Json | null
          initial_guide_show: boolean
          initial_username_prompt_shown: boolean
          preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_widgets?: Json | null
          created_at?: string
          dashboard_layout?: Json | null
          initial_guide_show?: boolean
          initial_username_prompt_shown?: boolean
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          active_widgets?: Json | null
          created_at?: string
          dashboard_layout?: Json | null
          initial_guide_show?: boolean
          initial_username_prompt_shown?: boolean
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_private_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_private_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_widget_instances: {
        Row: {
          created_at: string
          id: string
          is_installed: boolean
          layout_lg: Json | null
          layout_md: Json | null
          layout_xs: Json | null
          predefined_widget_id: string | null
          updated_at: string
          user_id: string
          user_widget_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_installed?: boolean
          layout_lg?: Json | null
          layout_md?: Json | null
          layout_xs?: Json | null
          predefined_widget_id?: string | null
          updated_at?: string
          user_id: string
          user_widget_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_installed?: boolean
          layout_lg?: Json | null
          layout_md?: Json | null
          layout_xs?: Json | null
          predefined_widget_id?: string | null
          updated_at?: string
          user_id?: string
          user_widget_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_widget_instances_predefined_widget_id_fkey"
            columns: ["predefined_widget_id"]
            isOneToOne: false
            referencedRelation: "predefined_widgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_widget_instances_user_widget_id_fkey"
            columns: ["user_widget_id"]
            isOneToOne: false
            referencedRelation: "user_widgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uwi_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "uwi_user_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_widgets: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_active: boolean
          is_public: boolean
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          moderation_status: Database["public"]["Enums"]["widget_moderation_status"]
          title: string
          updated_at: string
          url: string | null
          user_id: string
          widget_type: Database["public"]["Enums"]["widgets_types"]
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_public?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: Database["public"]["Enums"]["widget_moderation_status"]
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
          widget_type?: Database["public"]["Enums"]["widgets_types"]
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_public?: boolean
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: Database["public"]["Enums"]["widget_moderation_status"]
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
          widget_type?: Database["public"]["Enums"]["widgets_types"]
        }
        Relationships: [
          {
            foreignKeyName: "user_widgets_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_widgets_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_widgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_widgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      username_history: {
        Row: {
          changed_at: string
          id: string
          new_username: string
          old_username: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string
          id?: string
          new_username: string
          old_username?: string | null
          user_id?: string
        }
        Update: {
          changed_at?: string
          id?: string
          new_username?: string
          old_username?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usernames_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_dashboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "usernames_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          biography: string | null
          created_at: string
          display_name: string
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          biography?: string | null
          created_at?: string
          display_name: string
          updated_at?: string | null
          user_id?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          biography?: string | null
          created_at?: string
          display_name?: string
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_dashboard_view: {
        Row: {
          completed_tasks: number | null
          due_today_tasks: Json | null
          overdue_tasks: number | null
          pending_tasks: number | null
          total_tasks: number | null
          upcoming_tasks: Json | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_new_rank: { Args: { owner_id_param: string }; Returns: string }
      cancel_list_invitation: {
        Args: { p_invitation_id: string }
        Returns: undefined
      }
      ch_edit_or_insert_task: { Args: { p_list_id: string }; Returns: boolean }
      ch_is_list_admin: { Args: { p_list_id: string }; Returns: boolean }
      ch_is_list_member: { Args: { p_list_id: string }; Returns: boolean }
      ch_is_list_owner: { Args: { p_list_id: string }; Returns: boolean }
      compare_ranks: { Args: { rank1: string; rank2: string }; Returns: string }
      create_embedded_widget: {
        Args: { p_config?: Json; p_title: string; p_url: string }
        Returns: Json
      }
      create_list_and_owner_membership: {
        Args: {
          p_color: string
          p_icon: string
          p_index: number
          p_list_id: string
          p_list_name: string
          p_rank: string
        }
        Returns: undefined
      }
      create_list_invitation_by_username: {
        Args: { p_invited_username: string; p_list_id: string }
        Returns: Json
      }
      delete_folder_with_lists: { Args: { p_folder_id: string }; Returns: Json }
      delete_notification: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      get_dashboard_widgets: {
        Args: never
        Returns: {
          instance_id: string
          is_installed: boolean
          layout_lg: Json
          layout_md: Json
          layout_xs: Json
          pw_category: string
          pw_description: string
          pw_is_resizable: boolean
          pw_name: string
          pw_tier_required: Database["public"]["Enums"]["subscription_tier"]
          uw_config: Json
          uw_is_public: boolean
          uw_moderation_status: Database["public"]["Enums"]["widget_moderation_status"]
          uw_title: string
          uw_url: string
          widget_key: string
          widget_source: string
        }[]
      }
      get_initial_data: { Args: { p_user_id: string }; Returns: Json }
      get_list_members_users: {
        Args: { p_list_id: string }
        Returns: {
          avatar_url: string
          display_name: string
          role: string
          shared_since: string
          user_id: string
          username: string
        }[]
      }
      get_list_pending_invitations: {
        Args: { p_list_id: string }
        Returns: {
          created_at: string
          expires_at: string
          invitation_id: string
          invited_avatar_url: string
          invited_display_name: string
          invited_user_id: string
          invited_username: string
          inviter_display_name: string
          inviter_user_id: string
          list_id: string
          list_name: string
          status: string
        }[]
      }
      get_my_notifications: {
        Args: never
        Returns: {
          content: string
          created_at: string
          deleted: boolean
          deleted_at: string
          is_global: boolean
          metadata: Json
          notification_id: string
          read: boolean
          read_at: string
          title: string
          type: string
        }[]
      }
      get_my_pending_notifications: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          invitation_id: string
          invited_user_id: string
          inviter_user_id: string
          list_id: string
          list_name: string
          status: Database["public"]["Enums"]["status_shared_types"]
          username: string
        }[]
      }
      get_paginated_sidebar: {
        Args: { p_offset: number; p_page_limit: number; p_user_id: string }
        Returns: {
          item_id: string
          item_rank: string
          item_type: string
          payload: Json
        }[]
      }
      get_predefined_widgets_catalog: {
        Args: never
        Returns: {
          category: string
          created_at: string
          default_layout_lg: Json | null
          default_layout_md: Json | null
          default_layout_xs: Json | null
          description: string | null
          id: string
          is_active: boolean
          is_resizable: boolean
          name: string
          sort_order: number
          tier_required: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "predefined_widgets"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_setting_int: { Args: { p_setting: string }; Returns: number }
      get_upcoming_tasks: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          list_id: string
          target_date: string
          task_content: string
          task_id: string
        }[]
      }
      get_user_dashboard: {
        Args: { p_user_id: string }
        Returns: {
          completed_tasks: number
          due_today_tasks: Json
          overdue_tasks: number
          pending_tasks: number
          total_tasks: number
          upcoming_tasks: Json
          user_id: string
        }[]
      }
      get_user_stats: {
        Args: { p_user_id: string }
        Returns: {
          completed_tasks: number
          overdue_tasks: number
          pending_tasks: number
          total_tasks: number
          user_id: string
        }[]
      }
      get_user_tier: {
        Args: { p_user_id: string }
        Returns: Database["public"]["Enums"]["subscription_tier"]
      }
      get_widget_limits: { Args: never; Returns: Json }
      increment_rank: { Args: { input_rank: string }; Returns: string }
      install_widget: {
        Args: {
          p_layout_lg?: Json
          p_layout_md?: Json
          p_layout_xs?: Json
          p_predefined_id?: string
          p_user_widget_id?: string
        }
        Returns: Json
      }
      lexorank_gen_next: { Args: { p_rank: string }; Returns: string }
      load_dashboard_full: { Args: never; Returns: Json }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: undefined
      }
      remove_list_member: {
        Args: { p_list_id: string; p_target_user_id: string }
        Returns: undefined
      }
      save_widget_layouts: { Args: { p_layouts: Json }; Returns: undefined }
      search_users_input: {
        Args: { p_exclude_user?: string; p_search_term: string }
        Returns: {
          avatar_url: string
          display_name: string
          user_id: string
          username: string
        }[]
      }
      set_username_first_time: {
        Args: { p_username: string }
        Returns: undefined
      }
      uninstall_widget: {
        Args: { p_predefined_id?: string; p_user_widget_id?: string }
        Returns: undefined
      }
      update_list_member_role: {
        Args: {
          p_list_id: string
          p_new_role: string
          p_target_user_id: string
        }
        Returns: undefined
      }
      upsert_widget_instances: {
        Args: { p_instances: Json }
        Returns: undefined
      }
    }
    Enums: {
      app_update_category:
        | "new_feature"
        | "improvement"
        | "bug_fix"
        | "announcement"
      notification_type: "list_invitation" | "app_update" | "system"
      roles_types: "admin" | "editor" | "reader" | "owner"
      status_shared_types: "pending" | "accepted" | "rejected"
      subscription_status:
        | "active"
        | "canceled"
        | "past_due"
        | "trialing"
        | "incomplete"
      subscription_tier: "free" | "student" | "pro"
      widget_moderation_status:
        | "pending"
        | "approved"
        | "rejected"
        | "auto_approved"
      widgets_types: "predefined" | "embedded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_update_category: [
        "new_feature",
        "improvement",
        "bug_fix",
        "announcement",
      ],
      notification_type: ["list_invitation", "app_update", "system"],
      roles_types: ["admin", "editor", "reader", "owner"],
      status_shared_types: ["pending", "accepted", "rejected"],
      subscription_status: [
        "active",
        "canceled",
        "past_due",
        "trialing",
        "incomplete",
      ],
      subscription_tier: ["free", "student", "pro"],
      widget_moderation_status: [
        "pending",
        "approved",
        "rejected",
        "auto_approved",
      ],
      widgets_types: ["predefined", "embedded"],
    },
  },
} as const


export type MembershipRow =
  Database["public"]["Tables"]["list_memberships"]["Row"];
export type ListsRow = Database["public"]["Tables"]["lists"]["Row"];

export type TaskCountPayload = [{ count: number }];

export type MembershipCountPayload = [{ count: number }];

export type ListsType = MembershipRow & {
  list: ListsRow & { tasks?: TaskCountPayload };
};

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
  subscriptions?: Database["public"]["Tables"]["subscriptions"]["Row"][]; 
  tier?: Database["public"]["Enums"]["subscription_tier"]; 
};

export type InvitationRow =
  Database["public"]["Tables"]["list_invitations"]["Row"];

export type FolderType = Database["public"]["Tables"]["list_folders"]["Row"] & {
  memberships?: MembershipCountPayload;
};

export type AppUpdatesType = Database["public"]["Tables"]["app_updates"]["Row"];

export type UserWidgetRow = Database["public"]["Tables"]["user_widgets"]["Row"];

export type EmbeddedWidgetConfig = {
  url?: string;
  allowFullscreen?: boolean;
};

export type DashboardData = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  upcoming_tasks: TaskType[];
  due_today_tasks: TaskType[];
};

export type StatsData = {
  total_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
};