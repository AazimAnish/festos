-- Migration: Add blockchain data caching tables
-- This ensures Supabase serves as a fast cache layer while Smart Contracts remain the source of truth

-- Update events table to include blockchain references
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS blockchain_event_id BIGINT,
ADD COLUMN IF NOT EXISTS contract_address TEXT,
ADD COLUMN IF NOT EXISTS chain_id INTEGER DEFAULT 43113,
ADD COLUMN IF NOT EXISTS creation_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS ipfs_metadata_hash TEXT,
ADD COLUMN IF NOT EXISTS ipfs_image_hash TEXT,
ADD COLUMN IF NOT EXISTS poap_event_id INTEGER,
ADD COLUMN IF NOT EXISTS poap_secret_code TEXT,
ADD COLUMN IF NOT EXISTS poap_drop_created BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_blockchain_sync TIMESTAMPTZ DEFAULT NOW();

-- Create index on blockchain_event_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_events_blockchain_id ON events(blockchain_event_id);
CREATE INDEX IF NOT EXISTS idx_events_contract_address ON events(contract_address);
CREATE INDEX IF NOT EXISTS idx_events_chain_id ON events(chain_id);

-- Create registrations table for event attendees
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    attendee_address TEXT NOT NULL,
    attendee_name TEXT NOT NULL,
    attendee_email TEXT NOT NULL,
    ticket_token_id BIGINT,
    transaction_hash TEXT,
    amount_paid DECIMAL(18,8) DEFAULT 0,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(event_id, attendee_address), -- One registration per attendee per event
    CONSTRAINT valid_attendee_address CHECK (attendee_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Create indexes on registrations
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_attendee_address ON registrations(attendee_address);
CREATE INDEX IF NOT EXISTS idx_registrations_token_id ON registrations(ticket_token_id);
CREATE INDEX IF NOT EXISTS idx_registrations_tx_hash ON registrations(transaction_hash);

-- Create blockchain_events table for caching smart contract events
CREATE TABLE IF NOT EXISTS blockchain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL, -- e.g., 'EventCreated', 'TicketPurchased', etc.
    contract_address TEXT NOT NULL,
    transaction_hash TEXT NOT NULL,
    block_number BIGINT NOT NULL,
    block_hash TEXT NOT NULL,
    log_index INTEGER NOT NULL,
    chain_id INTEGER NOT NULL DEFAULT 43113,
    event_data JSONB NOT NULL, -- Raw event data from blockchain
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(transaction_hash, log_index), -- Ensure no duplicate events
    CONSTRAINT valid_contract_address CHECK (contract_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Create indexes on blockchain_events
CREATE INDEX IF NOT EXISTS idx_blockchain_events_contract ON blockchain_events(contract_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_name ON blockchain_events(event_name);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_tx_hash ON blockchain_events(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_block ON blockchain_events(block_number);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_processed ON blockchain_events(processed);

-- Create tickets table for NFT ticket caching
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id BIGINT NOT NULL,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    owner_address TEXT NOT NULL,
    attendee_name TEXT NOT NULL,
    attendee_email TEXT NOT NULL,
    mint_transaction_hash TEXT,
    mint_block_number BIGINT,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMPTZ,
    used_transaction_hash TEXT,
    metadata_uri TEXT,
    image_uri TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_sync TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(token_id), -- Each NFT token ID is unique
    CONSTRAINT valid_owner_address CHECK (owner_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Create indexes on tickets
CREATE INDEX IF NOT EXISTS idx_tickets_token_id ON tickets(token_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_owner ON tickets(owner_address);
CREATE INDEX IF NOT EXISTS idx_tickets_used ON tickets(is_used);

-- Create escrow_contracts table for escrow contract tracking
CREATE TABLE IF NOT EXISTS escrow_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    blockchain_event_id BIGINT NOT NULL,
    contract_address TEXT NOT NULL,
    creator_address TEXT NOT NULL,
    ticket_price DECIMAL(18,8) NOT NULL,
    event_end_time TIMESTAMPTZ NOT NULL,
    total_amount DECIMAL(18,8) DEFAULT 0,
    ticket_count INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    is_cancelled BOOLEAN DEFAULT FALSE,
    funds_released BOOLEAN DEFAULT FALSE,
    creation_tx_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(blockchain_event_id), -- One escrow per blockchain event
    CONSTRAINT valid_contract_address CHECK (contract_address ~ '^0x[a-fA-F0-9]{40}$'),
    CONSTRAINT valid_creator_address CHECK (creator_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Create indexes on escrow_contracts
CREATE INDEX IF NOT EXISTS idx_escrow_contracts_event_id ON escrow_contracts(event_id);
CREATE INDEX IF NOT EXISTS idx_escrow_contracts_blockchain_event_id ON escrow_contracts(blockchain_event_id);
CREATE INDEX IF NOT EXISTS idx_escrow_contracts_creator ON escrow_contracts(creator_address);

-- Create poap_claims table for POAP tracking
CREATE TABLE IF NOT EXISTS poap_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    attendee_address TEXT NOT NULL,
    poap_token_id BIGINT,
    poap_event_id INTEGER NOT NULL,
    transaction_hash TEXT,
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    poap_url TEXT,
    
    -- Constraints
    UNIQUE(event_id, attendee_address), -- One POAP per attendee per event
    CONSTRAINT valid_attendee_address CHECK (attendee_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Create indexes on poap_claims
CREATE INDEX IF NOT EXISTS idx_poap_claims_event_id ON poap_claims(event_id);
CREATE INDEX IF NOT EXISTS idx_poap_claims_attendee ON poap_claims(attendee_address);
CREATE INDEX IF NOT EXISTS idx_poap_claims_poap_event_id ON poap_claims(poap_event_id);

-- Create sync_status table to track blockchain synchronization
CREATE TABLE IF NOT EXISTS sync_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_address TEXT NOT NULL,
    chain_id INTEGER NOT NULL DEFAULT 43113,
    last_synced_block BIGINT NOT NULL DEFAULT 0,
    sync_type TEXT NOT NULL, -- 'events', 'tickets', 'escrows'
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    is_syncing BOOLEAN DEFAULT FALSE,
    sync_errors TEXT,
    
    -- Constraints
    UNIQUE(contract_address, chain_id, sync_type),
    CONSTRAINT valid_contract_address CHECK (contract_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Create index on sync_status
CREATE INDEX IF NOT EXISTS idx_sync_status_contract ON sync_status(contract_address, chain_id);

-- Add updated_at trigger for tables that need it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_registrations_updated_at ON registrations;
CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_escrow_contracts_updated_at ON escrow_contracts;
CREATE TRIGGER update_escrow_contracts_updated_at
    BEFORE UPDATE ON escrow_contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add Row Level Security (RLS) policies

-- Enable RLS on all new tables
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE poap_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;

-- Create policies for registrations (users can see their own registrations, creators can see their event registrations)
CREATE POLICY "Users can view own registrations" ON registrations
    FOR SELECT USING (
        attendee_address = LOWER(auth.jwt() ->> 'wallet_address')
        OR 
        event_id IN (
            SELECT id FROM events 
            WHERE creator_id = LOWER(auth.jwt() ->> 'wallet_address')
        )
    );

CREATE POLICY "Users can create own registrations" ON registrations
    FOR INSERT WITH CHECK (
        attendee_address = LOWER(auth.jwt() ->> 'wallet_address')
    );

-- Create policies for tickets (users can see their own tickets)
CREATE POLICY "Users can view own tickets" ON tickets
    FOR SELECT USING (
        owner_address = LOWER(auth.jwt() ->> 'wallet_address')
        OR 
        event_id IN (
            SELECT id FROM events 
            WHERE creator_id = LOWER(auth.jwt() ->> 'wallet_address')
        )
    );

-- Create policies for escrow_contracts (creators can see their own escrows)
CREATE POLICY "Creators can view own escrows" ON escrow_contracts
    FOR SELECT USING (
        creator_address = LOWER(auth.jwt() ->> 'wallet_address')
    );

-- Create policies for poap_claims (users can see their own claims)
CREATE POLICY "Users can view own POAP claims" ON poap_claims
    FOR SELECT USING (
        attendee_address = LOWER(auth.jwt() ->> 'wallet_address')
        OR 
        event_id IN (
            SELECT id FROM events 
            WHERE creator_id = LOWER(auth.jwt() ->> 'wallet_address')
        )
    );

-- Create policies for blockchain_events (readable by authenticated users)
CREATE POLICY "Authenticated users can view blockchain events" ON blockchain_events
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policies for sync_status (readable by authenticated users, writable by service role)
CREATE POLICY "Authenticated users can view sync status" ON sync_status
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage sync status" ON sync_status
    FOR ALL USING (auth.role() = 'service_role');

-- Add helpful views for common queries

-- View for event details with registration counts
CREATE OR REPLACE VIEW event_details_with_stats AS
SELECT 
    e.*,
    COALESCE(r.registration_count, 0) as registration_count,
    COALESCE(r.verified_count, 0) as verified_registration_count,
    COALESCE(t.ticket_count, 0) as ticket_count,
    COALESCE(t.used_ticket_count, 0) as used_ticket_count,
    CASE 
        WHEN e.poap_drop_created THEN 'enabled'
        WHEN e.has_poap THEN 'pending'
        ELSE 'disabled'
    END as poap_status
FROM events e
LEFT JOIN (
    SELECT 
        event_id,
        COUNT(*) as registration_count,
        COUNT(*) FILTER (WHERE is_verified = true) as verified_count
    FROM registrations
    GROUP BY event_id
) r ON e.id = r.event_id
LEFT JOIN (
    SELECT 
        event_id,
        COUNT(*) as ticket_count,
        COUNT(*) FILTER (WHERE is_used = true) as used_ticket_count
    FROM tickets
    GROUP BY event_id
) t ON e.id = t.event_id;

-- View for user ticket summary
CREATE OR REPLACE VIEW user_ticket_summary AS
SELECT 
    t.*,
    e.title as event_title,
    e.start_date as event_start_date,
    e.end_date as event_end_date,
    e.location as event_location,
    r.attendee_name,
    r.attendee_email,
    CASE 
        WHEN t.is_used THEN 'used'
        WHEN e.end_date < NOW() THEN 'expired'
        ELSE 'active'
    END as ticket_status
FROM tickets t
JOIN events e ON t.event_id = e.id
LEFT JOIN registrations r ON t.event_id = r.event_id AND t.owner_address = r.attendee_address;

-- Add comments for documentation
COMMENT ON TABLE registrations IS 'Event registrations with ticket references';
COMMENT ON TABLE blockchain_events IS 'Cache for blockchain events to avoid repeated RPC calls';
COMMENT ON TABLE tickets IS 'NFT ticket cache with ownership and usage tracking';
COMMENT ON TABLE escrow_contracts IS 'Escrow contract tracking for paid events';
COMMENT ON TABLE poap_claims IS 'POAP token claims for event attendance proof';
COMMENT ON TABLE sync_status IS 'Blockchain synchronization status tracking';

COMMENT ON VIEW event_details_with_stats IS 'Events with registration and ticket statistics';
COMMENT ON VIEW user_ticket_summary IS 'User tickets with event details and status';