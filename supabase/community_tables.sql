
-- Create channels table for community discussions
CREATE TABLE IF NOT EXISTS public.community_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_company_specific BOOLEAN DEFAULT FALSE,
  company_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create posts table for community discussions
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.community_channels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create comments table for community posts
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create table for post likes
CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT like_target_check CHECK (
    (post_id IS NULL AND comment_id IS NOT NULL) OR
    (post_id IS NOT NULL AND comment_id IS NULL)
  )
);

-- Add RLS policies to all tables
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

-- Channels policies
CREATE POLICY "Anyone can view channels" 
ON public.community_channels 
FOR SELECT USING (true);

CREATE POLICY "Only admins can create channels" 
ON public.community_channels 
FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can update channels" 
ON public.community_channels 
FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only admins can delete channels" 
ON public.community_channels 
FOR DELETE USING (get_user_role(auth.uid()) = 'admin');

-- Posts policies
CREATE POLICY "Anyone can view posts" 
ON public.community_posts 
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" 
ON public.community_posts 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own posts" 
ON public.community_posts 
FOR UPDATE USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can delete their own posts" 
ON public.community_posts 
FOR DELETE USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'admin');

-- Comments policies
CREATE POLICY "Anyone can view comments" 
ON public.community_comments 
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" 
ON public.community_comments 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own comments" 
ON public.community_comments 
FOR UPDATE USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can delete their own comments" 
ON public.community_comments 
FOR DELETE USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'admin');

-- Likes policies
CREATE POLICY "Anyone can view likes" 
ON public.community_likes 
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create likes" 
ON public.community_likes 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.community_likes 
FOR DELETE USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'admin');

-- Create indexes
CREATE INDEX community_posts_channel_id_idx ON public.community_posts(channel_id);
CREATE INDEX community_posts_user_id_idx ON public.community_posts(user_id);
CREATE INDEX community_comments_post_id_idx ON public.community_comments(post_id);
CREATE INDEX community_likes_post_id_idx ON public.community_likes(post_id);
CREATE INDEX community_likes_comment_id_idx ON public.community_likes(comment_id);
