# Festos - Web3 Event Platform

A decentralized event platform built with Next.js, Supabase, Filebase/IPFS, and Avalanche blockchain using a three-layer storage architecture.

## 🏗️ Architecture

The platform uses a three-layer storage architecture:

### 1. **Avalanche Blockchain (Immutable Layer)**
- Core event data, ticket ownership, transactions
- Smart contract integration for event creation and verification
- Immutable and transparent event records

### 2. **Supabase PostgreSQL (Performance Layer)**
- Fast queries, complex relationships, user management
- Optimized for read performance and complex queries
- Real-time subscriptions and analytics

### 3. **Filebase/IPFS (Media Layer)**
- Decentralized file storage for media and metadata
- Event banners, user avatars, POAP metadata
- Content-addressed storage with compression

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Supabase account
- Filebase account
- Avalanche wallet

### Installation
```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up database
bun run setup:database

# Start development server
bun run dev
```

### Environment Variables
```env
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Blockchain (Avalanche)
NEXT_PUBLIC_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
NEXT_PUBLIC_EVENT_FACTORY_ADDRESS=your_contract_address

# IPFS (Filebase)
FILEBASE_ACCESS_KEY_ID=your_filebase_access_key
FILEBASE_SECRET_ACCESS_KEY=your_filebase_secret_key
FILEBASE_ENDPOINT=https://s3.filebase.com
FILEBASE_REGION=us-east-1
FILEBASE_BUCKET=your_bucket_name
```

## 🧪 Testing

### Test Three-Layer Architecture
```bash
bun run test:three-layer
```

### Test Smart Contract Integration
```bash
bun run test:smart-contract
```

### Run All Tests
```bash
bun run test:all
```

## 📡 API Endpoints

### Events API v2
- `GET /api/events/v2` - List events with intelligent fallback
- `POST /api/events/v2` - Create events across all three layers
- `GET /api/events/v2/[eventId]` - Get specific events with verification

### Health API
- `GET /api/health` - System health status
- `POST /api/health?action=consistency` - Run data consistency checks
- `POST /api/health?action=sync` - Run data synchronization

## 🔧 Core Services

### Event Orchestrator
Coordinates all three storage layers and ensures data consistency.

### Health Monitor
Real-time monitoring of all storage providers with performance metrics.

### Storage Services
- **Database Service** - Supabase PostgreSQL operations
- **Blockchain Service** - Avalanche blockchain operations
- **IPFS Service** - Filebase/IPFS file operations

## 📊 Features

- ✅ **Three-Layer Storage Architecture**
- ✅ **Intelligent Fallback Strategies**
- ✅ **Data Consistency Monitoring**
- ✅ **Performance Optimization**
- ✅ **Real-time Health Monitoring**
- ✅ **Comprehensive Error Handling**
- ✅ **Smart Contract Integration**

## 🛠️ Development

### Available Scripts
```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun run test:all     # Run all tests
bun run setup:database # Set up database schema
```

## 📁 Project Structure

```
src/
├── lib/
│   ├── services/
│   │   ├── core/           # Core interfaces
│   │   ├── storage/        # Storage layer services
│   │   ├── integration/    # Event orchestrator
│   │   └── monitoring/     # Health monitor
│   ├── contracts/          # Smart contract integration
│   └── filebase/           # IPFS client
├── app/
│   └── api/
│       ├── events/v2/      # Events API v2
│       └── health/         # Health monitoring API
└── components/             # React components
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `bun run test:all`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
