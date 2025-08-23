'use client';

import { memo, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import type { FormField } from '@/shared/types/registration';

interface FormFieldsProps {
  form: FormField[];
  formData: Record<string, string>;
  onFormChange: (field: string, value: string) => void;
}

export const FormFields = memo(function FormFields({
  form,
  formData,
  onFormChange,
}: FormFieldsProps) {
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus first input
  useEffect(() => {
    if (firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, []);

  const handleInputChange = useCallback(
    (field: string, value: string) => {
      onFormChange(field, value);
    },
    [onFormChange]
  );

  const renderField = useCallback(
    (field: FormField, index: number) => {
      const isFirstField = index === 0;

      switch (field.type) {
        case 'text':
          return (
            <div key={field.label} className='space-y-2'>
              <Label className='text-sm font-medium text-foreground'>
                {field.label}{' '}
                {field.required && <span className='text-primary'>*</span>}
              </Label>
              <Input
                ref={isFirstField ? firstInputRef : undefined}
                placeholder={`Enter your ${field.label.toLowerCase()}`}
                className='bg-background/80 border-2 border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 backdrop-blur-sm'
                value={formData[field.label] || ''}
                onChange={e => handleInputChange(field.label, e.target.value)}
              />
            </div>
          );
        case 'email':
          return (
            <div key={field.label} className='space-y-2'>
              <Label className='text-sm font-medium text-foreground'>
                {field.label}{' '}
                {field.required && <span className='text-primary'>*</span>}
              </Label>
              <Input
                ref={isFirstField ? firstInputRef : undefined}
                type='email'
                placeholder='Enter your email'
                className='bg-background/80 border-2 border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 backdrop-blur-sm'
                value={formData[field.label] || ''}
                onChange={e => handleInputChange(field.label, e.target.value)}
              />
            </div>
          );
        case 'select':
          return (
            <div key={field.label} className='space-y-2'>
              <Label className='text-sm font-medium text-foreground'>
                {field.label}{' '}
                {field.required && <span className='text-primary'>*</span>}
              </Label>
              <select
                className='w-full px-3 py-2 bg-background/80 border-2 border-border rounded-xl text-foreground focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 backdrop-blur-sm'
                value={formData[field.label] || ''}
                onChange={e => handleInputChange(field.label, e.target.value)}
              >
                <option value=''>Select an option</option>
                {field.options?.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        default:
          return null;
      }
    },
    [formData, handleInputChange]
  );

  return (
    <div className='space-y-4'>
      {form.map((field, index) => renderField(field, index))}
    </div>
  );
});
