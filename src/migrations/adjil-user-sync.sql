-- Create admin_user_sync table for mapping Adjil.BNPL users to Admin Portal
-- This table maintains a relationship between Adjil.BNPL users and Admin Portal without modifying the original data

CREATE TABLE IF NOT EXISTS admin_user_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adjilUserId UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  name TEXT NOT NULL,
  phoneNumber TEXT,
  role TEXT NOT NULL DEFAULT 'support',
  isActive BOOLEAN DEFAULT true,
  adjilRole TEXT, -- Original role from Adjil.BNPL
  adjilData JSONB, -- Store complete original Adjil user data
  lastSyncedAt TIMESTAMP DEFAULT now(),
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_user_sync_email ON admin_user_sync(email);
CREATE INDEX IF NOT EXISTS idx_admin_user_sync_adjilUserId ON admin_user_sync(adjilUserId);
CREATE INDEX IF NOT EXISTS idx_admin_user_sync_role ON admin_user_sync(role);
CREATE INDEX IF NOT EXISTS idx_admin_user_sync_lastSyncedAt ON admin_user_sync(lastSyncedAt DESC);

-- Create sync_log table to track all synchronization events
CREATE TABLE IF NOT EXISTS sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syncType TEXT NOT NULL, -- 'FULL' | 'PARTIAL' | 'MANUAL'
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'SUCCESS' | 'FAILED'
  totalUsers INT DEFAULT 0,
  syncedUsers INT DEFAULT 0,
  errorMessage TEXT,
  startedAt TIMESTAMP DEFAULT now(),
  completedAt TIMESTAMP,
  metadata JSONB
);

-- Create index for sync_log
CREATE INDEX IF NOT EXISTS idx_sync_log_status ON sync_log(status);
CREATE INDEX IF NOT EXISTS idx_sync_log_startedAt ON sync_log(startedAt DESC);

-- Create a view for active synced users
CREATE OR REPLACE VIEW active_synced_users AS
SELECT
  id,
  adjilUserId,
  email,
  firstName,
  lastName,
  name,
  phoneNumber,
  role,
  adjilRole,
  lastSyncedAt
FROM admin_user_sync
WHERE isActive = true
ORDER BY lastSyncedAt DESC;

-- Enable RLS (Row Level Security) on admin_user_sync
ALTER TABLE admin_user_sync ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can view synced users (read-only for non-admins)
CREATE POLICY "Users can view synced users" ON admin_user_sync
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only admin service role can insert/update/delete synced users
CREATE POLICY "Only service role can modify synced users" ON admin_user_sync
  FOR ALL USING (auth.role() = 'service_role');

-- Enable RLS on sync_log
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can view sync logs
CREATE POLICY "Users can view sync logs" ON sync_log
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only service role can modify sync logs
CREATE POLICY "Only service role can modify sync logs" ON sync_log
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_admin_user_sync_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updatedAt
DROP TRIGGER IF EXISTS update_admin_user_sync_timestamp_trigger ON admin_user_sync;
CREATE TRIGGER update_admin_user_sync_timestamp_trigger
  BEFORE UPDATE ON admin_user_sync
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_user_sync_timestamp();

-- Function to log sync events
CREATE OR REPLACE FUNCTION log_sync_event(
  p_syncType TEXT,
  p_totalUsers INT DEFAULT 0,
  p_syncedUsers INT DEFAULT 0,
  p_errorMessage TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_syncId UUID;
BEGIN
  INSERT INTO sync_log (syncType, status, totalUsers, syncedUsers, errorMessage, metadata)
  VALUES (
    p_syncType,
    CASE WHEN p_errorMessage IS NULL THEN 'SUCCESS' ELSE 'FAILED' END,
    p_totalUsers,
    p_syncedUsers,
    p_errorMessage,
    p_metadata
  )
  RETURNING id INTO v_syncId;
  
  RETURN v_syncId;
END;
$$ LANGUAGE plpgsql;
