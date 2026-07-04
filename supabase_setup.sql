-- Supabase Setup Schema Script (V2 - Direct Client-Side Connect)
-- Copy and execute this script inside the SQL Editor of your Supabase Dashboard (https://supabase.com)
-- to automatically provision all required database tables, default reviews, and security policies.

-- 1. Create the 'contacts' table
CREATE TABLE IF NOT EXISTS public.contacts (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policies for public contacts
CREATE POLICY "Allow public select contacts" ON public.contacts FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert contacts" ON public.contacts FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public delete contacts" ON public.contacts FOR DELETE TO public USING (true);


-- 2. Create the 'quotes' table
CREATE TABLE IF NOT EXISTS public.quotes (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    service_requested text NOT NULL,
    project_description text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Policies for public quotes
CREATE POLICY "Allow public select quotes" ON public.quotes FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert quotes" ON public.quotes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update quotes" ON public.quotes FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete quotes" ON public.quotes FOR DELETE TO public USING (true);


-- 3. Create the 'reviews' table
CREATE TABLE IF NOT EXISTS public.reviews (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    customer_name text NOT NULL,
    rating integer NOT NULL,
    review text NOT NULL,
    approved boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies for public reviews
CREATE POLICY "Allow public select reviews" ON public.reviews FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert reviews" ON public.reviews FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update reviews" ON public.reviews FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete reviews" ON public.reviews FOR DELETE TO public USING (true);


-- 4. Seed approved customer reviews for immediate visual feedback
INSERT INTO public.reviews (customer_name, rating, review, approved)
VALUES 
('Sophie Copeland', 5, 'I highly recommend Phoenix Best Electricians! They provided quick and expert service when updating our electrical panel. Tracy was very knowledgeable, answered all of our questions, and took time to explain everything clearly. The pricing was fair and transparent.', true),
('Shirley A', 5, 'I’m really happy I chose to have my solar panels installed by this electrical company in Phoenix. I had about six different electricians come out for consultations, and in the end, the solar panel options they offered just made the most sense and the savings have been incredible!', true),
('Tracey Conner', 5, 'I recently had an issue where one of my electrical breakers tripped and wouldn’t reset. After searching for electricians nearby, I found a company with great reviews and decided to give them a call. I was able to talk to someone right away and they dispatched Tracy within the hour. Outstanding service!', true),
('Marcus Vance', 5, 'Needed 14 smart switches and dimmers installed across our home in Phoenix. Tracy did a spectacular job setting them up, grouping them, and ensuring everything met safety standards. Clean workspace and extremely skilled.', true),
('Elena Rojas', 5, 'Phoenix heat is brutal, so when our primary living room ceiling fan stopped working, we needed a replacement immediately. Called Phoenix Best Electricians and they came out the same afternoon. Installed a gorgeous new fan and checked our panel, too.', true),
('David K.', 5, 'Excellent condo work. Did a full electrical update for my unit in Midtown. They understood our complex building codes and completed everything on time with zero issues from the HOA. Pricing was very reasonable.', true);
