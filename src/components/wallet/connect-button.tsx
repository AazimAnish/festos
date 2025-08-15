"use client";

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function CustomConnectButton() {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

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
                    className="font-secondary rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20 px-4 sm:px-5 py-2.5 sm:py-3 h-10 sm:h-11 flex items-center gap-2"
                  >
                    {/* Network Icon */}
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            width={16}
                            height={16}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                    
                    {/* Account Info */}
                    <span className="font-mono text-sm">
                      {account.displayName}
                    </span>
                    
                    {/* Balance */}
                    {account.displayBalance && (
                      <span className="text-xs opacity-80">
                        ({account.displayBalance})
                      </span>
                    )}
                    
                    {/* Dropdown Arrow */}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                  </Button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-background/95 backdrop-blur-md border-2 border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                      <div className="p-2 space-y-1">
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

                        {/* Profile Option */}
                        <button
                          onClick={() => {
                            const walletAddress = account?.address ?? account?.displayName;
                            if (walletAddress) {
                              router.push(`/profile/${walletAddress}`);
                            }
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors duration-200 font-secondary text-sm flex items-center gap-2"
                        >
                          <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/40"></div>
                          Profile
                        </button>
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