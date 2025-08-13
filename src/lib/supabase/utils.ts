import { createClient as createServerClient } from './server'
import { createClient as createBrowserClient } from './client'

/**
 * Get the current user from the server
 */
export async function getCurrentUser() {
  const supabase = await createServerClient()
  
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
  const supabase = await createServerClient()
  
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
  const supabase = await createServerClient()
  
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