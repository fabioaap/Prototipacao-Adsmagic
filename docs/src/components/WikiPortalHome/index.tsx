import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {wikiTaxonomySections} from '@site/src/data/wikiTaxonomy';

type GuideColumn = {
  title: string;
  links: Array<{title: string; description: string; to: string}>;
};

type SupportColumn = {
  title: string;
  description: string;
  actions: Array<{label: string; to: string; external?: boolean}>;
};

const guideColumns: GuideColumn[] = [
  {
    title: 'Comecando',
    links: [
      {
        title: 'Subir o workspace e a wiki',
        description:
          'Configure dependencias, portas e o fluxo local atual do Adsmagic Workspace com o portal Docusaurus.',
        to: '/setup-local',
      },
      {
        title: 'Entender o produto atual',
        description:
          'Leia o que ja existe hoje em producao e quais superficies o time precisa preservar antes de mudar.',
        to: '/product/as-is',
      },
      {
        title: 'Navegar pelos modulos',
        description:
          'Veja telas, responsabilidades e screenshots do produto atual sem depender do app aberto em paralelo.',
        to: '/modulos',
      },
      {
        title: 'Ler o posicionamento base',
        description:
          'Comece pela tese de mercado e pela proposta de valor antes de revisar campanhas, LPs ou materiais comerciais.',
        to: '/wiki/marketing/posicionamento',
      },
    ],
  },
  {
    title: 'Popular',
    links: [
      {
        title: 'Oferta para agencias',
        description:
          'Blueprint de narrativa e proposta comercial para a frente de aquisicao de agencias.',
        to: '/wiki/marketing/oferta-para-agencias',
      },
      {
        title: 'Workflow de prototipacao',
        description:
          'Ritmo de execucao, handoffs e criterios operacionais para evoluir produto e prototipos.',
        to: '/workflow/prototipacao',
      },
      {
        title: 'Mensagens-chave',
        description:
          'Mensagem-mae, versoes por publico e CTAs que organizam LP, vendas e campanhas.',
        to: '/wiki/marketing/mensagens-chave',
      },
      {
        title: 'Estrutura do prototipo',
        description:
          'Mapa entre workspace Vue, portal Docusaurus e superficies ativas do repositorio.',
        to: '/architecture/estrutura-do-prototipo',
      },
    ],
  },
];

const supportColumns: SupportColumn[] = [
  {
    title: 'Voce encontrou o que precisava?',
    description:
      'Use a wiki como camada de decisao. Quando houver conflito entre discurso, prototipo e operacao, priorize as paginas de governanca e alinhamento.',
    actions: [
      {label: 'Abrir governanca', to: '/wiki/marketing/governanca'},
      {label: 'Ver alinhamento de fontes', to: '/wiki/marketing/alinhamento-de-fontes'},
    ],
  },
  {
    title: 'Ainda precisa de ajuda?',
    description:
      'Se a duvida for sobre comportamento do produto, volte para o workspace. Se for sobre direcao, narrativa ou operacao, permaneca na wiki.',
    actions: [
      {label: 'Abrir workspace', to: 'http://localhost:3000/', external: true},
      {label: 'Revisar jornadas', to: '/jornadas'},
    ],
  },
];

export default function WikiPortalHome(): ReactNode {
  return (
    <div className="wiki-portal-home">
      <section className="wiki-portal-home__cover">
        <div className="wiki-portal-home__cover-art" aria-hidden="true" />
        <div className="wiki-portal-home__cover-copy">
          <img className="wiki-portal-home__cover-logo" src="/img/logo.svg" alt="Adsmagic" />
          <h1>Documentacao do Adsmagic</h1>
          <p>Obtenha contexto, direcao e material operacional em qualquer ponto da jornada do produto.</p>
        </div>
      </section>

      <section className="wiki-portal-home__directory" aria-label="Secoes da documentacao">
        <div className="wiki-portal-home__directory-grid">
          {wikiTaxonomySections.map((section) => (
            <article key={section.title} className="wiki-portal-home__directory-group">
              <h2>{section.title}</h2>
              {section.items.map((item) => (
                <Link key={item.to} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section className="wiki-portal-home__guides">
        {guideColumns.map((column) => (
          <div key={column.title} className="wiki-portal-home__guides-column">
            <h2>{column.title}</h2>
            {column.links.map((link) => (
              <Link key={link.to} className="wiki-portal-home__guide-link" to={link.to}>
                <strong>{link.title}</strong>
                <span>{link.description}</span>
              </Link>
            ))}
          </div>
        ))}
      </section>

      <section className="wiki-portal-home__support">
        <h2>Ajuda e suporte</h2>
        <div className="wiki-portal-home__support-grid">
          {supportColumns.map((column) => (
            <div key={column.title}>
              <h3>{column.title}</h3>
              <p>{column.description}</p>
              <div className="wiki-portal-home__support-actions">
                {column.actions.map((action) => (
                  <Link key={action.to} to={action.to} {...(action.external ? {target: '_blank', rel: 'noreferrer'} : {})}>
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
