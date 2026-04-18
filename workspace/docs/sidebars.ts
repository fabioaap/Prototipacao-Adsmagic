import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {wikiTaxonomySections} from './src/data/wikiTaxonomy';

const sidebars: SidebarsConfig = {
  docsSidebar: wikiTaxonomySections.map((section) => ({
    type: 'category' as const,
    label: section.title,
    items: section.items.map((item) => item.docId),
  })),
};

export default sidebars;
