-- Migration 034: Link Triggers for Automatic Counters
-- Data: 2026-01-17
-- Descrição: Triggers para atualização automática de contadores em trackable_links
-- Baseado em: back-end/ETAPAS_BACKEND.md (Etapa 2)

BEGIN;

-- ============================================================================
-- TRIGGER 1: Incrementar clicks_count ao inserir em link_accesses
-- ============================================================================

CREATE OR REPLACE FUNCTION update_link_clicks_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE trackable_links
    SET clicks_count = clicks_count + 1,
        updated_at = NOW()
    WHERE id = NEW.link_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_link_clicks_count() IS 'Incrementa clicks_count em trackable_links quando novo acesso é registrado';

CREATE TRIGGER link_accesses_insert_clicks_trigger
    AFTER INSERT ON link_accesses
    FOR EACH ROW
    EXECUTE FUNCTION update_link_clicks_count();

-- ============================================================================
-- TRIGGER 2: Incrementar contacts_count quando contato é criado com origin_id de link
-- ============================================================================

CREATE OR REPLACE FUNCTION update_link_contacts_count()
RETURNS TRIGGER AS $$
DECLARE
    v_link_id UUID;
BEGIN
    -- Verificar se o contato tem origin_id vinculado a um link
    IF NEW.main_origin_id IS NOT NULL THEN
        -- Buscar link que tem este origin_id
        SELECT id INTO v_link_id
        FROM trackable_links
        WHERE origin_id = NEW.main_origin_id
        LIMIT 1;
        
        -- Se encontrou link, incrementar contador
        IF v_link_id IS NOT NULL THEN
            UPDATE trackable_links
            SET contacts_count = contacts_count + 1,
                updated_at = NOW()
            WHERE id = v_link_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_link_contacts_count() IS 'Incrementa contacts_count em trackable_links quando contato é criado com origin vinculada';

CREATE TRIGGER contacts_insert_link_counter_trigger
    AFTER INSERT ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_link_contacts_count();

-- ============================================================================
-- TRIGGER 3: Atualizar link_accesses com contact_id quando contato é criado
-- ============================================================================
-- Este trigger tenta atribuir o contact_id ao link_access mais recente
-- que ainda não foi convertido, baseado no origin_id do contato.

CREATE OR REPLACE FUNCTION attribute_contact_to_link_access()
RETURNS TRIGGER AS $$
DECLARE
    v_link_id UUID;
    v_access_id UUID;
BEGIN
    -- Verificar se o contato tem origin_id
    IF NEW.main_origin_id IS NOT NULL THEN
        -- Buscar link que tem este origin_id
        SELECT id INTO v_link_id
        FROM trackable_links
        WHERE origin_id = NEW.main_origin_id
        LIMIT 1;
        
        -- Se encontrou link, buscar acesso não convertido mais recente
        IF v_link_id IS NOT NULL THEN
            -- Buscar acesso mais recente não convertido deste link
            SELECT id INTO v_access_id
            FROM link_accesses
            WHERE link_id = v_link_id
            AND contact_id IS NULL
            ORDER BY created_at DESC
            LIMIT 1;
            
            -- Se encontrou acesso, atribuir contact_id
            IF v_access_id IS NOT NULL THEN
                UPDATE link_accesses
                SET contact_id = NEW.id,
                    converted_at = NOW()
                WHERE id = v_access_id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION attribute_contact_to_link_access() IS 'Atribui contact_id ao link_access mais recente quando contato é criado';

CREATE TRIGGER contacts_insert_link_attribution_trigger
    AFTER INSERT ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION attribute_contact_to_link_access();

-- ============================================================================
-- TRIGGER 4: Incrementar sales_count e revenue quando venda é criada
-- ============================================================================

CREATE OR REPLACE FUNCTION update_link_sales_count()
RETURNS TRIGGER AS $$
DECLARE
    v_link_id UUID;
    v_origin_id UUID;
BEGIN
    -- Apenas processar vendas completadas
    IF NEW.status = 'completed' AND NEW.contact_id IS NOT NULL THEN
        -- Buscar origin_id do contato
        SELECT main_origin_id INTO v_origin_id
        FROM contacts
        WHERE id = NEW.contact_id;
        
        -- Se contato tem origin, buscar link vinculado
        IF v_origin_id IS NOT NULL THEN
            SELECT id INTO v_link_id
            FROM trackable_links
            WHERE origin_id = v_origin_id
            LIMIT 1;
            
            -- Se encontrou link, atualizar contadores
            IF v_link_id IS NOT NULL THEN
                UPDATE trackable_links
                SET sales_count = sales_count + 1,
                    revenue = revenue + COALESCE(NEW.value, 0),
                    updated_at = NOW()
                WHERE id = v_link_id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_link_sales_count() IS 'Incrementa sales_count e revenue em trackable_links quando venda é completada';

CREATE TRIGGER sales_insert_link_counter_trigger
    AFTER INSERT ON sales
    FOR EACH ROW
    EXECUTE FUNCTION update_link_sales_count();

-- ============================================================================
-- TRIGGER 5: Atualizar contadores quando venda muda de status
-- ============================================================================
-- Quando uma venda muda de 'completed' para 'lost' ou vice-versa,
-- os contadores devem ser ajustados.

CREATE OR REPLACE FUNCTION update_link_sales_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_link_id UUID;
    v_origin_id UUID;
BEGIN
    -- Apenas processar se status mudou
    IF OLD.status != NEW.status AND NEW.contact_id IS NOT NULL THEN
        -- Buscar origin_id do contato
        SELECT main_origin_id INTO v_origin_id
        FROM contacts
        WHERE id = NEW.contact_id;
        
        -- Se contato tem origin, buscar link vinculado
        IF v_origin_id IS NOT NULL THEN
            SELECT id INTO v_link_id
            FROM trackable_links
            WHERE origin_id = v_origin_id
            LIMIT 1;
            
            -- Se encontrou link, ajustar contadores
            IF v_link_id IS NOT NULL THEN
                -- Se mudou de 'completed' para 'lost'
                IF OLD.status = 'completed' AND NEW.status = 'lost' THEN
                    UPDATE trackable_links
                    SET sales_count = GREATEST(0, sales_count - 1),
                        revenue = GREATEST(0, revenue - COALESCE(OLD.value, 0)),
                        updated_at = NOW()
                    WHERE id = v_link_id;
                    
                -- Se mudou de 'lost' para 'completed'
                ELSIF OLD.status = 'lost' AND NEW.status = 'completed' THEN
                    UPDATE trackable_links
                    SET sales_count = sales_count + 1,
                        revenue = revenue + COALESCE(NEW.value, 0),
                        updated_at = NOW()
                    WHERE id = v_link_id;
                END IF;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_link_sales_on_status_change() IS 'Ajusta sales_count e revenue quando status da venda muda';

CREATE TRIGGER sales_update_link_counter_trigger
    AFTER UPDATE ON sales
    FOR EACH ROW
    EXECUTE FUNCTION update_link_sales_on_status_change();

-- ============================================================================
-- TRIGGER 6: Decrementar contadores quando registros são deletados
-- ============================================================================

-- Decrementar clicks_count quando acesso é deletado
CREATE OR REPLACE FUNCTION decrement_link_clicks_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE trackable_links
    SET clicks_count = GREATEST(0, clicks_count - 1),
        updated_at = NOW()
    WHERE id = OLD.link_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER link_accesses_delete_clicks_trigger
    AFTER DELETE ON link_accesses
    FOR EACH ROW
    EXECUTE FUNCTION decrement_link_clicks_count();

-- Decrementar contacts_count quando contato é deletado
CREATE OR REPLACE FUNCTION decrement_link_contacts_count()
RETURNS TRIGGER AS $$
DECLARE
    v_link_id UUID;
BEGIN
    IF OLD.main_origin_id IS NOT NULL THEN
        SELECT id INTO v_link_id
        FROM trackable_links
        WHERE origin_id = OLD.main_origin_id
        LIMIT 1;
        
        IF v_link_id IS NOT NULL THEN
            UPDATE trackable_links
            SET contacts_count = GREATEST(0, contacts_count - 1),
                updated_at = NOW()
            WHERE id = v_link_id;
        END IF;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER contacts_delete_link_counter_trigger
    AFTER DELETE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION decrement_link_contacts_count();

-- Decrementar sales_count e revenue quando venda é deletada
CREATE OR REPLACE FUNCTION decrement_link_sales_count()
RETURNS TRIGGER AS $$
DECLARE
    v_link_id UUID;
    v_origin_id UUID;
BEGIN
    IF OLD.status = 'completed' AND OLD.contact_id IS NOT NULL THEN
        SELECT main_origin_id INTO v_origin_id
        FROM contacts
        WHERE id = OLD.contact_id;
        
        IF v_origin_id IS NOT NULL THEN
            SELECT id INTO v_link_id
            FROM trackable_links
            WHERE origin_id = v_origin_id
            LIMIT 1;
            
            IF v_link_id IS NOT NULL THEN
                UPDATE trackable_links
                SET sales_count = GREATEST(0, sales_count - 1),
                    revenue = GREATEST(0, revenue - COALESCE(OLD.value, 0)),
                    updated_at = NOW()
                WHERE id = v_link_id;
            END IF;
        END IF;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sales_delete_link_counter_trigger
    AFTER DELETE ON sales
    FOR EACH ROW
    EXECUTE FUNCTION decrement_link_sales_count();

COMMIT;
