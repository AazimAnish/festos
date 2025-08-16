"use client";

import { useState, useCallback, useMemo } from "react";
import type { FormField, RegistrationState } from "@/types/registration";

export function useRegistration(form: FormField[]) {
  const [state, setState] = useState<RegistrationState>({
    currentStep: 1,
    isSubmitting: false,
    walletConnected: false,
    walletAddress: "",
    gasEstimate: "0.002",
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
      const filledRequiredFields = requiredFields.filter(field => state.formData[field.label]);
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
  }, [state.currentStep, state.formData, state.walletConnected, state.termsAccepted, form]);

  // Memoized validation for current step
  const canProceed = useMemo(() => {
    switch (state.currentStep) {
      case 1:
        return form.every(field => !field.required || state.formData[field.label]);
      case 2:
        return state.walletConnected;
      case 3:
        return state.termsAccepted;
      default:
        return false;
    }
  }, [state.currentStep, state.formData, state.walletConnected, state.termsAccepted, form]);

  // Actions - properly memoized with stable references
  const setCurrentStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const updateFormData = useCallback((field: string, value: string) => {
    setState(prev => ({ 
      ...prev, 
      formData: { ...prev.formData, [field]: value } 
    }));
  }, []);

  const connectWallet = useCallback(() => {
    setState(prev => ({
      ...prev,
      walletConnected: true,
      walletAddress: "Connected" // This will be updated by the real wallet
    }));
  }, []);

  const setTermsAccepted = useCallback((accepted: boolean) => {
    setState(prev => ({ ...prev, termsAccepted: accepted }));
  }, []);

  const submitRegistration = useCallback(async () => {
    setState(prev => ({ ...prev, isSubmitting: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setState(prev => ({ 
      ...prev, 
      isSubmitting: false, 
      registrationComplete: true 
    }));
  }, []);

  const resetRegistration = useCallback(() => {
    setState({
      currentStep: 1,
      isSubmitting: false,
      walletConnected: false,
      walletAddress: "",
      gasEstimate: "0.002",
      formData: {},
      termsAccepted: false,
      registrationComplete: false,
    });
  }, []);

  // Memoize the actions object to prevent unnecessary re-renders
  const actions = useMemo(() => ({
    setCurrentStep,
    updateFormData,
    connectWallet,
    setTermsAccepted,
    submitRegistration,
    resetRegistration,
  }), [
    setCurrentStep,
    updateFormData,
    connectWallet,
    setTermsAccepted,
    submitRegistration,
    resetRegistration,
  ]);

  return {
    state,
    progress,
    canProceed,
    actions,
  };
} 