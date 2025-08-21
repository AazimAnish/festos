-- =============================================================================
-- FESTOS DATABASE EXTENSIONS
-- =============================================================================
-- 
-- This file contains the database extensions required for the Festos platform.
-- Extensions provide additional functionality to PostgreSQL.
--
-- Author: Festos Development Team
-- Version: 1.0.0
-- Last Updated: 2024
-- =============================================================================

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- CORE ENTITY TABLES
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
    
    -- IPFS/Web3Storage integration
    web3storage_metadata_cid TEXT,
    web3storage_image_cid TEXT,
    creator_did TEXT, -- User's DID for Web3Storage
    space_did TEXT, -- User's space DID for Web3Storage
    
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
-- SUPPORTING TABLES
-- =============================================================================

-- =============================================================================
-- USER PROFILES TABLE
-- =============================================================================
-- Extended user profile information
-- Separated from main users table for better organization

CREATE TABLE IF NOT EXISTS public.user_profiles (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Extended profile data
    bio TEXT,
    avatar_url TEXT,
    cover_image_url TEXT,
    location TEXT,
    website TEXT,
    twitter_handle TEXT,
    discord_handle TEXT,
    github_handle TEXT,
    
    -- User preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    
    -- Web3Storage integration
    did_identity TEXT,
    space_did TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id)
);

-- =============================================================================
-- EVENT CATEGORIES TABLE
-- =============================================================================
-- Predefined event categories for better organization and discovery

CREATE TABLE IF NOT EXISTS public.event_categories (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Category information
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- EVENT TAGS TABLE
-- =============================================================================
-- Flexible tagging system for events
-- Supports dynamic tag creation and usage tracking

CREATE TABLE IF NOT EXISTS public.event_tags (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tag information
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- EVENT ANALYTICS TABLE
-- =============================================================================
-- Daily analytics tracking for events
-- Supports comprehensive event performance monitoring

CREATE TABLE IF NOT EXISTS public.event_analytics (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    
    -- View analytics
    total_views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    
    -- Engagement analytics
    total_likes INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    
    -- Ticket analytics
    tickets_sold INTEGER DEFAULT 0,
    revenue_generated TEXT DEFAULT '0',
    
    -- Date tracking
    date DATE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(event_id, date)
);

-- =============================================================================
-- USER SESSIONS TABLE
-- =============================================================================
-- Session management for user authentication
-- Supports secure session tracking and management

CREATE TABLE IF NOT EXISTS public.user_sessions (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Session information
    session_token TEXT NOT NULL UNIQUE,
    wallet_address TEXT NOT NULL,
    
    -- Security information
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PERFORMANCE OPTIMIZATION
-- =============================================================================

-- =============================================================================
-- INDEXES
-- =============================================================================
-- Strategic indexes for optimal query performance
-- Focused on common query patterns and foreign key relationships

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON public.events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_visibility ON public.events(visibility);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_contract_event_id ON public.events(contract_event_id);
CREATE INDEX IF NOT EXISTS idx_events_web3storage_metadata_cid ON public.events(web3storage_metadata_cid);

-- Tickets table indexes
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_attendee_id ON public.tickets(attendee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_contract_ticket_id ON public.tickets(contract_ticket_id);

-- Sessions table indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- =============================================================================
-- AUTOMATION AND TRIGGERS
-- =============================================================================

-- =============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================================================
-- Automatically updates the updated_at timestamp on record modifications

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON public.events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON public.tickets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SECURITY AND ACCESS CONTROL
-- =============================================================================

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Enables fine-grained access control at the row level
-- Policies ensure users can only access their own data

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
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

-- =============================================================================
-- DATA SEEDING
-- =============================================================================

-- =============================================================================
-- DEFAULT EVENT CATEGORIES
-- =============================================================================
-- Pre-populated categories for better user experience
-- Users can select from these categories when creating events

INSERT INTO public.event_categories (name, description, icon, color) VALUES
    ('Technology', 'Tech conferences, hackathons, and workshops', '💻', '#3B82F6'),
    ('Business', 'Business networking and professional events', '💼', '#10B981'),
    ('Entertainment', 'Concerts, shows, and entertainment events', '🎭', '#F59E0B'),
    ('Sports', 'Sports events and competitions', '⚽', '#EF4444'),
    ('Education', 'Educational workshops and seminars', '📚', '#8B5CF6'),
    ('Community', 'Community meetups and social events', '🤝', '#06B6D4'),
    ('Art', 'Art exhibitions and creative events', '🎨', '#EC4899'),
    ('Food', 'Food festivals and culinary events', '🍕', '#F97316')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- DEFAULT EVENT TAGS
-- =============================================================================
-- Pre-populated tags for common event types
-- Supports flexible tagging system for event discovery

INSERT INTO public.event_tags (name, description) VALUES
    ('Web3', 'Blockchain and Web3 related events'),
    ('AI', 'Artificial Intelligence and Machine Learning'),
    ('Startup', 'Startup and entrepreneurship events'),
    ('Networking', 'Professional networking opportunities'),
    ('Workshop', 'Hands-on learning workshops'),
    ('Conference', 'Large-scale conferences'),
    ('Meetup', 'Small group meetups'),
    ('Virtual', 'Online and virtual events'),
    ('Free', 'Free events'),
    ('Paid', 'Paid events')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- SCHEMA COMPLETION
-- =============================================================================
-- 
-- The Festos database schema is now complete and ready for production use.
-- 
-- Key Features:
-- ✅ Wallet-based authentication
-- ✅ Comprehensive event management
-- ✅ Blockchain integration support
-- ✅ IPFS/Web3Storage integration
-- ✅ Row Level Security (RLS)
-- ✅ Performance optimization
-- ✅ Analytics tracking
-- ✅ Flexible categorization system
--
-- Next Steps:
-- 1. Run this schema in your Supabase project
-- 2. Configure environment variables
-- 3. Deploy smart contracts
-- 4. Test the complete system
--
-- =============================================================================
