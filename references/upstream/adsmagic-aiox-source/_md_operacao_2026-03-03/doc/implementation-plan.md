# Plano de Implementação - Adsmagic First AI MVP

## 📊 Visão Geral

- **Total de Fases:** 10
- **Estimativa Total:** 18-24 semanas
- **Entregas Principais:** 29x
- **Melhorias UX/UI:** 15+ integradas

---

## 🏗️ **FASE 1: Estrutura Base (1-2 semanas)**

### Objetivo

Estabelecer fundação completa: Navbar global, Sidebar, Layout base e sistema de navegação.

### Tasks Priorizadas

### 1.1 Navbar Global com Filtro de Período ⭐ NOVO

- [ ]  Componente `Navbar.vue` atualizado com filtro global
- [ ]  Dropdown de projetos mockado (preparado para API)
- [ ]  Badge de status WhatsApp (conectado/desconectado)
- [ ]  **Filtro de Período Global:**
    - Períodos pré-definidos (Hoje, 7d, 30d, 90d, mês atual/anterior)
    - Comparação de períodos (anterior, ano passado, custom)
    - Persistência em localStorage
    - Badges visuais (customizado, comparando)
- [ ]  **Busca Global (Ctrl+K):**
    - Modal de busca com atalho de teclado
    - Busca em contatos, vendas, links
    - Resultados agrupados por tipo
    - Navegação direta ou abertura de drawer
- [ ]  Responsivo (hamburger mobile, layout adaptativo)

**Critérios de Aceite:**

- Filtro global aplica automaticamente em todas páginas
- Busca global funcional com Ctrl+K ou /
- Estado persiste entre navegações
- Mobile: navbar empilhado, filtro em linha separada

### 1.2 Sidebar Aprimorada

- [ ]  Estrutura de menu completa (PRINCIPAL, RASTREAMENTO, SISTEMA, INFERIOR)
- [ ]  Estados visuais aprimorados (ativo, hover, expandido/colapsado)
- [ ]  Ícones lucide-vue para todos itens
- [ ]  Expansível/colapsável com estado salvo
- [ ]  **Breadcrumbs contextuais** (aparecem quando navegando níveis profundos)
- [ ]  Responsivo: desktop sempre visível, tablet colapsada, mobile oculta com overlay

**Critérios de Aceite:**

- Menu "Eventos" removido da estrutura
- Animações suaves de transição
- Breadcrumbs aparecem em navegação profunda (ex: Contatos > João > Venda #123)
- Mobile: overlay escuro, clique fecha sidebar

### 1.3 Layout Base

- [ ]  AppLayout.vue com sidebar + navbar + conteúdo
- [ ]  Store de layout (`layout.ts`) para estado de sidebar
- [ ]  Composable `useLayout` para controle programático
- [ ]  Breakpoints responsivos (mobile: 320-767px, tablet: 768-1023px, desktop: 1024px+)

**Critérios de Aceite:**

- Layout funcional em todos breakpoints
- Sidebar e navbar integrados
- Performance otimizada (lazy loading)

### 1.4 Sistema de Atalhos de Teclado ⭐ NOVO

- [ ]  Composable `useKeyboardShortcuts`
- [ ]  Registro global de atalhos:
    - Ctrl+K: Busca global
    - /: Focar busca da página
    - Esc: Fechar modais/drawers
    - Ctrl+B: Toggle sidebar
    - Ctrl+N, Ctrl+E, Ctrl+R, etc.
- [ ]  Modal de ajuda (?): lista todos atalhos
- [ ]  Tooltips em botões mostram atalhos

**Critérios de Aceite:**

- 25+ atalhos funcionais
- Modal de ajuda acessível com ?
- Atalhos contextuais por página

---

## 📊 **FASE 2: Dashboard e Métricas (2-3 semanas)**

### Objetivo

Implementar página Visão Geral completa com hierarquia visual e UX otimizado.

### Tasks Priorizadas

### 2.1 Seção de Métricas Principais

- [ ]  **3 Cards destacados** (Receita, Vendas, ROI)
- [ ]  Sparklines (micro gráficos de tendência)
- [ ]  Comparação vs período anterior (ícones ▲▼ + %)
- [ ]  Gradientes sutis e animações de entrada
- [ ]  Tooltips explicativos

**Critérios de Aceite:**

- Cards visualmente maiores que demais seções
- Animação smooth ao carregar
- Sparklines funcionais com dados reais

### 2.2 Funil de Conversão Visual ⭐ NOVO

- [ ]  Card horizontal com visualização progressiva
- [ ]  Barras proporcionais ao volume
- [ ]  Percentuais de conversão entre etapas
- [ ]  Tooltips: "4.34% dos que viram clicaram"
- [ ]  Ícones de tendência em cada taxa

**Critérios de Aceite:**

- Visual intuitivo da jornada completa
- Cores progressivas (Azul → Verde → Amarelo → Verde escuro)

### 2.3 Métricas Financeiras (Colapsável)

- [ ]  Seção com header clicável
- [ ]  Estado colapsado por padrão
- [ ]  Preferência salva em localStorage
- [ ]  Animação suave ao expandir/recolher
- [ ]  Grid 4 colunas: Gastos, Ticket médio, Custo/venda, CPC

**Critérios de Aceite:**

- Reduz sobrecarga cognitiva (colapsado por padrão)
- Animação fluida < 300ms

### 2.4 Análises e Gráficos (Tabs) ⭐ NOVO

- [ ]  Tab 1 - Performance: Gráfico Contatos x Vendas
    - Área sombreada sob linhas
    - Toggle: ver apenas contatos/vendas/ambos
    - Tooltip com variação vs dia anterior
- [ ]  Tab 2 - Origens: 2 gráficos de pizza lado a lado
    - Legenda interativa (clique destaca)
    - Cores consistentes
- [ ]  Tab 3 - Histórico: Gráfico barras evolução semanal

**Critérios de Aceite:**

- Biblioteca de gráficos integrada (Chart.js ou ApexCharts)
- Responsivo (mobile: versões simplificadas)

### 2.5 Últimas Atividades (Grid 2 colunas) ⭐ NOVO

- [ ]  Card Últimas Vendas (6 vendas)
    - Datas relativas ("Há 2 dias")
    - Clique abre drawer de venda
    - Link "Ver todas →"
- [ ]  Card Novos Contatos (6 contatos)
    - Datas relativas ("Há 3 horas")
    - Badges de origem + etapa
    - Clique abre drawer de contato

**Critérios de Aceite:**

- Grid 2 colunas desktop, empilhado mobile
- Integração com drawers funcionando

### 2.6 Tabela de Desempenho por Origem

- [ ]  Colunas completas com ordenação
- [ ]  Row highlighting ao hover
- [ ]  Row clicável: expande detalhes inline
- [ ]  Cores consistentes com gráficos

### 2.7 Empty States ⭐ NOVO

- [ ]  Empty state educativo quando sem dados
- [ ]  Botões de ação: [Configurar integrações] [Adicionar primeira venda]

**Critérios de Aceite:**

- Explica quando dados aparecerão
- Ações clicáveis e funcionais

---

## 👥 **FASE 3: Gestão de Contatos (3-4 semanas)**

### Objetivo

Implementar página Contatos completa com visualizações Lista e Kanban, incluindo melhorias de UX.

### Tasks Priorizadas

### 3.1 Tabela de Contatos (Lista)

- [ ]  Colunas completas com avatares de iniciais
- [ ]  Menu de ações (6 modais)
- [ ]  Paginação (10/página)
- [ ]  Busca com atalho (/)
- [ ]  Filtros avançados (modal)

### 3.2 Modal de Exportação Customizável ⭐ NOVO

- [ ]  Escolher: todos ou apenas filtrados
- [ ]  Selecionar colunas (checkboxes)
- [ ]  Formato: Excel (.xlsx) ou CSV
- [ ]  Contador dinâmico: "Exportar (23 contatos)"

### 3.3 Modal de Deletar com Confirmação Dupla ⭐ NOVO

- [ ]  Usuário digita "deletar" para confirmar
- [ ]  Mostra contexto: "3 vendas - R$ 1.500 serão perdidas"
- [ ]  Botão desabilitado até digitar corretamente

**Critérios de Aceite:**

- Previne cliques acidentais
- Contexto específico visível

### 3.4 Visualização Kanban com Optimistic UI ⭐ NOVO

- [ ]  Colunas = etapas do funil
- [ ]  **Drag-and-drop com feedback visual:**
    - Durante drag: opacity 0.5
    - Placeholder: "⬇️ Solte aqui"
    - Optimistic UI: move instantaneamente
    - Rollback automático se API falhar
    - Toast de sucesso/erro
- [ ]  Contadores em tempo real
- [ ]  Empty states por coluna

**Critérios de Aceite:**

- Sensação de velocidade instantânea
- Rollback gracioso com animação

### 3.5 Drawer de Contato Aprimorado ⭐ NOVO

- [ ]  **Navegação contextual:** [< Anterior] [Próximo >]
- [ ]  **Quick Actions:** [+ Venda] [+ Origem] [Mover etapa]
- [ ]  **Adicionar origem inline** (sem modal)
- [ ]  **Timeline interativa:**
    - Filtro de eventos
    - Ações contextuais (ver log, reenviar evento, copiar parâmetros)
    - Scroll infinito

**Critérios de Aceite:**

- Navegar entre contatos sem fechar drawer
- Menos cliques para ações comuns (economia de 60%)

### 3.6 Sistema de Origens

- [ ]  Gestão em Configurações > Origens
- [ ]  20 origens customizadas máximo
- [ ]  Color picker + emoji picker
- [ ]  Modal de deletar com reatribuição

---

## 💰 **FASE 4: Gestão de Vendas (2-3 semanas)**

### Tasks Priorizadas

- [ ]  Tab Realizadas (tabela completa)
- [ ]  Tab Perdidas (colunas específicas + motivo)
- [ ]  Drawer de venda (parâmetros URL, dispositivo, geolocalização)
- [ ]  Modal ao mover para perdida (motivo + observações)
- [ ]  Exportação customizável

---

## 🎯 **FASE 5: Funil e Automações (2-3 semanas)**

### Tasks Priorizadas

- [ ]  Tabela com drag-and-drop de ordenação
- [ ]  Drawer criar/editar etapa
- [ ]  Radio Group: Normal/Venda/Perdida (apenas 1 de cada)
- [ ]  Eventos de conversão (Meta/Google/TikTok)
- [ ]  Validações: deletar com contatos → escolher destino
- [ ]  Integração com Kanban de Contatos

---

## 🔗 **FASE 6: Integrações e Rastreamento (3-4 semanas)**

### Tasks Priorizadas

- [ ]  Página Integrações (Site + Canais)
- [ ]  Tag Adsmagic (script + botão copiar)
- [ ]  WhatsApp Business (QR Code)
- [ ]  Meta Ads (OAuth + CAPI)
- [ ]  Google Ads (OAuth + Enhanced Conversions)
- [ ]  Sistema de eventos (validação click IDs, retry, logs)

---

## 📎 **FASE 7: Links e Eventos (2-3 semanas)**

### Tasks Priorizadas

- [ ]  Cards de métricas por origem
- [ ]  Tabela de links
- [ ]  Modal criar link + mensagem WhatsApp
- [ ]  Drawer tracking (URL gerada + configurações)
- [ ]  Página Eventos (histórico, filtros, status visual)

---

## ⚙️ **FASE 8: Configurações Completas (2 semanas)**

### Tasks Priorizadas

- [ ]  Tab Geral (modelo de atribuição, zona de perigo)
- [ ]  Tab Origens (gestão completa)
- [ ]  Tab Funil (visualização + atalho)
- [ ]  Tab Moedas/Fuso (formatos, fusos horários)
- [ ]  Tab Notificações (e-mail, frequência, webhooks futuros)

---

## 💬 **FASE 9: Mensagens WhatsApp (aguardando specs)**

### Tasks Priorizadas

- [ ]  Aguardando especificações completas
- [ ]  Histórico de conversas
- [ ]  Interface de mensagens
- [ ]  Templates e automações

---

## ✨ **FASE 10: Polimento e Otimização (1-2 semanas)**

### Tasks Priorizadas

- [ ]  Testes de integração E2E
- [ ]  Otimização de performance (Lighthouse > 90)
- [ ]  Acessibilidade WCAG 2.1 AA
- [ ]  Skeleton screens + progressive loading
- [ ]  Touch gestures (swipe, pull-to-refresh, long press)
- [ ]  Testes de carga
- [ ]  Refinamento final de UX/UI

---

## 🎯 Prioridades Estratégicas

1. **Filtro Global + Busca (Ctrl+K)** → Economia massiva de tempo
2. **Optimistic UI no Kanban** → Sensação de velocidade instantânea
3. **Confirmação Dupla** → Prevenção de erros críticos
4. **Drawer com Navegação** → Redução de 60% nos cliques
5. **Empty States** → Educação e onboarding natural