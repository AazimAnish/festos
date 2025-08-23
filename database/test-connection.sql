-- =============================================================================
-- DATABASE CONNECTION TEST
-- =============================================================================
-- 
-- This script tests the database connection and creates a test event.
-- Run this after setting up the database to verify everything works.
-- =============================================================================

-- Test 1: Check if we can connect and query
SELECT 'Database connection test' as test_name, 'PASSED' as status;

-- Test 2: Check if extensions are working
SELECT 
    'UUID generation test' as test_name,
    CASE 
        WHEN uuid_generate_v4() IS NOT NULL THEN 'PASSED'
        ELSE 'FAILED'
    END as status;

-- Test 3: Create a test user
INSERT INTO public.users (wallet_address, display_name, email) 
VALUES (
    '0x1234567890123456789012345678901234567890',
    'Test User',
    'test@example.com'
) ON CONFLICT (wallet_address) DO NOTHING
RETURNING id, wallet_address;

-- Test 4: Create a test event
WITH test_user AS (
    SELECT id FROM public.users 
    WHERE wallet_address = '0x1234567890123456789012345678901234567890'
    LIMIT 1
)
INSERT INTO public.events (
    title,
    description,
    location,
    start_date,
    end_date,
    max_capacity,
    ticket_price,
    require_approval,
    has_poap,
    visibility,
    timezone,
    category,
    tags,
    creator_id,
    status,
    slug
)
SELECT 
    'Test Event - Festos Platform',
    'This is a test event to verify the database is working correctly.',
    'Test Location, Test City',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
    100,
    '10.00',
    FALSE,
    TRUE,
    'public',
    'UTC',
    'Technology',
    ARRAY['test', 'festos', 'blockchain'],
    test_user.id,
    'active',
    'test-event-festos-platform-' || EXTRACT(EPOCH FROM NOW())::integer
FROM test_user
ON CONFLICT (slug) DO NOTHING
RETURNING id, title, slug, created_at;

-- Test 5: Verify the test event was created
SELECT 
    'Test event verification' as test_name,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASSED - ' || COUNT(*) || ' events found'
        ELSE 'FAILED - No events found'
    END as status
FROM public.events 
WHERE title LIKE '%Test Event%';

-- Test 6: Show all events (should include our test event)
SELECT 
    id,
    title,
    location,
    start_date,
    status,
    created_at
FROM public.events 
ORDER BY created_at DESC
LIMIT 5;

-- =============================================================================
-- CLEANUP (Optional - uncomment to remove test data)
-- =============================================================================
-- DELETE FROM public.events WHERE title LIKE '%Test Event%';
-- DELETE FROM public.users WHERE wallet_address = '0x1234567890123456789012345678901234567890';
