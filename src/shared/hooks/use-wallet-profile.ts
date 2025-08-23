'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './use-wallet';
import { getUsernameFromWallet } from '@/shared/utils/event-helpers';

// Avatar color generation function (moved from connect-button.tsx)
const getAvatarColor = (address: string) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];

  if (!address) return colors[0];

  const hash = address.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return colors[Math.abs(hash) % colors.length];
};

// Get initials from wallet address or name
const getInitials = (address: string, name?: string) => {
  if (name) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  return address ? address.slice(2, 4).toUpperCase() : 'UN';
};

export interface WalletProfile {
  address: string | undefined;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  avatarColor: string;
  avatarInitials: string;
  profileUrl: string;
}

export function useWalletProfile() {
  const { address, isConnected } = useWallet();
  const [profile, setProfile] = useState<WalletProfile | null>(null);

  // Function to load user profile data
  const loadProfile = useCallback(async () => {
    if (!address) {
      setProfile(null);
      return;
    }

    // Generate username from wallet address (real implementation would fetch from API/DB)
    const username = getUsernameFromWallet(address);
    // const displayAddress = formatAddress(address); // Unused variable

    // In a real app, we would fetch profile data from API here
    // For now, we'll create a mock profile
    setProfile({
      address,
      username,
      displayName: username, // In real app, this could be a custom name set by user
      avatarUrl: null, // In real app, this would come from user data
      isVerified: false, // In real app, this would be based on verification status
      avatarColor: getAvatarColor(address),
      avatarInitials: getInitials(address, username),
      profileUrl: `/user/${username}`,
    });
  }, [address]);

  // Load profile data on address change or connection
  useEffect(() => {
    if (isConnected && address) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [isConnected, address, loadProfile]);

  return {
    profile,
    isLoading: isConnected && !profile,
    loadProfile,

    // Helper functions
    getAvatarColor,
    getInitials,
  };
}
