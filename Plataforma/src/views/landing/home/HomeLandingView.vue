<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ArrowRight,
  ChartSpline,
  ChevronDown,
  CircleDollarSign,
  Funnel,
  Menu,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from 'lucide-vue-next'
import GoogleAdsLogoIcon from '@/components/icons/GoogleAdsLogoIcon.vue'
import MetaAdsLogoIcon from '@/components/icons/MetaAdsLogoIcon.vue'
import {
  homeLandingFaqs,
  homeLandingFeatures,
  homeLandingLinks,
  homeLandingPricingBenefits,
  homeLandingSupportPills,
} from './content'

const base = import.meta.env.BASE_URL
const mobileMenuOpen = ref(false)
const billingCycle = ref<'monthly' | 'annual'>('monthly')
const openFaqId = ref(homeLandingFaqs[0]?.id ?? '')

const pricing = computed(() => {
  if (billingCycle.value === 'annual') {
    return {
      label: 'R$157/mês',
      meta: 'Cobrado anualmente · economize 20%',
      helper: '7 dias grátis · cartão necessário',
    }
  }

  return {
    label: 'R$197/mês',
    meta: 'Pago mensalmente',
    helper: '7 dias grátis · cartão necessário',
  }
})

const heroStats = [
  { label: 'Configuração', value: '5 min' },
  { label: 'Aprendizado do algoritmo', value: '3x mais rápido' },
  { label: 'Operação centralizada', value: 'Google + Meta + WhatsApp' },
]

const offerHighlights = [
  {
    icon: Target,
    title: 'Atribuição real',
    description: 'Entenda de onde veio cada conversa e cada venda sem depender de achismo ou planilha paralela.',
  },
  {
    icon: ChartSpline,
    title: 'ROI mais claro',
    description: 'Crie uma camada operacional entre mídia e WhatsApp para realocar orçamento com segurança.',
  },
  {
    icon: CircleDollarSign,
    title: 'Corte desperdício',
    description: 'Pare de otimizar campanhas por clique vazio e devolva sinais de venda para os algoritmos.',
  },
]

function resolveFeatureImage(fileName: string) {
  return `${base}img/landing/home/${fileName}`
}

function toggleFaq(id: string) {
  openFaqId.value = openFaqId.value === id ? '' : id
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}
</script>

<template>
  <div class="home-lp">
    <div class="home-lp__backdrop home-lp__backdrop--top" aria-hidden="true" />
    <div class="home-lp__backdrop home-lp__backdrop--bottom" aria-hidden="true" />

    <header class="home-lp__header">
      <nav class="home-lp__nav">
        <a class="home-lp__brand" href="/lp/home" aria-label="Ir para o topo da landing Adsmagic">
          <img :src="`${base}logo-wordmark.svg`" alt="Adsmagic" class="home-lp__brand-mark" />
        </a>

        <div class="home-lp__nav-desktop">
          <a class="home-lp__nav-link" href="#como-funciona">Como funciona</a>
          <a class="home-lp__nav-link" href="#preco">Oferta</a>
          <a class="home-lp__nav-link" href="#faq">FAQ</a>
          <a class="home-lp__nav-link home-lp__nav-link--ghost" :href="homeLandingLinks.login" target="_blank" rel="noreferrer">Acessar App</a>
          <a class="home-lp__nav-link home-lp__nav-link--primary" :href="homeLandingLinks.signupNav" target="_blank" rel="noreferrer">Teste grátis 7 dias</a>
        </div>

        <button type="button" class="home-lp__menu-button" @click="mobileMenuOpen = !mobileMenuOpen">
          <Menu v-if="!mobileMenuOpen" :size="20" />
          <X v-else :size="20" />
          <span>Menu</span>
        </button>
      </nav>

      <transition name="home-lp-fade">
        <div v-if="mobileMenuOpen" class="home-lp__mobile-sheet">
          <a href="#como-funciona" @click="closeMobileMenu">Como funciona</a>
          <a href="#preco" @click="closeMobileMenu">Oferta</a>
          <a href="#faq" @click="closeMobileMenu">FAQ</a>
          <a :href="homeLandingLinks.login" target="_blank" rel="noreferrer" @click="closeMobileMenu">Acessar App</a>
          <a :href="homeLandingLinks.signupNav" target="_blank" rel="noreferrer" @click="closeMobileMenu">Teste grátis 7 dias</a>
        </div>
      </transition>
    </header>

    <main>
      <section class="home-lp__hero">
        <div class="home-lp__hero-copy">
          <p class="home-lp__eyebrow">Venda mais pelo WhatsApp</p>
          <h1>Rastreie em tempo real a origem das conversas e aumente suas vendas.</h1>
          <p class="home-lp__hero-description">
            Configure tudo em menos de 5 minutos. Integre WhatsApp com Google e Meta Ads gerando links
            rastreáveis em poucos cliques. Descubra de onde vêm suas melhores vendas e corte gasto em mídia
            desnecessário.
          </p>

          <div class="home-lp__hero-actions">
            <a class="home-lp__primary-cta" :href="homeLandingLinks.signup" target="_blank" rel="noreferrer">
              <span>Testar grátis agora</span>
              <ArrowRight :size="18" />
            </a>
            <a class="home-lp__secondary-cta" :href="homeLandingLinks.login" target="_blank" rel="noreferrer">Acessar App</a>
          </div>

          <div class="home-lp__support">
            <span class="home-lp__support-label">Apoiado por</span>
            <div class="home-lp__support-pills">
              <span class="home-lp__support-pill"><GoogleAdsLogoIcon class="h-4 w-4" /> {{ homeLandingSupportPills[0] }}</span>
              <span class="home-lp__support-pill"><MetaAdsLogoIcon class="h-4 w-4" /> {{ homeLandingSupportPills[1] }}</span>
              <span class="home-lp__support-pill">{{ homeLandingSupportPills[2] }}</span>
            </div>
          </div>
        </div>

        <aside class="home-lp__hero-panel" aria-label="Resumo operacional da plataforma">
          <div class="home-lp__flow-card">
            <div class="home-lp__flow-track">
              <span>Google / Meta</span>
              <ArrowRight :size="16" />
              <span>WhatsApp</span>
              <ArrowRight :size="16" />
              <span>Venda</span>
            </div>
            <p>Do clique ao ROI, o Adsmagic registra contexto, atribuição e resultado no mesmo fluxo.</p>
          </div>

          <div class="home-lp__hero-stats">
            <article v-for="stat in heroStats" :key="stat.label" class="home-lp__hero-stat">
              <span>{{ stat.label }}</span>
              <strong>{{ stat.value }}</strong>
            </article>
          </div>
        </aside>
      </section>

      <section id="como-funciona" class="home-lp__section home-lp__section--centered">
        <p class="home-lp__section-label">Por que funciona tão bem?</p>
        <h2>Do clique ao ROI: entenda a mágica por trás do Adsmagic</h2>
        <p class="home-lp__section-description">
          O Adsmagic rastreia o clique no anúncio até a conversa no WhatsApp. Quando uma venda acontece,
          ele identifica automaticamente e envia os dados reais de volta para Google e Meta Ads. Assim,
          você otimiza campanhas com base em resultados concretos e não em achismos.
        </p>

        <div class="home-lp__offer-grid">
          <article v-for="item in offerHighlights" :key="item.title" class="home-lp__offer-card">
            <component :is="item.icon" :size="22" />
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section class="home-lp__section">
        <div class="home-lp__section-head">
          <div>
            <h2>O que o Adsmagic faz por você</h2>
            <p>Do clique ao cliente final: acompanhe cada passo em um único lugar.</p>
          </div>
          <div class="home-lp__section-badge">
            <Sparkles :size="16" />
            <span>Clone local com assets versionados</span>
          </div>
        </div>

        <div class="home-lp__feature-grid">
          <article
            v-for="feature in homeLandingFeatures"
            :key="feature.id"
            class="home-lp__feature-card"
          >
            <img
              class="home-lp__feature-image"
              :src="resolveFeatureImage(feature.image)"
              :alt="feature.imageAlt"
            />
            <div class="home-lp__feature-copy">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="home-lp__band">
        <div>
          <h2>Rastreie as vendas do WhatsApp, alimente Google e Meta Ads com dados reais e aumente seu ROI</h2>
          <p>
            Dados reais, decisões certeiras: atribua cada venda, turbine os algoritmos e faça seu dinheiro render mais.
          </p>
        </div>

        <a class="home-lp__band-cta" :href="homeLandingLinks.signup" target="_blank" rel="noreferrer">
          <span>Comece agora grátis por 7 dias</span>
          <ArrowRight :size="18" />
        </a>
      </section>

      <section id="preco" class="home-lp__section home-lp__pricing-layout">
        <div class="home-lp__pricing-copy">
          <p class="home-lp__pricing-kicker">Uma venda média de R$ 400 já cobre 2 meses de Adsmagic</p>
          <h2>Oferta única limitada</h2>
          <p>
            Para comemorar o lançamento, estamos oferecendo uma oferta especial.
          </p>

          <div class="home-lp__benefits-grid">
            <article
              v-for="benefit in homeLandingPricingBenefits"
              :key="benefit"
              class="home-lp__benefit-card"
            >
              <ShieldCheck :size="18" />
              <span>{{ benefit }}</span>
            </article>
          </div>
        </div>

        <aside class="home-lp__pricing-card">
          <p class="home-lp__pricing-discount">Economize +20%</p>

          <div class="home-lp__pricing-toggle" role="tablist" aria-label="Ciclo de cobrança">
            <button
              type="button"
              :class="['home-lp__pricing-toggle-button', { 'is-active': billingCycle === 'monthly' }]"
              @click="billingCycle = 'monthly'"
            >
              Mensal
            </button>
            <button
              type="button"
              :class="['home-lp__pricing-toggle-button', { 'is-active': billingCycle === 'annual' }]"
              @click="billingCycle = 'annual'"
            >
              Anual
            </button>
          </div>

          <p class="home-lp__price">{{ pricing.label }}</p>
          <p class="home-lp__price-meta">{{ pricing.meta }}</p>
          <p class="home-lp__price-helper">{{ pricing.helper }}</p>

          <a class="home-lp__primary-cta home-lp__primary-cta--full" :href="homeLandingLinks.signup" target="_blank" rel="noreferrer">
            <span>Testar grátis agora</span>
            <ArrowRight :size="18" />
          </a>

          <small class="home-lp__price-small">Cancele quando quiser. Zero burocracia</small>
        </aside>
      </section>

      <section class="home-lp__section home-lp__testimonial-section">
        <div class="home-lp__testimonial-heading">
          <div class="home-lp__avatar">GQ</div>
          <div>
            <strong>Gabriel Queiroz</strong>
            <p>Fundador da Melhor Limpeza</p>
          </div>
        </div>

        <blockquote>
          Antes do Adsmagic eu perdia cerca de 2h por semana cruzando planilhas e ainda ficava no escuro sobre a origem das vendas.
          Hoje deixo o dashboard aberto o dia inteiro: em segundos sei qual canal trouxe cada pedido e realoco o orçamento na hora certa.
          Ganhei confiança nos números, parei de desperdiçar verba e consigo crescer novos canais com segurança.
        </blockquote>
      </section>

      <section id="faq" class="home-lp__section home-lp__faq-section">
        <div class="home-lp__faq-copy">
          <p class="home-lp__section-label">FAQ</p>
          <h2>Perguntas frequentes</h2>
          <p>
            Aqui está tudo o que você precisa saber sobre o Adsmagic, desde os recursos até os primeiros passos.
          </p>

          <div class="home-lp__faq-contact">
            <span>Tem alguma dúvida específica?</span>
            <a :href="homeLandingLinks.contact" target="_blank" rel="noreferrer">Fale conosco</a>
          </div>
        </div>

        <div class="home-lp__faq-list">
          <article
            v-for="faq in homeLandingFaqs"
            :key="faq.id"
            :class="['home-lp__faq-item', { 'is-open': openFaqId === faq.id }]"
          >
            <button type="button" class="home-lp__faq-trigger" @click="toggleFaq(faq.id)">
              <span>{{ faq.question }}</span>
              <ChevronDown :size="18" />
            </button>
            <transition name="home-lp-faq">
              <p v-if="openFaqId === faq.id" class="home-lp__faq-answer">
                {{ faq.answer }}
              </p>
            </transition>
          </article>
        </div>
      </section>
    </main>

    <footer class="home-lp__footer">
      <div class="home-lp__footer-top">
        <a class="home-lp__brand" href="/lp/home" aria-label="Ir para o topo da landing Adsmagic">
          <img :src="`${base}logo-wordmark.svg`" alt="Adsmagic" class="home-lp__brand-mark" />
        </a>

        <div class="home-lp__footer-contact">
          <MessageSquareText :size="18" />
          <span>contato@adsmagic.com.br</span>
        </div>
      </div>

      <div class="home-lp__footer-links">
        <a :href="homeLandingLinks.privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
        <a :href="homeLandingLinks.cookies" target="_blank" rel="noreferrer">Cookie Policy</a>
        <a :href="homeLandingLinks.terms" target="_blank" rel="noreferrer">Terms of Service</a>
      </div>

      <p class="home-lp__footer-meta">© 2026 Adsmagic</p>
    </footer>
  </div>
</template>

<style scoped>
.home-lp {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.16), transparent 26%),
    radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.1), transparent 22%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 40%, #ffffff 100%);
  color: #0f172a;
}

.home-lp__backdrop {
  position: absolute;
  inset-inline: 0;
  height: 28rem;
  pointer-events: none;
}

.home-lp__backdrop--top {
  top: -8rem;
  background:
    radial-gradient(circle at 18% 42%, rgba(99, 102, 241, 0.18), transparent 20%),
    radial-gradient(circle at 86% 18%, rgba(14, 165, 233, 0.16), transparent 18%);
}

.home-lp__backdrop--bottom {
  bottom: -10rem;
  background:
    radial-gradient(circle at 15% 58%, rgba(99, 102, 241, 0.16), transparent 20%),
    radial-gradient(circle at 72% 52%, rgba(59, 130, 246, 0.12), transparent 24%);
}

.home-lp__header,
.home-lp__hero,
.home-lp__section,
.home-lp__band,
.home-lp__footer {
  position: relative;
  width: min(1180px, calc(100vw - 2rem));
  margin: 0 auto;
}

.home-lp__header {
  z-index: 10;
  padding-top: 0.75rem;
}

.home-lp__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(18px);
}

.home-lp__brand {
  display: inline-flex;
  align-items: center;
}

.home-lp__brand-mark {
  height: 1.45rem;
  width: auto;
}

.home-lp__nav-desktop {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.home-lp__nav-link,
.home-lp__menu-button,
.home-lp__pricing-toggle-button,
.home-lp__faq-trigger,
.home-lp__secondary-cta,
.home-lp__support-pill,
.home-lp__section-badge,
.home-lp__benefit-card {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 9999px;
}

.home-lp__nav-link,
.home-lp__menu-button,
.home-lp__secondary-cta,
.home-lp__support-pill,
.home-lp__section-badge {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.88);
  color: #334155;
}

.home-lp__nav-link {
  padding: 0.85rem 1.15rem;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: 180ms ease;
}

.home-lp__nav-link:hover,
.home-lp__secondary-cta:hover,
.home-lp__support-pill:hover {
  transform: translateY(-1px);
  border-color: rgba(99, 102, 241, 0.22);
}

.home-lp__nav-link--ghost {
  background: rgba(255, 255, 255, 0.9);
}

.home-lp__nav-link--primary,
.home-lp__primary-cta,
.home-lp__pricing-toggle-button.is-active {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 18px 40px rgba(99, 102, 241, 0.28);
}

.home-lp__menu-button {
  display: none;
  border: 1px solid rgba(226, 232, 240, 0.95);
  padding: 0.8rem 1rem;
  font: inherit;
  font-weight: 600;
}

.home-lp__mobile-sheet {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.85rem;
  padding: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 30px 70px rgba(15, 23, 42, 0.08);
}

.home-lp__mobile-sheet a {
  display: inline-flex;
  justify-content: center;
  padding: 0.9rem 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  color: #334155;
  text-decoration: none;
  font-weight: 600;
}

.home-lp__hero,
.home-lp__section,
.home-lp__band {
  padding: clamp(4rem, 8vw, 7rem) 0;
}

.home-lp__hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: center;
}

.home-lp__hero-copy {
  display: grid;
  gap: 1.4rem;
}

.home-lp__eyebrow,
.home-lp__section-label,
.home-lp__pricing-kicker {
  margin: 0;
  color: #4338ca;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.home-lp__hero h1,
.home-lp__section h2,
.home-lp__band h2 {
  margin: 0;
  line-height: 1.02;
}

.home-lp__hero h1 {
  max-width: 12ch;
  font-size: clamp(2.85rem, 7vw, 5.25rem);
}

.home-lp__hero-description,
.home-lp__section-description,
.home-lp__section-head p,
.home-lp__offer-card p,
.home-lp__feature-copy p,
.home-lp__band p,
.home-lp__pricing-copy p,
.home-lp__faq-copy p,
.home-lp__faq-answer,
.home-lp__testimonial-section blockquote,
.home-lp__footer-meta {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

.home-lp__hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
}

.home-lp__primary-cta,
.home-lp__secondary-cta,
.home-lp__band-cta {
  min-height: 3.5rem;
  padding: 0 1.35rem;
  font-weight: 700;
  text-decoration: none;
  transition: 180ms ease;
}

.home-lp__primary-cta,
.home-lp__band-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border-radius: 9999px;
}

.home-lp__primary-cta:hover,
.home-lp__band-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 52px rgba(99, 102, 241, 0.34);
}

.home-lp__secondary-cta {
  color: #334155;
}

.home-lp__primary-cta--full {
  width: 100%;
}

.home-lp__support {
  display: grid;
  gap: 0.75rem;
}

.home-lp__support-label {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 600;
}

.home-lp__support-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.home-lp__support-pill,
.home-lp__section-badge {
  padding: 0.75rem 1rem;
  font-size: 0.92rem;
  font-weight: 600;
}

.home-lp__hero-panel,
.home-lp__offer-card,
.home-lp__feature-card,
.home-lp__pricing-card,
.home-lp__benefit-card,
.home-lp__testimonial-section,
.home-lp__faq-item,
.home-lp__faq-contact {
  border: 1px solid rgba(226, 232, 240, 0.85);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.08);
}

.home-lp__hero-panel,
.home-lp__feature-card,
.home-lp__pricing-card,
.home-lp__testimonial-section,
.home-lp__faq-item,
.home-lp__faq-contact {
  border-radius: 1.75rem;
}

.home-lp__hero-panel {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
}

.home-lp__flow-card {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1.5rem;
  background: linear-gradient(135deg, #eef2ff 0%, rgba(255, 255, 255, 0.98) 100%);
}

.home-lp__flow-track {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
  color: #4338ca;
  font-size: 0.92rem;
  font-weight: 700;
}

.home-lp__flow-card p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.home-lp__hero-stats {
  display: grid;
  gap: 0.85rem;
}

.home-lp__hero-stat {
  display: grid;
  gap: 0.2rem;
  padding: 1rem 1.1rem;
  border-radius: 1.35rem;
  background: rgba(248, 250, 252, 0.92);
}

.home-lp__hero-stat span {
  color: #64748b;
  font-size: 0.9rem;
}

.home-lp__hero-stat strong {
  color: #0f172a;
  font-size: 1rem;
}

.home-lp__section--centered {
  display: grid;
  gap: 1rem;
  text-align: center;
}

.home-lp__section--centered h2 {
  font-size: clamp(2rem, 4vw, 3.35rem);
}

.home-lp__section-description {
  max-width: 62rem;
  margin-inline: auto;
}

.home-lp__offer-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
}

.home-lp__offer-card {
  display: grid;
  gap: 0.75rem;
  padding: 1.35rem;
  border-radius: 1.5rem;
  text-align: left;
}

.home-lp__offer-card :deep(svg) {
  color: #6366f1;
}

.home-lp__offer-card h3,
.home-lp__feature-copy h3,
.home-lp__pricing-copy h2,
.home-lp__faq-copy h2 {
  margin: 0;
}

.home-lp__section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.home-lp__section-head h2,
.home-lp__band h2,
.home-lp__pricing-copy h2,
.home-lp__faq-copy h2 {
  font-size: clamp(2rem, 4vw, 3.25rem);
}

.home-lp__feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1.25rem, 3vw, 2rem);
}

.home-lp__feature-card {
  overflow: hidden;
}

.home-lp__feature-image {
  display: block;
  width: 100%;
  aspect-ratio: 1.12;
  object-fit: cover;
  background: #e2e8f0;
}

.home-lp__feature-copy {
  display: grid;
  gap: 0.65rem;
  padding: 1.5rem;
}

.home-lp__band {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1.5rem;
  align-items: center;
  border-radius: 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #312e81 100%);
  color: #ffffff;
  padding-inline: clamp(1.5rem, 3vw, 2.5rem);
}

.home-lp__band p {
  color: rgba(255, 255, 255, 0.78);
}

.home-lp__band-cta {
  justify-self: end;
  background: #ffffff;
  color: #4338ca;
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.22);
}

.home-lp__pricing-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
  gap: clamp(1.5rem, 4vw, 2.5rem);
  align-items: start;
}

.home-lp__pricing-copy {
  display: grid;
  gap: 1rem;
}

.home-lp__benefits-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  margin-top: 0.75rem;
}

.home-lp__benefit-card {
  justify-content: start;
  padding: 1rem 1.1rem;
  border-radius: 1.25rem;
  font-weight: 600;
}

.home-lp__benefit-card :deep(svg) {
  color: #10b981;
}

.home-lp__pricing-card {
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
}

.home-lp__pricing-discount {
  margin: 0;
  color: #4338ca;
  font-weight: 700;
}

.home-lp__pricing-toggle {
  display: inline-flex;
  gap: 0.35rem;
  padding: 0.35rem;
  border-radius: 9999px;
  background: #eef2ff;
}

.home-lp__pricing-toggle-button {
  border: 0;
  background: transparent;
  padding: 0.8rem 1.1rem;
  color: #64748b;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: 180ms ease;
}

.home-lp__price,
.home-lp__price-meta,
.home-lp__price-helper,
.home-lp__price-small {
  margin: 0;
}

.home-lp__price {
  color: #0f172a;
  font-size: clamp(3rem, 6vw, 4.4rem);
  font-weight: 700;
  line-height: 0.98;
}

.home-lp__price-meta,
.home-lp__price-small {
  color: #64748b;
}

.home-lp__price-helper {
  color: #475569;
  font-weight: 600;
}

.home-lp__testimonial-section {
  display: grid;
  gap: 1.35rem;
  padding: clamp(1.35rem, 3vw, 2rem);
}

.home-lp__testimonial-heading {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.home-lp__testimonial-heading p {
  margin: 0.2rem 0 0;
  color: #64748b;
}

.home-lp__testimonial-section blockquote {
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  color: #334155;
}

.home-lp__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%);
  color: #ffffff;
  font-weight: 700;
}

.home-lp__faq-section {
  display: grid;
  grid-template-columns: minmax(0, 0.86fr) minmax(0, 1.14fr);
  gap: clamp(1.5rem, 4vw, 2.5rem);
  align-items: start;
}

.home-lp__faq-copy {
  display: grid;
  gap: 1rem;
}

.home-lp__faq-contact {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.15rem;
  border-radius: 1.5rem;
}

.home-lp__faq-contact a {
  color: #4338ca;
  font-weight: 700;
  text-decoration: none;
}

.home-lp__faq-list {
  display: grid;
  gap: 1rem;
}

.home-lp__faq-item {
  padding: 0.35rem 1.35rem;
}

.home-lp__faq-trigger {
  width: 100%;
  border: 0;
  background: transparent;
  padding: 1rem 0;
  justify-content: space-between;
  color: #0f172a;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.home-lp__faq-trigger :deep(svg) {
  color: #6366f1;
  transition: transform 180ms ease;
}

.home-lp__faq-item.is-open .home-lp__faq-trigger :deep(svg) {
  transform: rotate(180deg);
}

.home-lp__faq-answer {
  padding: 0 0 1rem;
}

.home-lp__footer {
  display: grid;
  gap: 1.25rem;
  padding: 2rem 0 4rem;
}

.home-lp__footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(226, 232, 240, 0.92);
}

.home-lp__footer-contact,
.home-lp__footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  color: #64748b;
}

.home-lp__footer-links a {
  color: inherit;
  text-decoration: none;
}

.home-lp-fade-enter-active,
.home-lp-fade-leave-active,
.home-lp-faq-enter-active,
.home-lp-faq-leave-active {
  transition: all 180ms ease;
}

.home-lp-fade-enter-from,
.home-lp-fade-leave-to,
.home-lp-faq-enter-from,
.home-lp-faq-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 1040px) {
  .home-lp__hero,
  .home-lp__pricing-layout,
  .home-lp__faq-section,
  .home-lp__band {
    grid-template-columns: 1fr;
  }

  .home-lp__band-cta {
    justify-self: start;
  }
}

@media (max-width: 900px) {
  .home-lp__offer-grid,
  .home-lp__feature-grid,
  .home-lp__benefits-grid {
    grid-template-columns: 1fr;
  }

  .home-lp__section-head,
  .home-lp__footer-top {
    flex-direction: column;
    align-items: start;
  }
}

@media (max-width: 760px) {
  .home-lp__nav-desktop {
    display: none;
  }

  .home-lp__menu-button {
    display: inline-flex;
  }

  .home-lp__hero h1 {
    max-width: 13ch;
  }
}

@media (max-width: 640px) {
  .home-lp__nav {
    border-radius: 1.45rem;
  }

  .home-lp__hero-actions,
  .home-lp__support-pills,
  .home-lp__footer-links,
  .home-lp__footer-contact {
    flex-direction: column;
    align-items: stretch;
  }

  .home-lp__primary-cta,
  .home-lp__secondary-cta,
  .home-lp__band-cta {
    width: 100%;
  }

  .home-lp__faq-contact {
    align-items: start;
  }
}
</style>
