# Página de Projetos - AdsMagic

## Resumo da Implementação

Implementei uma página completa de gerenciamento de projetos seguindo o design system existente do projeto e inspirada nas referências fornecidas.

## Arquivos Criados

### Types e Interfaces
- **`/front-end/src/types/project.ts`**
  - Definição de tipos TypeScript para projetos
  - Schemas Zod para validação
  - Interfaces para métricas e comparativos

### Serviços
- **`/front-end/src/services/projects.ts`**
  - Serviço mock de projetos com localStorage
  - Interface pronta para integração com backend
  - CRUD completo de projetos

### Store (Pinia)
- **`/front-end/src/stores/projects.ts`**
  - Gerenciamento de estado dos projetos
  - Filtros (pesquisa, ordenação)
  - Métricas agregadas

### Componentes UI

#### Componentes Base
1. **`/front-end/src/components/ui/TrialBanner.vue`**
   - Banner de aviso de trial expirando
   - Níveis de urgência (critical, high, medium, low)
   - Botão para escolher plano

2. **`/front-end/src/components/ui/SearchBar.vue`**
   - Campo de busca com ícone
   - Botão para limpar busca
   - Suporte a Enter para buscar

3. **`/front-end/src/components/ui/Select.vue`**
   - Dropdown customizado
   - Tamanhos variados (sm, default, lg)
   - Totalmente acessível

#### Componentes de Projetos
1. **`/front-end/src/components/projects/ProjectsTable.vue`**
   - Tabela responsiva com todas as métricas
   - Comparativos percentuais com ícones
   - Status do WhatsApp com badges coloridos
   - Estados: loading, empty, filled
   - Click em linha para ver detalhes

2. **`/front-end/src/components/projects/CreateProjectModal.vue`**
   - Modal para criar novo projeto
   - Validação em tempo real
   - Animações suaves
   - Suporte a Enter para submit

### Views
- **`/front-end/src/views/projects/ProjectsView.vue`**
  - Página principal de projetos
  - Trial banner no topo
  - Barra de ferramentas (busca, ordenação, ações)
  - Cards de estatísticas
  - Tabela de projetos

### Rotas
- **Atualizado: `/front-end/src/router/index.ts`**
  - Adicionada rota `/projetos`
  - Protegida por autenticação e onboarding

## Funcionalidades Implementadas

### 1. Trial Banner
- Exibe dias restantes para expirar
- Mensagem dinâmica baseada na urgência
- Botão para escolher plano
- Cores adaptativas (verde → amarelo → vermelho)

### 2. Barra de Ferramentas
- **Pesquisa**: Busca projetos por nome (com debounce de 300ms)
- **Ordenação**:
  - Data de criação (mais recente)
  - Nome (A-Z)
  - Nome (Z-A)
- **Ações**:
  - Botão Configurações (para gerenciar empresa)
  - Botão Adicionar Usuários
  - Botão Criar Novo Projeto

### 3. Cards de Estatísticas
Exibe em tempo real:
- Total de projetos
- Projetos conectados (WhatsApp)
- Projetos desconectados
- Taxa de conversão média

### 4. Tabela de Projetos

#### Colunas:
1. **Projeto**: Nome + data de criação
2. **Status**: Badge conectado/desconectado
3. **Investimento**: Valor + comparativo %
4. **Contatos**: Quantidade + comparativo %
5. **Vendas**: Quantidade + comparativo %
6. **Taxa de Vendas**: % + comparativo %
7. **Ticket Médio**: Valor + comparativo %
8. **Receita**: Valor + comparativo %
9. **Ações**: Botão ver detalhes

#### Funcionalidades:
- Comparativos com ícones (↗ verde, ↘ vermelho, — cinza)
- Formatação de moeda (BRL)
- Formatação de números
- Click na linha para ver projeto
- Loading skeleton
- Empty state personalizado
- Hover effects

### 5. Modal de Criar Projeto
- Validações:
  - Nome obrigatório
  - Mínimo 2 caracteres
  - Máximo 100 caracteres
- Feedback visual de erros
- Animações de entrada/saída
- Suporte a tecla Enter e ESC

## Dados Mock

O serviço inclui 5 projetos de exemplo baseados nas imagens de referência:

1. **Teste** - Sem métricas, desconectado
2. **Dra. Leticia Lopes** - Com métricas completas, conectado
3. **hdev** - Sem métricas, desconectado
4. **Primeiro cliente** - Sem métricas, desconectado
5. **aaaa** - Sem métricas, desconectado

## Persistência

- Dados salvos no localStorage com chave `adsmagic_projects`
- Carregamento automático ao iniciar a store
- Atualização em tempo real

## Design System

### Cores Utilizadas:
- **Success**: Verde para conexões ativas e comparativos positivos
- **Destructive**: Vermelho para desconectado e comparativos negativos
- **Muted**: Cinza para valores neutros
- **Info**: Azul para informações
- **Warning**: Amarelo para avisos de trial

### Componentes Base:
- Button (variants: default, outline, ghost)
- Card com border e shadow
- Badge (colors: success, destructive)
- Input customizado
- Select dropdown

### Responsividade:
- Grid adaptativo (1 col mobile → 4 cols desktop)
- Tabela com scroll horizontal em mobile
- Toolbar com flex-wrap

## Como Acessar

1. Faça login na aplicação
2. Complete o onboarding (se necessário)
3. Navegue para `/projetos`

Ou adicione um link no menu/sidebar:
```vue
<router-link to="/projetos">Meus Projetos</router-link>
```

## Próximos Passos (TODOs)

### 1. Página de Detalhes do Projeto
- Criar `ProjectDetailView.vue`
- Rota dinâmica `/projetos/:id`
- Gráficos de evolução das métricas
- Configurações do projeto

### 2. Integração com Backend
- Substituir `MockProjectsService` por serviço real
- Configurar endpoints da API
- Implementar autenticação nas requisições

### 3. WhatsApp Integration
- Modal para conectar WhatsApp
- QR Code para autenticação
- Status em tempo real da conexão

### 4. Filtros Avançados
- Filtrar por status do WhatsApp
- Filtrar por range de datas
- Filtrar por métricas (ex: apenas com vendas)

### 5. Ações em Lote
- Selecionar múltiplos projetos
- Deletar em lote
- Exportar relatórios

### 6. Página de Planos
- Criar `PlansView.vue`
- Integrar com botão "Escolha o plano"
- Checkout de assinatura

### 7. Configurações da Empresa
- Modal ou página de configurações
- Dados da empresa
- Permissões de usuários

### 8. Adicionar Usuários
- Modal de convite de usuários
- Gerenciamento de permissões
- Lista de usuários ativos

## Tecnologias Utilizadas

- **Vue 3** (Composition API)
- **TypeScript**
- **Pinia** (State Management)
- **Vue Router**
- **Tailwind CSS**
- **Radix Vue** (Componentes acessíveis)
- **Lucide Vue** (Ícones)
- **Zod** (Validação)
- **VueUse** (Utilities, watchDebounced)

## Performance

- Lazy loading de componentes
- Debounce na busca (300ms)
- Skeleton loading states
- Otimização de re-renders com computed

## Acessibilidade

- Labels semânticos
- Suporte a navegação por teclado
- ARIA labels
- Focus management
- Contraste adequado

## Browser Support

- Chrome/Edge (últimas 2 versões)
- Firefox (últimas 2 versões)
- Safari (últimas 2 versões)

---

**Desenvolvido para AdsMagic** 🚀
