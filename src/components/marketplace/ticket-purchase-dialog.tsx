"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConfettiFireworks } from "@/components/ui/confetti-fireworks";
import { useTickets } from "@/lib/hooks/use-tickets";
import { useWallet } from "@/lib/hooks/use-wallet";
import { toast } from "sonner";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  CheckCircle,
  Info,
  Wallet,
  Shield,
  ExternalLink,
  ShoppingCart,
  Timer,
  Check,
  X,
} from "lucide-react";

interface Listing {
  id: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventImage: string;
  price: string;
  originalPrice: string;
  ticketType: string;
  category: string;
  verified: boolean;
  expiresIn: string;
  sellerAddress: string;
  views: number;
}

interface PurchaseResult {
  id: string;
  listingId: string;
  buyerAddress: string;
  sellerAddress: string;
  price: string;
  serviceFee: string;
  totalAmount: string;
  purchasedAt: string;
  transactionHash: string;
  status: string;
}

interface TicketPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing | null;
}

export function TicketPurchaseDialog({ 
  open, 
  onOpenChange, 
  listing 
}: TicketPurchaseDialogProps) {
  const { isConnected, address } = useWallet();
  const { purchaseTicket, isLoading } = useTickets();
  
  const [step, setStep] = useState<"review" | "confirming" | "success" | "error">("review");
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const handlePurchase = useCallback(async () => {
    if (!listing || !isConnected) {
      toast.error("Please connect your wallet to purchase tickets");
      return;
    }

    setStep("confirming");
    setError(null);

    try {
      const result = await purchaseTicket(listing.id, listing.price);
      setPurchaseResult(result);
      setStep("success");
      setShowConfetti(true);
      toast.success("Ticket purchased successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
      setStep("error");
      toast.error("Failed to purchase ticket. Please try again.");
    }
  }, [listing, isConnected, purchaseTicket]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setShowConfetti(false);
    // Reset state after a delay to allow animation to complete
    setTimeout(() => {
      setStep("review");
      setPurchaseResult(null);
      setError(null);
    }, 300);
  }, [onOpenChange]);

  const handleRetry = useCallback(() => {
    setStep("review");
    setError(null);
  }, []);

  if (!isConnected) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Connect Wallet Required</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 space-y-4 flex-1 flex flex-col justify-center">
            <div className="w-16 h-16 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-primary text-lg font-semibold mb-2">Wallet Connection Required</h3>
              <p className="text-muted-foreground">
                Please connect your wallet to purchase tickets.
              </p>
            </div>
            <Button onClick={handleClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!listing) {
    return null;
  }

  const serviceFee = (parseFloat(listing.price) * 0.03).toFixed(3); // 3% service fee
  const totalAmount = (parseFloat(listing.price) + parseFloat(serviceFee)).toFixed(3);

  return (
    <>
      <ConfettiFireworks trigger={showConfetti} duration={3000} />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Purchase Ticket
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {step === "review" && (
              <div className="space-y-6 p-1">
                {/* Ticket Information */}
                <Card className="bg-muted/20 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                        <Image
                          src="/card1.png" // This would come from the actual ticket data
                          alt="Event"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-primary text-lg font-semibold text-foreground mb-2">
                          ETHIndia 2025 🇮🇳
                        </h3>
                        <div className="flex items-center gap-4 mb-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(listing.expiresIn).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {listing.eventLocation}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">VIP</Badge>
                          <Badge variant="secondary" className="text-xs">
                            Original: {listing.originalPrice}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Price Breakdown */}
                <Card className="bg-muted/10 border-border/50">
                  <CardContent className="p-6 space-y-4">
                    <h4 className="font-primary font-medium">Price Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Ticket Price</span>
                        <span className="font-medium">{listing.price}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Service Fee (3%)</span>
                        <span className="text-sm">{serviceFee} ETH</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <span className="font-primary font-semibold">Total Amount</span>
                        <span className="font-primary text-xl font-bold">{totalAmount} ETH</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Information */}
                <Card className="bg-green-50/50 border-green-200/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="space-y-2">
                        <h4 className="font-medium text-green-900">Secure Transaction</h4>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Escrow-protected purchase</li>
                          <li>• Instant ticket transfer</li>
                          <li>• Verified seller</li>
                          <li>• Smart contract security</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Wallet Information */}
                <Card className="bg-blue-50/50 border-blue-200/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900">Purchasing with</h4>
                        <p className="text-sm text-blue-800 font-mono">
                          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Loading...'}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Important Notes */}
                <Card className="bg-amber-50/50 border-amber-200/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div className="space-y-2">
                        <h4 className="font-medium text-amber-900">Important Information</h4>
                        <ul className="text-sm text-amber-800 space-y-1">
                          <li>• This purchase is final and non-refundable</li>
                          <li>• The ticket will be transferred to your wallet immediately</li>
                          <li>• Gas fees are additional and will be calculated during transaction</li>
                          <li>• You can verify ticket authenticity with the event organizer</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === "confirming" && (
              <div className="text-center py-12 space-y-6">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <div>
                  <h3 className="font-primary text-xl font-semibold mb-2">Processing Purchase</h3>
                  <p className="text-muted-foreground">
                    Please wait while we process your transaction on the blockchain.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Timer className="w-4 h-4" />
                  <span>This may take a few moments...</span>
                </div>
              </div>
            )}

            {step === "success" && purchaseResult && (
              <div className="text-center py-12 space-y-6">
                <div className="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-success" />
                </div>
                <div>
                  <h3 className="font-primary text-xl font-semibold mb-2 text-success">
                    Purchase Successful!
                  </h3>
                  <p className="text-muted-foreground">
                    Your ticket has been transferred to your wallet.
                  </p>
                </div>
                
                <Card className="bg-success/5 border-success/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Transaction Hash</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">
                          {purchaseResult.transactionHash.slice(0, 8)}...{purchaseResult.transactionHash.slice(-6)}
                        </span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span className="font-medium">{purchaseResult.totalAmount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Purchase Time</span>
                      <span>{new Date(purchaseResult.purchasedAt).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-center gap-3">
                  <Button onClick={handleClose} className="gap-2">
                    <Check className="w-4 h-4" />
                    Done
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View Ticket
                  </Button>
                </div>
              </div>
            )}

            {step === "error" && (
              <div className="text-center py-12 space-y-6">
                <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                  <X className="w-12 h-12 text-destructive" />
                </div>
                <div>
                  <h3 className="font-primary text-xl font-semibold mb-2 text-destructive">
                    Purchase Failed
                  </h3>
                  <p className="text-muted-foreground">
                    {error || "Something went wrong with your purchase. Please try again."}
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <Button onClick={handleRetry} className="gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Only show in review step */}
          {step === "review" && (
            <div className="flex items-center justify-between pt-6 border-t border-border/50 flex-shrink-0">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={isLoading}
                className="gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Complete Purchase
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
