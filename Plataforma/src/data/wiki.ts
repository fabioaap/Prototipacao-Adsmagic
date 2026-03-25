export interface WikiItem {
  id: string
  title: string
  description: string
}

export interface WikiSection {
  id: string
  tag: string
  title: string
  description: string
  items: WikiItem[]
}

export const mockWikiSections: WikiSection[] = [
  {
    id: 'contexto',
    tag: 'Wiki',
    title: 'Contexto do protótipo',
    description:
      'Registra o que está em validação agora, o que saiu de escopo e quais decisões já foram consolidadas.',
    items: [
      {
        id: 'escopo-atual-navegacao',
        title: 'Escopo atual da navegação',
        description:
          'O protótipo cobre as jornadas de Descoberta, Qualificação, Condução e Governança. Módulos de Contatos, Campanhas e Integrações são placeholders aguardando próximas iterações.',
      },
      {
        id: 'hipoteses-jornada',
        title: 'Hipóteses de jornada',
        description:
          'H1: Operadores orientam-se melhor por jornadas do que por menus. H2: O kanban reduz o tempo de atualização de oportunidades vs. listas tabulares.',
      },
      {
        id: 'pontos-abertos-refinamento',
        title: 'Pontos abertos para refinamento',
        description:
          'Definir comportamento de filtros no módulo de Contatos. Validar se o mapa de rotas (Vue Flow) resolve a necessidade de visibilidade estrutural.',
      },
    ],
  },
  {
    id: 'rituais',
    tag: 'Wiki',
    title: 'Rituais operacionais',
    description:
      'Centraliza combinados de acompanhamento para produto, marketing e comercial sem depender de telas adicionais.',
    items: [
      {
        id: 'cadencia-revisao',
        title: 'Cadência de revisão',
        description:
          'Sessões semanais de 30 min para revisar o kanban e atualizar estágios das oportunidades. Revisão mensal do dashboard de conversão com a liderança.',
      },
      {
        id: 'entradas-kanban',
        title: 'Entradas para o kanban',
        description:
          'Leads de Meta Ads e Google Ads entram automaticamente via integração. Leads orgânicos e de WhatsApp são adicionados manualmente pelo time comercial.',
      },
      {
        id: 'checklist-atualizacao-home',
        title: 'Checklist de atualização da Home',
        description:
          'Após cada sprint: atualizar progresso das jornadas, revisar atalhos rápidos e garantir que os stats refletem o estado atual do pipeline.',
      },
    ],
  },
  {
    id: 'referencias',
    tag: 'Wiki',
    title: 'Referências rápidas',
    description:
      'Agrupa links internos e tópicos que ajudam a orientar a leitura do protótipo durante as iterações.',
    items: [
      {
        id: 'leitura-jornadas',
        title: 'Leitura das jornadas',
        description:
          'Cada jornada na Home tem um indicador de progresso. Use o campo "Entregáveis" para alinhar o que está concluído e o que ainda está em aberto.',
      },
      {
        id: 'glossario-operacional',
        title: 'Glossário operacional',
        description:
          'Lead: contato que demonstrou interesse. Oportunidade: lead qualificado com valor estimado. Pipeline: conjunto de oportunidades em aberto por etapa.',
      },
      {
        id: 'proximos-incrementos-ref',
        title: 'Próximos incrementos',
        description:
          'Ver stories em docs/stories/. Prioridades: implementar ContactsView, CampaignsView e IntegrationsView com dados mockados e filtros básicos.',
      },
    ],
  },
  {
    id: 'decisoes',
    tag: 'Wiki',
    title: 'Decisões de produto',
    description:
      'Registro das decisões arquiteturais e de UX consolidadas durante o ciclo de prototipação.',
    items: [
      {
        id: 'mock-first-design',
        title: 'Mock-first por design',
        description:
          'Todos os dados são mockados localmente. Não há chamadas de API neste protótipo. A decisão permite iteração rápida sem dependência de backend.',
      },
      {
        id: 'vue-flow-mapa-rotas',
        title: 'Vue Flow para mapa de rotas',
        description:
          'Adotado para representar visualmente a estrutura de navegação da plataforma. Permite visualizar grupos, fluxos de autenticação e dependências entre telas.',
      },
      {
        id: 'sidebar-fixa-4-itens',
        title: 'Sidebar fixa com 4 itens',
        description:
          'A sidebar expõe apenas Início, Rotas, Kanban e Wiki. Módulos secundários são acessíveis via rotas mas não aparecem na navegação principal do protótipo.',
      },
    ],
  },
  {
    id: 'incrementos',
    tag: 'Wiki',
    title: 'Próximos incrementos',
    description:
      'Backlog de funcionalidades planejadas para as próximas iterações do protótipo.',
    items: [
      {
        id: 'contacts-view-lista-kanban',
        title: 'ContactsView — Lista e Kanban',
        description:
          'Implementar a tela de Contatos com toggle lista/kanban, busca por nome e filtros por status e origem. Dados já mockados em contacts.ts.',
      },
      {
        id: 'campaigns-view-overview',
        title: 'CampaignsView — Overview de campanhas',
        description:
          'Tela de visão geral de campanhas com cards por canal (Meta, Google), métricas básicas (impressões, cliques, CTR) e status de veiculação.',
      },
      {
        id: 'integrations-view-status',
        title: 'IntegrationsView — Status das conexões',
        description:
          'Tela de integrações com cards por conector (Meta Ads, Google Ads, WhatsApp, TikTok), status de conexão e ação de reconectar. Dados mockados em integrations.ts.',
      },
    ],
  },
]
