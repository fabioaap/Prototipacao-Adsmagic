# 📋 Scripts de Migração de Dados - FASE 1.5

## 🎯 Objetivo

Scripts para migração de dados existentes antes de criar unique constraints no banco de dados.

**⚠️ CRÍTICO**: Estes scripts devem ser executados ANTES da FASE 2 (Banco de Dados) para evitar falhas nas unique constraints.

---

## 📁 Arquivos

### 1. `analyze_contacts_duplicates.sql`
Script de análise que identifica:
- Contatos duplicados (mesmo phone + country_code no mesmo projeto)
- Contatos sem `canonical_identifier`
- Estatísticas gerais da tabela
- Contatos com problemas (sem identificador válido)

**Uso**: Execute para entender o estado atual dos dados antes da migração.

### 2. `migrate_contacts_canonical.sql`
Script de migração que:
- Preenche `canonical_identifier` para contatos existentes
- Resolve duplicatas mantendo o contato mais antigo
- Remove contatos duplicados (hard delete)

**Uso**: Execute para migrar os dados existentes.

---

## 🚀 Como Executar

### Passo 1: Análise (Obrigatório)

```bash
# Conectar ao banco de dados
psql -h <host> -U <user> -d <database>

# Ou via Supabase SQL Editor
# Copiar e colar o conteúdo de analyze_contacts_duplicates.sql
```

**Resultado esperado**:
- Estatísticas gerais
- Lista de duplicatas
- Contatos sem canonical_identifier
- Resumo para decisão

### Passo 2: Backup (Obrigatório)

```bash
# Fazer backup completo do banco
pg_dump -h <host> -U <user> -d <database> > backup_before_migration.sql

# Ou via Supabase Dashboard
# Settings > Database > Backups > Create Backup
```

### Passo 3: Revisar Resultados da Análise

- [ ] Verificar quantidade de duplicatas
- [ ] Verificar quantidade de contatos sem canonical_identifier
- [ ] Decidir estratégia de resolução de duplicatas
- [ ] Confirmar com equipe se necessário

### Passo 4: Executar Migração

**⚠️ ATENÇÃO**: Antes de executar, edite o script `migrate_contacts_canonical.sql` e configure a estratégia:

```sql
DECLARE
    duplicate_strategy TEXT := 'hard_delete'; -- ou 'soft_delete' se implementado
```

**Opções**:
- `'hard_delete'`: Deleta contatos duplicados permanentemente (mantém o mais antigo)
- `'soft_delete'`: Marca como inativo (requer campo `is_active` na tabela)

```bash
# Executar migração
psql -h <host> -U <user> -d <database> -f migrate_contacts_canonical.sql

# Ou via Supabase SQL Editor
# Copiar e colar o conteúdo de migrate_contacts_canonical.sql
```

### Passo 5: Validação

Após executar a migração, o script executa automaticamente queries de validação:
- Contatos sem canonical_identifier restantes
- Duplicatas restantes

**Verificar**:
- [ ] Todos os contatos têm canonical_identifier (exceto os sem identificador válido)
- [ ] Não há duplicatas restantes
- [ ] Dados não foram corrompidos

### Passo 6: Executar Análise Novamente

```bash
# Executar script de análise novamente para comparar
psql -h <host> -U <user> -d <database> -f analyze_contacts_duplicates.sql
```

**Comparar resultados**:
- Antes: X duplicatas, Y sem canonical_identifier
- Depois: 0 duplicatas, 0 sem canonical_identifier (ou apenas contatos inválidos)

---

## 📊 Formato do canonical_identifier

O script preenche `canonical_identifier` no seguinte formato:

- **Telefone**: `phone:${country_code}:${phone}`
  - Exemplo: `phone:55:16997202704`
  
- **JID**: `jid:${jid}`
  - Exemplo: `jid:5516997202704@s.whatsapp.net`
  
- **LID**: `lid:${lid_number}` (remove sufixo @lid)
  - Exemplo: `lid:213709100187796`

---

## ⚠️ Estratégia de Resolução de Duplicatas

### Hard Delete (Atual)

O script atual usa **hard delete**: mantém o contato mais antigo e deleta os outros.

**Critério de seleção**: Contato com `created_at` mais antigo é mantido.

**Impacto**:
- ✅ Simples e direto
- ✅ Remove duplicatas completamente
- ⚠️ Perda permanente de dados (mas duplicatas são indesejadas)

### Soft Delete (Futuro)

Se a tabela tiver campo `is_active` ou `deleted_at`, pode-se implementar soft delete:

```sql
-- Exemplo de implementação futura
UPDATE contacts
SET is_active = false, deleted_at = NOW()
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);
```

---

## 🔍 Validação Pós-Migração

### Queries de Validação

```sql
-- 1. Verificar contatos sem canonical_identifier
SELECT COUNT(*) 
FROM contacts
WHERE canonical_identifier IS NULL
  AND (phone IS NOT NULL OR jid IS NOT NULL OR lid IS NOT NULL);
-- Esperado: 0

-- 2. Verificar duplicatas restantes
SELECT 
    project_id,
    phone,
    country_code,
    COUNT(*) as cnt
FROM contacts
WHERE phone IS NOT NULL AND country_code IS NOT NULL
GROUP BY project_id, phone, country_code
HAVING COUNT(*) > 1;
-- Esperado: 0 linhas

-- 3. Verificar integridade dos dados
SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE canonical_identifier IS NOT NULL) as with_canonical,
    COUNT(*) FILTER (WHERE phone IS NOT NULL) as with_phone,
    COUNT(*) FILTER (WHERE jid IS NOT NULL) as with_jid,
    COUNT(*) FILTER (WHERE lid IS NOT NULL) as with_lid
FROM contacts;
```

---

## 🚨 Troubleshooting

### Erro: "duplicate key value violates unique constraint"

**Causa**: Unique constraint já existe no banco.

**Solução**: 
1. Verificar se a FASE 2 já foi executada
2. Se sim, executar este script ANTES de criar as constraints
3. Se não, verificar se há duplicatas que o script não resolveu

### Erro: "column canonical_identifier does not exist"

**Causa**: Campo ainda não foi criado (FASE 2 não executada).

**Solução**: 
1. Este script deve ser executado APÓS a FASE 2 criar os campos
2. Ou criar o campo manualmente antes:
   ```sql
   ALTER TABLE contacts ADD COLUMN IF NOT EXISTS canonical_identifier VARCHAR(255);
   ```

### Contatos sem canonical_identifier após migração

**Causa**: Contatos sem phone, jid ou lid válidos.

**Solução**:
1. Verificar se são contatos inválidos (sem nenhum identificador)
2. Se sim, são dados corrompidos e devem ser tratados separadamente
3. Se não, investigar por que o script não preencheu

---

## 📝 Checklist de Execução

### Antes de Executar

- [ ] Backup completo do banco criado
- [ ] Script de análise executado
- [ ] Resultados da análise revisados
- [ ] Estratégia de duplicatas definida
- [ ] Ambiente de staging testado (se aplicável)

### Durante Execução

- [ ] Script executado em transação (BEGIN/COMMIT)
- [ ] Logs de progresso monitorados
- [ ] Nenhum erro crítico ocorreu

### Após Execução

- [ ] Validação pós-migração executada
- [ ] Script de análise executado novamente
- [ ] Resultados comparados (antes vs depois)
- [ ] Dados verificados manualmente (amostra)
- [ ] Documentação atualizada

---

## 🔄 Rollback

Se necessário reverter a migração:

```sql
-- Restaurar backup
psql -h <host> -U <user> -d <database> < backup_before_migration.sql

-- Ou via Supabase Dashboard
-- Settings > Database > Backups > Restore
```

**⚠️ ATENÇÃO**: Rollback apaga TODOS os dados criados após o backup.

---

## 📚 Referências

- Plano de Implementação: `back-end/doc/PLANO_IMPLEMENTACAO_ETAPAS.md` (FASE 1.5)
- Arquitetura: `back-end/doc/ARCHITECTURE_VALIDATION.md`
- Implementação: `back-end/doc/IMPLEMENTATION_CONTACT_ORIGINS.md`
- Análise JID/LID: `back-end/doc/ANALISE_JID_LID_WHATSAPP.md`

---

**Última atualização**: 2025-01-27
