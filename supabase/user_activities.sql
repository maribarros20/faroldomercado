
-- Create user_activities table to track user activity
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  duration_seconds INTEGER,
  progress_percentage INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Users can select their own activities
CREATE POLICY "Users can view their own activities" 
ON public.user_activities 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own activities
CREATE POLICY "Users can track their own activities" 
ON public.user_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Only admin can update activities
CREATE POLICY "Only admins can update activities" 
ON public.user_activities 
FOR UPDATE
USING (get_user_role(auth.uid()) = 'admin');

-- Create indexes for better performance
CREATE INDEX user_activities_user_id_idx ON public.user_activities(user_id);
CREATE INDEX user_activities_content_id_idx ON public.user_activities(content_id);
CREATE INDEX user_activities_activity_type_idx ON public.user_activities(activity_type);
