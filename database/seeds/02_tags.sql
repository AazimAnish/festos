-- =============================================================================
-- FESTOS DEFAULT TAGS
-- =============================================================================
-- 
-- This file contains default event tags for flexible categorization.
-- Supports the flexible tagging system for event discovery.
--
-- Author: Festos Development Team
-- Version: 1.0.0
-- Last Updated: 2024
-- =============================================================================

-- =============================================================================
-- DEFAULT EVENT TAGS
-- =============================================================================
-- Pre-populated tags for common event types

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
