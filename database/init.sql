-- =============================================================================
-- FESTOS DATABASE INITIALIZATION
-- =============================================================================
-- 
-- Main initialization script for the Festos database schema.
-- This file runs all database components in the correct order.
--
-- Usage:
-- 1. Run this script in your Supabase SQL editor
-- 2. Or run individual files as needed
-- 3. All files are idempotent and safe to run multiple times
--
-- Architecture:
-- 1. Extensions - PostgreSQL extensions
-- 2. Core Tables - Main business entities
-- 3. Supporting Tables - Additional functionality
-- 4. Indexes - Performance optimization
-- 5. Functions/Triggers - Automation
-- 6. Security - Row Level Security policies
-- 7. Seeds - Default data
--
-- Author: Festos Development Team
-- Version: 1.0.0
-- Last Updated: 2024
-- =============================================================================

-- =============================================================================
-- 1. EXTENSIONS
-- =============================================================================
\i database/schemas/01_extensions.sql

-- =============================================================================
-- 2. CORE TABLES
-- =============================================================================
\i database/schemas/02_core_tables.sql

-- =============================================================================
-- 3. SUPPORTING TABLES
-- =============================================================================
\i database/schemas/03_supporting_tables.sql

-- =============================================================================
-- 4. INDEXES
-- =============================================================================
\i database/schemas/04_indexes.sql

-- =============================================================================
-- 5. FUNCTIONS AND TRIGGERS
-- =============================================================================
\i database/functions/01_triggers.sql

-- =============================================================================
-- 6. SECURITY POLICIES
-- =============================================================================
\i database/functions/02_security.sql

-- =============================================================================
-- 7. DEFAULT DATA
-- =============================================================================
\i database/seeds/01_categories.sql
\i database/seeds/02_tags.sql

-- =============================================================================
-- INITIALIZATION COMPLETE
-- =============================================================================
-- 
-- The Festos database schema has been successfully initialized.
-- 
-- Key Features Enabled:
-- ✅ Wallet-based authentication
-- ✅ Comprehensive event management
-- ✅ Blockchain integration support
-- ✅ IPFS/Web3Storage integration
-- ✅ Row Level Security (RLS)
-- ✅ Performance optimization
-- ✅ Analytics tracking
-- ✅ Flexible categorization system
--
-- Next Steps:
-- 1. Verify all tables were created successfully
-- 2. Test RLS policies with sample data
-- 3. Configure application environment variables
-- 4. Deploy smart contracts
--
-- =============================================================================
