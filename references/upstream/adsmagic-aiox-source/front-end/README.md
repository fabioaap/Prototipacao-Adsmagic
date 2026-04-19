# AdsMagic - Sistema de Gestão de Anúncios com IA

Sistema completo de gerenciamento e automação de campanhas publicitárias construído com tecnologias modernas.

## 🚀 Stack Tecnológica

### Frontend
- **Vue 3** - Framework progressivo JavaScript
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderna e rápida
- **TailwindCSS** - Utility-first CSS framework
- **Radix Vue** - Componentes UI primitivos
- **Vue Router** - Roteamento
- **Pinia** - Gerenciamento de estado
- **Zod** - Validação de schemas
- **VueUse** - Composables utilitários

### Backend (Em desenvolvimento)
- **Supabase** - Database e Auth
- **Cloudflare Workers** - Serverless functions
- **Hono** - Framework web leve
- **QStash (Upstash)** - Queue e Schedule

## 📦 Instalação

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Preview do build
pnpm preview
```

## 🧪 Testes visuais (Playwright) — recomendado no Windows

Como workaround para o problema de conectividade do Playwright com o Vite dev server no Windows, os testes visuais rodam em cima do **build de produção** servido pelo `vite preview`.

Para não bloquear os testes visuais quando o `vue-tsc` estiver falhando, este fluxo usa `pnpm build:visual` (que executa `vite build` sem o typecheck).

```bash
# (Local) subir o preview do build
pnpm test:visual

# (Em outro terminal) rodar os testes Playwright apontando para o preview
pnpm exec playwright test --config=playwright.ci.config.ts
```

No CI, use:

```bash
pnpm test:visual:ci
```

Obs.: o comando `test:visual:ci` faz `build` e o Playwright inicia o `vite preview` automaticamente via `webServer`.

No momento, a configuração de CI está rodando **canário + smoke de login** (`tests/e2e/spike-canary.spec.ts` e `tests/e2e/smoke-login.spec.ts`) para garantir conectividade e render do login sem depender do dev server (porta 5173).

## 🔧 Configuração

### Variáveis de Ambiente

O projeto requer variáveis de ambiente para funcionar. Copie o arquivo `.env.example` para `.env.local` e preencha com os valores reais:

```bash
cp .env.example .env.local
```

**Variáveis obrigatórias:**
- `VITE_SUPABASE_URL` - URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase

**Variáveis opcionais:**
- `VITE_API_BASE_URL` - URL da API (tem fallback)
- `VITE_USE_MOCK_QUEUE` - Flag para mock de queue
- `VITE_ENABLE_JOB_POLLING` - Habilitar polling de jobs
- `VITE_JOB_POLLING_INTERVAL` - Intervalo de polling
- `VITE_META_CLIENT_ID` - Client ID do Meta/Facebook (OAuth)
- `VITE_GOOGLE_CLIENT_ID` - Client ID do Google (OAuth)
- `VITE_TIKTOK_CLIENT_ID` - Client ID do TikTok (OAuth)
- `VITE_LINKEDIN_CLIENT_ID` - Client ID do LinkedIn (OAuth)

Consulte o arquivo `.env.example` para mais detalhes sobre cada variável.

### Metadados de Build (branch/commit)

Cada build agora gera automaticamente um arquivo público `version.json` na raiz do deploy.

Exemplos:
- `https://v2.adsmagic.com.br/version.json`
- `http://localhost:4173/version.json` (após `pnpm build` + `pnpm preview`)

Campos principais:
- `branch`
- `commit`
- `commitShort`
- `buildTime`
- `source`

## 🏗️ Estrutura do Projeto

```
src/
├── assets/          # Arquivos estáticos e estilos
├── components/      # Componentes Vue
│   ├── ui/         # Componentes UI base
│   ├── common/     # Componentes reutilizáveis
│   └── features/   # Componentes de features
├── composables/     # Vue composables
├── config/         # Configurações
├── layouts/        # Layouts
├── lib/            # Utilitários
├── router/         # Rotas
├── services/       # Serviços
├── stores/         # Pinia stores
├── types/          # TypeScript types
├── utils/          # Funções utilitárias
└── views/          # Páginas/Views
```

## � Design System Consolidation

Este projeto segue um design system consolidado para manter consistência e facilitar manutenção.

### Icon System

Todos os ícones devem ser importados do composable centralizado `@/composables/useIcons`:

```vue
<script setup>
import { RefreshCw, Plus, Download } from '@/composables/useIcons'
</script>

<template>
  <button class="flex items-center gap-2">
    <RefreshCw :size="16" />
    <span>Refresh</span>
  </button>
</template>
```

**❌ NÃO FAZER:**
```typescript
// ❌ Importação direta não permitida (bloqueada por ESLint)
import { RefreshCw } from 'lucide-vue-next'
```

**Benefícios:**
- ✅ Fácil troca de biblioteca de ícones (mude apenas um arquivo)
- ✅ Melhor tree-shaking (somente ícones usados no bundle)
- ✅ Autocomplete TypeScript para ícones disponíveis
- ✅ Consistência no projeto inteiro

**Adicionar novos ícones:**
1. Verifique se existe: https://lucide.dev/icons/
2. Adicione ao `src/composables/useIcons.ts`
3. Use no componente

### Component Consolidation

Usamos componentes shadcn-vue padronizados. Evite componentes duplicados/deprecated:

| ✅ Use | ❌ Evite (deprecated) | Migração |
|--------|----------------------|----------|
| **Modal.vue** | ModalV2.vue | `v-model` em vez de `:open` + `@close` |
| **Table.vue** | TableLegacy.vue | `columns` tipadas em vez de `headers: string[]` |
| **Alert.vue** | AlertSimple.vue | `variant="destructive"` em vez de `type="error"` |
| **useIcons** | Icon.vue | Importar ícone do Lucide diretamente |

**Exemplo de migração:**
```vue
<!-- ❌ Antes (deprecated) -->
<ModalV2 :open="isOpen" @close="isOpen = false">
  <AlertSimple type="error" message="Erro!" />
</ModalV2>

<!-- ✅ Depois (recomendado) -->
<Modal v-model="isOpen" title="Erro">
  <Alert variant="destructive">Erro!</Alert>
</Modal>
```

**Documentação completa:** `specs/005-design-system-consolidation/quickstart.md`

---

## �🎯 Features Atuais

- ✅ Tela de login split-screen responsiva
- ✅ Validação de formulários
- ✅ Sistema de tipos TypeScript rigoroso
- ✅ Componentes UI reutilizáveis
- ✅ **DateRangePicker com RangeCalendar** - Seleção visual de range com azul claro contínuo
- ✅ Preparado para integração com backend

## 📅 Componentes de Data

### DateRangePicker
Componente de seleção de intervalo de datas com visual moderno e intuitivo.

**Localização:** `src/components/ui/date-range-picker/`

**Features:**
- ✅ **RangeCalendar** - Dois meses lado a lado
- ✅ **Visual contínuo** - Datas intermediárias em azul claro (`bg-primary/20`)
- ✅ **Navegação com ícones** - ChevronLeft/ChevronRight
- ✅ **Presets** - Hoje, 7d, 30d, 90d
- ✅ **Conversão de tipos** - Date ↔ DateValue (`@internationalized/date`)
- ✅ **Botões Aplicar/Cancelar** - Com lógica de revert

**Uso:**
```vue
<DateRangePicker
  :model-value="{ start: Date, end: Date }"
  :show-presets="true"
  @change="handleDateRangeChange"
/>
```

**Componentes internos:**
- `RangeCalendar.vue` - Wrapper do RangeCalendarRoot (reka-ui)
- `RangeCalendarCellTrigger.vue` - Cell renderer com styling condicional

## 🚀 Deploy

O projeto está configurado para deploy automático no **Cloudflare Pages** via GitHub.

### Deploy Automático

1. Faça push para a branch `main` (ou `master`)
2. O Cloudflare Pages detecta automaticamente e faz o deploy
3. O site fica disponível em `https://[project-name].pages.dev`

### Configuração Inicial

Para configurar o deploy pela primeira vez, consulte o guia completo em **[DEPLOY.md](./DEPLOY.md)**.

**Resumo rápido:**
1. Crie um projeto no [Cloudflare Pages](https://dash.cloudflare.com/)
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente no dashboard
4. Configure build command: `pnpm install && pnpm build`
5. Configure output directory: `dist`

### Variáveis de Ambiente no Cloudflare

Configure as variáveis de ambiente no dashboard do Cloudflare Pages:
- Dashboard → Pages → [Seu Projeto] → Settings → Environment variables

Consulte [DEPLOY.md](./DEPLOY.md) para a lista completa de variáveis e instruções detalhadas.

## 🔜 Próximos Passos

1. Implementar dashboard
2. Configurar Supabase
3. Criar Cloudflare Workers
4. Integrar QStash
5. Implementar features principais

## 📝 Convenções de Código

Este projeto segue princípios **SOLID**, **Clean Code** e **boas práticas**.
Consulte `.cursor/rules/cursorrules.mdc` para detalhes completos.

## 🤝 Contribuindo

1. Siga as regras do `.cursor/rules/cursorrules.mdc`
2. Use commits semânticos
3. Mantenha código limpo e documentado
4. Teste antes de commitar

## 📄 Licença

[A definir]
