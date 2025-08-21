'use client';

import { memo, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

// Import sub-components
import { EventSummary } from './event-summary';
import { ProgressTimeline } from './progress-timeline';
import { FormFields } from './form-fields';
import { PaymentDetails } from './payment-details';
import { TermsConditions } from './terms-conditions';
import { RegistrationSuccess } from './registration-success';

// Import custom hook and utilities
import { useRegistration } from '@/lib/hooks/use-registration';
import { useWallet } from '@/lib/hooks/use-wallet';
import {
  generateCalendarEvent,
  downloadCalendarFile,
} from '@/lib/utils/calendar';
import type { FormField, EventData } from '@/types/registration';

interface RegistrationFormProps {
  form: FormField[];
  eventData: EventData;
  onClose?: () => void;
}

export const RegistrationForm = memo(function RegistrationForm({
  form,
  eventData,
  onClose,
}: RegistrationFormProps) {
  const { state, canProceed, actions } = useRegistration(form);
  const { isConnected, address } = useWallet();

  // Use ref to store the connectWallet function to avoid dependency issues
  const connectWalletRef = useRef(actions.connectWallet);
  connectWalletRef.current = actions.connectWallet;

  // Update wallet state when wallet connects
  useEffect(() => {
    if (isConnected && address && !state.walletConnected) {
      connectWalletRef.current();
    }
  }, [isConnected, address, state.walletConnected]);

  const handleDownloadCalendar = useCallback(() => {
    const calendarData = generateCalendarEvent(eventData);
    downloadCalendarFile(calendarData, eventData.title);
  }, [eventData]);

  const handleClose = useCallback(() => {
    // Close the dialog if onClose is provided, otherwise reset the form
    if (onClose) {
      onClose();
    } else {
      actions.resetRegistration();
    }
  }, [actions, onClose]);

  if (state.registrationComplete) {
    return (
      <RegistrationSuccess
        eventData={eventData}
        onDownloadCalendar={handleDownloadCalendar}
        onClose={handleClose}
      />
    );
  }

  return (
    <div className='space-y-8'>
      {/* Event Summary */}
      <EventSummary eventData={eventData} />

      {/* Progress Timeline */}
      <ProgressTimeline
        currentStep={state.currentStep}
        form={form}
        formData={state.formData}
        walletConnected={state.walletConnected}
        termsAccepted={state.termsAccepted}
      />

      {/* Step Content */}
      <div className='space-y-6'>
        {state.currentStep === 1 && (
          <div className='space-y-6'>
            <FormFields
              form={form}
              formData={state.formData}
              onFormChange={actions.updateFormData}
            />

            <Button
              onClick={() => actions.setCurrentStep(2)}
              className='w-full font-secondary bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20 rounded-xl px-6 py-4 h-auto text-base'
              disabled={!canProceed}
            >
              💳 Continue to Payment
              <ArrowRight className='h-5 w-5 ml-2' />
            </Button>
          </div>
        )}

        {state.currentStep === 2 && (
          <div className='space-y-6'>
            {/* Wallet Status Summary */}
            <div className='bg-success/5 border-2 border-success/20 rounded-3xl p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-success rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-5 h-5 text-success-foreground' />
                </div>
                <div>
                  <h4 className='font-secondary font-medium text-success'>
                    Wallet Connected
                  </h4>
                  <p className='text-sm text-success/80'>
                    {address
                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                      : 'Loading...'}
                  </p>
                </div>
              </div>
            </div>

            <PaymentDetails
              eventPrice={eventData.price}
              gasEstimate={state.gasEstimate}
            />

            <Button
              onClick={() => actions.setCurrentStep(3)}
              className='w-full font-secondary bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20 rounded-xl px-6 py-4 h-auto text-base'
              disabled={!canProceed}
            >
              ✨ Review & Confirm
              <ArrowRight className='h-5 w-5 ml-2' />
            </Button>
          </div>
        )}

        {state.currentStep === 3 && (
          <div className='space-y-6'>
            <TermsConditions
              termsAccepted={state.termsAccepted}
              onTermsChange={actions.setTermsAccepted}
            />

            <Button
              onClick={actions.submitRegistration}
              disabled={state.isSubmitting || !canProceed}
              className='w-full font-secondary bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20 rounded-xl px-6 py-4 h-auto text-base relative overflow-hidden'
            >
              {state.isSubmitting ? (
                <div className='flex items-center space-x-2'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>🎉 Complete Registration</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});
