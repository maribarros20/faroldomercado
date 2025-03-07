
-- Create a table to store user progress on materials
CREATE TABLE public.user_material_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  material_id UUID NOT NULL REFERENCES public.materials,
  navigation_id UUID REFERENCES public.knowledge_navigation,
  progress_percentage INT NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  UNIQUE(user_id, material_id)
);

-- Add Row Level Security
ALTER TABLE public.user_material_progress ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own progress
CREATE POLICY "Users can view their own progress" 
  ON public.user_material_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own progress
CREATE POLICY "Users can insert their own progress" 
  ON public.user_material_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own progress
CREATE POLICY "Users can update their own progress" 
  ON public.user_material_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to get in-progress materials for a user
CREATE OR REPLACE FUNCTION public.get_user_in_progress_materials(user_uuid UUID)
RETURNS SETOF public.materials
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.*
  FROM materials m
  JOIN user_material_progress p ON m.id = p.material_id
  WHERE p.user_id = user_uuid 
    AND p.progress_percentage > 0 
    AND p.is_completed = false;
$$;

-- Function to get completed materials for a user
CREATE OR REPLACE FUNCTION public.get_user_completed_materials(user_uuid UUID)
RETURNS SETOF public.materials
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.*
  FROM materials m
  JOIN user_material_progress p ON m.id = p.material_id
  WHERE p.user_id = user_uuid AND p.is_completed = true;
$$;

-- Calculate progress for a knowledge navigation path
CREATE OR REPLACE FUNCTION public.get_navigation_progress(user_uuid UUID, nav_id UUID)
RETURNS TABLE(
  total_materials INT,
  completed_materials INT,
  in_progress_materials INT,
  progress_percentage INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total INT;
  completed INT;
  in_progress INT;
  percentage INT;
BEGIN
  -- Count total materials in this navigation
  SELECT COUNT(*) INTO total
  FROM materials WHERE navigation_id = nav_id;
  
  -- Count completed materials
  SELECT COUNT(*) INTO completed
  FROM user_material_progress 
  WHERE user_id = user_uuid 
    AND navigation_id = nav_id
    AND is_completed = true;
  
  -- Count in-progress materials
  SELECT COUNT(*) INTO in_progress
  FROM user_material_progress 
  WHERE user_id = user_uuid 
    AND navigation_id = nav_id
    AND is_completed = false
    AND progress_percentage > 0;
  
  -- Calculate percentage (avoid division by zero)
  IF total > 0 THEN
    percentage := (completed * 100) / total;
  ELSE
    percentage := 0;
  END IF;
  
  RETURN QUERY SELECT total, completed, in_progress, percentage;
END;
$$;
