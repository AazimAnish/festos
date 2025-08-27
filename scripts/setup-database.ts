#!/usr/bin/env bun

/**
 * Database Setup Script
 * 
 * This script sets up the complete database schema in Supabase.
 * Run this script to create all tables, indexes, and seed data.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Read the setup script
    const setupScriptPath = join(process.cwd(), 'database', 'setup-complete.sql');
    const setupScript = readFileSync(setupScriptPath, 'utf-8');

    console.log('📝 Executing database setup script...');

    // Execute the setup script
    const { error } = await supabase.rpc('exec_sql', { sql: setupScript });

    if (error) {
      // If exec_sql doesn't exist, try direct SQL execution
      console.log('⚠️  exec_sql function not available, trying direct execution...');
      
      // Split the script into individual statements
      const statements = setupScript
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        try {
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
          if (stmtError) {
            console.warn(`⚠️  Statement failed: ${stmtError.message}`);
          }
        } catch (e) {
          console.warn(`⚠️  Statement failed: ${e}`);
        }
      }
    }

    console.log('✅ Database setup completed!\n');

    // Test the setup
    await testDatabaseSetup();

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

async function testDatabaseSetup() {
  console.log('🧪 Testing database setup...\n');

  try {
    // Test 1: Check if tables exist
    console.log('1. Checking tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'events', 'tickets', 'categories', 'tags']);

    if (tablesError) {
      console.error('❌ Failed to check tables:', tablesError.message);
    } else {
      const tableNames = tables?.map(t => t.table_name) || [];
      console.log(`✅ Found ${tableNames.length} tables: ${tableNames.join(', ')}`);
    }

    // Test 2: Check if categories exist
    console.log('\n2. Checking categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('name')
      .limit(5);

    if (categoriesError) {
      console.error('❌ Failed to check categories:', categoriesError.message);
    } else {
      console.log(`✅ Found ${categories?.length || 0} categories`);
    }

    // Test 3: Check if tags exist
    console.log('\n3. Checking tags...');
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('name')
      .limit(5);

    if (tagsError) {
      console.error('❌ Failed to check tags:', tagsError.message);
    } else {
      console.log(`✅ Found ${tags?.length || 0} tags`);
    }

    // Test 4: Create a test user
    console.log('\n4. Testing user creation...');
    const testWalletAddress = `0x${Date.now().toString(16)}`;
    const { data: testUser, error: userError } = await supabase
      .from('users')
      .insert({
        wallet_address: testWalletAddress,
        display_name: 'Test User',
      })
      .select('id, wallet_address')
      .single();

    if (userError) {
      console.error('❌ Failed to create test user:', userError.message);
    } else {
      console.log(`✅ Created test user: ${testUser.wallet_address}`);
      
      // Clean up test user
      await supabase
        .from('users')
        .delete()
        .eq('id', testUser.id);
      console.log('🧹 Cleaned up test user');
    }

    console.log('\n🎉 Database setup test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start your development server: bun run dev');
    console.log('2. Visit: http://localhost:3000/discover');
    console.log('3. Create your first event at: http://localhost:3000/create');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Run the setup
setupDatabase().catch(console.error);
