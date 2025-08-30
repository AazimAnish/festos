# Scripts Directory

This directory contains all the essential scripts for the Festos platform. All scripts are written in TypeScript and follow best practices.

## 📋 Script Overview

### 🚀 Deployment Scripts

#### `deploy-native.ts` ⭐ **RECOMMENDED**
- **Purpose**: Native deployment script that works with Hardhat 3
- **Usage**: `npx tsx scripts/deploy-native.ts`
- **Features**:
  - Uses native ethers v6 (no HRE dependencies)
  - Deploys both contracts with proper linking
  - Tests basic functionality including ticket purchases
  - Saves deployment info to JSON
  - Updates environment variables automatically
  - Comprehensive error handling
  - **STATUS**: ✅ WORKING PERFECTLY

#### `deploy-simple-ethers.ts`
- **Purpose**: Alternative deployment using Hardhat ethers integration
- **Usage**: `npx hardhat run scripts/deploy-simple-ethers.ts --network fuji`
- **Features**:
  - Uses Hardhat's built-in ethers integration
  - Streamlined deployment process
  - Automatic environment variable updates
  - Basic testing included
  - **STATUS**: ✅ WORKING

### 🧪 Testing Scripts

#### `test-contract-interaction.ts`
- **Purpose**: Tests contract interactions and identifies issues
- **Usage**: `npx tsx scripts/test-contract-interaction.ts`
- **Features**:
  - Tests contract deployment status
  - Validates contract addresses
  - Simulates ticket purchases
  - Checks escrow functionality

#### `test-ticket-purchase.ts`
- **Purpose**: Tests the complete ticket purchase flow
- **Usage**: `npx tsx scripts/test-ticket-purchase.ts`
- **Features**:
  - Tests API endpoints
  - Validates transaction data
  - Checks error scenarios
  - Analyzes purchase flow

#### `test-apis.ts`
- **Purpose**: Comprehensive API testing for all endpoints
- **Usage**: `npx tsx scripts/test-apis.ts`
- **Features**:
  - Tests event creation, listing, details
  - Tests ticket registration
  - Validates user stories
  - Comprehensive error handling

### 🔧 Utility Scripts

#### `check-wallet-balance.ts`
- **Purpose**: Checks wallet balance and network status
- **Usage**: `npx tsx scripts/check-wallet-balance.ts`
- **Features**:
  - Balance verification
  - Network status check
  - Gas price estimation
  - Transaction cost analysis

#### `setup-database.ts`
- **Purpose**: Sets up the complete database schema
- **Usage**: `npx tsx scripts/setup-database.ts`
- **Features**:
  - Creates all tables and indexes
  - Seeds initial data
  - Tests database setup
  - Comprehensive validation

#### `recover-from-blockchain.ts`
- **Purpose**: Recovers data from blockchain and IPFS
- **Usage**: `npx tsx scripts/recover-from-blockchain.ts`
- **Features**:
  - Rebuilds database from blockchain
  - Recovers IPFS metadata
  - Ensures data integrity
  - Handles missing data gracefully

## 🎯 Best Practices

### 1. **TypeScript First**
- All scripts use TypeScript for type safety
- Proper interfaces and type definitions
- No `any` types unless absolutely necessary

### 2. **Error Handling**
- Comprehensive try-catch blocks
- Meaningful error messages
- Graceful degradation
- Proper exit codes

### 3. **Environment Variables**
- All scripts load from `.env.local`
- Fallback values for missing variables
- Clear error messages for missing config

### 4. **Logging**
- Consistent emoji-based logging
- Clear step-by-step progress
- Detailed error information
- Success/failure indicators

### 5. **Modularity**
- Functions are separated by responsibility
- Reusable components
- Clear function signatures
- Proper return types

## 🚀 Usage Workflow

### Initial Setup
```bash
# 1. Setup database
npx tsx scripts/setup-database.ts

# 2. Deploy contracts (RECOMMENDED)
npx tsx scripts/deploy-native.ts

# 3. Check wallet balance
npx tsx scripts/check-wallet-balance.ts
```

### Testing
```bash
# 1. Test contract interactions
npx tsx scripts/test-contract-interaction.ts

# 2. Test ticket purchase flow
npx tsx scripts/test-ticket-purchase.ts

# 3. Test all APIs
npx tsx scripts/test-apis.ts
```

### Recovery (if needed)
```bash
# Recover data from blockchain
npx tsx scripts/recover-from-blockchain.ts
```

## 🔧 Configuration

### Required Environment Variables
```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Blockchain
NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL=
NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_ESCROW_ADDRESS=
NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_TICKET_ADDRESS=
NEXT_PUBLIC_AVALANCHE_FUJI_EVENT_FACTORY_ADDRESS=

# Deployment
PRIVATE_KEY=
```

### Network Configuration
- **Testnet**: Avalanche Fuji (Chain ID: 43113)
- **Mainnet**: Avalanche C-Chain (Chain ID: 43114)

## 📝 Script Dependencies

### External Dependencies
- `hardhat` - Contract deployment and testing
- `viem` - Blockchain interactions
- `@supabase/supabase-js` - Database operations
- `dotenv` - Environment variable loading

### Internal Dependencies
- `src/lib/contracts/` - Contract ABIs and addresses
- `src/lib/filebase/client.ts` - IPFS operations
- `database/setup-complete.sql` - Database schema

## 🐛 Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Ensure all dependencies are installed
   - Check TypeScript configuration
   - Verify import paths

2. **"Insufficient balance" errors**
   - Run `check-wallet-balance.ts` to verify funds
   - Get test AVAX from faucet if needed

3. **"Contract not deployed" errors**
   - Run deployment scripts first
   - Check environment variables
   - Verify network connection

4. **"Database connection failed" errors**
   - Check Supabase credentials
   - Verify database is accessible
   - Run `setup-database.ts` if needed

### Debug Mode
Add `DEBUG=true` to environment variables for verbose logging:
```bash
DEBUG=true npx tsx scripts/test-apis.ts
```

## 📊 Script Performance

### Execution Times (Typical)
- `deploy-native.ts`: 2-3 minutes
- `deploy-simple-ethers.ts`: 2-5 minutes
- `test-apis.ts`: 30-60 seconds
- `check-wallet-balance.ts`: 5-10 seconds
- `setup-database.ts`: 10-30 seconds

### Resource Usage
- Memory: 50-200MB per script
- Network: Varies by script type
- CPU: Minimal (mostly I/O bound)

## 🔄 Maintenance

### Regular Tasks
1. **Weekly**: Run all test scripts
2. **Monthly**: Update contract addresses
3. **Quarterly**: Review and update dependencies

### Version Control
- All scripts are version controlled
- Changes require testing
- Document any breaking changes
- Update this README when adding new scripts

## 📞 Support

For issues with scripts:
1. Check the troubleshooting section
2. Review error logs carefully
3. Verify environment configuration
4. Test with minimal data first
5. Create issue with detailed error information
