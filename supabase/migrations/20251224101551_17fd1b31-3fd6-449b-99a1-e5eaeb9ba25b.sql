-- Drop the existing policy (note the trailing space in the name)
DROP POLICY IF EXISTS "Lawyers can update assigned cases " ON public.cases;
DROP POLICY IF EXISTS "Lawyers can update assigned cases" ON public.cases;

-- Create a new policy that allows lawyers to update cases where they are currently assigned
-- Using WITH CHECK (true) allows the update to set lawyer_id to null (decline)
CREATE POLICY "Lawyers can update assigned cases"
ON public.cases
FOR UPDATE
USING ((auth.uid())::text = lawyer_id)
WITH CHECK (true);