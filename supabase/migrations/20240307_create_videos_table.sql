
-- Criação da tabela de vídeos
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL CHECK (source IN ('youtube', 'vimeo', 'storage')),
  url TEXT NOT NULL,
  thumbnail TEXT,
  category TEXT NOT NULL,
  learning_path TEXT NOT NULL,
  duration TEXT,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT now(),
  views INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Create policies for videos
CREATE POLICY "Users can view videos" 
ON public.videos
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert videos" 
ON public.videos
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update videos" 
ON public.videos
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Only admins can delete videos" 
ON public.videos
FOR DELETE
USING (public.is_admin());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_videos_category ON public.videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_learning_path ON public.videos(learning_path);
CREATE INDEX IF NOT EXISTS idx_videos_date_added ON public.videos(date_added);
