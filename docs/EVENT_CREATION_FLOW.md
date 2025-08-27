# Event Creation Flow - Blockchain-First Approach

## Overview

The Festos platform implements a **blockchain-first approach** for event creation, ensuring that all events are properly validated and stored on the Avalanche blockchain before being replicated to other storage layers. This ensures data integrity, immutability, and user ownership.

## Architecture

The system uses a **three-layer storage architecture**:

1. **Blockchain Layer (Avalanche)** - Source of truth, immutable
2. **Database Layer (Supabase)** - Performance layer, searchable
3. **IPFS Layer (Filebase)** - Media storage, decentralized

## Event Creation Flow

### 1. User Authentication
- User must connect their wallet (MetaMask, WalletConnect, etc.)
- Wallet must be connected to Avalanche network (Mainnet or Fuji Testnet)
- User's wallet address is used for authentication and transaction signing

### 2. Input Validation
- All required fields are validated (title, description, location, dates, etc.)
- Dates must be in the future
- Ticket price must be non-negative
- Wallet balance is checked for transaction fees

### 3. IPFS Upload (Phase 1)
- Event metadata is uploaded to IPFS via Filebase
- Banner image (if provided) is uploaded to IPFS
- IPFS URLs are generated for later use

### 4. Transaction Preparation (Phase 2)
- Smart contract transaction is prepared with event data
- Transaction includes IPFS metadata URL
- Transaction is ready for user signing

### 5. User Wallet Signing (Phase 3)
- User receives transaction notification in their wallet
- User reviews transaction details and signs
- Transaction is submitted to Avalanche blockchain
- System waits for transaction confirmation

### 6. Blockchain Verification (Phase 4)
- Transaction is verified on blockchain
- Event ID is extracted from transaction logs
- Event existence is confirmed on blockchain

### 7. Database Storage (Phase 5)
- Event is stored in Supabase database
- Blockchain transaction hash and event ID are included
- All metadata from blockchain and IPFS is stored

### 8. Consistency Verification (Phase 6)
- Cross-layer consistency is verified
- Data integrity is confirmed across all layers
- Rollback is executed if any inconsistencies are found

## Error Handling & Rollback

### Rollback Scenarios
1. **IPFS Upload Fails** - No rollback needed (nothing created yet)
2. **User Rejects Transaction** - IPFS files are deleted
3. **Transaction Fails** - IPFS files are deleted
4. **Database Storage Fails** - IPFS files are deleted (blockchain is immutable)
5. **Consistency Check Fails** - Database record is deleted, IPFS files are deleted

### Error Recovery
- All rollback actions are executed in reverse order
- Failed operations are logged for debugging
- Users receive clear error messages
- System maintains consistency across all layers

## API Endpoints

### POST /api/events/v3
Creates a new event with user wallet signing.

**Request Body:**
```json
{
  "title": "My Event",
  "description": "Event description",
  "location": "Event location",
  "startDate": "2024-01-01T10:00:00Z",
  "endDate": "2024-01-01T12:00:00Z",
  "maxCapacity": 100,
  "ticketPrice": "0.1",
  "requireApproval": false,
  "hasPOAP": true,
  "poapMetadata": "",
  "visibility": "public",
  "timezone": "UTC",
  "category": "General",
  "tags": ["tag1", "tag2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "eventId": "uuid",
    "slug": "my-event",
    "transactionHash": "0x...",
    "contractEventId": 1,
    "contractAddress": "0x...",
    "contractChainId": 43113,
    "filebaseMetadataUrl": "https://...",
    "filebaseImageUrl": "https://...",
    "createdOn": {
      "blockchain": true,
      "database": true,
      "filebase": true
    }
  }
}
```

### GET /api/events/v3
Lists events with blockchain verification.

### DELETE /api/events/v3?action=cleanup-orphaned
Cleans up orphaned events (admin only).

## Frontend Integration

### User Wallet Service
The frontend uses the `UserWalletService` to handle wallet interactions:

```typescript
import { useUserWalletService } from '@/lib/services/frontend/user-wallet-service';

function EventCreationPage() {
  const { service, isReady, error } = useUserWalletService();
  
  const handleCreateEvent = async () => {
    if (!service || !isReady) {
      alert('Please connect your wallet to Avalanche network');
      return;
    }
    
    // Create event with user wallet signing
    const response = await fetch('/api/events/v3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(eventData)
    });
    
    // Handle response...
  };
}
```

### Wallet Requirements
- User must have MetaMask or compatible wallet installed
- Wallet must be connected to Avalanche network
- User must have sufficient AVAX for transaction fees
- User must approve transaction in their wallet

## Data Consistency

### Blockchain as Source of Truth
- All events must exist on blockchain to be valid
- Database records without blockchain proof are considered orphaned
- Orphaned records are automatically cleaned up

### Consistency Checks
- Event title matches between blockchain and database
- Ticket price matches between blockchain and database
- IPFS metadata is accessible and valid
- Transaction hash is valid and confirmed

### Cleanup Process
Orphaned events (events in database without blockchain proof) are automatically detected and cleaned up:

```bash
# Run cleanup script
npm run cleanup-orphaned-events

# Or call API endpoint
curl -X DELETE "https://api.festos.com/api/events/v3?action=cleanup-orphaned"
```

## Security Considerations

### User Authentication
- JWT tokens are used for API authentication
- Wallet addresses are verified on each request
- Private keys are never stored or transmitted

### Transaction Security
- Users sign transactions with their own wallets
- No server-side private keys are used for user transactions
- Transaction details are transparent and verifiable

### Data Integrity
- Blockchain provides immutable proof of event creation
- All data is cryptographically signed
- Cross-layer consistency ensures data integrity

## Monitoring & Health Checks

### Health Monitoring
- All three layers are continuously monitored
- Response times and success rates are tracked
- Automatic alerts for service degradation

### Error Tracking
- All errors are logged with context
- Failed operations are tracked for debugging
- Rollback actions are logged for audit

## Best Practices

### For Users
1. Always connect to the correct Avalanche network
2. Ensure sufficient AVAX balance for transaction fees
3. Review transaction details before signing
4. Keep your wallet secure and backed up

### For Developers
1. Always verify blockchain proof before displaying events
2. Handle wallet connection errors gracefully
3. Provide clear feedback during transaction signing
4. Implement proper error handling and rollback

### For Administrators
1. Monitor orphaned event cleanup regularly
2. Check system health metrics
3. Review error logs for patterns
4. Ensure proper backup and recovery procedures

## Troubleshooting

### Common Issues

**Wallet Not Connected**
- Ensure MetaMask is installed and connected
- Check that wallet is connected to Avalanche network
- Verify wallet has sufficient AVAX balance

**Transaction Failed**
- Check network congestion
- Ensure sufficient gas fees
- Verify transaction parameters

**Event Not Appearing**
- Check if transaction was confirmed on blockchain
- Verify database consistency
- Run orphaned event cleanup

**IPFS Files Not Accessible**
- Check Filebase service status
- Verify IPFS gateway availability
- Check file permissions and access

### Support
For technical support or questions about the event creation flow, please refer to the development documentation or contact the development team.
