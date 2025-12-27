-- Create storage bucket for financial files
INSERT INTO storage.buckets (id, name, public) VALUES ('financial-files', 'financial-files', false);

-- Storage policies for financial-files bucket
CREATE POLICY "Users can upload their own financial files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'financial-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own financial files"
ON storage.objects FOR SELECT
USING (bucket_id = 'financial-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own financial files"
ON storage.objects FOR DELETE
USING (bucket_id = 'financial-files' AND auth.uid()::text = (storage.foldername(name))[1]);