-- Create a table for saved emails
CREATE TABLE public.saved_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_type TEXT NOT NULL DEFAULT 'original',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  opposite_party TEXT,
  case_type TEXT,
  parent_email_id UUID REFERENCES public.saved_emails(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_emails ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own emails"
ON public.saved_emails
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own emails"
ON public.saved_emails
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emails"
ON public.saved_emails
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_saved_emails_user_id ON public.saved_emails(user_id);
CREATE INDEX idx_saved_emails_created_at ON public.saved_emails(created_at DESC);