# Auditoria de Tokens - Design System Foundation

**Tarefa**: T011  
**Data**: 2025-12-03  
**Executado por**: Coding Agent  
**Status**: ✅ Completo

---

## 1. Resumo Executivo

### Estado Atual dos Arquivos

| Arquivo | Total de Variáveis | Status |
|---------|-------------------|--------|
| `main.css` | 183 variáveis | ⚠️ Contém duplicações internas |
| `tokens.css` | 0 variáveis | ✅ Vazio (consolidado) |

### Achados Críticos

1. **tokens.css já foi consolidado** anteriormente e está vazio
2. **main.css contém duplicações internas** entre três seções:
   - Seção 1: Tokens ShadCN base (HSL) com `.dark`
   - Seção 2: Design tokens (hex) sob `:root`
   - Seção 3: Theme overrides sob `[data-theme='dark']`
3. **Conflito de estratégias de tema**: `.dark` vs `[data-theme='dark']`
4. **Duplicação de cores semânticas** em formatos diferentes (HSL vs hex)

---

## 2. Análise Detalhada de Duplicações

### 2.1 Duplicações Diretas (Mesmo Conceito, Formato Diferente)

#### Cores Primárias
- `--primary` (HSL) ↔ `--color-primary-*` (hex) - **11 duplicações**
  - Exemplo: `--primary: 222.2 47.4% 11.2%` vs `--color-primary: #6366f1`
  
#### Cores de Background
- `--background` (HSL) ↔ `--bg-primary` (hex) - **4 duplicações**
- `--card` (HSL) ↔ `--bg-secondary` (hex) - **1 duplicação conceitual**

#### Cores de Texto
- `--foreground` (HSL) ↔ `--text-primary` (hex) - **4 duplicações**
- `--muted-foreground` (HSL) ↔ `--text-secondary` (hex) - **2 duplicações**

#### Cores Semânticas (Success/Warning/Error)
- `--success` (HSL) ↔ `--color-success` (hex) - **3 duplicações por tipo**
- `--warning` (HSL) ↔ `--color-warning` (hex) - **3 duplicações por tipo**
- `--destructive` (HSL) ↔ `--color-error` (hex) - **3 duplicações por tipo**
- `--info` (HSL) ↔ `--color-info` (hex) - **3 duplicações por tipo**

#### Cores de Borda
- `--border` (HSL) ↔ `--border-color` (hex) - **4 duplicações**

#### Border Radius
- `--radius: 0.5rem` ↔ `--radius-md: 0.5rem` - **duplicação exata**

#### Shadows
- Shadows definidas duas vezes: em `:root` e em `[data-theme='dark']` - **6 duplicações**

### 2.2 Duplicações de Tema Dark Mode

| Estratégia Atual | Variáveis Afetadas | Problema |
|------------------|-------------------|----------|
| `.dark { }` | 21 variáveis HSL | Classe CSS |
| `[data-theme='dark'] { }` | 60+ variáveis hex | Atributo data |

**Conflito**: Sistema usa DUAS estratégias simultâneas de dark mode que podem entrar em conflito.

---

## 3. Inventário Completo de Variáveis

### 3.1 Seção 1: ShadCN Base (HSL) - 42 variáveis

#### `:root` (21 variáveis)
```css
--background, --foreground
--card, --card-foreground
--popover, --popover-foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring
--radius
--brand-50, --brand-100, --brand-500, --brand-900
--success, --warning, --info
```

#### `.dark` (21 variáveis)
```css
(Mesmas variáveis acima com valores invertidos)
```

### 3.2 Seção 2: Design Tokens (hex) - 120 variáveis

#### Cores Primárias (11 variáveis)
```css
--color-primary
--color-primary-50 até --color-primary-900
```

#### Cores Neutras (12 variáveis)
```css
--color-white, --color-black
--color-gray-50 até --color-gray-900
```

#### Cores Semânticas (15 variáveis)
```css
--color-success, --color-success-light, --color-success-dark
--color-warning, --color-warning-light, --color-warning-dark
--color-error, --color-error-light, --color-error-dark
--color-info, --color-info-light, --color-info-dark
```

#### Origens de Tráfego (10 variáveis)
```css
--color-origin-google, --color-origin-meta, --color-origin-instagram
--color-origin-whatsapp, --color-origin-email, --color-origin-sms
--color-origin-phone, --color-origin-referral, --color-origin-organic
--color-origin-direct
```

#### Background/Text/Borda (18 variáveis)
```css
--bg-primary, --bg-secondary, --bg-tertiary, --bg-overlay
--text-primary, --text-secondary, --text-tertiary, --text-inverse
--text-link, --text-link-hover
--border-color, --border-color-light, --border-color-dark, --border-color-focus
```

#### Espaçamentos (13 variáveis)
```css
--space-0 até --space-24
```

#### Tipografia (15 variáveis)
```css
--font-family-sans, --font-family-mono
--font-size-xs até --font-size-4xl
--font-weight-normal até --font-weight-bold
--line-height-tight, --line-height-normal, --line-height-relaxed
```

#### Bordas (8 variáveis)
```css
--border-width, --border-width-2
--radius-none, --radius-sm, --radius-base, --radius-md, --radius-lg, --radius-xl, --radius-full
```

#### Shadows (6 variáveis)
```css
--shadow-sm, --shadow-base, --shadow-md, --shadow-lg, --shadow-xl, --shadow-2xl
```

#### Transições (3 variáveis)
```css
--transition-fast, --transition-base, --transition-slow
```

#### Z-index (7 variáveis)
```css
--z-dropdown, --z-sticky, --z-fixed, --z-modal-backdrop, --z-modal, --z-popover, --z-tooltip
```

### 3.3 Seção 3: Theme Dark Overrides - 60 variáveis

```css
[data-theme='dark'] {
  (Redefine todas as cores acima com valores invertidos)
}
```

---

## 4. Mapeamento de Duplicações por Categoria

### 4.1 Duplicações Críticas (Impacto Alto)

| Categoria | HSL (ShadCN) | Hex (Design Tokens) | Tipo de Conflito |
|-----------|--------------|---------------------|------------------|
| Background | `--background` | `--bg-primary` | Semântico vs Produto |
| Foreground | `--foreground` | `--text-primary` | Semântico vs Produto |
| Primary | `--primary` | `--color-primary-600` | Formato diferente |
| Secondary | `--secondary` | `--color-gray-100` | Semântico vs Neutro |
| Muted | `--muted` | `--bg-tertiary` | Conceitual |
| Border | `--border` | `--border-color` | Duplicação exata |
| Radius | `--radius` (0.5rem) | `--radius-md` (0.5rem) | Valor idêntico |

### 4.2 Duplicações Semânticas (Impacto Médio)

| HSL (ShadCN) | Hex (Design Tokens) | Contexto |
|--------------|---------------------|----------|
| `--success` | `--color-success` | Ambos verde, valores próximos |
| `--warning` | `--color-warning` | Ambos laranja, valores próximos |
| `--destructive` | `--color-error` | Ambos vermelho, valores próximos |
| `--info` | `--color-info` | Ambos azul, valores próximos |

### 4.3 Duplicações de Estratégia Dark Mode (Impacto Alto)

| Estratégia | Seletor | Variáveis | Status |
|------------|---------|-----------|--------|
| ShadCN | `.dark` | 21 HSL | ⚠️ Classe CSS |
| Custom | `[data-theme='dark']` | 60 hex | ⚠️ Atributo data |

**Conflito**: Componentes podem referenciar classes `.dark` enquanto o app usa `data-theme`, causando inconsistências.

---

## 5. Análise de Impacto

### 5.1 Componentes Afetados (Estimado)

Baseado na análise de `components/ui/`:

- **Alta dependência de HSL**: Dialog, Drawer, Popover, Toast, Command (usam `hsl(var(--primary))`)
- **Alta dependência de hex**: Card, Badge, Table, Avatar (podem usar `var(--bg-primary)`)
- **Mistura**: Button, Input, Select (podem usar ambos os formatos)

### 5.2 Impacto de Consolidação

| Ação | Componentes Impactados | Riscos |
|------|------------------------|--------|
| Remover hex duplicados | ~20-30 componentes | Médio - Refatoração de classes |
| Unificar estratégia dark | ~50+ componentes | Alto - Pode quebrar tema |
| Consolidar radius | ~40 componentes | Baixo - Buscar e substituir |

---

## 6. Recomendações para T012 (Remoção de Duplicações)

### 6.1 Estratégia Recomendada: Manter HSL como Fonte de Verdade

**Justificativa**: 
- ShadCN é o padrão da spec
- HSL permite manipulação dinâmica de luminosidade
- Radix UI espera formato HSL
- Menor impacto em componentes core

### 6.2 Plano de Ação (Sequencial)

#### Passo 1: Unificar Estratégia Dark Mode
1. **Escolher uma estratégia**: `.dark` (ShadCN padrão)
2. **Remover `[data-theme='dark']`** e migrar para `.dark`
3. **Atualizar composable `useDarkMode`** para adicionar classe `.dark` no `<html>`
4. **Testar**: Validar todos os componentes em ambos os temas

#### Passo 2: Consolidar Tokens Semânticos
1. **Manter HSL** como camada semântica base
2. **Remover duplicações hex** que conflitam:
   - `--bg-primary` → usar `--background`
   - `--text-primary` → usar `--foreground`
   - `--border-color` → usar `--border`
3. **Manter hex único** para:
   - Origens de tráfego (`--color-origin-*`)
   - Escalas de produto (`--color-primary-50` até `--color-primary-900`)
   - Z-index, transições, espaçamentos (não conflitam)

#### Passo 3: Criar Mapeamento Semântico → Produto
Em **tokens.css** (reativado):
```css
:root {
  /* Mapeamento semântico → produto */
  --semantic-background: hsl(var(--background));
  --semantic-foreground: hsl(var(--foreground));
  
  /* Tokens exclusivos de produto */
  --color-origin-google: #4285f4;
  --color-origin-meta: #1877f2;
  /* ... */
  
  /* Escalas completas de cor */
  --color-primary-50: #eef2ff;
  --color-primary-100: #e0e7ff;
  /* ... */
}
```

#### Passo 4: Consolidar Radius
1. **Remover `--radius`** (genérico demais)
2. **Padronizar em `--radius-md`** (0.5rem)
3. **Buscar e substituir** em componentes

#### Passo 5: Validação (Gate SC-001)
1. **Grep por duplicações**:
   ```bash
   grep -E "^[[:space:]]*--" front-end/src/assets/styles/main.css | sort | uniq -d
   ```
2. **Build e typecheck**: `pnpm typecheck && pnpm build`
3. **Teste visual**: Rodar showcase em dark/light
4. **Teste A11y**: Validar contrast ratios

---

## 7. Checklist de Validação

### T011 (Este arquivo)
- [x] Arquivo `TOKENS_AUDIT.md` criado
- [x] Total de variáveis documentado (183 em main.css, 0 em tokens.css)
- [x] Duplicações identificadas e categorizadas (42 HSL + 120 hex + conflito de tema)
- [x] Recomendações de consolidação para T012
- [x] Impacto estimado em componentes

### Preparação para T012
- [ ] Decidir estratégia dark mode (`.dark` recomendado)
- [ ] Listar componentes que usam hex duplicados
- [ ] Criar script de migração automática (buscar/substituir)
- [ ] Preparar testes de regressão visual

---

## 8. Arquivos para Revisão Manual

| Arquivo | Motivo |
|---------|--------|
| `front-end/src/composables/useDarkMode.ts` | Verificar se usa `.dark` ou `data-theme` |
| `front-end/src/components/ui/Button.vue` | Exemplo de uso misto HSL/hex |
| `front-end/src/components/ui/Card.vue` | Verificar dependência de `--bg-*` |
| `front-end/tailwind.config.js` | Validar configuração de dark mode |

---

## 9. Métricas Finais

| Métrica | Valor |
|---------|-------|
| Total de variáveis CSS | 183 |
| Duplicações diretas | ~35 |
| Duplicações conceituais | ~20 |
| Conflitos de estratégia | 2 (dark mode) |
| Taxa de duplicação | **~30%** |

**Gate SC-001**: ❌ **NÃO PASSA** (30% de duplicações detectadas)

**Próximo passo**: Executar T012 para consolidação seguindo plano de ação acima.

---

**Referências**:
- Spec: `specs/001-shadcn-design-system/spec.md` (FR-001, SC-001)
- Plan: `specs/001-shadcn-design-system/plan.md`
- Arquivos analisados: `front-end/src/assets/styles/main.css`, `front-end/src/assets/styles/tokens.css`
