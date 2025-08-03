"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface FormField {
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

interface RegistrationFormPreviewProps {
  form: FormField[];
}

export function RegistrationFormPreview({ form }: RegistrationFormPreviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              {field.label} {field.required && <span className="text-primary">*</span>}
            </Label>
            <Input 
              placeholder={`Enter your ${field.label.toLowerCase()}`}
              className="bg-background border-2 border-border rounded-lg"
            />
          </div>
        );
      case "email":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              {field.label} {field.required && <span className="text-primary">*</span>}
            </Label>
            <Input 
              type="email"
              placeholder="Enter your email"
              className="bg-background border-2 border-border rounded-lg"
            />
          </div>
        );
      case "select":
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              {field.label} {field.required && <span className="text-primary">*</span>}
            </Label>
            <select className="w-full px-3 py-2 bg-background border-2 border-border rounded-lg text-foreground">
              <option>Select an option</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate registration
    setTimeout(() => {
      setIsSubmitting(false);
      // Close dialog and update registration state
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {form.map((field, index) => (
          <div key={index}>
            {renderFieldPreview(field)}
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-2 pt-4">
        <Checkbox id="terms" />
        <Label htmlFor="terms" className="text-sm text-gray">
          I agree to the terms and conditions
        </Label>
      </div>

      <Button 
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full font-secondary text-base px-6 py-3 h-auto bg-primary text-primary-foreground rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-primary/90"
      >
        {isSubmitting ? "Registering..." : "🎉 Complete Registration"}
      </Button>
    </div>
  );
} 