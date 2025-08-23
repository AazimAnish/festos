# Events API Documentation

## Overview

The Events API provides comprehensive event listing functionality with support for filtering, pagination, and blockchain integration. This API follows RESTful principles and integrates with Supabase (database), Filebase (IPFS storage), and Avalanche smart contracts.

## Base URL

```
GET /api/events
```

## Query Parameters

### Pagination
- `page` (number, optional): Page number (default: 1, min: 1)
- `limit` (number, optional): Number of events per page (default: 12, max: 50)

### Search & Filtering
- `query` (string, optional): Search term for title, description, or location
- `category` (string, optional): Filter by event category
- `location` (string, optional): Filter by location
- `startDate` (string, optional): Filter events starting from this date (ISO 8601)
- `endDate` (string, optional): Filter events ending before this date (ISO 8601)
- `priceRange` (object, optional): Filter by ticket price range
  - `min` (number, optional): Minimum price
  - `max` (number, optional): Maximum price
- `tags` (array, optional): Filter by tags (can be specified multiple times)

### Blockchain Integration
- `includeBlockchain` (boolean, optional): Include events from blockchain (default: false)

## Response Format

```typescript
{
  success: boolean;
  events: EventData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    applied: EventSearchInput;
    available: {
      categories: string[];
      locations: string[];
      priceRanges: { min: number; max: number };
    };
  };
}
```

## EventData Structure

```typescript
interface EventData {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  ticketPrice: string;
  requireApproval: boolean;
  hasPOAP: boolean;
  poapMetadata?: string;
  visibility: 'public' | 'private';
  timezone: string;
  bannerImage?: string;
  category?: string;
  tags?: string[];
  creatorId: string;
  status: string;
  contractEventId?: number;
  contractAddress?: string;
  contractChainId?: number;
  filebaseMetadataUrl?: string;
  filebaseImageUrl?: string;
  storageProvider?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Examples

### Basic Event Listing

```bash
GET /api/events
```

Response:
```json
{
  "success": true,
  "events": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "applied": {...},
    "available": {
      "categories": ["music", "sports", "technology"],
      "locations": ["New York", "Los Angeles", "Chicago"],
      "priceRanges": { "min": 0, "max": 500 }
    }
  }
}
```

### Search Events

```bash
GET /api/events?query=concert&category=music&location=New%20York
```

### Filter by Price Range

```bash
GET /api/events?priceRange={"min":10,"max":100}
```

### Filter by Tags

```bash
GET /api/events?tags=music&tags=live&tags=concert
```

### Pagination

```bash
GET /api/events?page=2&limit=20
```

### Include Blockchain Events

```bash
GET /api/events?includeBlockchain=true
```

## Error Responses

### Validation Error (400)

```json
{
  "error": "Validation failed",
  "details": {
    "page": ["Page must be 1 or greater"],
    "limit": ["Limit must be between 1 and 50"]
  }
}
```

### Not Found Error (404)

```json
{
  "error": "No events found"
}
```

### Server Error (500)

```json
{
  "error": "Internal server error"
}
```

## Usage with React Query

```typescript
import { useEvents } from '@/lib/hooks/use-events-optimized';

function EventList() {
  const { data, isLoading, error } = useEvents({
    page: 1,
    limit: 12,
    query: 'concert',
    category: 'music',
    includeBlockchain: true,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

## Smart Contract Integration

The API can optionally include events from the Avalanche blockchain. When `includeBlockchain=true` is specified:

1. Events are fetched from the smart contract using the `getActiveEvents` function
2. Blockchain events are merged with database events
3. Duplicate events (same contract event ID) are filtered out
4. Results are sorted by start date

### Blockchain Event Structure

```typescript
interface BlockchainEvent {
  eventId: bigint;
  creator: `0x${string}`;
  title: string;
  description: string;
  location: string;
  startTime: bigint;
  endTime: bigint;
  maxCapacity: bigint;
  currentAttendees: bigint;
  ticketPrice: bigint;
  isActive: boolean;
  requireApproval: boolean;
  hasPOAP: boolean;
  poapMetadata: string;
  createdAt: bigint;
  updatedAt: bigint;
}
```

## Performance Considerations

1. **Pagination**: Always use pagination to limit the number of events returned
2. **Caching**: The API uses React Query for client-side caching
3. **Database Indexing**: Ensure proper indexes on frequently queried fields
4. **Blockchain Calls**: Use `includeBlockchain` sparingly as it adds latency

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per minute per IP address
- 1000 requests per hour per IP address

## Security

1. **Input Validation**: All inputs are validated using Zod schemas
2. **SQL Injection Protection**: Uses parameterized queries via Supabase
3. **CORS**: Configured to allow requests from authorized domains
4. **Authentication**: Some endpoints may require authentication (future enhancement)
