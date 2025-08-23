/**
 * Wallet Authentication Utilities
 * 
 * Handles wallet-based authentication for the Festos platform.
 * Creates JWT tokens with wallet addresses for Supabase RLS policies.
 */

// Supabase client removed - using blockchain only
import { SignJWT, jwtVerify } from 'jose';

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * Create a JWT token for wallet authentication
 */
export async function createWalletToken(walletAddress: string): Promise<string> {
  const token = await new SignJWT({ 
    wallet_address: walletAddress.toLowerCase(),
    sub: walletAddress.toLowerCase(),
    aud: 'authenticated',
    role: 'authenticated'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(JWT_SECRET));

  return token;
}

/**
 * Verify a wallet JWT token
 */
export async function verifyWalletToken(token: string): Promise<{ wallet_address: string } | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return {
      wallet_address: payload.wallet_address as string
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get authenticated user from request headers
 */
export async function getAuthenticatedUser(request: Request): Promise<{ wallet_address: string } | null> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return await verifyWalletToken(token);
}

/**
 * Create authenticated client with wallet token
 */
export async function createAuthenticatedClient(walletAddress: string) {
  const token = await createWalletToken(walletAddress);
  
  // Return token for authentication
  return { token };
}

/**
 * Middleware to require wallet authentication
 */
export function requireWalletAuth<T extends unknown[]>(
  handler: (request: Request & { user: { wallet_address: string } }, ...args: T) => Promise<Response>
) {
  return async (request: Request, ...args: T): Promise<Response> => {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return new Response(
        JSON.stringify({ 
          error: 'Wallet authentication required',
          message: 'Please connect your wallet to perform this action'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Add the authenticated user to the request context
    const authenticatedRequest = {
      ...request,
      user
    } as Request & { user: { wallet_address: string } };

    return handler(authenticatedRequest, ...args);
  };
}

/**
 * Optional wallet authentication middleware
 */
export function optionalWalletAuth<T extends unknown[]>(
  handler: (request: Request & { user: { wallet_address: string } | null }, ...args: T) => Promise<Response>
) {
  return async (request: Request, ...args: T): Promise<Response> => {
    const user = await getAuthenticatedUser(request);
    
    // Add the user (or null) to the request context
    const authenticatedRequest = {
      ...request,
      user
    } as Request & { user: { wallet_address: string } | null };

    return handler(authenticatedRequest, ...args);
  };
}
