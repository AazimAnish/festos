-- =============================================================================
-- FESTOS CORE TABLES
-- =============================================================================
-- 
-- This file contains the core entity tables for the Festos platform.
-- These are the primary business entities that drive the application.
--
-- Tables:
-- - users: User accounts with wallet-based authentication
-- - events: Event management with blockchain integration
-- - tickets: Event registrations and ticket purchases
--
-- Author: Festos Development Team
-- Version: 1.0.0
-- Last Updated: 2024
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
