-- Add pixel_access_token column for Meta CAPI pixel access tokens
ALTER TABLE integration_accounts ADD COLUMN IF NOT EXISTS pixel_access_token TEXT;
COMMENT ON COLUMN integration_accounts.pixel_access_token IS 'Encrypted Meta CAPI pixel access token for offline conversion events';
