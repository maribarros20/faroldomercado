
-- Function to increment video views
CREATE OR REPLACE FUNCTION public.increment_video_views(video_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.videos
  SET views = views + 1
  WHERE id = video_id;
  
  RETURN FOUND;
EXCEPTION
  WHEN others THEN
    RETURN FALSE;
END;
$$;
