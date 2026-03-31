// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { createRequire } from 'module';
import remarkAsciiProgress from './src/remark/ascii-progress.js';

const require = createRequire(import.meta.url);
const pkg = require('./package.json') as { version: string };

const workspaceUrl = process.env.WORKSPACE_URL || 'http://localhost:3000';

const config: Config = {
  title: 'Adsmagic Docs',
  tagline: 'Documentacao viva do Adsmagic Workspace e da estrutura atual do produto.',
  favicon: 'img/favicon.ico',
  future: {
    v4: true,
  },
  url: process.env.WORKSPACE_URL || 'https://fabioaap.github.io',
  baseUrl: process.env.CI ? '/Prototipacao-Adsmagic/wiki/' : '/',
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
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
          remarkPlugins: [remarkAsciiProgress],
        },
        blog: false,
        pages: {},
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
          href: workspaceUrl,
          label: 'Workspace',
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
              to: '/intro',
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
              label: 'Adsmagic Workspace',
              href: workspaceUrl,
            },
            {
              label: 'Rotas em producao',
              href: 'http://localhost:5200/pt/rotas',
            },
            {
              label: 'Wiki de produto',
              to: '/wiki',
            },
          ],
        },
      ],
      copyright: `Wiki de Produto Adsmagic — v${pkg.version} — © ${new Date().getFullYear()} Adsmagic`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
