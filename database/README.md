# Festos Database Setup

This directory contains all the database schema and setup files for the Festos platform.

## Quick Setup (Recommended)

### Step 1: Check Current Status

First, let's see what's currently in your database:

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the contents of `database/quick-check.sql`
4. Click **Run** to see the current status

### Step 2: Run the Setup Script (if needed)

If the quick check shows missing tables:

1. Copy and paste the contents of `database/supabase-setup.sql`
2. Click **Run** to execute the script
3. Wait for the success message

### Step 3: Test the Setup

1. Copy and paste the contents of `database/test-connection.sql`
2. Click **Run** to create a test event
3. You should see a test event created successfully

### Step 4: Verify Everything Works

1. Copy and paste the contents of `database/verify-setup.sql`
2. Click **Run** to verify everything is working correctly
3. You should see all green checkmarks (✅)

## What Gets Created

### Tables
- **users** - User accounts with wallet authentication
- **events** - Event management with blockchain integration  
- **tickets** - Event registrations and purchases
- **categories** - Event categorization system
- **tags** - Flexible tagging system

### Features
- ✅ Row Level Security (RLS) policies
- ✅ Automatic timestamp updates
- ✅ Performance indexes
- ✅ Full-text search capabilities
- ✅ Blockchain integration support
- ✅ IPFS/Filebase integration
- ✅ Seed data for categories and tags

## Manual Setup (Advanced)

If you prefer to run files individually:

1. **Extensions**: `01_extensions.sql`
2. **Core Tables**: `02_core_tables.sql`  
3. **Supporting Tables**: `03_supporting_tables.sql`
4. **Indexes**: `04_indexes.sql`
5. **Functions**: `01_triggers.sql`
6. **Security**: `02_security.sql`
7. **Seeds**: `01_categories.sql`, `02_tags.sql`

## Environment Variables

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing

After setup, test the API:

1. Start your development server: `bun run dev`
2. Visit: `http://localhost:3000/discover`
3. The page should load without database errors
4. Create a test event to verify everything works

## Troubleshooting

### "relation does not exist" errors
- **First**: Run `database/quick-check.sql` to see what's missing
- **Then**: Run the `database/supabase-setup.sql` script in your Supabase SQL editor
- **Finally**: Run `database/test-connection.sql` to verify it works

### RLS policy errors  
- Make sure you're authenticated in your app
- Check that RLS policies are properly created
- The setup script includes RLS policies, but you may need to adjust them

### Permission errors
- Verify your Supabase anon key has the correct permissions
- Check that RLS policies allow the operations you're trying to perform
- Make sure your environment variables are correct

### Application still shows errors after database setup
1. **Restart your development server**: Stop `bun run dev` and start it again
2. **Clear browser cache**: Hard refresh the page (Ctrl+Shift+R)
3. **Check the API directly**: Visit `http://localhost:3000/api/events` in your browser
4. **Verify database connection**: Run `database/test-connection.sql` to ensure the database is accessible

### Common Issues

**Issue**: "Events table not found" error
**Solution**: Run `database/supabase-setup.sql` in Supabase SQL Editor

**Issue**: API returns 500 errors
**Solution**: Check Supabase logs and ensure all tables were created successfully

**Issue**: No events showing in discover page
**Solution**: Create a test event using `database/test-connection.sql` or create an event through the app

## Support

If you encounter issues:
1. Run `verify-setup.sql` to check what's missing
2. Check the Supabase logs for detailed error messages
3. Ensure your environment variables are correct
