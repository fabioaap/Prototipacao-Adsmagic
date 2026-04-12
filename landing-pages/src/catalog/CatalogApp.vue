<script setup lang="ts">
import { landingPagesManifest } from '@/lib/manifest'

function getPreviewHref(path: string) {
  return `.${path}`
}
</script>

<template>
  <main class="catalog-shell">
    <section class="catalog-hero">
      <p class="catalog-kicker">AdsMagic Workspace</p>
      <h1>Landing pages separadas para handoff externo</h1>
      <p class="catalog-copy">
        Este app concentra as superficies exportaveis do repositorio. Cada card abaixo representa uma LP com
        entrada propria, manifesto central e pacote estatico dedicado para entrega externa.
      </p>
    </section>

    <section class="catalog-grid">
      <article v-for="page in landingPagesManifest.pages" :key="page.id" class="catalog-card">
        <div class="catalog-card-top">
          <div>
            <p class="catalog-card-kicker">{{ page.owner }}</p>
            <h2>{{ page.name }}</h2>
          </div>
          <span class="catalog-status">{{ page.status }}</span>
        </div>

        <p class="catalog-card-copy">{{ page.description }}</p>

        <dl class="catalog-meta">
          <div>
            <dt>Slug</dt>
            <dd>{{ page.slug }}</dd>
          </div>
          <div>
            <dt>Entrega</dt>
            <dd>{{ page.deliverableDir }}</dd>
          </div>
        </dl>

        <div class="catalog-actions">
          <a class="catalog-btn catalog-btn--primary" :href="getPreviewHref(page.previewPath)">Abrir preview</a>
          <a class="catalog-btn catalog-btn--ghost" :href="page.canonicalUrl" target="_blank" rel="noreferrer">
            URL canonica
          </a>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
.catalog-shell {
  min-height: 100vh;
  padding: 48px 24px 80px;
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.16), transparent 36%),
    radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.14), transparent 32%),
    #0f172a;
  color: #e2e8f0;
}

.catalog-hero {
  max-width: 760px;
  margin: 0 auto 40px;
}

.catalog-kicker,
.catalog-card-kicker {
  margin: 0 0 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: #38bdf8;
}

.catalog-hero h1 {
  margin: 0;
  font-size: clamp(2.5rem, 6vw, 4.75rem);
  line-height: 0.95;
}

.catalog-copy {
  margin: 18px 0 0;
  max-width: 62ch;
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(226, 232, 240, 0.84);
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.catalog-card {
  padding: 24px;
  border-radius: 28px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 28px 80px rgba(2, 6, 23, 0.42);
  backdrop-filter: blur(18px);
}

.catalog-card-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}

.catalog-card h2 {
  margin: 0;
  font-size: 1.6rem;
  line-height: 1.05;
}

.catalog-status {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.18);
  color: #c7d2fe;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.catalog-card-copy {
  margin: 18px 0 22px;
  color: rgba(226, 232, 240, 0.8);
  line-height: 1.7;
}

.catalog-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0 0 22px;
}

.catalog-meta div {
  padding: 14px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.catalog-meta dt {
  margin: 0 0 6px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(148, 163, 184, 0.78);
}

.catalog-meta dd {
  margin: 0;
  font-size: 0.96rem;
  line-height: 1.5;
}

.catalog-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.catalog-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  text-decoration: none;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.catalog-btn:hover {
  transform: translateY(-1px);
}

.catalog-btn--primary {
  background: #f8fafc;
  color: #0f172a;
}

.catalog-btn--ghost {
  border: 1px solid rgba(148, 163, 184, 0.24);
  color: #e2e8f0;
}

@media (max-width: 720px) {
  .catalog-shell {
    padding: 32px 16px 64px;
  }

  .catalog-card {
    border-radius: 22px;
  }
}
</style>