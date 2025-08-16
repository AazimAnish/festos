"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./use-wallet";

interface Ticket {
  id: string;
  tokenId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventImage: string;
  ticketType: "General" | "VIP" | "Early Bird" | "Premium";
  originalPrice: string;
  ownerAddress: string;
  status: "valid" | "used" | "expired" | "transferred";
  transferable: boolean;
  mintedAt: string;
  transferredAt?: string;
  usedAt?: string;
  hasPOAP: boolean;
  poapTokenId?: string;
}

interface TicketListing {
  id: string;
  ticketId: string;
  sellerAddress: string;
  price: string;
  originalPrice: string;
  listedAt: string;
  expiresAt: string;
  status: "active" | "sold" | "cancelled" | "expired";
  views: number;
  offers: TicketOffer[];
  autoAcceptPrice?: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventImage: string;
  category: string;
  ticketType: string;
  verified: boolean;
  expiresIn: string;
}

interface TicketOffer {
  id: string;
  listingId: string;
  buyerAddress: string;
  price: string;
  offeredAt: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  expiresAt: string;
}

interface TicketPurchase {
  id: string;
  listingId: string;
  buyerAddress: string;
  sellerAddress: string;
  price: string;
  serviceFee: string;
  totalAmount: string;
  purchasedAt: string;
  transactionHash: string;
  status: "pending" | "completed" | "failed";
}

// Mock data - in real app, this would come from blockchain/API
const mockOwnedTickets: Ticket[] = [
  {
    id: "1",
    tokenId: "0x1234567890abcdef",
    eventId: "fpvxrdl3",
    eventName: "ETHIndia 2025 🇮🇳",
    eventDate: "2025-01-15",
    eventLocation: "Bangalore, India",
    eventImage: "/card1.png",
    ticketType: "VIP",
    originalPrice: "0.2 ETH",
    ownerAddress: "0x1234...5678",
    status: "valid",
    transferable: true,
    mintedAt: "2024-12-01T10:00:00Z",
    hasPOAP: true,
    poapTokenId: "0xabcdef1234567890",
  },
  {
    id: "2",
    tokenId: "0xabcdef1234567890",
    eventId: "web3delhi",
    eventName: "Web3 Delhi Summit",
    eventDate: "2025-02-20",
    eventLocation: "New Delhi, India",
    eventImage: "/card2.png",
    ticketType: "General",
    originalPrice: "0.2 ETH",
    ownerAddress: "0x1234...5678",
    status: "valid",
    transferable: true,
    mintedAt: "2024-12-05T14:30:00Z",
    hasPOAP: true,
    poapTokenId: "0x1234567890abcdef",
  },
  {
    id: "3",
    tokenId: "0x9876543210fedcba",
    eventId: "mumbaiblock",
    eventName: "Mumbai Blockchain Fest",
    eventDate: "2024-03-10",
    eventLocation: "Mumbai, India",
    eventImage: "/card3.png",
    ticketType: "General",
    originalPrice: "0.05 ETH",
    ownerAddress: "0x1234...5678",
    status: "used",
    transferable: false,
    mintedAt: "2024-02-01T09:00:00Z",
    usedAt: "2024-03-10T18:00:00Z",
    hasPOAP: false,
  },
];

const mockListings: TicketListing[] = [
  {
    id: "listing-1",
    ticketId: "1",
    sellerAddress: "0xF5a2...6b47",
    price: "0.25 ETH",
    originalPrice: "0.2 ETH",
    listedAt: "2024-12-20T10:00:00Z",
    expiresAt: "2025-01-17T10:00:00Z",
    status: "active",
    views: 45,
    offers: [],
    autoAcceptPrice: "0.23 ETH",
    eventName: "ETHIndia 2025 🇮🇳",
    eventDate: "2025-01-15",
    eventLocation: "Bangalore, India",
    eventImage: "/card1.png",
    category: "Tech",
    ticketType: "VIP",
    verified: true,
    expiresIn: "2 days",
  },
  {
    id: "listing-2",
    ticketId: "2",
    sellerAddress: "0x1234...5678",
    price: "0.15 ETH",
    originalPrice: "0.2 ETH",
    listedAt: "2024-12-25T15:30:00Z",
    expiresAt: "2025-01-22T15:30:00Z",
    status: "active",
    views: 87,
    offers: [],
    eventName: "Web3 Delhi Summit",
    eventDate: "2025-02-20",
    eventLocation: "New Delhi, India",
    eventImage: "/card2.png",
    category: "Conference",
    ticketType: "General",
    verified: true,
    expiresIn: "5 days",
  },
];

export function useTickets() {
  const { isConnected, address } = useWallet();
  const [ownedTickets, setOwnedTickets] = useState<Ticket[]>([]);
  const [listings, setListings] = useState<TicketListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch owned tickets
  const fetchOwnedTickets = useCallback(async () => {
    if (!isConnected || !address) {
      setOwnedTickets([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter tickets by current user's address
      const userTickets = mockOwnedTickets.filter(
        ticket => ticket.ownerAddress === address
      );
      
      setOwnedTickets(userTickets);
    } catch (err) {
      setError("Failed to fetch tickets");
      console.error("Error fetching tickets:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address]);

  // Fetch marketplace listings
  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setListings(mockListings);
    } catch (err) {
      setError("Failed to fetch listings");
      console.error("Error fetching listings:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // List a ticket for sale
  const listTicket = useCallback(async (
    ticketId: string,
    price: string,
    duration: number, // in days
    autoAcceptPrice?: string
  ) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newListing: TicketListing = {
        id: `listing-${Date.now()}`,
        ticketId,
        sellerAddress: address,
        price,
        originalPrice: mockOwnedTickets.find(t => t.id === ticketId)?.originalPrice || "0 ETH",
        listedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
        views: 0,
        offers: [],
        autoAcceptPrice,
        // Populate event info from the ticket
        eventName: mockOwnedTickets.find(t => t.id === ticketId)?.eventName || "",
        eventDate: mockOwnedTickets.find(t => t.id === ticketId)?.eventDate || "",
        eventLocation: mockOwnedTickets.find(t => t.id === ticketId)?.eventLocation || "",
        eventImage: mockOwnedTickets.find(t => t.id === ticketId)?.eventImage || "",
        category: "Tech", // Default category
        ticketType: mockOwnedTickets.find(t => t.id === ticketId)?.ticketType || "General",
        verified: true, // Mock verified status
        expiresIn: `${duration} days`, // Human readable
      };

      setListings(prev => [newListing, ...prev]);
      
      // Update ticket status to indicate it's listed
      setOwnedTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, status: "transferred" as const }
            : ticket
        )
      );

      return newListing;
    } catch (err) {
      setError("Failed to list ticket");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address]);

  // Purchase a ticket
  const purchaseTicket = useCallback(async (
    listingId: string,
    price: string
  ): Promise<TicketPurchase> => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const listing = listings.find(l => l.id === listingId);
      if (!listing) {
        throw new Error("Listing not found");
      }

      const serviceFee = (parseFloat(price) * 0.03).toFixed(3); // 3% service fee
      const totalAmount = (parseFloat(price) + parseFloat(serviceFee)).toFixed(3);

      const purchase: TicketPurchase = {
        id: `purchase-${Date.now()}`,
        listingId,
        buyerAddress: address,
        sellerAddress: listing.sellerAddress,
        price,
        serviceFee: `${serviceFee} ETH`,
        totalAmount: `${totalAmount} ETH`,
        purchasedAt: new Date().toISOString(),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        status: "completed",
      };

      // Update listing status
      setListings(prev => 
        prev.map(l => 
          l.id === listingId 
            ? { ...l, status: "sold" as const }
            : l
        )
      );

      // Add ticket to user's owned tickets
      const ticket = mockOwnedTickets.find(t => t.id === listing.ticketId);
      if (ticket) {
        const newTicket: Ticket = {
          ...ticket,
          id: `${ticket.id}-${Date.now()}`,
          ownerAddress: address,
          status: "valid",
          transferredAt: new Date().toISOString(),
        };
        setOwnedTickets(prev => [newTicket, ...prev]);
      }

      return purchase;
    } catch (err) {
      setError("Failed to purchase ticket");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, listings]);

  // Cancel a listing
  const cancelListing = useCallback(async (listingId: string) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setListings(prev => 
        prev.map(l => 
          l.id === listingId 
            ? { ...l, status: "cancelled" as const }
            : l
        )
      );

      // Return ticket to user's owned tickets
      const listing = listings.find(l => l.id === listingId);
      if (listing) {
        const ticket = mockOwnedTickets.find(t => t.id === listing.ticketId);
        if (ticket) {
          setOwnedTickets(prev => 
            prev.map(t => 
              t.id === listing.ticketId 
                ? { ...t, status: "valid" as const }
                : t
            )
          );
        }
      }
    } catch (err) {
      setError("Failed to cancel listing");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, listings]);

  // Get transferable tickets (tickets that can be listed)
  const getTransferableTickets = useCallback(() => {
    return ownedTickets.filter(ticket => 
      ticket.transferable && ticket.status === "valid"
    );
  }, [ownedTickets]);

  // Get user's active listings
  const getUserListings = useCallback(() => {
    if (!address) return [];
    return listings.filter(listing => listing.sellerAddress === address);
  }, [listings, address]);

  // Initialize data
  useEffect(() => {
    fetchOwnedTickets();
    fetchListings();
  }, [fetchOwnedTickets, fetchListings]);

  return {
    ownedTickets,
    listings,
    isLoading,
    error,
    listTicket,
    purchaseTicket,
    cancelListing,
    getTransferableTickets,
    getUserListings,
    refetch: () => {
      fetchOwnedTickets();
      fetchListings();
    },
  };
}
