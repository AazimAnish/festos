"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Mail, 
  Wallet, 
  CreditCard, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

// Validation schema using Zod
const addAttendeeSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  walletAddress: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Please enter a valid Ethereum wallet address")
    .optional()
    .or(z.literal("")),
  ticketType: z.enum(["General", "VIP", "Premium"]),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  notes: z.string()
    .max(200, "Notes must be less than 200 characters")
    .optional()
    .or(z.literal(""))
});

type AddAttendeeFormData = z.infer<typeof addAttendeeSchema>;

interface AddAttendeeDialogProps {
  eventId: string;
  onAttendeeAdded?: (attendee: AddAttendeeFormData) => void;
  trigger?: React.ReactNode;
}

const ticketTypes = [
  { value: "General", label: "General Admission", price: "Free" },
  { value: "VIP", label: "VIP Access", price: "0.1 AVAX" },
  { value: "Premium", label: "Premium Experience", price: "0.25 AVAX" }
];

export function AddAttendeeDialog({ 
  eventId, 
  onAttendeeAdded, 
  trigger 
}: AddAttendeeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<AddAttendeeFormData>({
    resolver: zodResolver(addAttendeeSchema),
    defaultValues: {
      name: "",
      email: "",
      walletAddress: "",
      ticketType: "General",
      phone: "",
      notes: ""
    },
    mode: "onChange"
  });

  const selectedTicketType = form.watch("ticketType");
  const ticketInfo = ticketTypes.find(t => t.value === selectedTicketType);

  const onSubmit = async (data: AddAttendeeFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would be an API call to add the attendee
      console.log("Adding attendee:", { ...data, eventId });
      
      // Call the callback if provided
      onAttendeeAdded?.(data);
      
      // Reset form and close dialog
      form.reset();
      setIsOpen(false);
      
      // Show success feedback (you could use a toast here)
      console.log("Attendee added successfully!");
      
    } catch (error) {
      setSubmitError("Failed to add attendee. Please try again.");
      console.error("Error adding attendee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      form.reset();
      setSubmitError(null);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Add Guest
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <UserPlus className="w-5 h-5 text-primary" />
            Add New Guest
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Add a new attendee to your event. All fields marked with * are required.
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Display */}
            {submitError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{submitError}</p>
              </div>
            )}

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <span>Full Name</span>
                    <span className="text-primary">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter attendee's full name"
                      className="rounded-xl"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>Email Address</span>
                    <span className="text-primary">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="attendee@example.com"
                      className="rounded-xl"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ticket Type Field */}
            <FormField
              control={form.control}
              name="ticketType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    <span>Ticket Type</span>
                    <span className="text-primary">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select ticket type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ticketTypes.map((ticket) => (
                          <SelectItem key={ticket.value} value={ticket.value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{ticket.label}</span>
                              <Badge variant="outline" className="ml-2">
                                {ticket.price}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Wallet Address Field */}
            <FormField
              control={form.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Wallet className="w-4 h-4" />
                    <span>Wallet Address (Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="0x..."
                      className="rounded-xl font-mono text-sm"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                                       <p className="text-xs text-muted-foreground">
                       Enter the attendee&apos;s wallet address for blockchain-based features
                     </p>
                </FormItem>
              )}
            />

            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <span>Phone Number (Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="+1 (555) 123-4567"
                      className="rounded-xl"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <span>Notes (Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      placeholder="Any special requirements or notes..."
                      className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    {field.value?.length || 0}/200 characters
                  </p>
                </FormItem>
              )}
            />

            {/* Ticket Summary */}
            {ticketInfo && (
              <div className="p-4 bg-muted/20 rounded-xl border border-border/50">
                <h4 className="font-semibold text-sm mb-2">Ticket Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{ticketInfo.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <Badge variant="outline" className="font-medium">
                      {ticketInfo.price}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
                className="flex-1 sm:flex-none gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Add Guest
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
