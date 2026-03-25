import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'setup-local',
    {
      type: 'category',
      label: 'Wiki',
      items: [
        'wiki/index',
        {
          type: 'category',
          label: 'Produto',
          items: ['product/as-is', 'product/to-be'],
        },
        {
          type: 'category',
          label: 'Módulos',
          items: [
            'modulos/index',
            'modulos/dashboard',
            'modulos/contatos',
            'modulos/vendas',
            'modulos/mensagens',
            'modulos/rastreamento',
            'modulos/eventos',
            'modulos/analytics',
            'modulos/campanhas-google',
            'modulos/campanhas-meta',
            'modulos/integracoes',
            'modulos/configuracoes',
          ],
        },
        {
          type: 'category',
          label: 'Arquitetura',
          items: ['architecture/visao-geral', 'architecture/estrutura-do-prototipo'],
        },
        {
          type: 'category',
          label: 'Operacao',
          items: ['jornadas', 'workflow/prototipacao'],
        },
        {
          type: 'category',
          label: 'Stories',
          items: [
            'stories/story-contacts',
            'stories/story-campaigns',
            'stories/story-integrations',
            'stories/story-messages',
            'stories/story-settings',
            'stories/antitese',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
