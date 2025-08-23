-- =============================================================================
-- IMPLEMENT WALLET-BASED AUTHENTICATION POLICIES
-- =============================================================================
-- 
-- This migration implements proper wallet-based authentication for the Festos platform.
-- It ensures that sensitive operations require wallet authentication while keeping
-- event browsing public.
--
-- Author: Festos Development Team
-- Version: 1.0.2
-- Created: 2025-08-23
-- =============================================================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view all events" ON public.events;
DROP POLICY IF EXISTS "Anyone can create events" ON public.events;
DROP POLICY IF EXISTS "Anyone can update events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view tickets" ON public.tickets;
DROP POLICY IF EXISTS "Anyone can create tickets" ON public.tickets;
DROP POLICY IF EXISTS "Anyone can update tickets" ON public.tickets;

-- =============================================================================
-- USERS TABLE POLICIES
-- =============================================================================

-- Anyone can view user profiles (for event creators, etc.)
CREATE POLICY "Anyone can view user profiles" ON public.users
    FOR SELECT USING (true);

-- Users can only insert their own profile with their wallet address
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (
        wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    );

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (
        wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    );

-- =============================================================================
-- EVENTS TABLE POLICIES
-- =============================================================================

-- Anyone can view public events (for browsing)
CREATE POLICY "Anyone can view public events" ON public.events
    FOR SELECT USING (
        visibility = 'public' OR 
        visibility = 'unlisted'
    );

-- Only authenticated users can view private events they created
CREATE POLICY "Users can view own private events" ON public.events
    FOR SELECT USING (
        visibility = 'private' AND 
        creator_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- Only authenticated users can create events
CREATE POLICY "Authenticated users can create events" ON public.events
    FOR INSERT WITH CHECK (
        creator_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- Only event creators can update their events
CREATE POLICY "Creators can update own events" ON public.events
    FOR UPDATE USING (
        creator_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- Only event creators can delete their events
CREATE POLICY "Creators can delete own events" ON public.events
    FOR DELETE USING (
        creator_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- =============================================================================
-- TICKETS TABLE POLICIES
-- =============================================================================

-- Users can view tickets for events they can see
CREATE POLICY "Users can view event tickets" ON public.tickets
    FOR SELECT USING (
        event_id IN (
            SELECT id FROM public.events 
            WHERE visibility = 'public' OR visibility = 'unlisted'
        )
    );

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON public.tickets
    FOR SELECT USING (
        attendee_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- Event creators can view tickets for their events
CREATE POLICY "Creators can view event tickets" ON public.tickets
    FOR SELECT USING (
        event_id IN (
            SELECT id FROM public.events 
            WHERE creator_id IN (
                SELECT id FROM public.users 
                WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
            )
        )
    );

-- Only authenticated users can purchase tickets
CREATE POLICY "Authenticated users can purchase tickets" ON public.tickets
    FOR INSERT WITH CHECK (
        attendee_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- Users can only update their own tickets
CREATE POLICY "Users can update own tickets" ON public.tickets
    FOR UPDATE USING (
        attendee_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- =============================================================================
-- COMMENTS TABLE (NEW) - FOR EVENT COMMENTS
-- =============================================================================

-- Create comments table for event discussions
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Anyone can view comments" ON public.comments
    FOR SELECT USING (
        event_id IN (
            SELECT id FROM public.events 
            WHERE visibility = 'public' OR visibility = 'unlisted'
        )
    );

CREATE POLICY "Authenticated users can create comments" ON public.comments
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

CREATE POLICY "Users can update own comments" ON public.comments
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

CREATE POLICY "Users can delete own comments" ON public.comments
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- =============================================================================
-- POAP CLAIMS TABLE (NEW) - FOR POAP CLAIMING
-- =============================================================================

-- Create POAP claims table
CREATE TABLE IF NOT EXISTS public.poap_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    poap_token_id TEXT,
    poap_contract_address TEXT,
    poap_chain_id INTEGER,
    claim_status TEXT DEFAULT 'pending' CHECK (claim_status IN ('pending', 'claimed', 'failed')),
    transaction_hash TEXT,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Enable RLS on POAP claims
ALTER TABLE public.poap_claims ENABLE ROW LEVEL SECURITY;

-- POAP claims policies
CREATE POLICY "Users can view own POAP claims" ON public.poap_claims
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

CREATE POLICY "Event creators can view POAP claims" ON public.poap_claims
    FOR SELECT USING (
        event_id IN (
            SELECT id FROM public.events 
            WHERE creator_id IN (
                SELECT id FROM public.users 
                WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
            )
        )
    );

CREATE POLICY "Authenticated users can claim POAPs" ON public.poap_claims
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

CREATE POLICY "Users can update own POAP claims" ON public.poap_claims
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- =============================================================================
-- RESALE TICKETS TABLE (NEW) - FOR TICKET RESELLING
-- =============================================================================

-- Create resale tickets table
CREATE TABLE IF NOT EXISTS public.resale_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.users(id),
    resale_price TEXT NOT NULL,
    status TEXT DEFAULT 'listed' CHECK (status IN ('listed', 'sold', 'cancelled')),
    listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sold_at TIMESTAMP WITH TIME ZONE,
    transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on resale tickets
ALTER TABLE public.resale_tickets ENABLE ROW LEVEL SECURITY;

-- Resale tickets policies
CREATE POLICY "Anyone can view listed resale tickets" ON public.resale_tickets
    FOR SELECT USING (status = 'listed');

CREATE POLICY "Users can view own resale activities" ON public.resale_tickets
    FOR SELECT USING (
        seller_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        ) OR
        buyer_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

CREATE POLICY "Authenticated users can list tickets" ON public.resale_tickets
    FOR INSERT WITH CHECK (
        seller_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

CREATE POLICY "Authenticated users can buy resale tickets" ON public.resale_tickets
    FOR UPDATE USING (
        buyer_id IN (
            SELECT id FROM public.users 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- =============================================================================
-- INDEXES FOR NEW TABLES
-- =============================================================================

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_event_id ON public.comments(event_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);

-- POAP claims indexes
CREATE INDEX IF NOT EXISTS idx_poap_claims_event_id ON public.poap_claims(event_id);
CREATE INDEX IF NOT EXISTS idx_poap_claims_user_id ON public.poap_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_poap_claims_status ON public.poap_claims(claim_status);
CREATE INDEX IF NOT EXISTS idx_poap_claims_poap_token_id ON public.poap_claims(poap_token_id);

-- Resale tickets indexes
CREATE INDEX IF NOT EXISTS idx_resale_tickets_original_ticket_id ON public.resale_tickets(original_ticket_id);
CREATE INDEX IF NOT EXISTS idx_resale_tickets_seller_id ON public.resale_tickets(seller_id);
CREATE INDEX IF NOT EXISTS idx_resale_tickets_buyer_id ON public.resale_tickets(buyer_id);
CREATE INDEX IF NOT EXISTS idx_resale_tickets_status ON public.resale_tickets(status);

-- =============================================================================
-- TRIGGERS FOR NEW TABLES
-- =============================================================================

-- Comments trigger
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- POAP claims trigger
CREATE TRIGGER update_poap_claims_updated_at BEFORE UPDATE ON public.poap_claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Resale tickets trigger
CREATE TRIGGER update_resale_tickets_updated_at BEFORE UPDATE ON public.resale_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Verify new tables were created
SELECT 
    'New Tables Status' as info,
    CASE 
        WHEN COUNT(*) = 3 THEN '✅ All new tables created successfully'
        ELSE '❌ Some tables missing: ' || (3 - COUNT(*))::text
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('comments', 'poap_claims', 'resale_tickets');

-- Show policy count
SELECT 
    'Policy Count' as info,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public';
