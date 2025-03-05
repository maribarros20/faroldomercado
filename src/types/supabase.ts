
// Supabase Auth admin API response types
export interface AdminUserResponse {
  id: string;
  aud: string;
  role: string;
  email?: string;
  email_confirmed_at?: string;
  phone?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
  user_metadata: Record<string, any>;
  identities?: Array<Record<string, any>>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithPlan {
  id: string;
  user_id: string;
  plan_id: string;
  is_active: boolean;
  started_at: string;
  expires_at: string | null;
  payment_type: string | null;
  plans: {
    id: string;
    name: string;
    monthly_price: number | null;
    yearly_price: number | null;
    description: string;
  };
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email?: string;
    company: string | null;
  };
}

export interface Subscriber {
  id: string;
  email?: string;
  name?: string;
  subscription?: SubscriptionWithPlan;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    company: string | null;
  };
}

// User activity tracking types
export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'read_material' | 'watch_video' | 'complete_quiz' | 'post_community';
  content_id: string;
  created_at: string;
  duration_seconds?: number;
  progress_percentage?: number;
  metadata?: Record<string, any>;
}

export interface UserProgressStats {
  materialsCompleted: number;
  videosWatched: number;
  quizzesTaken: number;
  totalTimeSpent: number; // in minutes
  averageScore: number;
  streak: number;
  lastActive: string;
  progress: {
    materials: number;
    videos: number;
    overall: number;
  };
}

// Community types
export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  channel_id: string;
  author: {
    first_name: string | null;
    last_name: string | null;
    company: string | null;
  };
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: {
    first_name: string | null;
    last_name: string | null;
  };
}

export interface CommunityChannel {
  id: string;
  name: string;
  description: string;
  is_company_specific: boolean;
  company_id: string | null;
  created_at: string;
  post_count: number;
}
