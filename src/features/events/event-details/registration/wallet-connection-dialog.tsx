'use client';

import { memo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Wallet,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { useWallet } from '@/shared/hooks/use-wallet';
import { RegistrationFormPreview } from '../registration-form-preview';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { FormField, EventData } from '@/shared/types/registration';

interface WalletConnectionDialogProps {
  eventData: EventData;
  registrationForm: FormField[];
}

export const WalletConnectionDialog = memo(function WalletConnectionDialog({
  eventData,
  registrationForm,
}: WalletConnectionDialogProps) {
  const { isConnected, isAvalanche, address } = useWallet();
  const [showRegistration, setShowRegistration] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleProceedToRegistration = () => {
    setShowRegistration(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setShowRegistration(false);
  };

  // If wallet is connected and on Avalanche, show registration form
  if (showRegistration && isConnected && isAvalanche) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className='w-full font-secondary text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-5 h-auto bg-primary text-primary-foreground rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 text-center'>
            🎟️ Register Now
          </Button>
        </DialogTrigger>
        <DialogContent className='max-w-md sm:max-w-lg lg:max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='font-primary text-lg sm:text-xl font-bold text-foreground'>
              Register for {eventData.title}
            </DialogTitle>
          </DialogHeader>
          <RegistrationFormPreview
            form={registrationForm}
            eventData={eventData}
            onClose={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Show wallet connection requirement
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className='w-full font-secondary text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-5 h-auto bg-primary text-primary-foreground rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 text-center'>
          🎟️ Register Now
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-md sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='font-primary text-lg sm:text-xl font-bold text-foreground'>
            Connect Wallet to Register
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Wallet Status */}
          <Card className='border-2 border-border bg-background/80 backdrop-blur-sm shadow-lg rounded-3xl'>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <Wallet className='h-5 w-5 text-primary' />
                    <span className='font-secondary font-medium text-foreground'>
                      Wallet Connection
                    </span>
                  </div>
                  {isConnected ? (
                    <Badge className='bg-success/10 text-success border-success/20'>
                      <CheckCircle className='w-3 h-3 mr-1' />
                      Connected
                    </Badge>
                  ) : (
                    <Badge
                      variant='secondary'
                      className='bg-warning/10 text-warning border-warning/20'
                    >
                      <AlertCircle className='w-3 h-3 mr-1' />
                      Wrong Network
                    </Badge>
                  )}
                </div>

                {isConnected && (
                  <div className='space-y-2'>
                    <div className='text-xs text-gray font-mono bg-muted/50 p-3 rounded-3xl border border-border backdrop-blur-sm'>
                      {address
                        ? `${address.slice(0, 6)}...${address.slice(-4)}`
                        : 'Loading...'}
                    </div>

                    <div className='flex items-center space-x-2 text-xs'>
                      <span className='text-gray'>Network:</span>
                      <span className='font-mono'>
                        {isAvalanche ? '❄️ Avalanche' : '🔗 Other Network'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <div className='space-y-3'>
            <h4 className='font-secondary text-base font-medium text-foreground'>
              Requirements:
            </h4>
            <div className='space-y-2'>
              <div
                className={`flex items-center space-x-2 text-sm ${isConnected ? 'text-success' : 'text-gray'}`}
              >
                <CheckCircle
                  className={`h-4 w-4 ${isConnected ? 'text-success' : 'text-gray'}`}
                />
                <span>Wallet Connected</span>
              </div>
              <div
                className={`flex items-center space-x-2 text-sm ${isAvalanche ? 'text-success' : 'text-gray'}`}
              >
                <CheckCircle
                  className={`h-4 w-4 ${isAvalanche ? 'text-success' : 'text-gray'}`}
                />
                <span>Avalanche Network</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='space-y-3'>
            {!isConnected ? (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button
                    onClick={openConnectModal}
                    className='w-full font-secondary bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20 rounded-xl px-6 py-4 h-auto text-base'
                  >
                    💳 Connect Wallet
                    <ArrowRight className='h-5 w-5 ml-2' />
                  </Button>
                )}
              </ConnectButton.Custom>
            ) : !isAvalanche ? (
              <div className='space-y-3'>
                <div className='text-sm text-warning bg-warning/5 p-3 rounded-xl border border-warning/20'>
                  <div className='flex items-center gap-2 mb-2'>
                    <AlertTriangle className='w-4 h-4' />
                    <span className='font-medium'>Network Requirements</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <AlertCircle className='h-4 w-4' />
                    <span>Please switch to Avalanche network to continue</span>
                  </div>
                </div>
                <ConnectButton.Custom>
                  {({ openChainModal }) => (
                    <Button
                      onClick={openChainModal}
                      variant='outline'
                      className='w-full font-secondary border-2 border-warning text-warning hover:bg-warning/5 transition-all duration-200 hover:scale-105 active:scale-95 rounded-xl px-6 py-4 h-auto text-base'
                    >
                      🔄 Switch Network
                      <ArrowRight className='h-5 w-5 ml-2' />
                    </Button>
                  )}
                </ConnectButton.Custom>
              </div>
            ) : (
              <Button
                onClick={handleProceedToRegistration}
                className='w-full font-secondary bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20 rounded-xl px-6 py-4 h-auto text-base'
              >
                ✨ Proceed to Registration
                <ArrowRight className='h-5 w-5 ml-2' />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
