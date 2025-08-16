"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useWalletProfile } from '@/lib/hooks/use-wallet-profile';

export function CustomConnectButton() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { profile } = useWalletProfile();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    type="button"
                    className="font-secondary rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20 px-3 sm:px-4 py-2.5 sm:py-3 h-10 sm:h-11"
                  >
                    💳 Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    type="button"
                    className="font-secondary rounded-xl border-2 border-error text-error hover:bg-error/5 transition-all duration-200 hover:scale-105 active:scale-95 px-3 sm:px-4 py-2.5 sm:py-3 h-10 sm:h-11"
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className="relative">
                  <Button
                    onClick={() => setShowDropdown(!showDropdown)}
                    type="button"
                    className="font-secondary rounded-xl bg-background border-border border text-foreground hover:bg-accent/20 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg px-3 sm:px-4 py-2 sm:py-2.5 h-10 sm:h-11 flex items-center gap-2"
                  >
                    {/* User Avatar */}
                    <Avatar className="w-7 h-7 border border-border">
                      {profile?.avatarUrl ? (
                        <AvatarImage src={profile.avatarUrl} alt={profile.displayName || 'User'} />
                      ) : (
                        <AvatarFallback className={profile?.avatarColor}>
                          {profile?.avatarInitials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    {/* Account Info */}
                    <div className="flex flex-col items-start leading-none">
                      <span className="font-secondary text-sm font-medium">
                        {profile?.displayName || account.displayName}
                      </span>
                      
                      {/* Balance as secondary line */}
                      {account.displayBalance && (
                        <span className="text-xs text-muted-foreground">
                          {account.displayBalance}
                        </span>
                      )}
                    </div>
                    
                    {/* Dropdown Arrow */}
                    <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                  </Button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-60 bg-background/95 backdrop-blur-md border-2 border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                      {/* User Header */}
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border border-border">
                            {profile?.avatarUrl ? (
                              <AvatarImage src={profile.avatarUrl} alt={profile.displayName || 'User'} />
                            ) : (
                              <AvatarFallback className={profile?.avatarColor}>
                                {profile?.avatarInitials}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-secondary font-medium text-sm">
                              {profile?.displayName || account.displayName}
                            </div>
                            <div className="font-mono text-xs text-muted-foreground">
                              {account.displayBalance}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2 space-y-1">
                        {/* Profile Option - First for emphasis */}
                        {profile && (
                          <Link href={profile.profileUrl} prefetch={true}>
                            <button
                              onClick={() => setShowDropdown(false)}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors duration-200 font-secondary text-sm flex items-center gap-2 text-primary"
                            >
                              <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/40"></div>
                              View Profile
                            </button>
                          </Link>
                        )}
                        
                        {/* Network Switch Option */}
                        <button
                          onClick={() => {
                            openChainModal();
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors duration-200 font-secondary text-sm flex items-center gap-2"
                        >
                          <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/40"></div>
                          Switch Network
                        </button>
                        
                        {/* Account Details Option */}
                        <button
                          onClick={() => {
                            openAccountModal();
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors duration-200 font-secondary text-sm flex items-center gap-2"
                        >
                          <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/40"></div>
                          Account Details
                        </button>

                        {/* Dashboard Link */}
                        <Link href="/dashboard" prefetch={true}>
                          <button
                            onClick={() => setShowDropdown(false)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors duration-200 font-secondary text-sm flex items-center gap-2"
                          >
                            <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/40"></div>
                            My Dashboard
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
} 