-- Migration: Add wallet_address column to users table
-- This migration adds support for wallet-based authentication

-- Add wallet_address column to users table
ALTER TABLE users 
ADD COLUMN wallet_address TEXT UNIQUE;

-- Create index for faster wallet address lookups
CREATE INDEX idx_users_wallet_address ON users(wallet_address);

-- Add comment to document the column
COMMENT ON COLUMN users.wallet_address IS 'Wallet address for Web3 authentication (0x format)';
