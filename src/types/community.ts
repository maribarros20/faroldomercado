export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  photo?: string | null;
  role: string;
  username?: string | null;
  phone?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  date_of_birth: string;
};

export type Post = {
  id: string;
  channel_id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  user?: Profile;
  user_has_liked?: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  user?: Profile;
  user_has_liked?: boolean;
};

export type Channel = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  is_company_specific: boolean;
  company_id: string | null;
};
