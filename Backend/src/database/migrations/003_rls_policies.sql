-- RLS for public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: select own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users: update own" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- RLS for public.business_profiles
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_profiles: select own" ON public.business_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "business_profiles: insert own" ON public.business_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "business_profiles: update own" ON public.business_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "business_profiles: delete own" ON public.business_profiles FOR DELETE USING (auth.uid() = user_id);

-- RLS for public.formalization_steps
ALTER TABLE public.formalization_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "formalization_steps: select own" ON public.formalization_steps FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.business_profiles bp WHERE bp.id = profile_id AND bp.user_id = auth.uid()));

CREATE POLICY "formalization_steps: insert own" ON public.formalization_steps FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.business_profiles bp WHERE bp.id = profile_id AND bp.user_id = auth.uid()));

CREATE POLICY "formalization_steps: update own" ON public.formalization_steps FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.business_profiles bp WHERE bp.id = profile_id AND bp.user_id = auth.uid()));

CREATE POLICY "formalization_steps: delete own" ON public.formalization_steps FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.business_profiles bp WHERE bp.id = profile_id AND bp.user_id = auth.uid()));

-- RLS for public.financial_records
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "financial_records: select own" ON public.financial_records FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.business_profiles bp WHERE bp.id = profile_id AND bp.user_id = auth.uid()));

CREATE POLICY "financial_records: insert own" ON public.financial_records FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.business_profiles bp WHERE bp.id = profile_id AND bp.user_id = auth.uid()));

CREATE POLICY "financial_records: update own" ON public.financial_records FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.business_profiles bp WHERE bp.id = profile_id AND bp.user_id = auth.uid()));

CREATE POLICY "financial_records: delete own" ON public.financial_records FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.business_profiles bp WHERE bp.id = profile_id AND bp.user_id = auth.uid()));

-- RLS for public.chat_sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_sessions: select own" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chat_sessions: insert own" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chat_sessions: update own" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chat_sessions: delete own" ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- RLS for public.domain_knowledge
ALTER TABLE public.domain_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "domain_knowledge: read for authenticated" ON public.domain_knowledge FOR SELECT USING (auth.role() = 'authenticated');
