-- Rename Filebase columns to IPFS columns
-- Date: 2025-08-28
-- Description: Updates column names from filebase_* to ipfs_* to reflect migration from Filebase to Pinata IPFS

-- Update events table columns
ALTER TABLE events 
  RENAME COLUMN filebase_metadata_url TO ipfs_metadata_url;

ALTER TABLE events 
  RENAME COLUMN filebase_image_url TO ipfs_image_url;

-- Add comments to document the purpose of these columns
COMMENT ON COLUMN events.ipfs_metadata_url IS 'IPFS hash/URL for event metadata stored via Pinata IPFS service';
COMMENT ON COLUMN events.ipfs_image_url IS 'IPFS hash/URL for event banner image stored via Pinata IPFS service';

-- Update storage provider values from 'filebase' to 'pinata'
UPDATE events 
SET storage_provider = 'pinata' 
WHERE storage_provider = 'filebase' OR storage_provider IS NULL;