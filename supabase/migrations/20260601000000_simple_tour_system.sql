-- Simple Tour Management System Migration

-- 1. Update app_users (Profiles)
ALTER TABLE public.app_users
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS address_house text,
ADD COLUMN IF NOT EXISTS address_street text,
ADD COLUMN IF NOT EXISTS address_locality text,
ADD COLUMN IF NOT EXISTS address_post_office text,
ADD COLUMN IF NOT EXISTS address_district text,
ADD COLUMN IF NOT EXISTS address_state text,
ADD COLUMN IF NOT EXISTS address_pin_code text,
ADD COLUMN IF NOT EXISTS identity_type text,
ADD COLUMN IF NOT EXISTS identity_number text,
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_contact_number text,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship text,
ADD COLUMN IF NOT EXISTS avatar_url text;

-- 2. Define Tour Status Enum
DO $$ BEGIN
    CREATE TYPE public.tour_status AS ENUM (
        'DRAFT',
        'PUBLISHED',
        'REGISTRATION_OPEN',
        'REGISTRATION_CLOSED',
        'UPCOMING',
        'ONGOING',
        'COMPLETED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Update tours table
ALTER TABLE public.tours
ADD COLUMN IF NOT EXISTS tour_code text UNIQUE,
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS end_date date,
ADD COLUMN IF NOT EXISTS registration_open_date date,
ADD COLUMN IF NOT EXISTS registration_close_date date,
ADD COLUMN IF NOT EXISTS max_participants integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS price numeric(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS status public.tour_status DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS departure_location text,
ADD COLUMN IF NOT EXISTS return_location text;

-- 4. Create Tour Itineraries table
CREATE TABLE IF NOT EXISTS public.tour_itineraries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
    day_number integer NOT NULL,
    title text NOT NULL,
    description text,
    departure_time time without time zone,
    activities text,
    meals text,
    overnight_location text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(tour_id, day_number)
);

-- 5. Define Registration Status Enum
DO $$ BEGIN
    CREATE TYPE public.registration_status AS ENUM (
        'PENDING',
        'CONFIRMED',
        'CANCELLED',
        'COMPLETED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Create Tour Registrations table (Simplified Booking)
CREATE TABLE IF NOT EXISTS public.tour_registrations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid NOT NULL REFERENCES public.app_users(user_id) ON DELETE CASCADE,
    tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
    registration_date timestamp with time zone DEFAULT now(),
    status public.registration_status DEFAULT 'PENDING',
    travellers_count integer DEFAULT 1,
    notes text,
    profile_snapshot jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(customer_id, tour_id)
);

-- 7. RLS Policies

-- Enable RLS
ALTER TABLE public.tour_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_registrations ENABLE ROW LEVEL SECURITY;

-- Tour Itineraries: Public read, Admin write
CREATE POLICY "Allow public read access to itineraries" ON public.tour_itineraries FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to itineraries" ON public.tour_itineraries FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.app_users WHERE user_id = auth.uid() AND role = (SELECT id FROM public.user_roles WHERE role_name = 'admin'))
);

-- Tour Registrations: Customer read/write own, Admin full access
CREATE POLICY "Customers can view their own registrations" ON public.tour_registrations FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Customers can create their own registrations" ON public.tour_registrations FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Customers can update their own pending registrations" ON public.tour_registrations FOR UPDATE TO authenticated USING (customer_id = auth.uid() AND status = 'PENDING');
CREATE POLICY "Admin can view all registrations" ON public.tour_registrations FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.app_users WHERE user_id = auth.uid() AND role = (SELECT id FROM public.user_roles WHERE role_name = 'admin'))
);
CREATE POLICY "Admin can manage all registrations" ON public.tour_registrations FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.app_users WHERE user_id = auth.uid() AND role = (SELECT id FROM public.user_roles WHERE role_name = 'admin'))
);

-- Profiles (app_users) updates
CREATE POLICY "Users can update their own profiles" ON public.app_users FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Tours updates
CREATE POLICY "Admin can manage tours" ON public.tours FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.app_users WHERE user_id = auth.uid() AND role = (SELECT id FROM public.user_roles WHERE role_name = 'admin'))
);
