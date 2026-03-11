-- Update users table to support all roles (customer, merchant, admin, partner, support, ceo)
-- This enables sharing data between Adjil.BNPL and Admin Portal

-- Drop existing CHECK constraint and add new one with all roles
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('customer', 'merchant', 'admin', 'partner', 'support', 'ceo'));

-- Add status check constraint with all valid statuses
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_status_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_status_check 
CHECK (status IN ('active', 'inactive', 'suspended', 'deleted'));

-- Add admin-specific fields (optional - for future use)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;

-- Add first_name and last_name columns for Admin Portal compatibility
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS first_name TEXT;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Update existing records to populate first_name/last_name from name if empty
UPDATE public.users 
SET 
    first_name = COALESCE(first_name, SPLIT_PART(name, ' ', 1)),
    last_name = COALESCE(last_name, 
        CASE 
            WHEN POSITION(' ' IN name) > 0 
            THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
            ELSE ''
        END
    )
WHERE first_name IS NULL OR last_name IS NULL;

-- Grant necessary permissions to service role
GRANT ALL ON public.users TO service_role;
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- Grant permissions on transactions
GRANT ALL ON public.transactions TO service_role;
GRANT SELECT ON public.transactions TO authenticated;
GRANT SELECT ON public.transactions TO anon;

-- Grant permissions on support_tickets
GRANT ALL ON public.support_tickets TO service_role;
GRANT SELECT ON public.support_tickets TO authenticated;
GRANT SELECT ON public.support_tickets TO anon;

-- Update RLS policies to allow admin access
DROP POLICY IF EXISTS "Allow service role full access" ON public.users;
CREATE POLICY "Allow service role full access" ON public.users
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can view all users" ON public.users;
CREATE POLICY "Users can view all users" ON public.users
    FOR SELECT USING (auth.role() IN ('authenticated', 'service_role'));
