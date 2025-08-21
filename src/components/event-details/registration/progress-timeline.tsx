'use client';

import { memo, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, User, CreditCard, Shield } from 'lucide-react';
import type { FormField } from '@/types/registration';

interface ProgressTimelineProps {
  currentStep: number;
  form: FormField[];
  formData: Record<string, string>;
  walletConnected: boolean;
  termsAccepted: boolean;
}

const STEPS = [
  { id: 1, title: 'Details', icon: User, description: 'Your information' },
  { id: 2, title: 'Payment', icon: CreditCard, description: 'Payment details' },
  { id: 3, title: 'Confirm', icon: Shield, description: 'Review & complete' },
] as const;

export const ProgressTimeline = memo(function ProgressTimeline({
  currentStep,
  form,
  formData,
  walletConnected,
  termsAccepted,
}: ProgressTimelineProps) {
  // Memoized progress calculation
  const actualProgress = useMemo(() => {
    let completedSteps = 0;

    // Step 1: Check if required fields are filled
    if (currentStep >= 1) {
      const requiredFields = form.filter(field => field.required);
      const filledRequiredFields = requiredFields.filter(
        field => formData[field.label]
      );
      if (filledRequiredFields.length === requiredFields.length) {
        completedSteps += 1;
      }
    }

    // Step 2: Check if payment details are ready (wallet is already connected from dialog)
    if (currentStep >= 2 && walletConnected) {
      completedSteps += 1;
    }

    // Step 3: Check if terms are accepted
    if (currentStep >= 3 && termsAccepted) {
      completedSteps += 1;
    }

    return (completedSteps / STEPS.length) * 100;
  }, [currentStep, form, formData, walletConnected, termsAccepted]);

  // Memoized progress description
  const progressDescription = useMemo(() => {
    if (currentStep === 1) {
      const remainingFields =
        form.filter(field => field.required).length -
        form.filter(field => field.required && formData[field.label]).length;
      return `${remainingFields} required field(s) remaining`;
    }
    if (currentStep === 2 && !walletConnected) {
      return 'Review payment details to continue';
    }
    if (currentStep === 2 && walletConnected) {
      return 'Payment details ready ✓';
    }
    if (currentStep === 3 && !termsAccepted) {
      return 'Accept terms to complete registration';
    }
    if (currentStep === 3 && termsAccepted) {
      return 'Ready to complete registration ✓';
    }
    return '';
  }, [currentStep, form, formData, walletConnected, termsAccepted]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <span className='font-secondary text-sm font-medium text-foreground'>
            Step {currentStep} of {STEPS.length}
          </span>
          <span className='text-xs text-gray'>
            {STEPS[currentStep - 1].title}
          </span>
        </div>
        <span className='text-xs text-gray font-mono'>
          {Math.round(actualProgress)}%
        </span>
      </div>

      <Progress value={actualProgress} className='h-2 rounded-3xl' />

      {/* Progress Description */}
      <div className='text-xs text-gray text-center'>{progressDescription}</div>

      {/* Step Indicators */}
      <div className='flex items-center justify-between'>
        {STEPS.map(step => {
          const isActive = currentStep === step.id;
          const isPartiallyCompleted =
            step.id === 1 && currentStep >= 1 && formData[form[0]?.label];
          const isWalletStepCompleted = step.id === 2 && walletConnected;
          const isTermsStepCompleted = step.id === 3 && termsAccepted;
          const Icon = step.icon;

          // Determine if step is actually completed based on requirements
          let stepCompleted = false;
          if (step.id === 1) {
            const requiredFields = form.filter(field => field.required);
            const filledRequiredFields = requiredFields.filter(
              field => formData[field.label]
            );
            stepCompleted =
              filledRequiredFields.length === requiredFields.length;
          } else if (step.id === 2) {
            stepCompleted = walletConnected;
          } else if (step.id === 3) {
            stepCompleted = termsAccepted;
          }

          return (
            <div key={step.id} className='flex flex-col items-center space-y-2'>
              <div
                className={`relative flex items-center justify-center w-10 h-10 rounded-3xl border-2 transition-all duration-200 ${
                  stepCompleted
                    ? 'bg-primary border-primary text-primary-foreground shadow-lg'
                    : isActive
                      ? 'bg-primary/10 border-primary text-primary shadow-md'
                      : isPartiallyCompleted ||
                          isWalletStepCompleted ||
                          isTermsStepCompleted
                        ? 'bg-primary/5 border-primary/50 text-primary/70 shadow-sm'
                        : 'bg-background/80 border-border text-gray backdrop-blur-sm'
                }`}
              >
                {stepCompleted ? (
                  <Check className='h-5 w-5' />
                ) : (
                  <Icon className='h-5 w-5' />
                )}
                {/* Partial completion indicator */}
                {!stepCompleted &&
                  (isPartiallyCompleted ||
                    isWalletStepCompleted ||
                    isTermsStepCompleted) && (
                    <div className='absolute inset-0 rounded-3xl bg-primary/20 animate-pulse'></div>
                  )}
              </div>
              <span
                className={`text-xs font-medium ${
                  stepCompleted
                    ? 'text-primary'
                    : isActive
                      ? 'text-primary'
                      : 'text-gray'
                }`}
              >
                {step.title}
              </span>
              {/* Progress indicator for current step */}
              {isActive && !stepCompleted && (
                <div className='w-1 h-1 bg-primary/50 rounded-full animate-pulse'></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
