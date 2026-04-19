-- Migration 015: Encryption Functions
-- Data: 2025-01-27
-- Descrição: Criar funções para criptografia/descriptografia de tokens usando pgcrypto

BEGIN;

-- ============================================================================
-- FUNÇÃO: encrypt_token
-- ============================================================================
CREATE OR REPLACE FUNCTION encrypt_token(
    token_data TEXT,
    encryption_key TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    encrypted_result TEXT;
BEGIN
    -- Encrypt using AES-256
    encrypted_result := encode(
        pgp_sym_encrypt(token_data, encryption_key, 'cipher-algo=aes256'),
        'base64'
    );
    
    RETURN encrypted_result;
END;
$$;

COMMENT ON FUNCTION encrypt_token IS 'Encrypt token using AES-256 with pgcrypto';

-- ============================================================================
-- FUNÇÃO: decrypt_token
-- ============================================================================
CREATE OR REPLACE FUNCTION decrypt_token(
    encrypted_data TEXT,
    encryption_key TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    decrypted_result TEXT;
BEGIN
    -- Decrypt using AES-256
    decrypted_result := pgp_sym_decrypt(
        decode(encrypted_data, 'base64'),
        encryption_key,
        'cipher-algo=aes256'
    );
    
    RETURN decrypted_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to decrypt token: %', SQLERRM;
END;
$$;

COMMENT ON FUNCTION decrypt_token IS 'Decrypt token using AES-256 with pgcrypto';

-- ============================================================================
-- PERMISSÕES
-- ============================================================================
-- Permitir que authenticated users executem as funções
GRANT EXECUTE ON FUNCTION encrypt_token TO authenticated;
GRANT EXECUTE ON FUNCTION decrypt_token TO authenticated;

-- Permitir que service_role execute as funções
GRANT EXECUTE ON FUNCTION encrypt_token TO service_role;
GRANT EXECUTE ON FUNCTION decrypt_token TO service_role;

COMMIT;

