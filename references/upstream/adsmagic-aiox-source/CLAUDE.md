# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AdsMagic First AI is a full-stack SaaS platform for marketing attribution and lead management. It uses Vue 3 (frontend) deployed on Cloudflare Pages and Supabase (PostgreSQL + Edge Functions) for the backend. The system follows a multi-tenant architecture with company and project-level isolation.

## Project Constitution

The product-level governance document is [docs/governance/project-constitution.md](docs/governance/project-constitution.md).

When there is tension between framework workflow convenience and product safety, follow the AdsMagic constitution first.

## Current Branch State (v3 — March 2026)

**Branch:** `v3` (active development) | **Repo:** `kennedyselect/Adsmagic-First-AI`

| Area | Status | Notes |
|------|--------|-------|
| Frontend build | ✅ Passing | `pnpm build` and `pnpm build:visual` both pass |
| Unit tests | ✅ 969/969 | `pnpm test --run` |
| E2E Playwright | ✅ 37/37 | `playwright.ci.config.ts` with `build:visual` |
| Backend (core) | ✅ 100% | Infra, users, projects, contacts, origins, stages |
| Backend (sales) | 🔴 0% | Issue #6 — not started |
| Backend (analytics real) | 🟡 20% | Issue #7 — dashboard uses mock data |
| Backend (integrations) | 🟡 53% | Issue #9 — OAuth partial |
| Backend (WhatsApp) | 🟡 76% | Issue #10 — missing tests + webhook sig |

**Open issues (backlog):** https://github.com/kennedyselect/Adsmagic-First-AI/issues

### Key facts about this codebase
- `ContactsView.vue` defaults to `viewMode = 'list'` (not kanban) — changed in master→v3 merge
- Toggle buttons use `aria-label` via i18n: `t('contacts.listView')` = "Visualização em lista", `t('contacts.kanbanView')` = "Visualização em kanban"
- `src/test-drawer.html` has a stale import (`stagesService`) — known non-blocking issue, doesn't affect app
- `TestContactsView.vue` at route `/pt/test-contacts` is a dev-only page (no auth required)

## Essential Commands

### Frontend Development

```bash
cd front-end

# Development
pnpm install
pnpm dev --port 5200        # Start dev server (http://localhost:5200) — portas 5173/5174/5154/5456/5157 ocupadas

# Building
pnpm build                  # Full build with TypeScript check
pnpm build:temp             # Build without TypeScript check (faster)
pnpm preview                # Preview production build

# Testing
pnpm test                   # Unit tests (Vitest)
pnpm test:ui                # Vitest UI
pnpm test:e2e               # Playwright E2E tests
pnpm test:coverage          # Coverage report

# Visual Testing (Playwright on Windows workaround)
# IMPORTANT: ALWAYS use build:visual (NOT build:temp) for Playwright.
# build:temp uses .env.production (empty Supabase vars) → app crashes.
# build:visual uses .env.test (VITE_USE_MOCK=true) → works without Supabase.
pnpm build:visual           # Build with mock mode (.env.test)
pnpm preview -- --port 4173 --strictPort  # Serve on :4173 (keep running)
# In another terminal:
pnpm exec playwright test --config=playwright.ci.config.ts

# Deployment
pnpm deploy                 # Deploy to Cloudflare Pages
pnpm deploy:preview         # Deploy preview branch
pnpm deploy:production      # Deploy production
```

### Backend Development (Supabase)

```bash
cd back-end

# Local Supabase Stack
supabase start              # Start local Supabase (Docker required)
supabase stop               # Stop local Supabase

# Database Migrations
supabase migration new migration_name    # Create new migration
supabase db reset                        # Reset local DB and apply migrations
supabase db push                         # Push migrations to remote

# Edge Functions
supabase functions serve                     # Serve all functions locally
supabase functions serve function-name       # Serve specific function
supabase functions deploy function-name      # Deploy function to remote

# Type Generation
supabase gen types typescript --local > types.ts

# Accessing Local Services
# Supabase Studio: http://localhost:54323
# Edge Functions: http://localhost:54321/functions/v1
# Inbucket (emails): http://localhost:54324
```

### Testing Individual Edge Functions

```bash
# Get local Supabase URL
PROJECT_URL="http://localhost:54321"

# Test OPTIONS (CORS preflight)
curl -X OPTIONS "$PROJECT_URL/functions/v1/projects" -v

# Test GET with auth (replace JWT_TOKEN)
curl -X GET "$PROJECT_URL/functions/v1/projects" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-Project-ID: project-uuid"

# Test POST
curl -X POST "$PROJECT_URL/functions/v1/projects" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","company_id":"uuid"}'
```

## High-Level Architecture

### Frontend Structure (Vue 3 + TypeScript)

**Location:** `/front-end/`

```
src/
├── views/           # Page components (route targets)
├── components/      # Reusable Vue components
│   ├── ui/         # Base UI components (shadcn-vue)
│   ├── common/     # Shared components
│   └── [feature]/  # Feature-specific components
├── stores/          # Pinia stores (state management)
├── router/          # Vue Router configuration
├── services/        # Business logic and API clients
│   ├── api/        # HTTP clients and API services
│   ├── adapters/   # Data transformation (backend ↔ frontend)
│   ├── cache/      # Client-side caching
│   └── [feature]/  # Domain services
├── composables/     # Vue composables (reusable logic)
├── layouts/         # Layout wrappers
├── locales/         # i18n translations (pt/en/es)
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── schemas/         # Zod validation schemas
├── lib/             # Third-party library configs
└── config/          # App configuration
```

**Key Pattern:** All routes are prefixed with `/:locale/` (pt/en/es)

### Backend Structure (Supabase Edge Functions)

**Location:** `/back-end/supabase/`

```
supabase/
├── migrations/      # Database migrations (50+ SQL files)
├── functions/       # Edge Functions (Deno runtime)
│   └── [function-name]/
│       ├── index.ts         # Entry point with routing
│       ├── handlers/        # Request handlers
│       ├── services/        # Business logic
│       ├── repositories/    # Database queries
│       ├── validators/      # Input validation
│       ├── utils/           # Utilities (CORS, responses)
│       └── types.ts         # Type definitions
├── policies/        # RLS policies documentation
└── types/           # Generated TypeScript types
```

### Authentication Flow

1. **Frontend:** User logs in via Supabase Auth (email/password or OAuth)
2. **Token Storage:** JWT stored in localStorage (`adsmagic_auth_token`)
3. **API Requests:** Every request includes `Authorization: Bearer {token}` header
4. **Backend:** Edge Functions verify JWT via `supabaseClient.auth.getUser()`
5. **RLS:** Database enforces Row-Level Security based on `auth.uid()`
6. **Multi-tenant:** Requests include `X-Project-ID` header for project context

**Important:** OAuth flows use popup windows and have sophisticated session preservation logic in `stores/auth.ts` to handle temporary `SIGNED_OUT` events during OAuth callbacks.

### State Management (Pinia)

**Core Stores:**
- `auth.ts` - Authentication, user session, onboarding
- `companies.ts` - Company selection and management
- `projects.ts` - Project CRUD, metrics, caching (5-min TTL)
- `language.ts` - i18n locale management

**Feature Stores:**
- `contacts.ts`, `sales.ts`, `integrations.ts`, `messages.ts`, `events.ts`, `links.ts`, `origins.ts`, `stages.ts`, `tags.ts`, `tracking.ts`
- `dashboardV2.ts` - Dashboard metrics and aggregations
- `settings.ts` - Project settings

**Pattern:** All stores use Composition API (`defineStore` with setup function)

### Service Layer Pattern

**3-Layer Architecture:**

1. **API Client** (`services/api/client.ts`):
   - Axios instance with interceptors
   - Automatic JWT injection
   - Session restoration for OAuth flows
   - Retry logic
   - Mock mode support

2. **Adapters** (`services/adapters/`):
   - Convert backend (snake_case) ↔ frontend (camelCase)
   - Type safety on both sides
   - Example: `projectAdapter.ts`, `saleAdapter.ts`

3. **Repositories** (`services/[feature]/`):
   - Abstract HTTP calls
   - Return adapted domain objects
   - Example: `ProjectRepository.ts`

### Database Schema

**Multi-tenant Architecture:**
- `companies` - Top-level tenant
- `projects` - Sub-tenant within company
- `company_users` - User-company memberships
- `project_users` - User-project memberships

**Core Tables:**
- `auth.users` + `user_profiles` - User accounts
- `contacts` - Leads/customers
- `sales` - Conversions with attribution
- `origins` - Traffic sources
- `contact_origins` - Attribution history
- `trackable_links` + `link_accesses` - Link tracking
- `integrations` + `integration_accounts` - Platform OAuth
- `messaging_*` - WhatsApp messaging
- `stages` - Sales funnel stages
- `tags` - Contact tagging

**Key Features:**
- UUID primary keys
- Automatic `updated_at` triggers
- RLS policies on all tables
- JSONB for flexible metadata
- Strategic indexes for performance
- CHECK constraints for data integrity

## Critical Patterns and Conventions

### Follow SOLID Principles

This project strictly follows SOLID, Clean Code, and TypeScript best practices. See `.cursor/rules/cursorrules.mdc` for comprehensive guidelines.

**Key Rules:**
- Single Responsibility: Functions do ONE thing
- Type Safety: Avoid `any`, use `unknown` when type is unclear
- DRY: Extract duplicated code
- Naming: Descriptive names (camelCase for variables, PascalCase for classes)
- Error Handling: Custom error types, Result pattern for operations that can fail

### Multi-Tenant Context

Always maintain tenant context in your code:

```typescript
// Store current project in localStorage
localStorage.setItem('current_project_id', projectId)

// API client automatically adds X-Project-ID header
// Edge Functions receive project context via header
const projectId = request.headers.get('X-Project-ID')
```

### Adapter Pattern Usage

When working with API data, ALWAYS use adapters:

```typescript
// ❌ DON'T: Use backend data directly
const project = await apiClient.get('/projects/123')
displayProject(project.company_id)  // snake_case in frontend!

// ✅ DO: Use adapter
const dbProject = await apiClient.get('/projects/123')
const project = adaptProject(dbProject)  // camelCase
displayProject(project.companyId)
```

### Icon System

**ALWAYS** import icons from the centralized composable:

```typescript
// ✅ DO
import { RefreshCw, Plus, Download } from '@/composables/useIcons'

// ❌ DON'T
import { RefreshCw } from 'lucide-vue-next'  // Blocked by ESLint
```

To add new icons:
1. Check https://lucide.dev/icons/
2. Add to `src/composables/useIcons.ts`
3. Export and use

### Component Consolidation

Use modern components, avoid deprecated ones:

| ✅ Use | ❌ Avoid (deprecated) |
|--------|----------------------|
| Modal.vue | ModalV2.vue |
| Table.vue | TableLegacy.vue |
| Alert.vue | AlertSimple.vue |
| useIcons | Icon.vue |

### API Client Session Management

The API client has critical session restoration logic for OAuth flows. When working on authentication or integrations:

**Key Function:** `ensureSession()` in `services/api/client.ts`
- Preserves tokens during OAuth popup flows
- Implements 10-second wait for session restoration on OAuth callbacks
- Falls back to localStorage when auth store is in SIGNED_OUT state
- Combines `onAuthStateChange` listener + polling for reliability

### Edge Function Structure

All Edge Functions follow this pattern:

```typescript
// index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import { handleCors, successResponse, errorResponse } from './utils/cors.ts'

serve(async (req) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCors(req)
  }

  try {
    // 2. Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 3. Verify authentication
    const { data: { user }, error } = await supabaseClient.auth.getUser()
    if (error || !user) {
      return errorResponse('Unauthorized', 401)
    }

    // 4. Route by path and method
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    if (method === 'GET' && path === '/functions/v1/projects') {
      return handleGetProjects(req, supabaseClient, user)
    }
    // ... more routes

    return errorResponse('Not Found', 404)
  } catch (error) {
    return errorResponse(error.message, 500)
  }
})
```

### Database Migration Guidelines

When creating migrations:

1. **Always include RLS policies:**
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY table_name_select_policy ON table_name
  FOR SELECT
  USING (project_id IN (
    SELECT project_id FROM project_users
    WHERE user_id = auth.uid()
  ));
```

2. **Add indexes for foreign keys and filters:**
```sql
CREATE INDEX idx_table_name_project_id ON table_name(project_id);
CREATE INDEX idx_table_name_status ON table_name(status);
```

3. **Include updated_at trigger:**
```sql
CREATE TRIGGER update_table_name_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

4. **Use CHECK constraints for enums:**
```sql
status VARCHAR(20) CHECK (status IN ('draft', 'active', 'archived'))
```

### Routing and Navigation

All routes are localized:

```typescript
// ✅ DO: Use localized paths
router.push({ name: 'dashboard', params: { locale: 'pt', projectId: '123' } })

// ✅ DO: Use composable for locale switching
import { useLocalizedRoute } from '@/composables/useLocalizedRoute'
const { switchLocale } = useLocalizedRoute()
switchLocale('en')  // Navigates to same route with new locale
```

**Navigation Guards Order:**
1. Locale guard (validates/syncs locale)
2. Auth guard (checks authentication)
3. Onboarding guard (checks completion)
4. Project guard (validates project access)

### Internationalization

```typescript
// ✅ In templates
<p>{{ $t('dashboard.title') }}</p>

// ✅ In script
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const title = t('dashboard.title')

// ✅ Add translations to all 3 locales
// /locales/pt.json
// /locales/en.json
// /locales/es.json
```

### Caching Strategy

The projects store implements intelligent caching:

```typescript
// Cache with 5-minute TTL
cacheService.set('projects:company-123', data, 5 * 60 * 1000)

// Invalidate on mutations
cacheService.invalidatePattern('projects:*')

// Bypass cache when filters are active
if (hasActiveFilters) {
  // Skip cache, fetch fresh data
}
```

## Common Development Tasks

### Adding a New Feature Store

1. Create store file: `src/stores/newFeature.ts`
2. Define state, actions, and computed properties
3. Implement caching if needed
4. Export store
5. Import and use in components

### Creating a New Edge Function

1. Create function directory:
```bash
mkdir -p back-end/supabase/functions/new-function/handlers
mkdir -p back-end/supabase/functions/new-function/utils
```

2. Create `index.ts` with routing logic
3. Add handlers in `handlers/` directory
4. Add CORS utils: `utils/cors.ts`
5. Test locally: `supabase functions serve new-function`
6. Deploy: `supabase functions deploy new-function`

### Adding a New Migration

1. Create migration:
```bash
cd back-end
supabase migration new descriptive_name
```

2. Write SQL in generated file
3. Test locally: `supabase db reset`
4. Verify in Studio: http://localhost:54323
5. Deploy: `supabase db push`

### Adding a New Route

1. Define route in `router/index.ts`:
```typescript
{
  path: '/:locale/projects/:projectId/new-feature',
  name: 'new-feature',
  component: () => import('@/views/new-feature/NewFeatureView.vue'),
  meta: { requiresAuth: true }
}
```

2. Create view component: `src/views/new-feature/NewFeatureView.vue`
3. Add translations in all locale files
4. Update navigation menus

### Working with OAuth Integrations

The platform supports Meta, Google, and TikTok OAuth:

1. **Start OAuth:** POST `/integrations/oauth/{platform}`
2. **Callback:** POST `/integrations/oauth/{platform}/callback` with code
3. **Select Accounts:** POST `/integrations/{id}/select-accounts`

**Critical:** OAuth flows use popups. The auth store has logic to preserve sessions during popup flows. Don't modify this logic without understanding the full flow.

### Testing Edge Functions Locally

1. Start local Supabase: `supabase start`
2. Get test JWT:
   - Go to http://localhost:54323
   - Sign in with test user
   - Copy JWT from Storage tab
3. Test with curl:
```bash
JWT_TOKEN="your-jwt-token"
curl -X GET "http://localhost:54321/functions/v1/projects" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "X-Project-ID: project-uuid"
```

## Environment Variables

### Required Frontend Variables

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Optional Frontend Variables

```bash
VITE_API_BASE_URL=https://your-project.supabase.co/functions/v1
VITE_USE_MOCK=false
VITE_USE_SUPABASE=true
VITE_META_CLIENT_ID=your-meta-client-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_TIKTOK_CLIENT_ID=your-tiktok-client-id
```

### Backend Secrets (Supabase Dashboard)

```bash
# OAuth
META_OAUTH_CLIENT_ID
META_OAUTH_CLIENT_SECRET
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET
TIKTOK_OAUTH_CLIENT_ID
TIKTOK_OAUTH_CLIENT_SECRET

# Messaging
UAZAPI_ADMIN_TOKEN
```

## Key Edge Functions

- `projects` - Project CRUD
- `companies` - Company CRUD
- `contacts` - Contact management
- `sales` - Sales tracking
- `dashboard` - Dashboard metrics (summary, time-series, funnel, pipeline)
- `integrations` - OAuth flows and account management
- `trackable-links` - UTM link generation
- `redirect` - Link tracking and redirects
- `messaging` - WhatsApp messaging
- `messaging-webhooks` - WhatsApp webhook handler (no auth required)
- `events` - Event tracking
- `origins` - Traffic source management
- `stages` - Sales funnel stages
- `tags` - Contact tagging
- `settings` - Project settings
- `analytics-worker` - Analytics processing

## Documentation References

- **Backend Plan:** `/back-end/BACKEND_IMPLEMENTATION_PLAN.md`
- **Backend Progress:** `/back-end/BACKEND_PROGRESS.md`
- **Frontend README:** `/front-end/README.md`
- **Backend README:** `/back-end/README.md`
- **Coding Standards:** `.cursor/rules/cursorrules.mdc`
- **Database Schema:** `/doc/database-schema.md` (if exists)

## Deployment

### Frontend (Cloudflare Pages)
- **Trigger:** Git push to `main` branch
- **Build Command:** `pnpm install && pnpm build`
- **Output Directory:** `dist`
- **Auto-deployed:** Yes

### Backend (Supabase)
- **Migrations:** `supabase db push`
- **Edge Functions:** `supabase functions deploy [function-name]`
- **Environment Variables:** Set in Supabase Dashboard → Settings → Edge Functions

## Important Notes

1. **Never hardcode secrets** - Use environment variables
2. **Always use adapters** - Convert snake_case ↔ camelCase at API boundary
3. **Test RLS policies** - Ensure users can only access their own data
4. **Cache intelligently** - Use 5-minute TTL for dashboard data
5. **Handle OAuth carefully** - Session preservation logic is critical
6. **Maintain tenant context** - Always include X-Project-ID header
7. **Follow SOLID principles** - See .cursor/rules/cursorrules.mdc
8. **Use TypeScript strictly** - Enable strict mode, avoid `any`
9. **Write tests** - Unit tests for services, E2E for critical flows
10. **Document breaking changes** - Update this file when architecture changes
11. **Playwright: use `build:visual`** - NEVER use `build:temp` for E2E tests; it crashes because `.env.production` has empty Supabase vars. `build:visual` uses `.env.test` with `VITE_USE_MOCK=true`
12. **E2E selectors: use aria-label** - Lucide Vue does NOT emit `data-lucide` attributes in production builds; use `getByRole('button', { name: /text/i })` with i18n values
13. **Dev server ports** - **SEMPRE usar porta 5200** neste projeto (`pnpm dev --port 5200`); outras portas ocupadas por outros projetos
14. **Dashboard data is mock** - `dashboardV2.ts` store returns mock data until backend analytics (issue #7) is implemented
15. **Sales backend is missing** - `sales` Edge Function schema not deployed yet (issue #6); frontend UI exists but POST/PATCH will fail against real backend

## Troubleshooting

### Frontend won't connect to backend
- Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Verify CORS is configured in Edge Functions
- Check browser console for CORS errors

### Authentication issues
- Verify JWT token in localStorage
- Check auth store state
- Test JWT with `supabaseClient.auth.getUser()`
- For OAuth: Check session preservation logic

### Database permission errors
- Verify RLS policies exist
- Check user is authenticated
- Verify user has project_users record
- Test query in Supabase Studio with RLS enabled

### Edge Function errors
- Check Supabase function logs: Dashboard → Edge Functions → Logs
- Test locally with `supabase functions serve`
- Verify environment variables are set
- Check CORS configuration

### Migration failures
- Run `supabase db reset` to reset local database
- Check for syntax errors in SQL
- Verify foreign key references exist
- Test migration in order (dependencies first)
