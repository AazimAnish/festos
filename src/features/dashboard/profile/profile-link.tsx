'use client';

import { useWallet } from '@/shared/hooks/use-wallet';
import { getUsernameFromWallet } from '@/shared/utils/event-helpers';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

interface ProfileLinkProps {
  children: React.ReactNode;
  className?: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ProfileLink({
  children,
  className,
  variant = 'ghost',
  size = 'sm',
}: ProfileLinkProps) {
  const { address, isConnected } = useWallet();

  // Generate username from wallet address
  const username =
    isConnected && address ? getUsernameFromWallet(address) : 'anonymous';

  return (
    <Link href={`/user/${username}`}>
      <Button variant={variant} size={size} className={className}>
        {children}
      </Button>
    </Link>
  );
}
