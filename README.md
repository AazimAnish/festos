# 🎉 Festos - Decentralized Event Platform

A comprehensive Web3 event platform built with Next.js, Supabase, Filebase, and Avalanche blockchain. Create, manage, and attend events with blockchain-based ticketing, POAP integration, and decentralized storage with advanced image compression optimization.

[![Build Status](https://github.com/AazimAnish/festos/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/AazimAnish/festos/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Table of Contents

- [🚀 Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📋 Prerequisites](#-prerequisites)
- [🛠️ Installation & Setup](#️-installation--setup)
- [🏗️ Architecture](#️-architecture)
- [🗄️ Database Setup](#️-database-setup)
- [🔧 Smart Contract Setup](#-smart-contract-setup)
- [🚀 Development](#-development)
- [🧪 Testing](#-testing)
- [📦 Build & Deployment](#-build--deployment)
- [🖼️ Image Compression System](#️-image-compression-system)
- [🔐 Security](#-security)
- [📚 API Reference](#-api-reference)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🚀 Features

### Core Features

- **Event Creation & Management**: Create events with customizable parameters
- **Blockchain Ticketing**: Purchase, approve, and use tickets on-chain
- **POAP Integration**: Proof of Presence tokens for attendees
- **Decentralized Storage**: IPFS-based storage via Filebase with image compression
- **Wallet Authentication**: RainbowKit integration for seamless wallet connection
- **Multi-Chain Support**: Avalanche mainnet and Fuji testnet
- **Real-time Updates**: Live event updates and notifications
- **Advanced Analytics**: Comprehensive event performance tracking

### Technical Features

- **Type-Safe Development**: Full TypeScript coverage with strict type checking
- **Clean Architecture**: Separation of concerns with service layer pattern
- **Performance Optimized**: Bundle splitting, code optimization, and caching
- **Quality Assurance**: Automated linting, formatting, and type checking
- **CI/CD Pipeline**: Automated testing and deployment workflows

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend & Database

- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: RainbowKit + WalletConnect
- **Storage**: Filebase (IPFS) with S3-compatible API

### Blockchain

- **Network**: Avalanche (C-Chain)
- **Smart Contracts**: Solidity 0.8.28
- **Development**: Hardhat + Viem
- **Testing**: Foundry + Node.js test runner

### Development Tools

- **Package Manager**: Bun
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier
- **Testing**: Chai assertions + Mocha
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

### Required Software

- **Node.js** 18+ (recommended: 20.x)
- **Bun** (for faster package management)
- **Git**

### Check Versions

```bash
node --version  # Should be 18+ or 20.x
bun --version   # Should be latest
git --version   # Any recent version
```

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd festos

# Install dependencies with Bun (faster than npm)
bun install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with your values
nano .env.local
```

### 3. Required Environment Variables

```bash
# Essential for basic functionality
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# For Supabase (database) - Optional
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# For Avalanche blockchain - Optional
NEXT_PUBLIC_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# Contract Addresses (after deployment)
NEXT_PUBLIC_AVALANCHE_EVENT_FACTORY_ADDRESS=deployed_contract_address
NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_FACTORY_ADDRESS=deployed_contract_address

# For Filebase (decentralized storage) - Optional
FILEBASE_ACCESS_KEY_ID=your_access_key_id
FILEBASE_SECRET_ACCESS_KEY=your_secret_access_key
FILEBASE_BUCKET=your_bucket_name
```

### 4. Filebase Setup (Optional)

Filebase provides S3-compatible decentralized storage with IPFS and other backends.

```bash
# Set your Filebase credentials
export FILEBASE_ACCESS_KEY_ID=your_access_key_id
export FILEBASE_SECRET_ACCESS_KEY=your_secret_access_key
export FILEBASE_BUCKET=your_bucket_name

# Run the setup script
bun run setup-filebase
```

## 🏗️ Architecture

### Project Structure

```
festos/
├── src/                    # Main source code
│   ├── app/               # Next.js App Router
│   ├── components/        # Reusable UI components
│   ├── lib/              # Utility libraries and configurations
│   └── types/            # TypeScript type definitions
├── test/                 # Test files (excluded from build)
├── foundry-tests/        # Foundry test files
├── contracts/            # Smart contracts
├── database/             # Database schemas and migrations
├── scripts/              # Build and deployment scripts
└── public/               # Static assets
```

### Key Principles

- **Separation of Concerns**: Clear separation between UI, business logic, and data layers
- **Component-Based Architecture**: Reusable, composable components
- **Type Safety**: Full TypeScript coverage for better developer experience
- **Performance First**: Optimized builds and runtime performance

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│   Next.js API   │───▶│   Supabase DB   │
│   (Next.js)     │    │   Routes        │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   RainbowKit    │    │   Filebase      │    │   Avalanche     │
│   (Wallet Auth) │    │   (IPFS)        │    │   (Blockchain)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🗄️ Database Setup

### Supabase Setup (Optional)

```bash
# Option 1: Use Supabase CLI
supabase init
supabase start

# Option 2: Use Supabase Dashboard
# 1. Go to https://supabase.com
# 2. Create new project
# 3. Run the SQL schema in the SQL editor
```

### Database Schema

The database includes comprehensive tables for:

- **Users**: Wallet-based authentication with profiles
- **Events**: Complete event management with blockchain integration
- **Tickets**: Event registrations and purchases
- **Analytics**: Performance tracking and metrics
- **Categories & Tags**: Event organization system

### Run Database Schema

```bash
# Copy the schema to your Supabase SQL editor
cat database/init.sql

# Or run via CLI if you have Supabase CLI configured
supabase db push
```

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Wallet-based authentication** with JWT claims
- **Data isolation** - users can only access their own data
- **Public/private event** visibility controls

## 🔧 Smart Contract Setup

### 1. Compile Contracts

```bash
# Compile smart contracts
bun run hardhat compile
```

### 2. Deploy Contracts (Optional)

```bash
# Deploy to local network
bun run hardhat run scripts/deploy-and-update-env.ts --network localhost

# Deploy to Fuji testnet
bun run hardhat run scripts/deploy-and-update-env.ts --network avalancheFuji

# Deploy to Avalanche mainnet
bun run hardhat run scripts/deploy-and-update-env.ts --network avalanche
```

### Smart Contract Features

- **Event Creation**: Create events with title, description, location, dates, capacity, pricing
- **Ticket Sales**: Purchase tickets with automatic payment processing
- **Approval System**: Optional approval workflow for ticket purchases
- **POAP Support**: Integrated Proof of Presence token minting
- **Revenue Sharing**: Automatic platform fee collection and creator payouts
- **Event Management**: Update and cancel events (with restrictions)

## 🚀 Development

### Available Commands

```bash
# Development
bun run dev                   # Start development server
bun run build                 # Build for production
bun run start                 # Start production server

# Quality Assurance
bun run lint                  # Run ESLint
bun run lint:fix             # Fix ESLint issues automatically
bun run type-check           # TypeScript type checking
bun run type-check:test      # Test type checking
bun run format               # Format code with Prettier
bun run format:check         # Check code formatting

# Comprehensive Validation
bun run build:check          # Full validation (lint + type-check + build)
bun run clean                # Clean build artifacts

# Smart Contract Development
bun run hardhat compile      # Compile contracts
bun run hardhat test         # Run contract tests
bun run hardhat clean        # Clean contract artifacts
```

### Local Development Workflow

1. **Type Checking**: `bun run type-check`
2. **Linting**: `bun run lint`
3. **Formatting**: `bun run format`
4. **Full Validation**: `bun run build:check`

### Catching Build Issues Locally

To avoid deployment failures, always run these commands before pushing:

```bash
# 1. Type check (catches TypeScript errors)
bun run type-check

# 2. Lint (catches code style and potential issues)
bun run lint

# 3. Build (ensures everything compiles)
bun run build

# Or run all at once
bun run build:check
```

## 🧪 Testing

### Test Results

**✅ All Tests Passing (8/8)**

```
Counter
  ✔ Should increment by 1
  ✔ Should increment by a given amount
  ✔ The sum of the Increment events should match the current value

EventFactory
  ✔ Should deploy successfully
  ✔ Should have correct initial state

EventFactory (Working)
  ✔ Should deploy successfully
  ✔ Should have correct initial state
  ✔ Should create an event successfully
```

### Run Tests

```bash
# Run all tests
bun run hardhat test

# Run specific test types
bun run hardhat test solidity  # Solidity tests only
bun run hardhat test nodejs    # TypeScript tests only
```

### Test File Organization

- **Unit Tests**: `test/` directory
- **Smart Contract Tests**: `foundry-tests/` directory
- **Type Checking**: Separate TypeScript configuration for tests

## 📦 Build & Deployment

### Production Deployment

#### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel --prod

# Or connect your GitHub repo for automatic deployments
```

#### Manual Deployment

```bash
# Build for production
bun run build

# Start production server
bun run start
```

### CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow that:

- Runs on pull requests and pushes to main/master
- Sets up Bun and Node.js environments
- Installs dependencies with frozen lockfile
- Runs linting, type checking, and formatting checks
- Builds the application for production
- Provides detailed feedback on any issues

### Common Build Issues & Solutions

#### TypeScript Errors in Test Files

If you see errors like `Property 'by' does not exist on type 'never'`:

- Test files are excluded from the main build via `tsconfig.json`
- Use `tsconfig.test.json` for test-specific TypeScript configuration
- Ensure test files are in `test/` or `foundry-tests/` directories

#### Vercel Deployment Issues

- Test files are automatically excluded via `.vercelignore`
- TypeScript configuration excludes test directories
- Use `bun run build:check` to catch issues locally

## 🖼️ Image Compression System

### Overview

The Festos application includes a comprehensive image compression system optimized for Filebase storage usage and bandwidth reduction.

### Key Features

- **Smart Compression Algorithm**: Multi-format support (JPEG, PNG, WebP, AVIF)
- **Automatic Format Detection**: Chooses optimal format based on image characteristics
- **Quality Optimization**: Different presets for different use cases
- **Size-based Compression**: Adjusts compression based on original file size
- **Transparency Preservation**: Maintains alpha channels when needed

### Compression Presets

| Preset        | Quality | Max Dimensions | Target Size | Use Case                                  |
| ------------- | ------- | -------------- | ----------- | ----------------------------------------- |
| **BANNER**    | 85%     | 1920×1080      | 2MB         | Event banners, hero images                |
| **THUMBNAIL** | 75%     | 400×300        | 500KB       | Event thumbnails, previews                |
| **PROFILE**   | 80%     | 512×512        | 1MB         | User profile pictures                     |
| **GENERAL**   | 80%     | 1200×800       | 1.5MB       | General event images                      |
| **MAXIMUM**   | 60%     | 800×600        | 1MB         | Large files requiring maximum compression |

### Storage Optimization Benefits

- **Filebase 5GB Limit**: Optimized to stay within free tier limits
- **Bandwidth Reduction**: Smaller files = faster uploads and downloads
- **Cost Savings**: Reduced storage and bandwidth costs
- **Performance**: Faster page loads with optimized images

### Usage Examples

```typescript
// In API route for event creation
import { compressBannerImage } from '@/lib/utils/image-compression-server';

// Compress banner image before upload
const compressionResult = await compressBannerImage(imageBuffer);
const uploadResult = await filebaseClient.uploadFile(
  imageKey,
  compressionResult.buffer,
  `image/${compressionResult.format}`
);
```

## 🔐 Security

### Authentication & Security

#### Wallet Authentication

- **RainbowKit Integration**: Seamless wallet connection
- **Multi-Chain Support**: Avalanche mainnet and Fuji testnet
- **Wallet Address Validation**: Secure wallet address verification

#### Filebase Security

- **S3-Compatible API**: Uses AWS SDK for seamless integration
- **Metadata Storage**: JSON event metadata stored in Filebase
- **Image Storage**: Event banner images stored in Filebase
- **Presigned URLs**: Direct upload support for better performance
- **Error Handling**: Graceful fallback when Filebase is unavailable

#### Database Security

- **Row Level Security (RLS)**: Supabase RLS policies for data protection
- **User Isolation**: Users can only access their own data
- **Input Validation**: Zod schema validation for all inputs

### Security Headers

- **Powered By Header**: Disabled for security
- **Content Security Policy**: Configured for Web3 applications
- **Environment Variables**: Properly secured and validated

## 📚 API Reference

### Event Creation API

```typescript
POST /api/events/create
{
  title: string,
  description: string,
  location: string,
  startDate: string,
  endDate: string,
  maxCapacity: number,
  ticketPrice: string,
  requireApproval: boolean,
  hasPOAP: boolean,
  visibility: 'public' | 'private',
  walletAddress: string,
  privateKey?: string
}
```

### Filebase Client

```typescript
import { getFilebaseClient, generateEventMetadataKey } from '@/lib/filebase/client';

// Upload event metadata
const client = getFilebaseClient();
const eventId = 'unique-event-id';
const metadata = { title: 'My Event', ... };

const result = await client.uploadMetadata(
  generateEventMetadataKey(eventId),
  metadata
);
// result.url contains the public URL
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `bun run hardhat test`
5. Run linting: `bun run lint`
6. Run type checking: `bun run type-check`
7. Commit your changes: `git commit -m 'Add feature'`
8. Push to the branch: `git push origin feature-name`
9. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Update documentation as needed
- Follow the existing code architecture patterns

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions
- **Documentation**: Check the inline code comments and this README

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Integration with more blockchains
- [ ] Advanced POAP features
- [ ] Social features and sharing
- [ ] Advanced event discovery
- [ ] Creator tools and analytics

---

**🎉 Festos - Building the future of decentralized events with optimized architecture and intelligent image compression!**
