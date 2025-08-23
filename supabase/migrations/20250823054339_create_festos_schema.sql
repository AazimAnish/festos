-- =============================================================================
-- FESTOS DATABASE SCHEMA MIGRATION
-- =============================================================================
-- 
-- This migration creates the complete database schema for the Festos platform.
-- It includes all tables, indexes, functions, triggers, and RLS policies.
--
-- Author: Festos Development Team
-- Version: 1.0.0
-- Created: 2025-08-23
-- =============================================================================

-- =============================================================================
-- 1. EXTENSIONS
-- =============================================================================

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 2. CORE TABLES
-- =============================================================================

-- =============================================================================
-- USERS TABLE
-- =============================================================================
-- Stores user information with wallet-based authentication
-- Supports both wallet-only and email+wallet authentication patterns

CREATE TABLE IF NOT EXISTS public.users (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    
    -- Profile information
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    
    -- Social media links
    website TEXT,
    twitter_handle TEXT,
    discord_handle TEXT,
    
    -- Account status
    is_verified BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- EVENTS TABLE
-- =============================================================================
-- Stores comprehensive event data with blockchain and IPFS integration
-- Supports multiple visibility levels and approval workflows

CREATE TABLE IF NOT EXISTS public.events (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic event information
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    
    -- Capacity and pricing
    max_capacity INTEGER DEFAULT 0,
    current_attendees INTEGER DEFAULT 0,
    ticket_price TEXT NOT NULL DEFAULT '0',
    
    -- Event settings
    require_approval BOOLEAN DEFAULT FALSE,
    has_poap BOOLEAN DEFAULT FALSE,
    poap_metadata TEXT,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'cancelled', 'completed')),
    
    -- Media and categorization
    banner_image TEXT,
    category TEXT,
    tags TEXT[],
    
    -- Relationships
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Blockchain integration
    contract_event_id INTEGER,
    contract_address TEXT,
    contract_chain_id INTEGER,
    transaction_hash TEXT,
    
    -- IPFS/Web3Storage integration (legacy - now using Filebase)
    web3storage_metadata_cid TEXT,
    web3storage_image_cid TEXT,
    creator_did TEXT,
    space_did TEXT,
    
    -- Filebase integration
    filebase_metadata_url TEXT,
    filebase_image_url TEXT,
    storage_provider TEXT DEFAULT 'database',
    
    -- SEO and discovery
    slug TEXT UNIQUE,
    seo_title TEXT,
    seo_description TEXT,
    
    -- Analytics
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- TICKETS TABLE
-- =============================================================================
-- Manages event registrations and ticket purchases
-- Supports blockchain-based ticketing with on-chain verification

CREATE TABLE IF NOT EXISTS public.tickets (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relationships
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    attendee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Ticket details
    ticket_type TEXT DEFAULT 'general',
    price_paid TEXT NOT NULL,
    
    -- Status flags
    is_used BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    is_refunded BOOLEAN DEFAULT FALSE,
    
    -- Blockchain integration
    contract_ticket_id INTEGER,
    contract_address TEXT,
    contract_chain_id INTEGER,
    transaction_hash TEXT,
    
    -- IPFS integration
    ticket_metadata_cid TEXT,
    
    -- Timestamps
    purchase_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_time TIMESTAMP WITH TIME ZONE,
    approved_time TIMESTAMP WITH TIME ZONE,
    refunded_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(event_id, attendee_id)
);

-- =============================================================================
-- 3. SUPPORTING TABLES
-- =============================================================================

-- Categories table for event categorization
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags table for flexible event tagging
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 4. INDEXES FOR PERFORMANCE
-- =============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON public.events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON public.events(end_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_visibility ON public.events(visibility);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_location ON public.events(location);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_contract_event_id ON public.events(contract_event_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_events_title_search ON public.events USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_events_description_search ON public.events USING gin(to_tsvector('english', description));

-- Tags array index
CREATE INDEX IF NOT EXISTS idx_events_tags ON public.events USING gin(tags);

-- Tickets table indexes
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_attendee_id ON public.tickets(attendee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_purchase_time ON public.tickets(purchase_time);
CREATE INDEX IF NOT EXISTS idx_tickets_is_used ON public.tickets(is_used);
CREATE INDEX IF NOT EXISTS idx_tickets_is_approved ON public.tickets(is_approved);

-- =============================================================================
-- 5. FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON public.tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Events policies
CREATE POLICY "Anyone can view public events" ON public.events
    FOR SELECT USING (visibility = 'public' AND status = 'active');

CREATE POLICY "Creators can manage their events" ON public.events
    FOR ALL USING (auth.uid()::text = creator_id::text);

CREATE POLICY "Anyone can create events" ON public.events
    FOR INSERT WITH CHECK (true);

-- Tickets policies
CREATE POLICY "Users can view their own tickets" ON public.tickets
    FOR SELECT USING (auth.uid()::text = attendee_id::text);

CREATE POLICY "Event creators can view tickets for their events" ON public.tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = tickets.event_id 
            AND events.creator_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can purchase tickets" ON public.tickets
    FOR INSERT WITH CHECK (auth.uid()::text = attendee_id::text);

-- Categories and tags policies (read-only for now)
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view tags" ON public.tags
    FOR SELECT USING (is_active = true);

-- =============================================================================
-- 7. SEED DATA
-- =============================================================================

-- Insert default categories
INSERT INTO public.categories (name, description, icon, color) VALUES
    ('Technology', 'Tech conferences, workshops, and meetups', '💻', '#3B82F6'),
    ('Music', 'Concerts, festivals, and music events', '🎵', '#EF4444'),
    ('Art', 'Art exhibitions, galleries, and creative workshops', '🎨', '#8B5CF6'),
    ('Business', 'Networking events, conferences, and seminars', '💼', '#059669'),
    ('Sports', 'Sports events, tournaments, and fitness activities', '⚽', '#F59E0B'),
    ('Food', 'Food festivals, cooking classes, and tastings', '🍕', '#DC2626'),
    ('Education', 'Workshops, courses, and educational seminars', '📚', '#7C3AED'),
    ('Health', 'Wellness events, yoga, and health workshops', '🏥', '#10B981'),
    ('Gaming', 'Gaming tournaments, esports, and game nights', '🎮', '#6366F1'),
    ('Community', 'Local meetups, social events, and gatherings', '👥', '#F97316')
ON CONFLICT (name) DO NOTHING;

-- Insert default tags
INSERT INTO public.tags (name, description) VALUES
    ('blockchain', 'Blockchain and cryptocurrency related'),
    ('web3', 'Web3 and decentralized technologies'),
    ('nft', 'NFT and digital collectibles'),
    ('defi', 'Decentralized finance'),
    ('metaverse', 'Virtual worlds and metaverse'),
    ('ai', 'Artificial intelligence and machine learning'),
    ('startup', 'Startup and entrepreneurship'),
    ('networking', 'Professional networking'),
    ('workshop', 'Hands-on learning workshops'),
    ('conference', 'Large scale conferences'),
    ('meetup', 'Casual meetups and gatherings'),
    ('online', 'Virtual/online events'),
    ('free', 'Free admission events'),
    ('premium', 'Premium/paid events'),
    ('beginner', 'Beginner friendly'),
    ('advanced', 'Advanced level content'),
    ('certification', 'Offers certification'),
    ('poap', 'POAP eligible events')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Verify tables were created
SELECT 
    'Migration Status' as info,
    CASE 
        WHEN COUNT(*) = 5 THEN '✅ All tables created successfully'
        ELSE '❌ Some tables missing: ' || (5 - COUNT(*))::text
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'events', 'tickets', 'categories', 'tags');
