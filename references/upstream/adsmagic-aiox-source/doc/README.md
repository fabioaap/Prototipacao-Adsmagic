# Documentação do Frontend

Este diretório contém toda a documentação técnica e de negócio do frontend do projeto Adsmagic First AI.

## 📋 Índice

### 📖 Documentação Principal
- **[Regras de Negócio](./business-rules.md)** - Regras e fluxos de negócio do frontend
- **[Convenções de Código](./coding-standards.md)** - Padrões e boas práticas de desenvolvimento
- **[Roteamento e i18n](./routing-i18n.md)** - Sistema de rotas e internacionalização
- **[Padrões de Desenvolvimento](./development-patterns.md)** - Arquitetura, design patterns e implementações
- **[CHANGELOG](./CHANGELOG.md)** - Histórico de mudanças e correções

### 🏗️ Arquitetura
- **Estrutura de Pastas**: `front-end/src/`
  - `components/` - Componentes Vue reutilizáveis
    - `ui/` - Componentes base (Button, Input, Card, Alert, Dialog, Toast, Select, RadioGroup, Textarea, Modal, Drawer, etc.)
    - `features/` - Componentes específicos de funcionalidades
    - `layout/` - Componentes de layout (Header, Sidebar, Footer, Breadcrumb)
    - `projects/` - Componentes relacionados a projetos
    - `dashboard/` - Componentes específicos do dashboard
    - `contacts/` - Componentes de contatos (ContactsKanban, ContactFormModal, ContactsList, etc.)
    - `settings/` - Componentes de configurações (Stages, Origins, General, Currency, Notifications, etc.)
    - `sales/` - Componentes de vendas (SalesList, SaleCard, etc.)
    - `events/` - Componentes de eventos (EventCard, EventTimeline, etc.)
    - `integrations/` - Componentes de integrações (IntegrationCard, OAuthFlowButton, etc.)
  - `views/` - Páginas da aplicação
    - `auth/` - Páginas de autenticação
    - `dashboard/` - Dashboard principal
    - `onboarding/` - Fluxo de onboarding
    - `projects/` - Gestão de projetos
    - `project-wizard/` - Wizard de criação de projetos
    - `contacts/` - Gestão de contatos
    - `sales/` - Gestão de vendas
    - `events/` - Gestão de eventos
    - `integrations/` - Gestão de integrações
    - `settings/` - Configurações (Funnel, Origins, General, Currency, Notifications)
    - `Test*View.vue` - Views de teste e demonstração
  - `layouts/` - Layouts da aplicação
    - `BlankLayout.vue` - Layout limpo
    - `DashboardLayout.vue` - Layout do dashboard
    - `HeaderOnlyLayout.vue` - Layout com header apenas
  - `stores/` - Gerenciamento de estado (Pinia)
    - `auth.ts` - Estado de autenticação
    - `projects.ts` - Estado de projetos
    - `projectWizard.ts` - Estado do wizard de projetos
    - `onboarding.ts` - Estado do onboarding
    - `language.ts` - Estado de idioma
    - `contacts.ts` - Estado de contatos
    - `sales.ts` - Estado de vendas
    - `dashboard.ts` - Estado do dashboard
    - `events.ts` - Estado de eventos
    - `integrations.ts` - Estado de integrações
    - `links.ts` - Estado de links
    - `origins.ts` - Estado de origens
    - `stages.ts` - Estado de estágios
    - `toast.ts` - Estado de notificações toast
  - `composables/` - Lógica reutilizável
    - `useLocalizedRoute.ts` - Navegação com locale
    - `useDarkMode.ts` - Gerenciamento de tema
    - `useFormat.ts` - Formatação de dados
    - `useApi.ts` - Cliente de API
    - `useDebounce.ts` - Debounce de funções
    - `useDevice.ts` - Detecção de dispositivo
    - `usePagination.ts` - Paginação
  - `services/` - Integração com APIs
    - `api/` - Cliente HTTP e configurações
    - `projects.ts` - Serviços de projetos
    - `onboarding.ts` - Serviços de onboarding
    - `contacts.ts` - Serviços de contatos
  - `types/` - Definições TypeScript
    - `project.ts` - Tipos de projetos
    - `onboarding.ts` - Tipos de onboarding
    - `country.ts` - Tipos de países
    - `models.ts` - Modelos de dados
    - `dto.ts` - Data Transfer Objects
    - `api.ts` - Tipos de API
  - `schemas/` - Schemas de validação (Zod)
    - `contact.ts` - Validação de contatos
    - `sale.ts` - Validação de vendas
    - `origin.ts` - Validação de origens
    - `stage.ts` - Validação de estágios
    - `link.ts` - Validação de links
  - `utils/` - Funções utilitárias
    - `security.ts` - Utilitários de segurança
  - `mocks/` - Dados mock para desenvolvimento
    - `contacts.ts` - Dados mock de contatos
    - `origins.ts` - Dados mock de origens
    - `stages.ts` - Dados mock de estágios
  - `assets/` - Recursos estáticos
    - `styles/` - Estilos globais
      - `tokens.css` - Design tokens CSS
  - `locales/` - Arquivos de tradução
    - `pt.json` - Traduções em português
    - `en.json` - Traduções em inglês
    - `es.json` - Traduções em espanhol

### 🛠️ Tecnologias
- **Vue 3** com Composition API
- **TypeScript** com tipagem estrita
- **Pinia** para gerenciamento de estado
- **Vue Router** com guards de autenticação
- **Vue i18n** para internacionalização
- **Tailwind CSS** para estilização
- **Vite** como bundler

### 📝 Convenções
- Seguir princípios **SOLID** e **Clean Code**
- Usar **Conventional Commits** para mensagens
- Componentes com responsabilidade única
- TypeScript estrito (sem `any`)
- Testes unitários para lógica de negócio

### 🆕 Funcionalidades Principais
- **Autenticação** - Login, registro e recuperação de senha
- **Onboarding** - Configuração inicial de franquias
- **Dashboard** - Visão geral com métricas, gráficos e ações rápidas
- **Gestão de Projetos** - Criação, edição e listagem
- **Project Wizard** - Assistente de criação de projetos em 7 passos
- **Gestão de Contatos** - Sistema Kanban com drag & drop, modal de formulário e filtros avançados
- **Vendas** - Pipeline de vendas e conversões
- **Eventos** - Rastreamento de eventos e interações
- **Integrações** - Conexão com plataformas de anúncios (WhatsApp, Meta, Google, TikTok)
- **Links** - Sistema de links rastreáveis
- **Origens** - Gestão de origens de tráfego
- **Estágios** - Configuração de estágios de vendas
- **Notificações Toast** - Sistema de feedback visual temporário
- **Internacionalização** - Suporte a PT, EN, ES
- **Dark Mode** - Alternância de tema
- **Responsividade** - Mobile, tablet e desktop

### 🎯 Padrões Implementados
- **Arquitetura de Componentes** - Estrutura consistente e reutilizável
- **Gerenciamento de Estado** - Pinia stores com padrões definidos
- **Composables** - Lógica reutilizável e testável
- **Validação** - Schemas Zod com feedback em tempo real
- **Sistema de Design** - Tokens CSS e componentes padronizados
- **Notificações Toast** - Sistema de feedback visual com auto-remoção
- **Testes** - Cobertura de componentes, stores e composables
- **Layouts** - Sistema de layouts flexível e responsivo
- **Mocks** - Sistema de dados mock para desenvolvimento
- **Utilitários** - Funções helper para segurança e formatação

