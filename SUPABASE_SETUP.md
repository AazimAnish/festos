# Supabase Setup Guide

This project is configured with Supabase for authentication and database operations. Follow these steps to complete the setup.

## 1. Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```bash
# Copy the example file
cp env.example .env.local
```

Then edit `.env.local` and add your Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is created, go to Settings > API
3. Copy the `Project URL` and `anon public` key
4. Paste them in your `.env.local` file

## 3. Database Schema

The project includes TypeScript types for a basic todo application. You can generate your own types from your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the TypeScript types from the "TypeScript" section
4. Replace the content in `src/lib/supabase/types.ts`

## 4. Usage Examples

### Server Components

```typescript
import { createServerClient } from '@/lib/supabase'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  
  const { data: todos } = await supabase
    .from('todos')
    .select('*')
  
  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

### Client Components

```typescript
'use client'

import { createBrowserClient } from '@/lib/supabase'

export default function ClientComponent() {
  const supabase = createBrowserClient()
  
  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    })
    if (error) console.error('Error:', error.message)
  }
  
  return <button onClick={handleSignIn}>Sign In</button>
}
```

### Utility Functions

```typescript
import { getCurrentUser, getCurrentSession } from '@/lib/supabase'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  const session = await getCurrentSession()
  
  if (!user) {
    return <div>Please sign in</div>
  }
  
  return <div>Welcome, {user.email}</div>
}
```

## 5. Authentication

The middleware (`src/middleware.ts`) automatically handles session refresh for all routes. This ensures that user sessions are properly maintained across your application.

## 6. Row Level Security (RLS)

Make sure to enable Row Level Security on your tables in Supabase and create appropriate policies. For example:

```sql
-- Enable RLS on todos table
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own todos
CREATE POLICY "Users can view own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own todos
CREATE POLICY "Users can insert own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 7. Development

Start the development server:

```bash
bun dev
```

The application will be available at `http://localhost:3000`

## 8. Production

For production deployment:

1. Set up your environment variables in your hosting platform
2. Ensure your Supabase project is in production mode
3. Configure your domain in Supabase Auth settings if using custom domains

## File Structure

```
src/lib/supabase/
├── index.ts          # Main exports
├── server.ts         # Server-side client
├── client.ts         # Browser client
├── middleware.ts     # Middleware client
├── utils.ts          # Utility functions
└── types.ts          # TypeScript types
```

## Troubleshooting

- **Environment variables not loading**: Make sure your `.env.local` file is in the root directory
- **Authentication not working**: Check that your Supabase URL and key are correct
- **TypeScript errors**: Regenerate types from your Supabase dashboard if you've changed your schema 