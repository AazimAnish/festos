-- =============================================================================
-- FESTOS DATABASE FUNCTIONS AND TRIGGERS
-- =============================================================================
-- 
-- This file contains database functions and triggers for automation.
-- Automatically updates timestamps and maintains data consistency.
--
-- Author: Festos Development Team
-- Version: 1.0.0
-- Last Updated: 2024
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

-- =============================================================================
-- APPLY TRIGGERS TO TABLES
-- =============================================================================
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
