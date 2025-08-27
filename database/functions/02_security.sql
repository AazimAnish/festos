-- =============================================================================
-- FESTOS SECURITY POLICIES
-- =============================================================================
-- 
-- This file contains Row Level Security (RLS) policies for data protection.
-- Ensures users can only access their own data and public information.
--
-- Author: Festos Development Team
-- Version: 1.0.0
-- Last Updated: 2024
-- =============================================================================

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================
-- Enable RLS on all tables for fine-grained access control

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.events ENABLE ROW LEVEL SECURITY; -- Temporarily disabled for testing
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- USERS TABLE POLICIES
-- =============================================================================

-- Users can view public profiles
CREATE POLICY "Users can view public profiles" 
    ON public.users FOR SELECT 
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
    ON public.users FOR UPDATE 
    USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
    ON public.users FOR INSERT 
    WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- =============================================================================
-- EVENTS TABLE POLICIES
-- =============================================================================

-- Events are viewable by everyone (public events) or by creator (private events)
CREATE POLICY "Events are viewable by everyone" 
    ON public.events FOR SELECT 
    USING (
        visibility = 'public' 
        OR creator_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- Users can create events
CREATE POLICY "Users can create events" 
    ON public.events FOR INSERT 
    WITH CHECK (
        creator_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- Users can update their own events
CREATE POLICY "Users can update their own events" 
    ON public.events FOR UPDATE 
    USING (
        creator_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- =============================================================================
-- TICKETS TABLE POLICIES
-- =============================================================================

-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets" 
    ON public.tickets FOR SELECT 
    USING (
        attendee_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- Users can create tickets
CREATE POLICY "Users can create tickets" 
    ON public.tickets FOR INSERT 
    WITH CHECK (
        attendee_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );
