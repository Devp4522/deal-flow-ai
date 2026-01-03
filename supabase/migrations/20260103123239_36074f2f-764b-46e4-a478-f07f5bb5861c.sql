-- Create negotiations table
CREATE TABLE public.negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company JSONB NOT NULL DEFAULT '{}',
  current_revision INT NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft', 'pending_approval', 'approved', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create negotiation_revisions table
CREATE TABLE public.negotiation_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id UUID NOT NULL REFERENCES public.negotiations(id) ON DELETE CASCADE,
  revision INT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}',
  results JSONB DEFAULT NULL,
  risk_flags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(negotiation_id, revision)
);

-- Create negotiation_approvals table
CREATE TABLE public.negotiation_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id UUID NOT NULL REFERENCES public.negotiations(id) ON DELETE CASCADE,
  revision INT NOT NULL,
  user_id UUID NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create negotiation_audit table
CREATE TABLE public.negotiation_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id UUID NOT NULL REFERENCES public.negotiations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create negotiation_usage table for tracking
CREATE TABLE public.negotiation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  usage_count INT NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiation_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiation_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiation_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiation_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for negotiations
CREATE POLICY "Users can view their own negotiations" ON public.negotiations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own negotiations" ON public.negotiations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own negotiations" ON public.negotiations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own negotiations" ON public.negotiations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for negotiation_revisions
CREATE POLICY "Users can view revisions of their negotiations" ON public.negotiation_revisions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.negotiations WHERE id = negotiation_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create revisions for their negotiations" ON public.negotiation_revisions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.negotiations WHERE id = negotiation_id AND user_id = auth.uid())
  );

-- RLS policies for negotiation_approvals
CREATE POLICY "Users can view approvals of their negotiations" ON public.negotiation_approvals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.negotiations WHERE id = negotiation_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create approvals for their negotiations" ON public.negotiation_approvals
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.negotiations WHERE id = negotiation_id AND user_id = auth.uid())
  );

-- RLS policies for negotiation_audit
CREATE POLICY "Users can view audit of their negotiations" ON public.negotiation_audit
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.negotiations WHERE id = negotiation_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create audit entries for their negotiations" ON public.negotiation_audit
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.negotiations WHERE id = negotiation_id AND user_id = auth.uid())
  );

-- RLS policies for negotiation_usage
CREATE POLICY "Users can view their own usage" ON public.negotiation_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON public.negotiation_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON public.negotiation_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for updated_at on negotiations
CREATE TRIGGER update_negotiations_updated_at
  BEFORE UPDATE ON public.negotiations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on negotiation_usage
CREATE TRIGGER update_negotiation_usage_updated_at
  BEFORE UPDATE ON public.negotiation_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_negotiations_user_id ON public.negotiations(user_id);
CREATE INDEX idx_negotiation_revisions_negotiation_id ON public.negotiation_revisions(negotiation_id);
CREATE INDEX idx_negotiation_approvals_negotiation_id ON public.negotiation_approvals(negotiation_id);
CREATE INDEX idx_negotiation_audit_negotiation_id ON public.negotiation_audit(negotiation_id);