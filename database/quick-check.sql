-- =============================================================================
-- QUICK DATABASE CHECK
-- =============================================================================
-- 
-- Run this script to quickly check if your database is set up correctly.
-- =============================================================================

-- Check if events table exists
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'events'
        ) THEN '✅ Events table exists'
        ELSE '❌ Events table does NOT exist - Run supabase-setup.sql first!'
    END as events_table_status;

-- Check if users table exists  
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
        ) THEN '✅ Users table exists'
        ELSE '❌ Users table does NOT exist - Run supabase-setup.sql first!'
    END as users_table_status;

-- Check if required extensions are installed
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM pg_extension WHERE extname = 'uuid-ossp') 
        THEN '✅ uuid-ossp extension installed'
        ELSE '❌ uuid-ossp extension missing'
    END as uuid_extension_status;

-- Check if any events exist
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM public.events LIMIT 1) 
        THEN '✅ Events table has data'
        ELSE 'ℹ️  Events table is empty (this is normal for new setup)'
    END as events_data_status;

-- Show all public tables
SELECT 
    'Available Tables' as info,
    string_agg(table_name, ', ') as tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
