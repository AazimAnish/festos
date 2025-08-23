-- =============================================================================
-- FESTOS DATABASE VERIFICATION
-- =============================================================================
-- 
-- Quick verification script to check if the database is properly set up.
-- Run this after running supabase-setup.sql
-- =============================================================================

-- Check if all required tables exist
SELECT 
    'Table Verification' as check_type,
    CASE 
        WHEN COUNT(*) = 5 THEN '✅ All tables exist'
        ELSE '❌ Missing tables: ' || (5 - COUNT(*))::text
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'events', 'tickets', 'categories', 'tags');

-- Check if extensions are installed
SELECT 
    'Extensions' as check_type,
    CASE 
        WHEN COUNT(*) >= 2 THEN '✅ Required extensions installed'
        ELSE '❌ Missing extensions'
    END as status
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- Check if RLS is enabled
SELECT 
    'Row Level Security' as check_type,
    CASE 
        WHEN COUNT(*) = 5 THEN '✅ RLS enabled on all tables'
        ELSE '❌ RLS not properly configured'
    END as status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
    AND c.relname IN ('users', 'events', 'tickets', 'categories', 'tags')
    AND c.relrowsecurity = true;

-- Check seed data
SELECT 
    'Seed Data' as check_type,
    CASE 
        WHEN (SELECT COUNT(*) FROM public.categories) > 0 
             AND (SELECT COUNT(*) FROM public.tags) > 0 
        THEN '✅ Seed data loaded'
        ELSE '❌ Seed data missing'
    END as status;

-- Show table details
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = t.table_name AND table_schema = 'public') as column_count,
    CASE 
        WHEN table_name = 'users' THEN (SELECT COUNT(*) FROM public.users)
        WHEN table_name = 'events' THEN (SELECT COUNT(*) FROM public.events)
        WHEN table_name = 'tickets' THEN (SELECT COUNT(*) FROM public.tickets)
        WHEN table_name = 'categories' THEN (SELECT COUNT(*) FROM public.categories)
        WHEN table_name = 'tags' THEN (SELECT COUNT(*) FROM public.tags)
    END as row_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'events', 'tickets', 'categories', 'tags')
ORDER BY table_name;
