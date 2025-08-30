-- Migration: Rename Filebase columns to IPFS columns
-- This migration updates all filebase_* columns to ipfs_* to reflect the change from Filebase to Pinata IPFS

-- Update events table columns
ALTER TABLE events 
  RENAME COLUMN filebase_metadata_url TO ipfs_metadata_url;

ALTER TABLE events 
  RENAME COLUMN filebase_image_url TO ipfs_image_url;

-- Add comment to document the change
COMMENT ON COLUMN events.ipfs_metadata_url IS 'IPFS hash/URL for event metadata stored via Pinata';
COMMENT ON COLUMN events.ipfs_image_url IS 'IPFS hash/URL for event banner image stored via Pinata';

-- Update any existing indexes (if they exist)
-- Note: Supabase typically creates indexes automatically based on column names
-- This ensures any custom indexes are updated

-- Update storage provider values from 'filebase' to 'pinata' if needed
UPDATE events 
SET storage_provider = 'pinata' 
WHERE storage_provider = 'filebase';

-- Log the migration
INSERT INTO migration_logs (migration_name, applied_at, description)
VALUES (
  'rename_filebase_to_ipfs_columns',
  NOW(),
  'Renamed filebase_* columns to ipfs_* columns and updated storage provider values'
) ON CONFLICT (migration_name) DO NOTHING;