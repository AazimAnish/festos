-- =============================================================================
-- MIGRATION: Add attendee_name and attendee_email columns to tickets table
-- =============================================================================
-- 
-- This migration adds the missing attendee_name and attendee_email columns
-- to the tickets table to support ticket purchase functionality.
--
-- Author: Festos Development Team
-- Version: 1.0.0
-- Date: 2025-08-27
-- =============================================================================

-- Add attendee_name column
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS attendee_name TEXT;

-- Add attendee_email column  
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS attendee_email TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.tickets.attendee_name IS 'Name of the attendee for this ticket';
COMMENT ON COLUMN public.tickets.attendee_email IS 'Email address of the attendee for this ticket';

-- Update existing tickets to have default values if needed
UPDATE public.tickets 
SET attendee_name = 'Anonymous'
WHERE attendee_name IS NULL;

UPDATE public.tickets 
SET attendee_email = 'no-email@example.com'
WHERE attendee_email IS NULL;

-- Make columns NOT NULL after setting default values
ALTER TABLE public.tickets 
ALTER COLUMN attendee_name SET NOT NULL;

ALTER TABLE public.tickets 
ALTER COLUMN attendee_email SET NOT NULL;

