-- =============================================================================
-- FESTOS DATABASE INDEXES
-- =============================================================================
-- 
-- This file contains database indexes for performance optimization.
-- Strategic indexes are focused on common query patterns and foreign key relationships.
--
-- Author: Festos Development Team
-- Version: 1.0.0
-- Last Updated: 2024
-- =============================================================================

-- =============================================================================
-- USERS TABLE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- =============================================================================
-- EVENTS TABLE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_events_creator_id ON public.events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_visibility ON public.events(visibility);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_contract_event_id ON public.events(contract_event_id);
CREATE INDEX IF NOT EXISTS idx_events_web3storage_metadata_cid ON public.events(web3storage_metadata_cid);

-- =============================================================================
-- TICKETS TABLE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_attendee_id ON public.tickets(attendee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_contract_ticket_id ON public.tickets(contract_ticket_id);

-- =============================================================================
-- SESSIONS TABLE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);
