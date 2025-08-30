'use client';

import { useState } from 'react';
import { NFTViewer } from '@/shared/components/nft-viewer';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function TestNFTPage() {
  const [tokenId, setTokenId] = useState('1');
  const [contractAddress, setContractAddress] = useState('0xb76B7EfEDf7bA5003e663C53bEb0B673B2668bB5');
  const [chainId, setChainId] = useState('43113');

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">NFT Metadata Test</h1>
        <p className="text-muted-foreground">
          Test NFT metadata and image generation for Festos tickets
        </p>
      </div>

      {/* Test Controls */}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tokenId">Token ID</Label>
            <Input
              id="tokenId"
              type="number"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="Enter token ID"
            />
          </div>
          
          <div>
            <Label htmlFor="contractAddress">Contract Address</Label>
            <Input
              id="contractAddress"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="Enter contract address"
            />
          </div>
          
          <div>
            <Label htmlFor="chainId">Chain ID</Label>
            <Input
              id="chainId"
              value={chainId}
              onChange={(e) => setChainId(e.target.value)}
              placeholder="Enter chain ID"
            />
          </div>
        </CardContent>
      </Card>

      {/* NFT Viewer */}
      <NFTViewer
        tokenId={tokenId}
        contractAddress={contractAddress}
        chainId={parseInt(chainId)}
      />

      {/* API Test Links */}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>API Test Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Metadata API</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={`/api/nft/metadata/${tokenId}`}
                readOnly
                className="text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/api/nft/metadata/${tokenId}`, '_blank')}
              >
                Test
              </Button>
            </div>
          </div>
          
          <div>
            <Label>Image API</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={`/api/nft/image/${tokenId}`}
                readOnly
                className="text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/api/nft/image/${tokenId}`, '_blank')}
              >
                Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

