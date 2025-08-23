/**
 * Wallet Authentication Hook
 * 
 * Manages wallet authentication state and JWT tokens for the Festos platform.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

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

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('festos_wallet_token');
    const savedUser = localStorage.getItem('festos_wallet_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to load saved auth state:', err);
        localStorage.removeItem('festos_wallet_token');
        localStorage.removeItem('festos_wallet_user');
      }
    }
  }, []);

  // Authenticate wallet address
  const authenticate = useCallback(async (walletAddress: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          // TODO: Add signature verification
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Save to state and localStorage
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('festos_wallet_token', data.token);
      localStorage.setItem('festos_wallet_user', JSON.stringify(data.user));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      console.error('Wallet authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('festos_wallet_token');
    localStorage.removeItem('festos_wallet_user');
    disconnect();
  }, [disconnect]);

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (isConnected && address && !user) {
      authenticate(address);
    }
  }, [isConnected, address, user, authenticate]);

  // Clear auth when wallet disconnects
  useEffect(() => {
    if (!isConnected && user) {
      logout();
    }
  }, [isConnected, user, logout]);

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
