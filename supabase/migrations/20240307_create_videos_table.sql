
-- Criação da tabela de vídeos
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL CHECK (source IN ('youtube', 'vimeo', 'storage')),
  url TEXT NOT NULL,
  thumbnail TEXT,
  category TEXT NOT NULL,
  duration TEXT,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT now(),
  views INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE,
  navigation_id UUID REFERENCES public.knowledge_navigation(id),
  format_id UUID REFERENCES public.material_formats(id),
  themes JSONB DEFAULT '[]'::jsonb
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
CREATE INDEX IF NOT EXISTS idx_videos_date_added ON public.videos(date_added);
CREATE INDEX IF NOT EXISTS idx_videos_navigation_id ON public.videos(navigation_id);
CREATE INDEX IF NOT EXISTS idx_videos_format_id ON public.videos(format_id);

-- Tabela de relação entre vídeos e temas
CREATE TABLE IF NOT EXISTS public.video_theme_relations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES public.material_themes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(video_id, theme_id)
);

-- Enable RLS
ALTER TABLE public.video_theme_relations ENABLE ROW LEVEL SECURITY;

-- Create policies for video_theme_relations
CREATE POLICY "Users can view video theme relations" 
ON public.video_theme_relations
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert video theme relations" 
ON public.video_theme_relations
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update video theme relations" 
ON public.video_theme_relations
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Only admins can delete video theme relations" 
ON public.video_theme_relations
FOR DELETE
USING (public.is_admin());
