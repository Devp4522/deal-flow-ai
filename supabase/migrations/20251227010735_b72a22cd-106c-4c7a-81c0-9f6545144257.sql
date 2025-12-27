-- Files uploaded by user (raw)
CREATE TABLE IF NOT EXISTS financial_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  filename text NOT NULL,
  file_key text NOT NULL,
  file_type text NOT NULL,
  statement_type text,
  uploaded_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE financial_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for financial_files
CREATE POLICY "Users can view their own files"
ON financial_files FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own files"
ON financial_files FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
ON financial_files FOR DELETE
USING (auth.uid() = user_id);

-- Model job runs
CREATE TABLE IF NOT EXISTS financial_model_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ticker text NOT NULL,
  company_name text,
  fiscal_year_end text,
  currency text DEFAULT 'USD',
  workflow_id text,
  inputs jsonb,
  assumptions jsonb,
  external_data jsonb,
  status text DEFAULT 'queued',
  error_text text,
  result_json jsonb,
  dcf_summary jsonb,
  checks jsonb,
  provenance jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE financial_model_runs ENABLE ROW LEVEL SECURITY;

-- RLS policies for financial_model_runs
CREATE POLICY "Users can view their own runs"
ON financial_model_runs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own runs"
ON financial_model_runs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own runs"
ON financial_model_runs FOR UPDATE
USING (auth.uid() = user_id);

-- Audit / prompt record
CREATE TABLE IF NOT EXISTS financial_model_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES financial_model_runs(id) ON DELETE CASCADE,
  prompt_version text,
  agent_version_hash text,
  llm_response_tokens integer,
  llm_prompt_tokens integer,
  created_at timestamptz DEFAULT now(),
  notes text
);

-- Enable RLS
ALTER TABLE financial_model_audit ENABLE ROW LEVEL SECURITY;

-- RLS policies for financial_model_audit
CREATE POLICY "Users can view audits for their runs"
ON financial_model_audit FOR SELECT
USING (EXISTS (
  SELECT 1 FROM financial_model_runs 
  WHERE financial_model_runs.id = financial_model_audit.run_id 
  AND financial_model_runs.user_id = auth.uid()
));

CREATE POLICY "Users can create audits for their runs"
ON financial_model_audit FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM financial_model_runs 
  WHERE financial_model_runs.id = financial_model_audit.run_id 
  AND financial_model_runs.user_id = auth.uid()
));