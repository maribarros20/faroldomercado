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
          mentor_id: string | null
          name: string
          owner_id: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_company_specific?: boolean
          mentor_id?: string | null
          name: string
          owner_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_company_specific?: boolean
          mentor_id?: string | null
          name?: string
          owner_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_channels_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
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
      knowledge_navigation: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      market_indices: {
        Row: {
          change_value: string | null
          chart: string[] | null
          created_at: string | null
          id: string
          key: string
          name: string
          parameter: string | null
          time_data: string | null
          updated_at: string | null
          value: string
        }
        Insert: {
          change_value?: string | null
          chart?: string[] | null
          created_at?: string | null
          id?: string
          key: string
          name: string
          parameter?: string | null
          time_data?: string | null
          updated_at?: string | null
          value: string
        }
        Update: {
          change_value?: string | null
          chart?: string[] | null
          created_at?: string | null
          id?: string
          key?: string
          name?: string
          parameter?: string | null
          time_data?: string | null
          updated_at?: string | null
          value?: string
        }
        Relationships: []
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
          source_url: string | null
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
          source_url?: string | null
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
          source_url?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      material_categories: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      material_formats: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      material_likes: {
        Row: {
          created_at: string
          id: string
          material_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_likes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      material_theme_relations: {
        Row: {
          created_at: string
          id: string
          material_id: string
          theme_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          theme_id: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_theme_relations_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_theme_relations_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "material_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      material_themes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
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
          format_id: string | null
          id: string
          likes_count: number | null
          mentor_id: string | null
          navigation_id: string | null
          owner_id: string | null
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
          format_id?: string | null
          id?: string
          likes_count?: number | null
          mentor_id?: string | null
          navigation_id?: string | null
          owner_id?: string | null
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
          format_id?: string | null
          id?: string
          likes_count?: number | null
          mentor_id?: string | null
          navigation_id?: string | null
          owner_id?: string | null
          plan_id?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "material_formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_navigation_id_fkey"
            columns: ["navigation_id"]
            isOneToOne: false
            referencedRelation: "knowledge_navigation"
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
          can_create_content: boolean | null
          can_create_plans: boolean | null
          can_manage_students: boolean | null
          cnpj: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          photo: string | null
        }
        Insert: {
          can_create_content?: boolean | null
          can_create_plans?: boolean | null
          can_manage_students?: boolean | null
          cnpj: string
          created_at?: string
          email: string
          id?: string
          name: string
          phone: string
          photo?: string | null
        }
        Update: {
          can_create_content?: boolean | null
          can_create_plans?: boolean | null
          can_manage_students?: boolean | null
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
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          user_id?: string
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
          is_mentor_plan: boolean | null
          is_popular: boolean | null
          mentor_id: string | null
          monthly_price: number | null
          name: string
          requires_payment: boolean | null
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
          is_mentor_plan?: boolean | null
          is_popular?: boolean | null
          mentor_id?: string | null
          monthly_price?: number | null
          name: string
          requires_payment?: boolean | null
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
          is_mentor_plan?: boolean | null
          is_popular?: boolean | null
          mentor_id?: string | null
          monthly_price?: number | null
          name?: string
          requires_payment?: boolean | null
          trial_days?: number
          updated_at?: string | null
          yearly_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plans_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
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
          contrato_expiracao_data: string | null
          cpf: string | null
          date_of_birth: string
          email: string
          first_name: string
          id: string
          last_name: string
          mentor_id: string | null
          mentor_link_id: string | null
          owner_id: string | null
          phone: string | null
          photo: string | null
          plan_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          tipo_de_conta: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          cnpj?: string | null
          contrato_expiracao_data?: string | null
          cpf?: string | null
          date_of_birth: string
          email: string
          first_name: string
          id: string
          last_name: string
          mentor_id?: string | null
          mentor_link_id?: string | null
          owner_id?: string | null
          phone?: string | null
          photo?: string | null
          plan_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tipo_de_conta?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          cnpj?: string | null
          contrato_expiracao_data?: string | null
          cpf?: string | null
          date_of_birth?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          mentor_id?: string | null
          mentor_link_id?: string | null
          owner_id?: string | null
          phone?: string | null
          photo?: string | null
          plan_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tipo_de_conta?: string | null
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
            foreignKeyName: "profiles_mentor_link_id_fkey"
            columns: ["mentor_link_id"]
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
      user_material_progress: {
        Row: {
          completed_at: string | null
          id: string
          is_completed: boolean
          last_accessed_at: string
          material_id: string
          metadata: Json | null
          navigation_id: string | null
          progress_percentage: number
          started_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean
          last_accessed_at?: string
          material_id: string
          metadata?: Json | null
          navigation_id?: string | null
          progress_percentage?: number
          started_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean
          last_accessed_at?: string
          material_id?: string
          metadata?: Json | null
          navigation_id?: string | null
          progress_percentage?: number
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_material_progress_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_material_progress_navigation_id_fkey"
            columns: ["navigation_id"]
            isOneToOne: false
            referencedRelation: "knowledge_navigation"
            referencedColumns: ["id"]
          },
        ]
      }
      users_alerts_seen: {
        Row: {
          alert_message: string
          alert_type: string
          id: string
          seen_at: string | null
          ticker: string
          user_id: string
        }
        Insert: {
          alert_message: string
          alert_type: string
          id?: string
          seen_at?: string | null
          ticker: string
          user_id: string
        }
        Update: {
          alert_message?: string
          alert_type?: string
          id?: string
          seen_at?: string | null
          ticker?: string
          user_id?: string
        }
        Relationships: []
      }
      users_favorites: {
        Row: {
          created_at: string | null
          exchange: string | null
          id: string
          name: string
          ticker: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          exchange?: string | null
          id?: string
          name: string
          ticker: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          exchange?: string | null
          id?: string
          name?: string
          ticker?: string
          user_id?: string
        }
        Relationships: []
      }
      video_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          user_id: string | null
          video_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          user_id?: string | null
          video_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          user_id?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_comments_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_likes: {
        Row: {
          created_at: string | null
          id: string
          user_id: string | null
          video_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id?: string | null
          video_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_theme_relations: {
        Row: {
          created_at: string
          id: string
          theme_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          theme_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          theme_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_theme_relations_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "material_themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_theme_relations_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
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
          format_id: string | null
          id: string
          likes: number | null
          navigation_id: string | null
          owner_id: string | null
          source: string
          themes: Json | null
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
          format_id?: string | null
          id?: string
          likes?: number | null
          navigation_id?: string | null
          owner_id?: string | null
          source: string
          themes?: Json | null
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
          format_id?: string | null
          id?: string
          likes?: number | null
          navigation_id?: string | null
          owner_id?: string | null
          source?: string
          themes?: Json | null
          thumbnail?: string | null
          title?: string
          updated_at?: string | null
          url?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_format_id_fkey"
            columns: ["format_id"]
            isOneToOne: false
            referencedRelation: "material_formats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_navigation_id_fkey"
            columns: ["navigation_id"]
            isOneToOne: false
            referencedRelation: "knowledge_navigation"
            referencedColumns: ["id"]
          },
        ]
      }
      vix_data: {
        Row: {
          chart_data: string[] | null
          closing_change: string | null
          closing_time_data: string | null
          closing_value: string | null
          created_at: string | null
          curr_change: string
          curr_change_parameter: string | null
          curr_time: string | null
          curr_value: string
          curr_value_parameter: string | null
          id: string
          opening_change: string | null
          opening_change_parameter: string | null
          opening_time_data: string | null
          opening_value: string | null
          tendency_parameter: string | null
          tendency_time_data: string | null
          updated_at: string | null
        }
        Insert: {
          chart_data?: string[] | null
          closing_change?: string | null
          closing_time_data?: string | null
          closing_value?: string | null
          created_at?: string | null
          curr_change: string
          curr_change_parameter?: string | null
          curr_time?: string | null
          curr_value: string
          curr_value_parameter?: string | null
          id?: string
          opening_change?: string | null
          opening_change_parameter?: string | null
          opening_time_data?: string | null
          opening_value?: string | null
          tendency_parameter?: string | null
          tendency_time_data?: string | null
          updated_at?: string | null
        }
        Update: {
          chart_data?: string[] | null
          closing_change?: string | null
          closing_time_data?: string | null
          closing_value?: string | null
          created_at?: string | null
          curr_change?: string
          curr_change_parameter?: string | null
          curr_time?: string | null
          curr_value?: string
          curr_value_parameter?: string | null
          id?: string
          opening_change?: string | null
          opening_change_parameter?: string | null
          opening_time_data?: string | null
          opening_value?: string | null
          tendency_parameter?: string | null
          tendency_time_data?: string | null
          updated_at?: string | null
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
      decrement: {
        Args: {
          row_id: string
          table_name: string
          column_name: string
        }
        Returns: number
      }
      get_navigation_progress: {
        Args: {
          user_uuid: string
          nav_id: string
        }
        Returns: {
          total_materials: number
          completed_materials: number
          in_progress_materials: number
          progress_percentage: number
        }[]
      }
      get_user_completed_materials: {
        Args: {
          user_uuid: string
        }
        Returns: {
          category: string
          created_by: string | null
          date_added: string | null
          description: string | null
          downloads: number | null
          file_url: string | null
          format_id: string | null
          id: string
          likes_count: number | null
          mentor_id: string | null
          navigation_id: string | null
          owner_id: string | null
          plan_id: string | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
        }[]
      }
      get_user_in_progress_materials: {
        Args: {
          user_uuid: string
        }
        Returns: {
          category: string
          created_by: string | null
          date_added: string | null
          description: string | null
          downloads: number | null
          file_url: string | null
          format_id: string | null
          id: string
          likes_count: number | null
          mentor_id: string | null
          navigation_id: string | null
          owner_id: string | null
          plan_id: string | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
        }[]
      }
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      increment: {
        Args: {
          row_id: string
          table_name: string
          column_name: string
        }
        Returns: number
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
