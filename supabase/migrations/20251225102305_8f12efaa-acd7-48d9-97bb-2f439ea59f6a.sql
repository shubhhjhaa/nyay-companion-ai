-- Add disposal fields to cases table
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS disposal_reason text,
ADD COLUMN IF NOT EXISTS disposal_requested_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS disposal_confirmed_at timestamp with time zone;