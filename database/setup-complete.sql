-- =============================================================================
-- FESTOS COMPLETE DATABASE SETUP
-- =============================================================================
-- 
-- Complete database setup script for Supabase.
-- Run this script in your Supabase SQL editor to set up all tables and functions.
--
-- Author: Festos Development Team
-- Version: 2.0.0
-- Last Updated: 2025
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

-- Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON public.events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_visibility ON public.events(visibility);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON public.events(end_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_location ON public.events(location);
CREATE INDEX IF NOT EXISTS idx_events_contract_event_id ON public.events(contract_event_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at);

-- Full-text search index for events
CREATE INDEX IF NOT EXISTS idx_events_search ON public.events USING GIN (
    to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || location)
);

-- Tags array index
CREATE INDEX IF NOT EXISTS idx_events_tags ON public.events USING GIN(tags);

-- Tickets table indexes
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_attendee_id ON public.tickets(attendee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(is_approved, is_used, is_refunded);

-- Categories and tags indexes
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);

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

-- Apply updated_at triggers to all tables
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

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_unique_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert title to slug
    base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    final_slug := base_slug;
    
    -- Check if slug exists and append number if needed
    WHILE EXISTS (SELECT 1 FROM public.events WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to increment tag usage count
CREATE OR REPLACE FUNCTION increment_tag_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment usage count for each tag
    UPDATE public.tags 
    SET usage_count = usage_count + 1 
    WHERE name = ANY(NEW.tags);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment tag usage when events are created
CREATE TRIGGER increment_tag_usage_trigger
    AFTER INSERT ON public.events
    FOR EACH ROW
    WHEN (NEW.tags IS NOT NULL AND array_length(NEW.tags, 1) > 0)
    EXECUTE FUNCTION increment_tag_usage();

-- =============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.jwt() ->> 'wallet_address' = wallet_address);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.jwt() ->> 'wallet_address' = wallet_address);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.jwt() ->> 'wallet_address' = wallet_address);

-- Events policies
CREATE POLICY "Anyone can view public events" ON public.events
    FOR SELECT USING (visibility = 'public' AND status = 'active');

CREATE POLICY "Event creators can view their own events" ON public.events
    FOR SELECT USING (
        auth.jwt() ->> 'wallet_address' = (
            SELECT wallet_address FROM public.users WHERE id = creator_id
        )
    );

CREATE POLICY "Event creators can update their own events" ON public.events
    FOR UPDATE USING (
        auth.jwt() ->> 'wallet_address' = (
            SELECT wallet_address FROM public.users WHERE id = creator_id
        )
    );

CREATE POLICY "Authenticated users can create events" ON public.events
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'wallet_address' IS NOT NULL
    );

-- Tickets policies
CREATE POLICY "Users can view their own tickets" ON public.tickets
    FOR SELECT USING (
        auth.jwt() ->> 'wallet_address' = (
            SELECT wallet_address FROM public.users WHERE id = attendee_id
        )
    );

CREATE POLICY "Event creators can view event tickets" ON public.tickets
    FOR SELECT USING (
        auth.jwt() ->> 'wallet_address' = (
            SELECT wallet_address FROM public.users WHERE id = (
                SELECT creator_id FROM public.events WHERE id = event_id
            )
        )
    );

CREATE POLICY "Authenticated users can create tickets" ON public.tickets
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'wallet_address' IS NOT NULL
    );

-- Categories and tags policies (read-only for everyone)
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view tags" ON public.tags
    FOR SELECT USING (is_active = true);

-- =============================================================================
-- 7. SEED DATA
-- =============================================================================

-- Insert default categories
INSERT INTO public.categories (name, description, icon, color) VALUES
    ('Music', 'Live music events, concerts, and performances', '🎵', '#FF6B6B'),
    ('Technology', 'Tech meetups, hackathons, and conferences', '💻', '#4ECDC4'),
    ('Sports', 'Sports events, tournaments, and activities', '⚽', '#45B7D1'),
    ('Art', 'Art exhibitions, galleries, and creative events', '🎨', '#96CEB4'),
    ('Food', 'Food festivals, cooking classes, and dining events', '🍕', '#FFEAA7'),
    ('Business', 'Business meetings, networking, and professional events', '💼', '#DDA0DD'),
    ('Education', 'Workshops, seminars, and learning events', '📚', '#98D8C8'),
    ('Entertainment', 'Movies, theater, and entertainment events', '🎭', '#F7DC6F'),
    ('Health', 'Fitness, wellness, and health-related events', '💪', '#BB8FCE'),
    ('Community', 'Community gatherings, social events, and meetups', '🤝', '#85C1E9')
ON CONFLICT (name) DO NOTHING;

-- Insert default tags
INSERT INTO public.tags (name, description) VALUES
    ('free', 'Free events'),
    ('paid', 'Paid events'),
    ('virtual', 'Virtual/online events'),
    ('in-person', 'In-person events'),
    ('family-friendly', 'Family-friendly events'),
    ('networking', 'Networking opportunities'),
    ('workshop', 'Interactive workshops'),
    ('conference', 'Professional conferences'),
    ('festival', 'Festivals and celebrations'),
    ('meetup', 'Casual meetups'),
    ('concert', 'Live music concerts'),
    ('exhibition', 'Art and cultural exhibitions'),
    ('hackathon', 'Coding and innovation events'),
    ('seminar', 'Educational seminars'),
    ('party', 'Social parties and celebrations')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 8. VIEWS FOR COMMON QUERIES
-- =============================================================================

-- View for active public events with creator information
CREATE OR REPLACE VIEW public.active_events AS
SELECT 
    e.*,
    u.display_name as creator_name,
    u.wallet_address as creator_wallet,
    u.avatar_url as creator_avatar
FROM public.events e
JOIN public.users u ON e.creator_id = u.id
WHERE e.visibility = 'public' 
    AND e.status = 'active'
    AND e.start_date > NOW();

-- View for event statistics
CREATE OR REPLACE VIEW public.event_stats AS
SELECT 
    e.id,
    e.title,
    e.views_count,
    e.likes_count,
    e.shares_count,
    COUNT(t.id) as ticket_count,
    COUNT(CASE WHEN t.is_approved = true THEN 1 END) as approved_tickets,
    COUNT(CASE WHEN t.is_used = true THEN 1 END) as used_tickets
FROM public.events e
LEFT JOIN public.tickets t ON e.id = t.event_id
GROUP BY e.id, e.title, e.views_count, e.likes_count, e.shares_count;

-- =============================================================================
-- 9. COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Festos database setup completed successfully!';
    RAISE NOTICE '📊 Tables created: users, events, tickets, categories, tags';
    RAISE NOTICE '🔒 RLS policies enabled for security';
    RAISE NOTICE '📈 Indexes created for performance';
    RAISE NOTICE '🌱 Seed data inserted for categories and tags';
    RAISE NOTICE '🎯 Views created for common queries';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test the API endpoints';
    RAISE NOTICE '2. Create your first event';
    RAISE NOTICE '3. Verify the discover page works';
END $$;
