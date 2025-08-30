/**
 * Wallet Authentication Hook
 * 
 * Manages wallet authentication state and JWT tokens for the Festos platform.
 */

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth';

interface AuthUser {
  id: string;
  wallet_address: string;
  display_name: string;
}

interface UseWalletAuthReturn {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authenticate: (walletAddress: string) => Promise<void>;
  logout: () => void;
}

export function useWalletAuth(): UseWalletAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { ready, authenticated, login, logout: privyLogout, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  
  const address = wallets.length > 0 ? wallets[0].address : null;
  // const isConnected = authenticated && !!address; // Temporarily unused

  // Load authentication state when Privy is ready
  useEffect(() => {
    if (ready && authenticated && address) {
      // Create or load user data
      const userData = {
        id: address.toLowerCase(),
        wallet_address: address,
        display_name: `${address.slice(0, 6)}...${address.slice(-4)}`
      };
      setUser(userData);
      
      // Get Privy access token
      getAccessToken().then((accessToken) => {
        if (accessToken) {
          setToken(accessToken);
        }
      }).catch(console.error);
    } else if (!authenticated) {
      setUser(null);
      setToken(null);
    }
  }, [ready, authenticated, address, getAccessToken]);

  // Authenticate wallet address using Privy
  const authenticate = useCallback(async (_walletAddress?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!authenticated) {
        await login();
      }
      // Privy handles authentication automatically
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      console.error('Wallet authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, login]);

  // Logout using Privy
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    privyLogout();
  }, [privyLogout]);

  return {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    error,
    authenticate,
    logout,
  };
}

/**
 * Hook to get authenticated fetch function
 */
export function useAuthenticatedFetch() {
  const { token } = useWalletAuth();

  return useCallback(async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }, [token]);
}
