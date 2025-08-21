-- =============================================================================
-- FESTOS DEFAULT CATEGORIES
-- =============================================================================
-- 
-- This file contains default event categories for better user experience.
-- Users can select from these categories when creating events.
--
-- Author: Festos Development Team
-- Version: 1.0.0
-- Last Updated: 2024
-- =============================================================================

-- =============================================================================
-- DEFAULT EVENT CATEGORIES
-- =============================================================================
-- Pre-populated categories for better user experience

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
