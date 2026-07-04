-- Supabase Setup Schema Script
-- Copy and execute this script inside the SQL Editor of your Supabase Dashboard (https://supabase.com)
-- to automatically provision all required database tables, default reviews, and secure storage buckets.

-- 1. Create the 'leads' table
CREATE TABLE IF NOT EXISTS public.leads (
    id text PRIMARY KEY,
    name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    "serviceNeeded" text,
    "scopeSize" text,
    details text,
    status text DEFAULT 'pending'::text,
    "submittedAt" text,
    "estimatedPrice" text,
    "preferredTime" text,
    "photoUrl" text
);

-- Enable Row Level Security (RLS) on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow public read access to leads (useful for operator portal dashboard)
CREATE POLICY "Allow public read access to leads" ON public.leads
    FOR SELECT TO public USING (true);

-- Allow public insert access to leads (so customers can submit forms)
CREATE POLICY "Allow public insert access to leads" ON public.leads
    FOR INSERT TO public WITH CHECK (true);

-- Allow public updates to leads (so status changes can be saved)
CREATE POLICY "Allow public update access to leads" ON public.leads
    FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Allow public deletion of leads (for operator database cleanups)
CREATE POLICY "Allow public delete access to leads" ON public.leads
    FOR DELETE TO public USING (true);


-- 2. Create the 'reviews' table
CREATE TABLE IF NOT EXISTS public.reviews (
    id text PRIMARY KEY,
    author text NOT NULL,
    rating integer NOT NULL,
    "timeAgo" text,
    text text NOT NULL,
    "avatarUrl" text,
    category text,
    tags text[]
);

-- Enable Row Level Security (RLS) on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access to reviews
CREATE POLICY "Allow public read access to reviews" ON public.reviews
    FOR SELECT TO public USING (true);

-- Allow public insert access to reviews
CREATE POLICY "Allow public insert access to reviews" ON public.reviews
    FOR INSERT TO public WITH CHECK (true);

-- Allow public deletion of reviews
CREATE POLICY "Allow public delete access to reviews" ON public.reviews
    FOR DELETE TO public USING (true);


-- 3. Create the 'contacts' table
CREATE TABLE IF NOT EXISTS public.contacts (
    id text PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    message text NOT NULL,
    "submittedAt" text
);

-- Enable Row Level Security (RLS) on contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to contacts (for operator portal management)
CREATE POLICY "Allow public read access to contacts" ON public.contacts
    FOR SELECT TO public USING (true);

-- Allow public insert access to contacts (so customers can submit the contact form)
CREATE POLICY "Allow public insert access to contacts" ON public.contacts
    FOR INSERT TO public WITH CHECK (true);

-- Allow public deletion of contacts
CREATE POLICY "Allow public delete access to contacts" ON public.contacts
    FOR DELETE TO public USING (true);


-- 4. Seed the default customer reviews (so the reviews section displays immediately on load)
INSERT INTO public.reviews (id, author, rating, "timeAgo", text, "avatarUrl", category, tags)
VALUES 
('1', 'Sophie Copeland', 5, '4 months ago', 'I highly recommend Phoenix Best Electricians! They provided quick and expert service when updating our electrical panel. Tracy was very knowledgeable, answered all of our questions, and took time to explain everything clearly. The pricing was fair and transparent.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'panel', ARRAY['Panel Upgrade', 'Skilled', 'Tracy']),
('2', 'Shirley A', 5, '4 months ago', 'I’m really happy I chose to have my solar panels installed by this electrical company in Phoenix. I had about six different electricians come out for consultations, and in the end, the solar panel options they offered just made the most sense and the savings have been incredible!', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'solar', ARRAY['Solar Panels', 'Consultation', 'Energy Savings']),
('3', 'Robert K.', 5, '2 months ago', 'A breaker was repeatedly tripping at our place late at night. Tracy dispatched a team within 40 minutes, located the ground fault, replaced the failing breaker, and thoroughly tested the circuit. Outstanding service.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'breaker', ARRAY['Breaker Tripping', 'Late Night', 'Emergency Dispatch']),
('4', 'Marcus D.', 5, '1 month ago', 'Installed two high-end, smart-connected ceiling fans in our vaulted living room. Seamless, clean mounting, perfectly level, and completely quiet. Truly professional workmanship!', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'ceiling_fan', ARRAY['Ceiling Fans', 'Vaulted Ceilings', 'Quiet Install']),
('5', 'Elena R.', 5, '3 weeks ago', 'Phenomenal local team. They upgraded my subpanel to handle an EV charger install. From load calculations to final inspection, the process was seamless. Friendly, prompt, and top-tier quality.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'general', ARRAY['Subpanel Upgrade', 'EV Charger', 'Load Calculation'])
ON CONFLICT (id) DO NOTHING;


-- 5. Set up Supabase Storage Bucket 'electrical-photos' for customer uploads
-- (Note: Storage setup via SQL can also be configured directly via the Supabase Storage UI,
-- but the queries below will attempt to create the bucket and enable access policies)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('electrical-photos', 'electrical-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage public download policy
CREATE POLICY "Allow public download of photos" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'electrical-photos');

-- Storage public upload policy
CREATE POLICY "Allow public upload of photos" ON storage.objects
    FOR INSERT TO public WITH CHECK (bucket_id = 'electrical-photos');
