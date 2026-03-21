# Workflow de Protótipos — Adsmagic

## Estrutura de Branches

| Branch | Propósito |
|--------|-----------|
| `main` | Ambiente base — código estável, sem protótipos |
| `prototypes/as-is` | Baseline AS-IS do Adsmagic — como o produto está hoje |
| `prototypes/feature/<nome>` | Protótipos de melhorias isoladas |

---

## Como Criar um Novo Protótipo

### 1. Sempre parta do AS-IS

```bash
git checkout prototypes/as-is
git pull origin prototypes/as-is
```

### 2. Crie a branch do protótipo

```bash
git checkout -b prototypes/feature/nome-da-feature
```

Exemplos de nomes:
- `prototypes/feature/novo-dashboard-atribuicao`
- `prototypes/feature/kanban-melhorado`
- `prototypes/feature/onboarding-integracoes`

### 3. Desenvolva o protótipo

Edite os arquivos em `Plataforma/src/`. Rode localmente com:

```bash
npm run dev
```

Acesse em: **http://localhost:5173**

### 4. Faça commits com a convenção correta

```bash
git add .
git commit -m "proto: descrição do que foi mudado"
```

Exemplos:
```
proto: adiciona gráfico de funil interativo no dashboard
proto: refatora kanban com drag and drop visual
proto: novo layout de cards de integração
```

### 5. Publique o protótipo

```bash
git push origin prototypes/feature/nome-da-feature
```

---

## Convenções de Commit

| Prefixo | Uso |
|---------|-----|
| `proto:` | Mudanças de prototipação (UI, UX, novos fluxos) |
| `data:` | Ajustes nos dados mockados |
| `fix:` | Correção de bugs no ambiente |
| `chore:` | Manutenção do ambiente (deps, configs) |

---

## URLs de Desenvolvimento

| Servidor | URL | Comando |
|----------|-----|---------|
| Root (via vite.config.js raiz) | http://localhost:5173 | `npm run dev` |
| Plataforma standalone | http://localhost:5174 | `npm run dev:fo` |

---

## Comparando Protótipos

Para comparar o AS-IS com uma feature branch:

```bash
# Ver diferenças entre as-is e seu protótipo
git diff prototypes/as-is...prototypes/feature/nome-da-feature -- Plataforma/src/

# Ver lista de arquivos alterados
git diff --name-only prototypes/as-is...prototypes/feature/nome-da-feature
```

---

## Regras Gerais

- ❌ **Nunca faça merge** de protótipos para `main` sem discussão
- ✅ Cada protótipo deve ser **independente** — parta sempre do `as-is`
- ✅ Mantenha os **dados sempre mockados** — sem conexões a APIs reais
- ✅ Documente o objetivo do protótipo no PR/commit inicial
