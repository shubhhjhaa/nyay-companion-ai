-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create cases table for case history
CREATE TABLE public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    lawyer_id UUID REFERENCES public.profiles(id),
    case_type TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    ai_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create saved_lawyers table
CREATE TABLE public.saved_lawyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    lawyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, lawyer_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    case_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create lawyer_reviews table
CREATE TABLE public.lawyer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    lawyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    case_id UUID,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for cases
CREATE POLICY "Users can view own cases" ON public.cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own cases" ON public.cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cases" ON public.cases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Lawyers can view assigned cases" ON public.cases FOR SELECT USING (auth.uid() = lawyer_id);
CREATE POLICY "Lawyers can update assigned cases" ON public.cases FOR UPDATE USING (auth.uid() = lawyer_id);

-- RLS policies for saved_lawyers
CREATE POLICY "Users can view own saved lawyers" ON public.saved_lawyers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save lawyers" ON public.saved_lawyers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave lawyers" ON public.saved_lawyers FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- RLS policies for lawyer_reviews
CREATE POLICY "Anyone can view reviews" ON public.lawyer_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.lawyer_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.lawyer_reviews FOR UPDATE USING (auth.uid() = user_id);

-- Create storage bucket for case documents
INSERT INTO storage.buckets (id, name, public) VALUES ('case-documents', 'case-documents', false);

-- Storage policies for case documents
CREATE POLICY "Users can upload own case documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'case-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own case documents" ON storage.objects FOR SELECT USING (bucket_id = 'case-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own case documents" ON storage.objects FOR DELETE USING (bucket_id = 'case-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add case_id to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS case_id UUID;

-- Create trigger for updated_at on cases
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();