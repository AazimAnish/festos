-- =============================================================================
-- FESTOS SUPPORTING TABLES
-- =============================================================================
-- 
-- This file contains supporting tables that extend core functionality.
-- These tables provide additional features and organizational structure.
--
-- Tables:
-- - user_profiles: Extended user profile information
-- - event_categories: Event categorization system
-- - event_tags: Flexible tagging system
-- - event_analytics: Performance tracking
-- - user_sessions: Session management
--
-- Author: Festos Development Team
-- Version: 1.0.0
-- Last Updated: 2024
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
