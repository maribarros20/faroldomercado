export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      community_channels: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_company_specific: boolean
          name: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_company_specific?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_company_specific?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          channel_id: string
          comments_count: number
          content: string
          created_at: string
          id: string
          likes_count: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "community_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_iframes: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          iframe_url: string
          is_active: boolean | null
          mentor_id: string | null
          plan_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          iframe_url: string
          is_active?: boolean | null
          mentor_id?: string | null
          plan_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          iframe_url?: string
          is_active?: boolean | null
          mentor_id?: string | null
          plan_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "finance_iframes_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_iframes_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      market_news: {
        Row: {
          author: string | null
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string | null
          publication_date: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          publication_date?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          publication_date?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      materials: {
        Row: {
          category: string
          created_by: string | null
          date_added: string | null
          description: string | null
          downloads: number | null
          file_url: string | null
          id: string
          mentor_id: string | null
          plan_id: string | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_by?: string | null
          date_added?: string | null
          description?: string | null
          downloads?: number | null
          file_url?: string | null
          id?: string
          mentor_id?: string | null
          plan_id?: string | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_by?: string | null
          date_added?: string | null
          description?: string | null
          downloads?: number | null
          file_url?: string | null
          id?: string
          mentor_id?: string | null
          plan_id?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          cnpj: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          photo: string | null
        }
        Insert: {
          cnpj: string
          created_at?: string
          email: string
          id?: string
          name: string
          phone: string
          photo?: string | null
        }
        Update: {
          cnpj?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          photo?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      plan_features: {
        Row: {
          created_at: string | null
          id: string
          is_included: boolean | null
          plan_id: string
          text: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_included?: boolean | null
          plan_id: string
          text: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_included?: boolean | null
          plan_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_features_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string | null
          description: string
          duration_days: number
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          monthly_price: number | null
          name: string
          trial_days: number
          updated_at: string | null
          yearly_price: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          duration_days?: number
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          monthly_price?: number | null
          name: string
          trial_days?: number
          updated_at?: string | null
          yearly_price?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          duration_days?: number
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          monthly_price?: number | null
          name?: string
          trial_days?: number
          updated_at?: string | null
          yearly_price?: number | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cnpj: string | null
          cpf: string | null
          date_of_birth: string
          email: string
          first_name: string
          id: string
          last_name: string
          mentor_id: string | null
          phone: string | null
          photo: string | null
          plan_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          username: string | null
        }
        Insert: {
          cnpj?: string | null
          cpf?: string | null
          date_of_birth: string
          email: string
          first_name: string
          id: string
          last_name: string
          mentor_id?: string | null
          phone?: string | null
          photo?: string | null
          plan_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          cnpj?: string | null
          cpf?: string | null
          date_of_birth?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          mentor_id?: string | null
          phone?: string | null
          photo?: string | null
          plan_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_canceled: boolean | null
          payment_method_id: string
          plan_id: string
          started_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_canceled?: boolean | null
          payment_method_id: string
          plan_id: string
          started_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          canceled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_canceled?: boolean | null
          payment_method_id?: string
          plan_id?: string
          started_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_type: string
          badge_icon: string | null
          created_at: string
          description: string
          id: string
          points: number
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          badge_icon?: string | null
          created_at?: string
          description: string
          id?: string
          points?: number
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          badge_icon?: string | null
          created_at?: string
          description?: string
          id?: string
          points?: number
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          content_id: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          metadata: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type: string
          content_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          content_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_likes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          category: string
          created_by: string | null
          date_added: string | null
          description: string | null
          duration: string | null
          id: string
          learning_path: string
          source: string
          thumbnail: string | null
          title: string
          updated_at: string | null
          url: string
          views: number | null
        }
        Insert: {
          category: string
          created_by?: string | null
          date_added?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          learning_path: string
          source: string
          thumbnail?: string | null
          title: string
          updated_at?: string | null
          url: string
          views?: number | null
        }
        Update: {
          category?: string
          created_by?: string | null
          date_added?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          learning_path?: string
          source?: string
          thumbnail?: string | null
          title?: string
          updated_at?: string | null
          url?: string
          views?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      user_activity_stats: {
        Row: {
          achievements_count: number | null
          active_days: number | null
          comments_made: number | null
          last_activity: string | null
          login_count: number | null
          materials_read: number | null
          quizzes_completed: number | null
          total_watch_time_seconds: number | null
          user_id: string | null
          videos_watched: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      increment_video_views: {
        Args: {
          video_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      payment_type_enum:
        | "sem_pagamento"
        | "cartao_credito_vista"
        | "cartao_credito_parcelado"
        | "pix"
        | "boleto"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
