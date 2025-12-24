-- First drop the policies that depend on lawyer_id
DROP POLICY IF EXISTS "Lawyers can view assigned cases" ON public.cases;
DROP POLICY IF EXISTS "Lawyers can update assigned cases" ON public.cases;

-- Drop the foreign key constraints
ALTER TABLE public.saved_lawyers DROP CONSTRAINT IF EXISTS saved_lawyers_lawyer_id_fkey;
ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_lawyer_id_fkey;

-- Change lawyer_id column types to TEXT
ALTER TABLE public.saved_lawyers ALTER COLUMN lawyer_id TYPE TEXT;
ALTER TABLE public.cases ALTER COLUMN lawyer_id TYPE TEXT;

-- Recreate the policies for lawyers (now with TEXT comparison)
CREATE POLICY "Lawyers can view assigned cases" 
ON public.cases 
FOR SELECT 
USING (auth.uid()::text = lawyer_id);

CREATE POLICY "Lawyers can update assigned cases" 
ON public.cases 
FOR UPDATE 
USING (auth.uid()::text = lawyer_id);