-- Create table to track research usage per user
CREATE TABLE public.user_research_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_research_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users can view their own usage"
ON public.user_research_usage
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own usage record
CREATE POLICY "Users can insert their own usage"
ON public.user_research_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own usage
CREATE POLICY "Users can update their own usage"
ON public.user_research_usage
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index on user_id
CREATE INDEX idx_user_research_usage_user_id ON public.user_research_usage(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_research_usage_updated_at
BEFORE UPDATE ON public.user_research_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();