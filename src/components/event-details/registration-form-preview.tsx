'use client';

import { memo } from 'react';
import { RegistrationForm } from './registration/registration-form';
import type { FormField, EventData } from '@/types/registration';

interface RegistrationFormPreviewProps {
  form: FormField[];
  eventData: EventData;
  onClose?: () => void;
}

export const RegistrationFormPreview = memo(function RegistrationFormPreview({
  form,
  eventData,
  onClose,
}: RegistrationFormPreviewProps) {
  return (
    <RegistrationForm form={form} eventData={eventData} onClose={onClose} />
  );
});
