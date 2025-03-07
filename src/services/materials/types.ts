
export interface Material {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  thumbnail_url: string | null;
  file_url: string | null;
  date_added: string | null;
  updated_at: string | null;
  downloads: number | null;
  likes_count: number | null;
  is_liked_by_user: boolean;
  created_by: string | null;
  navigation_id: string | null;
  format_id: string | null;
  themes?: MaterialTheme[];
  icon?: string;
}

export interface MaterialCategory {
  id: string;
  name: string;
  created_at: string;
  created_by: string | null;
}

export interface KnowledgeNavigation {
  id: string;
  name: string;
  created_at: string;
  created_by: string | null;
}

export interface MaterialFormat {
  id: string;
  name: string;
  created_at: string;
  created_by: string | null;
}

export interface MaterialTheme {
  id: string;
  name: string;
  created_at: string;
  created_by: string | null;
}

export interface MaterialLike {
  id: string;
  material_id: string;
  user_id: string;
  created_at: string;
}
