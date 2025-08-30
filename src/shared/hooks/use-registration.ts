'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { FormField, RegistrationState } from '@/shared/types/registration';

export function useRegistration(form: FormField[], walletConnected: boolean = false) {
  const [state, setState] = useState<RegistrationState>({
    currentStep: 1,
    isSubmitting: false,
    walletConnected,
    walletAddress: '',
    gasEstimate: '0.002',
    formData: {},
    termsAccepted: false,
    registrationComplete: false,
  });

  // Memoized progress calculation
  const progress = useMemo(() => {
    let completedSteps = 0;

    // Step 1: Check if required fields are filled
    if (state.currentStep >= 1) {
      const requiredFields = form.filter(field => field.required);
      const filledRequiredFields = requiredFields.filter(
        field => state.formData[field.label]
      );
      if (filledRequiredFields.length === requiredFields.length) {
        completedSteps += 1;
      }
    }

    // Step 2: Check if wallet is connected
    if (state.currentStep >= 2 && state.walletConnected) {
      completedSteps += 1;
    }

    // Step 3: Check if terms are accepted
    if (state.currentStep >= 3 && state.termsAccepted) {
      completedSteps += 1;
    }

    return (completedSteps / 3) * 100;
  }, [
    state.currentStep,
    state.formData,
    state.walletConnected,
    state.termsAccepted,
    form,
  ]);

  // Memoized validation for current step
  const canProceed = useMemo(() => {
    switch (state.currentStep) {
      case 1:
        return form.every(
          field => !field.required || state.formData[field.label]
        );
      case 2:
        return state.walletConnected;
      case 3:
        return state.termsAccepted;
      default:
        return false;
    }
  }, [
    state.currentStep,
    state.formData,
    state.walletConnected,
    state.termsAccepted,
    form,
  ]);

  // Actions - properly memoized with stable references
  const setCurrentStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const updateFormData = useCallback((field: string, value: string) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
    }));
  }, []);

  // Update wallet connection status when it changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      walletConnected,
      walletAddress: walletConnected ? 'Connected' : '',
    }));
  }, [walletConnected]);

  const connectWallet = useCallback(() => {
    setState(prev => ({
      ...prev,
      walletConnected: true,
      walletAddress: 'Connected', // This will be updated by the real wallet
    }));
  }, []);

  const setTermsAccepted = useCallback((accepted: boolean) => {
    setState(prev => ({ ...prev, termsAccepted: accepted }));
  }, []);

  const submitRegistration = useCallback(async (eventId: string, onPurchase?: (params: { eventId: string; attendeeName: string; attendeeEmail: string }) => Promise<unknown>) => {
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Extract attendee information from form data
      const attendeeName = state.formData['Full Name'] || state.formData['Name'] || 'Anonymous';
      const attendeeEmail = state.formData['Email'] || state.formData['Email Address'] || '';

      if (onPurchase) {
        // Use the provided purchase function
        await onPurchase({
          eventId,
          attendeeName,
          attendeeEmail,
        });
      } else {
        // Simulate API call for backward compatibility
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        registrationComplete: true,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
      }));
      throw error;
    }
  }, [state.formData]);

  const resetRegistration = useCallback(() => {
    setState({
      currentStep: 1,
      isSubmitting: false,
      walletConnected: false,
      walletAddress: '',
      gasEstimate: '0.002',
      formData: {},
      termsAccepted: false,
      registrationComplete: false,
    });
  }, []);

  // Memoize the actions object to prevent unnecessary re-renders
  const actions = useMemo(
    () => ({
      setCurrentStep,
      updateFormData,
      connectWallet,
      setTermsAccepted,
      submitRegistration,
      resetRegistration,
    }),
    [
      setCurrentStep,
      updateFormData,
      connectWallet,
      setTermsAccepted,
      submitRegistration,
      resetRegistration,
    ]
  );

  return {
    state,
    progress,
    canProceed,
    actions,
  };
}
