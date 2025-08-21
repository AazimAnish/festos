export interface FormField {
  type: 'text' | 'email' | 'select';
  label: string;
  required: boolean;
  options?: string[];
}

export interface EventData {
  id: string;
  title: string;
  price: string;
  hasPOAP: boolean;
  poapTokenId?: string;
  joinedCount: number;
  location: string;
  date: string;
  time: string;
  image: string;
}

export interface RegistrationStep {
  id: number;
  title: string;
  description: string;
}

export interface RegistrationState {
  currentStep: number;
  isSubmitting: boolean;
  walletConnected: boolean;
  walletAddress: string;
  gasEstimate: string;
  formData: Record<string, string>;
  termsAccepted: boolean;
  registrationComplete: boolean;
}

export interface RegistrationFormData {
  form: FormField[];
  eventData: EventData;
}
