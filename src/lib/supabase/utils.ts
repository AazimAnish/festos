import { createClient as createServerClient } from './server'
import { createClient as createBrowserClient } from './client'
import { cookies } from 'next/headers'

/**
 * Get the current user from the server
 */
export async function getCurrentUser() {
  const cookieStore = cookies()
  const supabase = await createServerClient(cookieStore)
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error.message)
    return null
  }
  
  return user
}

/**
 * Get the current session from the server
 */
export async function getCurrentSession() {
  const cookieStore = cookies()
  const supabase = await createServerClient(cookieStore)
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting session:', error.message)
    return null
  }
  
  return session
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const cookieStore = cookies()
  const supabase = await createServerClient(cookieStore)
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error.message)
    throw error
  }
}

/**
 * Create a browser client instance
 */
export function createClient() {
  return createBrowserClient()
} 