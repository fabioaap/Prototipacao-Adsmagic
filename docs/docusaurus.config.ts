// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Adsmagic Docs',
  tagline: 'Documentacao viva do prototipo e da estrutura atual do produto.',
  favicon: 'img/favicon.ico',
  future: {
    v4: true,
  },
  url: 'http://localhost:3000',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: ['@docusaurus/theme-mermaid'],
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        pages: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: 'img/logo.svg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Adsmagic Docs',
      logo: {
        alt: 'Adsmagic Docs',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentacao',
        },
        {
          href: 'http://localhost:5173',
          label: 'Prototipo',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Portal',
          items: [
            {
              label: 'Introducao',
              to: '/',
            },
            {
              label: 'Wiki',
              to: '/wiki',
            },
          ],
        },
        {
          title: 'Produto',
          items: [
            {
              label: 'As-Is',
              to: '/product/as-is',
            },
            {
              label: 'To-Be',
              to: '/product/to-be',
            },
          ],
        },
        {
          title: 'Operacao',
          items: [
            {
              label: 'Jornadas',
              to: '/jornadas',
            },
            {
              label: 'Workflow de prototipacao',
              to: '/workflow/prototipacao',
            },
          ],
        },
        {
          title: 'Workspace',
          items: [
            {
              label: 'App Vue',
              href: 'http://localhost:5173',
            },
            {
              label: 'Rotas em producao',
              href: 'http://localhost:5200/pt/rotas',
            },
            {
              label: 'Wiki no prototipo',
              href: 'http://localhost:5173/wiki',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Adsmagic. Documentacao gerada com Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
