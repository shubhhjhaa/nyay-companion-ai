-- Create storage bucket for case analysis documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-documents', 'case-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload their case documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'case-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to read their own documents
CREATE POLICY "Users can read their own case documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'case-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own documents
CREATE POLICY "Users can delete their own case documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'case-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);