import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import WikiPortalHome from '@site/src/components/WikiPortalHome';

export default function Home(): ReactNode {
  return (
    <Layout
      title="Documentação do Adsmagic"
      description="Hub editorial e operacional do Adsmagic para produto, marketing, arquitetura e operação."
    >
      <main className="wiki-portal-home__page">
        <WikiPortalHome />
      </main>
    </Layout>
  );
}
