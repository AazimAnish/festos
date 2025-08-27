# API Structure Documentation

## Clean and Organized API Endpoints

The API has been cleaned up and standardized. Here's the current structure:

### Events API (`/api/events/`)

#### Core Endpoints
- **`POST /api/events/create`** - Create new events with wallet authentication
- **`GET /api/events/list`** - List events with filtering and pagination
- **`GET /api/events/[eventId]`** - Get detailed information for a specific event

#### Supporting Endpoints
- **`GET /api/events/similar/[eventId]`** - Get similar events for recommendations

### Authentication API (`/api/auth/`)
- **`POST /api/auth/wallet`** - Authenticate users with wallet addresses

### Health API (`/api/health/`)
- **`GET /api/health`** - System health check and monitoring
- **`POST /api/health?action=consistency`** - Run data consistency checks
- **`POST /api/health?action=sync`** - Run data synchronization

## Removed Redundant Files

The following redundant and outdated API files have been removed:
- ❌ `src/app/api/events/v2/` - Old versioned API (replaced by standardized endpoints)
- ❌ `src/app/api/events/v3/` - Old versioned API (replaced by standardized endpoints)
- ❌ `src/app/api/events/listing/` - Redundant listing endpoint (merged into `/list`)
- ❌ `src/app/api/events/route.ts` - Old main events route (replaced by specific endpoints)

## Benefits of Clean Structure

1. **Consistency**: All endpoints follow the same naming convention
2. **Maintainability**: No version conflicts or duplicate functionality
3. **Clarity**: Clear separation of concerns with specific endpoints
4. **Performance**: Reduced bundle size by removing unused code
5. **Developer Experience**: Easier to understand and work with

## Frontend Integration

All frontend hooks and components have been updated to use the new standardized API endpoints:
- `use-events-optimized.ts` - Updated to use `/api/events/list` and `/api/events/[eventId]`
- `use-similar-events.ts` - Uses `/api/events/similar/[eventId]`
- Event creation page - Uses `/api/events/create`
- Event detail page - Uses `/api/events/[eventId]` and `/api/events/similar/[eventId]`
