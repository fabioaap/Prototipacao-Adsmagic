# Regras de Negócio do Frontend

Este documento descreve as regras de negócio aplicadas no frontend do projeto Adsmagic First AI, alinhadas aos princípios definidos em `docs/tokens-e-padroes.md` e às camadas da aplicação em `front-end/src`.

## 🎯 Escopo Geral
- O frontend é **multi-idioma** (pt, en, es) e todas as rotas e textos devem respeitar o locale atual
- O **onboarding de franquias** define o contexto de trabalho (tipo de empresa, quantidade de franquias, nome) e influencia telas futuras
- A **autenticação** controla acesso a rotas protegidas e guarda o idioma preferido do usuário
- O sistema suporta **dark mode** com persistência de preferência
- **Responsividade** é obrigatória em todos os componentes

## 📋 Domínios e Regras

### 1) 🌐 Internacionalização (i18n)
- O idioma é parte do caminho da URL: `/:locale/...`
- **Locales suportados**: `pt`, `en`, `es`. Valores inválidos redirecionam para `pt`
- **Mudança de idioma** deve:
  - Atualizar a URL preservando a rota atual
  - Persistir preferência em `localStorage.language`
  - Recarregar mensagens traduzidas automaticamente
  - Manter estado da aplicação (formulários, filtros, etc.)
- **Componentes** devem usar chaves de tradução. Textos hardcoded são **proibidos**
- **Fallback**: Se uma tradução não existir, usar a chave como texto temporário
- **Pluralização**: Usar regras específicas de cada idioma

### 2) 🛣️ Roteamento e Guards
- **Todas as rotas** (públicas e privadas) devem incluir o prefixo `/:locale`
- **Guard `locale`** normaliza o parâmetro e impede navegação com locale inválido
- **Rotas protegidas** com `meta.requiresAuth = true` exigem usuário autenticado
- **Redirecionamento**: Caso não autenticado, redirecionar para `/:locale/auth/login` mantendo `redirect` de retorno
- **404**: Rotas inexistentes redirecionam para `/:locale/dashboard` (se autenticado) ou `/:locale/auth/login`

### 3) 🔐 Autenticação
- **Estados de auth** residem em `stores/auth.ts`
- **Após login válido**:
  - Salvar token e dados mínimos do usuário (apenas o necessário)
  - Definir idioma do usuário como idioma ativo, se disponível
  - Redirecionar para a rota de retorno ou `/:locale/dashboard`
- **Logout** deve:
  - Limpar estado completo (token, dados do usuário)
  - Redirecionar para `/:locale/auth/login`
  - Limpar localStorage relacionado à sessão
- **Sessão expirada**: Detectar automaticamente e redirecionar para login

### 4) 🏢 Onboarding de Franquias
- **Fluxo**: tipo de empresa → número de franquias → nome da franquia → revisão
- **Validações obrigatórias** por passo:
  - **Tipo de empresa**: um dos valores permitidos (franchise, corporate, individual)
  - **Número de franquias**: inteiro positivo (1-999) dentro do limite de negócios
  - **Nome**: não vazio, 2-100 caracteres, sem caracteres especiais
- **Persistência**: Ao concluir, salvar no store + API quando disponível
- **Progresso**: Mostrar barra de progresso e permitir navegação entre passos
- **Validação em tempo real**: Feedback imediato para campos inválidos
- **Layout responsivo**: Adaptação automática para mobile, tablet e desktop
- **Estados visuais**: Loading, erro e sucesso claramente indicados

### 5) 📊 Projetos
- **Listagem**: Paginação com filtros de busca, país e status
- **Criação via wizard** com múltiplos passos:
  - **Passo 1 - Informações do Projeto**: Nome, descrição, país, idioma
  - **Passo 2 - Seleção de Plataformas**: Facebook, Instagram, Google, TikTok
  - **Passo 3 - Configuração de Plataformas**: Configurações específicas por plataforma
  - **Passo 4 - Tipo de Campanha Meta**: Objetivos e configurações de campanha
  - **Passo 5 - Links Rastreáveis**: URLs de destino e parâmetros UTM
  - **Passo 6 - WhatsApp**: Configuração de integração WhatsApp
  - **Passo 7 - Finalização**: Revisão e confirmação
- **Validações obrigatórias**:
  - Nome: obrigatório, 3-50 caracteres
  - País: seleção obrigatória da lista
  - Idioma padrão: baseado no locale atual
  - Pelo menos uma plataforma deve ser selecionada
- **Contexto**: A criação herda dados do onboarding quando aplicável
- **Estados**: Draft, Active, Paused, Archived
- **Permissões**: Baseadas no tipo de usuário e empresa
- **Store**: `projectWizard.ts` gerencia estado do wizard

### 6) 📊 Dashboard
- **Métricas principais**: Exibir KPIs relevantes (contatos, vendas, conversões)
- **Gráficos interativos**: Visualizações de dados com Chart.js ou similar
- **Ações rápidas**: Botões para operações frequentes (novo contato, nova venda)
- **Contatos recentes**: Lista dos últimos contatos adicionados
- **Top origens**: Ranking das origens mais efetivas
- **Atualização em tempo real**: Dados atualizados automaticamente
- **Filtros temporais**: Visualizar dados por período (hoje, semana, mês)
- **Responsividade**: Layout adaptativo para todos os dispositivos

### 7) 👥 Gestão de Contatos
- **Visualização Kanban**: Contatos organizados por estágios (Lead, Qualificado, Proposta, Negociação, Fechado)
- **Drag & Drop**: Movimentação de contatos entre estágios com persistência automática
- **Modal de Formulário**: Criação e edição de contatos com validação em tempo real
- **Filtros avançados**: Busca por nome, email, telefone, origem e estágio
- **Paginação inteligente**: Carregamento otimizado para grandes volumes
- **Estados visuais**: Loading, erro e sucesso claramente indicados
- **Responsividade**: Interface adaptativa para mobile, tablet e desktop
- **Acessibilidade**: Navegação por teclado e leitores de tela
- **Validações obrigatórias**:
  - Nome: obrigatório, 2-100 caracteres
  - Email: formato válido, único no sistema
  - Telefone: formato internacional opcional
  - Origem: seleção obrigatória da lista
  - Estágio: seleção obrigatória da lista
- **Persistência**: Dados salvos automaticamente no store e API
- **Feedback**: Notificações toast para ações de sucesso/erro

### 8) 📊 Eventos
- **Rastreamento automático**: Eventos são capturados automaticamente via tag de rastreamento
- **Tipos de eventos**: page_view, click, form_submit, purchase, custom
- **Filtros temporais**: Visualizar eventos por período (hoje, semana, mês)
- **Métricas em tempo real**: Contadores e gráficos atualizados automaticamente
- **Timeline de eventos**: Visualização cronológica das interações do usuário
- **Exportação**: Dados de eventos exportáveis para análise externa
- **Responsividade**: Interface adaptativa para todos os dispositivos

### 9) ⚙️ Configurações Gerais
- **Informações do Projeto**: Nome, descrição, ID e data de criação
- **Modelo de Atribuição**: First Touch, Last Touch, Linear, Time Decay, Position Based
- **Configurações de Moeda**: Moeda padrão, fuso horário, formatos de data e hora
- **Notificações**: Configuração de email e eventos para notificar
- **Zona de Perigo**: Arquivar e deletar projeto com confirmações de segurança
- **Validação em tempo real**: Feedback imediato para campos obrigatórios
- **Persistência**: Configurações salvas automaticamente no store
- **Interface responsiva**: Adaptação para mobile, tablet e desktop
- **Estados visuais**: Loading, erro e sucesso claramente indicados

### 10) 🔗 Integrações
- **Plataformas suportadas**: WhatsApp, Meta (Facebook/Instagram), Google Ads, TikTok
- **OAuth Flow**: Autenticação segura com contas de anúncios
- **Status de conexão**: Visualização clara do estado de cada integração
- **Sincronização automática**: Dados atualizados periodicamente
- **Tag de rastreamento**: Script JavaScript para captura de eventos
- **QR Code WhatsApp**: Conexão via QR Code com expiração automática
- **Seleção de contas**: Múltiplas contas de anúncios por plataforma
- **Permissões**: Controle granular de acesso aos dados

### 11) 🎨 UX e Acessibilidade
- **Componentes interativos** devem ter foco e rótulos acessíveis
- **Mensagens de erro** e validação sempre traduzidas
- **Estados de loading**: Botões desabilitados durante requisições
- **Feedback visual**: Indicadores de progresso e estados de sucesso/erro
- **Notificações Toast**: Sistema de feedback temporário com auto-remoção
- **Responsividade**: Funcionar em mobile, tablet e desktop
- **Contraste**: Seguir WCAG 2.1 AA para acessibilidade

### 12) 🔔 Sistema de Notificações Toast
- **Posicionamento**: Fixo no canto superior direito (top-4 right-4)
- **Variantes**: default (azul), success (verde), destructive (vermelho), warning (amarelo)
- **Auto-remoção**: 3 segundos por padrão (configurável)
- **Empilhamento**: Múltiplos toasts empilhados verticalmente
- **Animações**: Entrada/saída suaves com slide e fade
- **Acessibilidade**: Foco e navegação por teclado
- **API**: Composable `useToast()` com helpers específicos
- **Store**: Pinia store para gerenciamento de estado global
- **Componentes**: Toast.vue, ToastContainer.vue integrados no layout

## 🔧 Contratos e Tipos
- **Tipos centrais** em `front-end/src/types/`:
  - `onboarding.ts` - Tipos do processo de onboarding
  - `project.ts` - Tipos de projetos e suas propriedades
  - `country.ts` - Tipos de países e localização
  - `index.ts` - Tipos globais e utilitários
  - `models.ts` - Modelos de dados (Contact, Sale, Event, Integration, Connection, etc.)
  - `dto.ts` - Data Transfer Objects
  - `api.ts` - Tipos de API e responses
- **Tipos do Project Wizard**:
  - `ProjectWizardState` - Estado completo do wizard
  - `PlatformConfig` - Configurações de plataformas
  - `CampaignType` - Tipos de campanha Meta
  - `TrackableLink` - Links rastreáveis e UTMs
  - `WhatsAppConfig` - Configuração WhatsApp
- **Tipos do Dashboard**:
  - `DashboardMetric` - Métricas do dashboard
  - `ChartData` - Dados para gráficos
  - `QuickAction` - Ações rápidas
- **Schemas de Validação** em `front-end/src/schemas/`:
  - `contact.ts` - Validação de contatos
  - `sale.ts` - Validação de vendas
  - `origin.ts` - Validação de origens
  - `stage.ts` - Validação de estágios
  - `link.ts` - Validação de links
- **Tipos de Toast** em `front-end/src/stores/toast.ts`:
  - `Toast` - Interface do toast com id, title, description, variant
  - `ToastOptions` - Opções para criação de toast
  - `useToast()` - Composable com API simplificada
- **Tipos de Integrações** em `front-end/src/stores/integrations.ts`:
  - `Integration` - Interface de integração com plataformas
  - `Connection` - Interface de conexão OAuth
  - `TagInstallation` - Interface de instalação da tag de rastreamento
  - `OAuthResult` - Resultado do fluxo OAuth
  - `Account` - Conta de anúncios conectada
- **TypeScript estrito**: Nunca usar `any`. Preferir `unknown` + refinamento ou tipos específicos
- **Interfaces**: Usar para contratos que podem ser estendidos
- **Types**: Usar para unions, intersections e tipos primitivos

## 🌐 Integrações e API
- **Cliente HTTP** central em `services/api/client.ts`
- **Todas as chamadas** devem:
  - Tratar erros com mensagens traduzidas
  - Retornar `Result<T, E>` quando possível, evitando exceptions não tratadas
  - Incluir timeout e retry automático
  - Logar erros para debugging
- **Interceptors**: Para adicionar tokens de autenticação automaticamente
- **Cache**: Implementar cache inteligente para dados que mudam pouco

## 💾 Regras de Persistência Local
- **Pinia stores** para estado volátil da aplicação
- **localStorage** apenas para:
  - Preferências do usuário (idioma, tema)
  - Dados de sessão temporários
  - **NUNCA** armazenar tokens, senhas ou dados sensíveis
- **sessionStorage** para dados que devem ser limpos ao fechar a aba

## 🔒 Segurança
- **Validação de entrada**: Usar Zod/Yup nos formulários antes de enviar para API
- **Sanitização**: Sanitizar HTML não confiável antes de renderizar
- **XSS Protection**: Escapar dados do usuário em templates
- **CSRF**: Implementar proteção contra ataques CSRF
- **Rate Limiting**: Implementar no frontend para evitar spam

## 🎨 Dark Mode
- **Persistência**: Salvar preferência em `localStorage.theme`
- **Sistema**: Detectar preferência do sistema operacional
- **Transição**: Animações suaves entre temas
- **Componentes**: Todos devem suportar ambos os temas

## 📱 Responsividade
- **Breakpoints**: mobile (320px+), tablet (768px+), desktop (1024px+)
- **Mobile First**: Desenvolver primeiro para mobile
- **Touch**: Otimizar para interações touch
- **Performance**: Otimizar para conexões lentas

## 🧙‍♂️ Project Wizard
- **Fluxo de criação** em 7 passos sequenciais
- **Navegação**: Permitir voltar e avançar entre passos
- **Validação**: Cada passo deve ser validado antes de avançar
- **Persistência**: Estado salvo automaticamente durante navegação
- **Cancelamento**: Permitir sair do wizard com confirmação
- **Validação em tempo real**: Feedback imediato para campos inválidos
- **Estados visuais**: Loading, erro e sucesso em cada passo
- **Responsividade**: Layout adaptativo para todos os dispositivos
- **Componentes específicos**:
  - `CheckboxCard` - Seleção de plataformas com visual de card
  - `Textarea` - Campos de texto expandidos
- **Store dedicado**: `projectWizard.ts` para gerenciar estado complexo
- **UX aprimorada**: Transições suaves e feedback visual consistente

## 🧪 Sistema de Testes
- **Testes de Componentes**: Cobertura para todos os componentes UI
- **Testes de Stores**: Validação de lógica de estado Pinia
- **Testes de Composables**: Verificação de lógica reutilizável
- **Testes de Validação**: Schemas Zod e validações de formulário
- **Mocks**: Sistema de dados mock para desenvolvimento
- **Views de Teste**: TestComponentsView, TestStoresView, TestDashboardView

## 🔄 Observações de Manutenção
- **Seguir princípios**: SOLID, DRY, e `docs/tokens-e-padroes.md`
- **Documentação**: Novas telas devem declarar suas regras de negócio aqui
- **Testes**: Manter cobertura de testes para lógica de negócio
- **Performance**: Monitorar métricas de performance e otimizar quando necessário
- **Acessibilidade**: Testar com leitores de tela e navegação por teclado
- **Wizard**: Manter consistência entre passos e validações
- **Dashboard**: Manter métricas atualizadas e performance otimizada
- **Toast Notifications**: Usar para feedback de ações do usuário (sucesso, erro, aviso)
- **UX**: Manter consistência visual e comportamental em todas as notificações
