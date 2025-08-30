'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Loader2, ExternalLink, Copy } from 'lucide-react';
import Image from 'next/image';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  properties: {
    files: Array<{
      type: string;
      uri: string;
    }>;
    category: string;
    eventId: string;
    contractEventId: number;
    attendeeName: string;
    attendeeEmail: string;
  };
}

interface NFTViewerProps {
  tokenId: string;
  contractAddress: string;
  chainId: number;
}

export function NFTViewer({ tokenId, contractAddress, chainId }: NFTViewerProps) {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch metadata from our API
        const response = await fetch(`/api/nft/metadata/${tokenId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }

        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        console.error('Error fetching NFT metadata:', err);
        setError(err instanceof Error ? err.message : 'Failed to load NFT metadata');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [tokenId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading NFT metadata...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="font-medium">Error loading NFT</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metadata) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>No metadata found for this NFT</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{metadata.name}</span>
          <Badge variant="outline">#{tokenId}</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* NFT Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden border">
          <Image
            src={metadata.image}
            alt={metadata.name}
            fill
            className="object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = '/ticket.png';
            }}
          />
        </div>

        {/* Description */}
        <div>
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">{metadata.description}</p>
        </div>

        {/* Attributes */}
        <div>
          <h3 className="font-medium mb-2">Attributes</h3>
          <div className="grid grid-cols-2 gap-2">
            {metadata.attributes.map((attr, index) => (
              <div key={index} className="text-sm">
                <span className="text-muted-foreground">{attr.trait_type}:</span>
                <span className="ml-1 font-medium">{attr.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contract Info */}
        <div className="pt-4 border-t">
          <h3 className="font-medium mb-2">Contract Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Contract:</span>
              <div className="flex items-center space-x-1">
                <span className="font-mono text-xs">
                  {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(contractAddress)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Chain ID:</span>
              <span>{chainId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Token ID:</span>
              <span>{tokenId}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open(metadata.external_url, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Event
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(`${contractAddress}/${tokenId}`)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

