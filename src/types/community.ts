
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
  date_of_birth: string;
  mentor_id?: string | null;
  cnpj?: string | null;
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
  user?: Profile | null;
  user_has_liked?: boolean;
  comments?: Comment[];
};

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  user?: Profile | null;
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
  mentor_id?: string | null;
  mentor_name?: string | null;
};
