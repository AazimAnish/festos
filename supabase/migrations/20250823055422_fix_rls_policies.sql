-- =============================================================================
-- FIX RLS POLICIES FOR ANON ACCESS
-- =============================================================================
-- 
-- This migration fixes the RLS policies to work with the anon key
-- without requiring authentication, which is needed for our application.
--
-- Author: Festos Development Team
-- Version: 1.0.1
-- Created: 2025-08-23
-- =============================================================================

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view public events" ON public.events;
DROP POLICY IF EXISTS "Creators can manage their events" ON public.events;
DROP POLICY IF EXISTS "Anyone can create events" ON public.events;
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Event creators can view tickets for their events" ON public.tickets;
DROP POLICY IF EXISTS "Users can purchase tickets" ON public.tickets;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view tags" ON public.tags;

-- Create new policies that work with anon access
-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (true);

-- Events policies
CREATE POLICY "Anyone can view all events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create events" ON public.events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update events" ON public.events
    FOR UPDATE USING (true);

-- Tickets policies
CREATE POLICY "Anyone can view tickets" ON public.tickets
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create tickets" ON public.tickets
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update tickets" ON public.tickets
    FOR UPDATE USING (true);

-- Categories and tags policies (read-only for now)
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view tags" ON public.tags
    FOR SELECT USING (is_active = true);

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'events', 'tickets', 'categories', 'tags')
ORDER BY tablename, policyname;
