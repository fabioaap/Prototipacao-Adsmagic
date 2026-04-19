export type WikiTaxonomyLink = {
  label: string;
  docId: string;
  to: string;
};

export type WikiTaxonomySection = {
  title: string;
  items: WikiTaxonomyLink[];
};

export const wikiTaxonomySections: WikiTaxonomySection[] = [
  {
    title: 'Introdução',
    items: [
      {label: 'Adsmagic Docs', docId: 'intro', to: '/intro'},
      {label: 'Constituição do repositório', docId: 'constituicao', to: '/constituicao'},
      {label: 'Setup local', docId: 'setup-local', to: '/setup-local'},
      {label: 'Agentes na IDE', docId: 'workflow/agentes-na-ide', to: '/workflow/agentes-na-ide'},
      {label: 'Wiki', docId: 'wiki/index', to: '/wiki'},
      {label: 'Visão geral', docId: 'architecture/visao-geral', to: '/architecture/visao-geral'},
      {label: 'Organização do repositório', docId: 'architecture/organizacao-do-repositorio', to: '/architecture/organizacao-do-repositorio'},
    ],
  },
  {
    title: 'Codificação colaborativa',
    items: [
      {label: 'Produto As-Is', docId: 'product/as-is', to: '/product/as-is'},
      {label: 'Baseline As-Is', docId: 'product/as-is-baseline', to: '/product/as-is-baseline'},
      {label: 'Registro de gaps As-Is', docId: 'product/as-is-gap-register', to: '/product/as-is-gap-register'},
      {label: 'Produto To-Be', docId: 'product/to-be', to: '/product/to-be'},
      {label: 'Contatos', docId: 'modulos/contatos', to: '/modulos/contatos'},
      {label: 'Vendas', docId: 'modulos/vendas', to: '/modulos/vendas'},
      {label: 'Mensagens', docId: 'modulos/mensagens', to: '/modulos/mensagens'},
    ],
  },
  {
    title: 'GitHub Copilot',
    items: [
      {label: 'Workflow de prototipação', docId: 'workflow/prototipacao', to: '/workflow/prototipacao'},
      {label: 'Sincronização do As-Is', docId: 'workflow/as-is-sync', to: '/workflow/as-is-sync'},
      {label: 'Kanban de Experimentos', docId: 'modulos/kanban-experimentos', to: '/modulos/kanban-experimentos'},
      {label: 'Tela de Campanhas', docId: 'stories/PROTO-002', to: '/stories/PROTO-002'},
      {label: 'Tela de Contatos', docId: 'stories/PROTO-001', to: '/stories/PROTO-001'},
      {label: 'Tela de Integrações', docId: 'stories/PROTO-003', to: '/stories/PROTO-003'},
      {label: 'Tela de Mensagens', docId: 'stories/PROTO-004', to: '/stories/PROTO-004'},
      {label: 'Tela de Configurações', docId: 'stories/PROTO-005', to: '/stories/PROTO-005'},
      {label: 'Backlog: Kanban de Experimentos', docId: 'stories/PROTO-006', to: '/stories/PROTO-006'},
      {label: 'Backlog: Agente de Segurança (DevSecOps)', docId: 'stories/PROTO-SEC-001', to: '/stories/PROTO-SEC-001'},
      {label: 'Backlog: Wiki Assistant com IA', docId: 'stories/PROTO-007', to: '/stories/PROTO-007'},
      {label: 'Backlog: Configuração de LLM (Settings)', docId: 'stories/PROTO-008', to: '/stories/PROTO-008'},
    ],
  },
  {
    title: 'CI/CD e DevOps',
    items: [
      {label: 'Infra: Workspace · Canary · Produção', docId: 'architecture/infra-canary-producao', to: '/architecture/infra-canary-producao'},
      {label: 'Handoff Cloudflare Pages para LPs', docId: 'workflow/cloudflare-pages-lps', to: '/workflow/cloudflare-pages-lps'},
      {label: 'Estrutura do protótipo', docId: 'architecture/estrutura-do-prototipo', to: '/architecture/estrutura-do-prototipo'},
      {label: 'Integrações', docId: 'modulos/integracoes', to: '/modulos/integracoes'},
      {label: 'Rastreamento', docId: 'modulos/rastreamento', to: '/modulos/rastreamento'},
      {label: 'Eventos', docId: 'modulos/eventos', to: '/modulos/eventos'},
    ],
  },
  {
    title: 'Segurança e qualidade',
    items: [
      {label: 'Governança', docId: 'marketing/governanca', to: '/wiki/marketing/governanca'},
      {label: 'Alinhamento de fontes', docId: 'marketing/alinhamento-de-fontes', to: '/wiki/marketing/alinhamento-de-fontes'},
      {label: 'Provas e objeções', docId: 'marketing/provas-e-objecoes', to: '/wiki/marketing/provas-e-objecoes'},
      {label: 'Gaps e decisões abertas', docId: 'marketing/gaps-e-decisoes-abertas-do-gtm', to: '/wiki/marketing/gaps-e-decisoes-abertas-do-gtm'},
    ],
  },
  {
    title: 'Aplicativos cliente',
    items: [
      {label: 'Dashboard', docId: 'modulos/dashboard', to: '/modulos/dashboard'},
      {label: 'Analytics', docId: 'modulos/analytics', to: '/modulos/analytics'},
      {label: 'Campanhas Google', docId: 'modulos/campanhas-google', to: '/modulos/campanhas-google'},
      {label: 'Campanhas Meta', docId: 'modulos/campanhas-meta', to: '/modulos/campanhas-meta'},
      {label: 'Configurações', docId: 'modulos/configuracoes', to: '/modulos/configuracoes'},
    ],
  },
  {
    title: 'Gerenciamento de projetos',
    items: [
      {label: 'Jornadas', docId: 'jornadas', to: '/jornadas'},
      {label: 'Plano de 90 dias', docId: 'marketing/plano-90-dias', to: '/wiki/marketing/plano-90-dias'},
      {label: 'Squad de GTM', docId: 'marketing/squad-de-gtm', to: '/wiki/marketing/squad-de-gtm'},
      {label: 'Antítese', docId: 'stories/antitese', to: '/stories/antitese'},
    ],
  },
  {
    title: 'Empresas e equipes',
    items: [
      {label: 'ICP e segmentos', docId: 'marketing/icp-e-segmentos', to: '/wiki/marketing/icp-e-segmentos'},
      {label: 'Agências e parceiros', docId: 'marketing/agencias-e-parceiros', to: '/wiki/marketing/agencias-e-parceiros'},
      {label: 'Oferta para agências', docId: 'marketing/oferta-para-agencias', to: '/wiki/marketing/oferta-para-agencias'},
      {label: 'Posicionamento', docId: 'marketing/posicionamento', to: '/wiki/marketing/posicionamento'},
    ],
  },
  {
    title: 'Desenvolvedores',
    items: [
      {label: 'Visão geral da arquitetura', docId: 'architecture/visao-geral', to: '/architecture/visao-geral'},
      {label: 'Integrações', docId: 'modulos/integracoes', to: '/modulos/integracoes'},
      {label: 'Eventos', docId: 'modulos/eventos', to: '/modulos/eventos'},
      {label: 'Rastreamento', docId: 'modulos/rastreamento', to: '/modulos/rastreamento'},
    ],
  },
  {
    title: 'Campanhas de GTM',
    items: [
      {label: 'Plano de organização GTM', docId: 'marketing/plano-organizacao-campanhas-gtm', to: '/wiki/marketing/plano-organizacao-campanhas-gtm'},
      {label: 'Base de inteligência de conteúdo', docId: 'marketing/base-de-inteligencia-de-conteudo', to: '/wiki/marketing/base-de-inteligencia-de-conteudo'},
      {label: 'Assets e campanhas', docId: 'marketing/assets-e-campanhas', to: '/wiki/marketing/assets-e-campanhas'},
      {label: 'Copies Meta Ads', docId: 'marketing/copies-meta-ads', to: '/wiki/marketing/copies-meta-ads'},
      {label: 'Copies Google Ads', docId: 'marketing/copies-google-ads', to: '/wiki/marketing/copies-google-ads'},
      {label: 'Canvas de conteúdo', docId: 'marketing/canvas-de-conteudo-instagram', to: '/wiki/marketing/canvas-de-conteudo-instagram'},
      {label: 'Arquitetura editorial StoryBrand', docId: 'marketing/arquitetura-editorial-instagram-storybrand', to: '/wiki/marketing/arquitetura-editorial-instagram-storybrand'},
      {label: 'Copies dos 9 carrosséis StoryBrand', docId: 'marketing/copies-carrosseis-instagram-storybrand', to: '/wiki/marketing/copies-carrosseis-instagram-storybrand'},
      {label: 'Roteiros para reels e carrosséis', docId: 'marketing/roteiros-reels-carrosseis', to: '/wiki/marketing/roteiros-reels-carrosseis'},
      {label: 'Sequência de email outbound', docId: 'marketing/sequencia-email-outbound', to: '/wiki/marketing/sequencia-email-outbound'},
    ],
  },
  {
    title: 'Mais documentos',
    items: [
      {label: 'Marketing', docId: 'marketing/index', to: '/wiki/marketing'},
      {label: 'Módulos', docId: 'modulos/index', to: '/modulos'},
      {label: 'Benchmark competitivo', docId: 'marketing/benchmark-competitivo-tintim', to: '/wiki/marketing/benchmark-competitivo-tintim'},
      {label: 'Dossiê de canal no YouTube', docId: 'marketing/dossie-canal-youtube-bispo-bruno-leonardo', to: '/wiki/marketing/dossie-canal-youtube-bispo-bruno-leonardo'},
    ],
  },
];