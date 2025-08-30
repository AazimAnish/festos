# Festos - Web3 Event Platform 🎉

**The decentralized event platform for Web3** - Create, discover, and attend events with NFT tickets, blockchain verification, and POAP rewards.

![Festos Platform](https://img.shields.io/badge/Platform-Web3-blue) ![Next.js](https://img.shields.io/badge/Next.js-15+-black) ![Avalanche](https://img.shields.io/badge/Blockchain-Avalanche-red) ![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)

## 🌟 Features

- ✅ **Create & Discover Events** - Full event lifecycle management
- ✅ **NFT Ticket System** - ERC-721 tickets on Avalanche blockchain
- ✅ **POAP Integration** - Proof of Attendance Protocol rewards
- ✅ **Web3 Authentication** - Secure wallet-based login via Privy
- ✅ **Decentralized Storage** - IPFS via Pinata for images and metadata
- ✅ **Event Check-in System** - QR code scanning for attendance
- ✅ **Marketplace** - Buy/sell tickets securely
- ✅ **Social Features** - Community feeds and interactions
- ✅ **Multi-layer Architecture** - Blockchain + Database + IPFS

## 🏗️ Architecture

### Three-Layer Storage System

1. **🔗 Avalanche Blockchain (Immutable Layer)**
   - Event creation and verification
   - NFT ticket ownership and transfers
   - Escrow contracts for paid events
   - Immutable transaction records

2. **⚡ Supabase Database (Performance Layer)**  
   - Fast event queries and filtering
   - User profiles and relationships
   - Real-time features and caching
   - Analytics and reporting

3. **🌐 IPFS Storage (Media Layer)**
   - Event banners and images
   - NFT metadata and POAP assets
   - Decentralized content delivery
   - Content-addressed storage

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** or **Bun** runtime
- **Avalanche wallet** with AVAX for testing
- **Supabase account** for database
- **Pinata account** for IPFS storage
- **Privy account** for Web3 authentication

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/festos.git
cd festos

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env.local
```

### Environment Setup

Create `.env.local` with the following configuration:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Authentication (Privy)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# IPFS Storage (Pinata)
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret
PINATA_JWT=your_pinata_jwt_token

# Blockchain (Avalanche Fuji Testnet)
NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_TICKET_ADDRESS=deployed_contract_address
NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_ESCROW_ADDRESS=deployed_escrow_address

# Deployment (Optional)
PRIVATE_KEY=your_private_key_for_deployment
```

### Database Setup

```bash
# Set up Supabase database schema
npm run setup:database

# Or run setup script manually
npx tsx scripts/setup-database.ts
```

### Smart Contract Deployment

```bash
# Deploy contracts to Avalanche Fuji testnet
npx hardhat run scripts/deploy-full-stack.ts --network fuji

# The script will automatically update your .env.local with contract addresses
```

### Start Development

```bash
# Start the development server
npm run dev

# Open http://localhost:3000 in your browser
```

## 📡 API Reference

### Core APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/events/list` | GET | List all public events |
| `/api/events/create` | POST | Create new event (auth required) |
| `/api/events/[id]` | GET | Get event details |
| `/api/events/[id]/register` | POST | Register for event (auth required) |
| `/api/events/[id]/scan` | POST | Check-in attendees (auth required) |
| `/api/events/[id]/poap` | GET | Generate POAP for event |
| `/api/tickets/purchase` | POST | Purchase event ticket (auth required) |
| `/api/tickets/user` | GET | Get user's tickets (auth required) |
| `/api/events/user` | GET | Get user's events (auth required) |

### User Stories Implemented

#### ✅ Event Creator Stories

- **Create Free Events** - No payment required, optional POAP rewards
- **Create Paid Events** - AVAX payments via escrow contracts
- **Event Management** - Update details, view analytics, manage attendees
- **Revenue Analytics** - Track sales, fees, and payouts

#### ✅ Event Attendee Stories

- **Discover Events** - Browse, search, and filter events
- **Purchase Tickets** - Buy tickets with crypto payments
- **NFT Tickets** - Receive ERC-721 tickets in wallet
- **Event Check-in** - QR code scanning for attendance
- **POAP Collection** - Earn proof-of-attendance NFTs

#### ✅ Platform Features

- **Marketplace** - Secondary ticket sales
- **Social Feed** - Community interactions
- **User Dashboard** - Personal event management
- **Analytics** - Event performance metrics

## 🔧 Smart Contracts

### EventTicket Contract

**Features:**
- ERC-721 compliant NFT tickets
- Event creation with capacity limits
- Ticket purchasing and minting
- Metadata storage on-chain
- Access control for event creators

**Key Functions:**
```solidity
createEvent(title, location, startTime, endTime, capacity, price, requiresEscrow, baseURI)
purchaseTicket(eventId) payable
useTicket(tokenId)
getTicketMetadata(tokenId)
```

### EventEscrow Contract

**Features:**
- Secure payment escrow for paid events
- Automatic fee calculation (2.5%)
- Fund release after event completion
- Refund mechanism for cancelled events

## 🧪 Testing

### Test APIs
```bash
# Test all API endpoints
npm run test:apis

# Test specific functionality  
curl http://localhost:3000/api/events/list
```

### Verify Smart Contracts
```bash
# Run contract verification
npm run verify:contracts

# Test contract interactions
npx tsx scripts/test-contract-interaction.ts
```

### End-to-End Testing
```bash
# Test complete user journey
npm run test:e2e

# Test specific user stories
npm run test:user-stories
```

## 📁 Project Structure

```
festos/
├── contracts/                 # Smart contracts
│   ├── EventTicket.sol       # Main NFT ticket contract
│   └── EventEscrow.sol       # Payment escrow contract
├── src/
│   ├── app/                  # Next.js app router
│   │   ├── api/             # API routes
│   │   ├── discover/        # Event discovery page
│   │   ├── create/          # Event creation page
│   │   └── marketplace/     # Ticket marketplace
│   ├── lib/
│   │   ├── contracts/       # Contract interaction clients
│   │   ├── services/        # Business logic services
│   │   └── clients/         # External service clients
│   ├── features/            # Feature-based components
│   │   ├── events/         # Event-related components
│   │   ├── dashboard/      # User dashboard
│   │   └── marketplace/    # Marketplace features
│   └── shared/             # Shared utilities and hooks
├── scripts/                # Deployment and utility scripts
├── supabase/              # Database migrations
└── deployments/           # Contract deployment records
```

## 🚀 Deployment Guide

### 1. Prepare Environment

```bash
# Set private key for deployment (with AVAX balance)
echo "PRIVATE_KEY=your_private_key" >> .env.local

# Check wallet balance
npx tsx scripts/check-wallet-balance.ts
```

### 2. Deploy Smart Contracts

```bash
# Deploy all contracts to Fuji testnet
npx hardhat run scripts/deploy-full-stack.ts --network fuji

# Verify deployment
npx tsx scripts/verify-setup.ts
```

### 3. Deploy Frontend

```bash
# Build for production
npm run build

# Deploy to your preferred platform (Vercel, Railway, etc.)
npm run deploy
```

### 4. Post-Deployment

```bash
# Test the deployment
npm run test:deployment

# Verify all functionality works
npm run verify:production
```

## 🛠️ Available Scripts

```bash
npm run dev                    # Start development server
npm run build                  # Build for production  
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run test:apis             # Test API endpoints
npm run test:contracts        # Test smart contracts
npm run setup:database        # Setup database schema
npm run deploy:contracts      # Deploy smart contracts
npm run verify:setup          # Verify deployment setup
```

## 🔒 Security

- **Wallet Authentication** - Secure Web3 login via Privy
- **Smart Contract Security** - OpenZeppelin standards
- **Input Validation** - Comprehensive data validation
- **Rate Limiting** - API request rate limiting
- **CORS Protection** - Cross-origin request security
- **Environment Variables** - Secure credential management

## 🌍 Supported Networks

- **Avalanche Fuji Testnet** (Primary)
- **Avalanche Mainnet** (Production ready)
- **Local Development** (via Hardhat)

## 📊 Monitoring & Analytics

- **Health Monitoring** - Real-time system health checks
- **Performance Metrics** - API response times and usage
- **Error Tracking** - Comprehensive error logging
- **User Analytics** - Event discovery and engagement metrics

## 🤝 Contributing

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
4. **Commit** your changes (`git commit -m 'Add amazing feature'`)
5. **Push** to the branch (`git push origin feature/amazing-feature`)
6. **Open** a Pull Request

### Development Guidelines

- Write comprehensive tests for new features
- Follow TypeScript best practices
- Use conventional commit messages
- Update documentation as needed
- Test on Avalanche Fuji testnet before mainnet

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Avalanche** - Blockchain infrastructure
- **Privy** - Web3 authentication
- **Supabase** - Database and real-time features  
- **Pinata** - IPFS storage and pinning
- **OpenZeppelin** - Smart contract security standards
- **Next.js** - React framework
- **Tailwind CSS** - UI styling

---

**Built with ❤️ for the Web3 community**

For support, please reach out on [Discord](https://discord.gg/festos) or [Twitter](https://twitter.com/festos).
