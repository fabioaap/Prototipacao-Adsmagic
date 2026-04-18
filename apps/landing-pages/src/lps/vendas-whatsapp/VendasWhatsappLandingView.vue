<script setup lang="ts">
import { type Directive, onMounted, onUnmounted, ref } from 'vue'
import { ArrowRight, Linkedin, Menu, X, Youtube } from 'lucide-vue-next'
import BrandFaqAccordion from '@/components/brand-system/BrandFaqAccordion.vue'
import BrandPricingCard from '@/components/brand-system/BrandPricingCard.vue'
import BrandTestimonialCard from '@/components/brand-system/BrandTestimonialCard.vue'
import BrandTrustRibbon from '@/components/brand-system/BrandTrustRibbon.vue'
import { publicAsset } from '@/lib/publicAsset'
import {
  homeLandingFaqs,
  homeLandingFeatures,
  homeLandingLinks,
  homeLandingPricingPlans,
  homeLandingSupportPartners,
  homeLandingTestimonial,
} from './content'
const ctaBandStarPath =
  'M77.9645 120.387C77.9645 108.106 83.0981 96.3291 92.2363 87.6457C101.374 78.9623 113.769 74.084 126.692 74.084C129.277 74.084 131.756 73.1084 133.583 71.3717C135.411 69.635 136.438 67.2796 136.438 64.8235C136.438 62.3675 135.411 60.0121 133.583 58.2754C131.756 56.5387 129.277 55.563 126.692 55.563C113.769 55.563 101.374 50.6848 92.2363 42.0014C83.0981 33.318 77.9645 21.5408 77.9645 9.26057C77.9645 6.80453 76.9377 4.44898 75.1101 2.7123C73.2825 0.975617 70.8037 0 68.219 0C65.6344 0 63.1556 0.975617 61.328 2.7123C59.5004 4.44898 58.4736 6.80453 58.4736 9.26057C58.4736 21.5408 53.3395 33.318 44.2013 42.0014C35.0631 50.6848 22.6693 55.563 9.74597 55.563C7.1613 55.563 4.68203 56.5387 2.85439 58.2754C1.02675 60.0121 0 62.3675 0 64.8235C0 67.2796 1.02675 69.635 2.85439 71.3717C4.68203 73.1084 7.1613 74.084 9.74597 74.084C22.6693 74.084 35.0631 78.9623 44.2013 87.6457C53.3395 96.3291 58.4736 108.106 58.4736 120.387C58.4736 122.843 59.5004 125.198 61.328 126.935C63.1556 128.671 65.6344 129.647 68.219 129.647C70.8037 129.647 73.2825 128.671 75.1101 126.935C76.9377 125.198 77.9645 122.843 77.9645 120.387Z'
const ctaBandStarViewBox = '0 0 137 130'
const mobileMenuOpen = ref(false)
const billingCycle = ref<'monthly' | 'annual'>('annual')
const supportPartnerLogos = homeLandingSupportPartners.map((partner) => ({
  src: publicAsset(`img/landing/hero/${partner.logo}`),
  alt: partner.name,
  variant: 'wide' as const,
}))

function planPrice(plan: { monthlyPrice: number; annualPrice: number }) {
  return billingCycle.value === 'annual' ? plan.annualPrice : plan.monthlyPrice
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

const headerStuck = ref(false)
function onScroll() { headerStuck.value = window.scrollY > 60 }
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const vReveal: Directive = {
  mounted(el: HTMLElement, binding) {
    const { type = 'fadeUp', delay = 0 } = (binding.value as { type?: string; delay?: number }) ?? {}
    el.style.setProperty('--rv-delay', `${delay}s`)
    el.classList.add('rv', `rv--${type}`)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('rv-in')
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -80px 0px' }
    )
    observer.observe(el)
  },
}
</script>

<template>
  <div id="top" class="home-lp">
    <!-- ═══ HEADER ═══ -->
    <header :class="['home-lp__header', { 'is-stuck': headerStuck }]">
      <nav class="home-lp__nav">
        <a class="home-lp__brand" href="#top" aria-label="Adsmagic home">
          <img :src="publicAsset('logo-wordmark.svg')" alt="Adsmagic" class="home-lp__brand-mark" />
        </a>

        <div class="home-lp__nav-actions">
          <a class="home-lp__btn home-lp__btn--green home-lp__btn--pill" :href="homeLandingLinks.signupNav" target="_blank" rel="noreferrer">Teste grátis 7 dias</a>
          <a class="home-lp__btn home-lp__btn--outline home-lp__btn--pill" :href="homeLandingLinks.login" target="_blank" rel="noreferrer">Acessar App</a>
        </div>

        <button type="button" class="home-lp__menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Menu">
          <Menu v-if="!mobileMenuOpen" :size="22" />
          <X v-else :size="22" />
        </button>
      </nav>

      <transition name="home-lp-fade">
        <div v-if="mobileMenuOpen" class="home-lp__mobile-sheet">
          <a class="home-lp__btn home-lp__btn--green" :href="homeLandingLinks.signupNav" target="_blank" rel="noreferrer" @click="closeMobileMenu">Teste grátis 7 dias</a>
          <a class="home-lp__btn home-lp__btn--outline" :href="homeLandingLinks.login" target="_blank" rel="noreferrer" @click="closeMobileMenu">Acessar App</a>
        </div>
      </transition>
    </header>

    <main>
      <!-- ═══ HERO ═══ -->
      <section class="home-lp__hero">
        <div class="home-lp__hero-copy">
          <p class="home-lp__tagline">Software de rastreamento para vendas no WhatsApp</p>
          <h1>Rastreie vendas no WhatsApp e descubra quais campanhas geram receita.</h1>

          <p class="home-lp__hero-desc">O Adsmagic é um software de rastreamento e atribuição para equipes que vendem pelo WhatsApp. Conecte Google Ads e Meta Ads em menos de 5 minutos e veja quais anúncios geram leads, conversas e vendas.</p>

          <div class="home-lp__hero-cta">
            <a class="home-lp__btn home-lp__btn--green home-lp__btn--lg" :href="homeLandingLinks.signup" target="_blank" rel="noreferrer">
              Testar grátis agora
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>

          <div class="home-lp__partners">
            <BrandTrustRibbon tone="light" size="compact" :logos="supportPartnerLogos" />
          </div>
        </div>

        <aside class="home-lp__hero-visual">
          <div class="home-lp__hero-grafismos">
            <svg class="home-lp__brand-bars home-lp__brand-bars--top" viewBox="0 0 260 500" fill="none" aria-hidden="true" focusable="false">
              <rect x="60" y="0" width="30" height="260" rx="15" transform="rotate(135 75 130)" fill="url(#homeHeroBarTop1)" fill-opacity="0.6" />
              <rect x="120" y="40" width="22" height="200" rx="11" transform="rotate(135 131 140)" fill="url(#homeHeroBarTop2)" fill-opacity="0.48" />
              <rect x="170" y="80" width="16" height="160" rx="8" transform="rotate(135 178 160)" fill="url(#homeHeroBarTop3)" fill-opacity="0.34" />
              <defs>
                <linearGradient id="homeHeroBarTop1" x1="0" y1="0" x2="0" y2="1">
                  <stop stop-color="#1E3A8A" />
                  <stop offset="1" stop-color="#2563EB" />
                </linearGradient>
                <linearGradient id="homeHeroBarTop2" x1="0" y1="0" x2="0" y2="1">
                  <stop stop-color="#059669" />
                  <stop offset="1" stop-color="#3BB56D" />
                </linearGradient>
                <linearGradient id="homeHeroBarTop3" x1="0" y1="0" x2="0" y2="1">
                  <stop stop-color="#6366F1" />
                  <stop offset="1" stop-color="#818CF8" />
                </linearGradient>
              </defs>
            </svg>

            <svg class="home-lp__brand-bars home-lp__brand-bars--bottom" viewBox="0 0 240 460" fill="none" aria-hidden="true" focusable="false">
              <rect x="40" y="20" width="26" height="230" rx="13" transform="rotate(135 53 135)" fill="url(#homeHeroBarBottom1)" fill-opacity="0.42" />
              <rect x="100" y="60" width="20" height="190" rx="10" transform="rotate(135 110 155)" fill="url(#homeHeroBarBottom2)" fill-opacity="0.32" />
              <rect x="150" y="100" width="14" height="140" rx="7" transform="rotate(135 157 170)" fill="url(#homeHeroBarBottom3)" fill-opacity="0.22" />
              <defs>
                <linearGradient id="homeHeroBarBottom1" x1="0" y1="0" x2="0" y2="1">
                  <stop stop-color="#059669" />
                  <stop offset="1" stop-color="#3BB56D" />
                </linearGradient>
                <linearGradient id="homeHeroBarBottom2" x1="0" y1="0" x2="0" y2="1">
                  <stop stop-color="#1E3A8A" />
                  <stop offset="1" stop-color="#6366F1" />
                </linearGradient>
                <linearGradient id="homeHeroBarBottom3" x1="0" y1="0" x2="0" y2="1">
                  <stop stop-color="#3BB56D" />
                  <stop offset="1" stop-color="#2563EB" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <img
              :src="publicAsset('img/landing/hero/hero-dashboard.png')"
              alt="Funil de vendas Adsmagic"
            class="home-lp__hero-img"
          />
        </aside>
      </section>

      <!-- ═══ DO CLIQUE AO ROI ═══ -->
      <section class="home-lp__flow-section">
        <div class="home-lp__flow-inner" v-reveal>
          <p class="home-lp__tagline">Por que funciona tão bem?</p>
          <h2>Do clique ao ROI: entenda a mágica por trás do Adsmagic</h2>
          <p class="home-lp__flow-desc">
            O Adsmagic rastreia o clique no anúncio até a conversa no WhatsApp. Quando uma venda acontece,
            ele identifica automaticamente e envia os dados reais de volta para Google e Meta Ads. Assim,
            você otimiza campanhas com base em resultados concretos e não em achismos.
          </p>
          <img
            :src="publicAsset('img/landing/home/flow-diagram.png')"
            alt="Fluxo do Adsmagic entre clique, conversa, lead e venda"
            class="home-lp__flow-img"
          />
        </div>
      </section>

      <!-- ═══ FEATURES GRID ═══ -->
      <section class="home-lp__features-section">
        <div class="home-lp__features-inner">
          <div class="home-lp__features-head" v-reveal>
            <h2>O que você ganha com o Adsmagic</h2>
            <p>Visibilidade total da jornada comercial para decidir com mais velocidade e menos achismo.</p>
          </div>

          <div class="home-lp__features-grid" v-reveal="{ type: 'staggerChildren' }">
            <article
              v-for="feature in homeLandingFeatures"
              :key="feature.id"
              class="home-lp__feature-card"
            >
              <div class="home-lp__feature-img-wrap">
                <img
                  class="home-lp__feature-img"
                  :src="publicAsset(`img/landing/home/${feature.image}`)"
                  :alt="feature.imageAlt"
                />
              </div>
              <div class="home-lp__feature-text">
                <h3>{{ feature.title }}</h3>
                <p>{{ feature.description }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- ═══ CTA ESCURA ═══ -->
      <section class="home-lp__cta-dark">
        <div class="home-lp__cta-band-grafismo" aria-hidden="true">
          <svg class="home-lp__cta-band-bars home-lp__cta-band-bars--left" viewBox="0 0 240 400" fill="none">
            <rect x="50" y="0" width="32" height="220" rx="16" transform="rotate(35 50 0)" fill="url(#homeCtaBar1)" fill-opacity="0.10" />
            <rect x="100" y="30" width="24" height="180" rx="12" transform="rotate(35 100 30)" fill="url(#homeCtaBar2)" fill-opacity="0.08" />
            <rect x="20" y="80" width="20" height="160" rx="10" transform="rotate(35 20 80)" fill="url(#homeCtaBar3)" fill-opacity="0.06" />
            <defs>
              <linearGradient id="homeCtaBar1" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3BB56D" /><stop offset="1" stop-color="#059669" /></linearGradient>
              <linearGradient id="homeCtaBar2" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#2563EB" /><stop offset="1" stop-color="#6366f1" /></linearGradient>
              <linearGradient id="homeCtaBar3" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#3BB56D" /><stop offset="1" stop-color="#2563EB" /></linearGradient>
            </defs>
          </svg>
          <svg class="home-lp__cta-band-bars home-lp__cta-band-bars--right" viewBox="0 0 200 360" fill="none">
            <rect x="40" y="10" width="28" height="200" rx="14" transform="rotate(35 40 10)" fill="url(#homeCtaBarR1)" fill-opacity="0.08" />
            <rect x="90" y="50" width="22" height="170" rx="11" transform="rotate(35 90 50)" fill="url(#homeCtaBarR2)" fill-opacity="0.06" />
            <defs>
              <linearGradient id="homeCtaBarR1" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#059669" /><stop offset="1" stop-color="#3BB56D" /></linearGradient>
              <linearGradient id="homeCtaBarR2" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1E3A8A" /><stop offset="1" stop-color="#6366f1" /></linearGradient>
            </defs>
          </svg>
          <svg class="home-lp__cta-band-star home-lp__cta-band-star--1" :viewBox="ctaBandStarViewBox" fill="none">
            <path :d="ctaBandStarPath" fill="#3BB56D" fill-opacity="0.10" />
          </svg>
          <svg class="home-lp__cta-band-star home-lp__cta-band-star--2" :viewBox="ctaBandStarViewBox" fill="none">
            <path :d="ctaBandStarPath" fill="#ffffff" fill-opacity="0.04" />
          </svg>
        </div>
        <div class="home-lp__cta-band-icons" aria-hidden="true">
          <span class="home-lp__cta-band-icon home-lp__cta-band-icon--1">
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </span>
          <span class="home-lp__cta-band-icon home-lp__cta-band-icon--2">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </span>
          <span class="home-lp__cta-band-icon home-lp__cta-band-icon--3">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
          </span>
          <span class="home-lp__cta-band-icon home-lp__cta-band-icon--4">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <defs><linearGradient id="homeCtaIg" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#FCAF45"/><stop offset="30%" stop-color="#F77737"/><stop offset="60%" stop-color="#C13584"/><stop offset="100%" stop-color="#833AB4"/></linearGradient></defs>
              <path fill="url(#homeCtaIg)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
            </svg>
          </span>
          <span class="home-lp__cta-band-icon home-lp__cta-band-icon--5">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.57 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.38-6.22V9.4a8.16 8.16 0 0 0 3.84.96V7.06a4.85 4.85 0 0 1-1.59-.37z"/></svg>
          </span>
        </div>
        <div class="home-lp__cta-band-glow" aria-hidden="true"></div>
        <div class="home-lp__cta-dark-inner" v-reveal="{ type: 'scale' }">
          <h2 class="home-lp__cta-band-heading">Rastreie as vendas do WhatsApp, alimente Google &amp; Meta Ads com dados reais e aumente seu ROI</h2>
          <p class="home-lp__cta-band-relief">Você fecha isso em 30 minutos.</p>
          <p class="home-lp__cta-band-sub">Dados reais, decisões certeiras: atribua cada venda, turbine os algoritmos e faça seu dinheiro render mais</p>
          <a class="home-lp__cta-band-btn" :href="homeLandingLinks.signup" target="_blank" rel="noreferrer">
            <span>Comece agora grátis por 7 dias</span>
            <ArrowRight :size="18" class="home-lp__cta-band-btn-icon" />
          </a>
        </div>
        <div class="home-lp__cta-dark-fade" aria-hidden="true"></div>
      </section>

      <!-- ═══ PRICING ═══ -->
      <section class="home-lp__pricing-section">
        <div class="home-lp__pricing-inner">
          <h2>Escolha seu plano</h2>
          <p class="home-lp__pricing-sub">Selecione o plano ideal para o seu negócio</p>

          <div class="home-lp__cycle-toggle" role="tablist">
            <button
              type="button"
              :class="['home-lp__cycle-btn', { 'is-active': billingCycle === 'monthly' }]"
              @click="billingCycle = 'monthly'"
            >Mensal</button>
            <button
              type="button"
              :class="['home-lp__cycle-btn', { 'is-active': billingCycle === 'annual' }]"
              @click="billingCycle = 'annual'"
            >Anual</button>
            <span class="home-lp__discount-badge">Economize 20%</span>
          </div>

          <div class="home-lp__pricing-grid" v-reveal="{ type: 'staggerChildren' }">
            <BrandPricingCard
              v-for="plan in homeLandingPricingPlans"
              :key="plan.id"
              :icon="plan.icon"
              :name="plan.name"
              :description="plan.description"
              :price="planPrice(plan)"
              period="/mês"
              :billing-info="billingCycle === 'annual' ? 'Cobrado anualmente' : 'Pago mensalmente'"
              :features="plan.features"
              :cta-label="plan.cta"
              :cta-href="plan.ctaStyle === 'filled' ? homeLandingLinks.signup : (plan.id === 'premium' ? homeLandingLinks.contact : homeLandingLinks.signup)"
              :cta-style="plan.ctaStyle"
              :recommended="Boolean(plan.recommended)"
            />
          </div>
        </div>
      </section>

      <!-- ═══ TESTIMONIAL ═══ -->
      <section class="home-lp__testimonial-section">
        <div class="home-lp__testimonial-grafismo" aria-hidden="true">
          <svg class="home-lp__testimonial-star home-lp__testimonial-star--lg" :viewBox="ctaBandStarViewBox" fill="none">
            <path :d="ctaBandStarPath" fill="#010543" fill-opacity="0.07" />
          </svg>
          <svg class="home-lp__testimonial-star home-lp__testimonial-star--sm" :viewBox="ctaBandStarViewBox" fill="none">
            <path :d="ctaBandStarPath" fill="#3BB56D" fill-opacity="0.13" />
          </svg>
          <svg class="home-lp__testimonial-dots" viewBox="0 0 130 130" fill="none">
            <g fill="#010543" fill-opacity="0.12">
              <circle cx="5" cy="5" r="3"/><circle cx="35" cy="5" r="3"/><circle cx="65" cy="5" r="3"/><circle cx="95" cy="5" r="3"/><circle cx="125" cy="5" r="3"/>
              <circle cx="5" cy="35" r="3"/><circle cx="35" cy="35" r="3"/><circle cx="65" cy="35" r="3"/><circle cx="95" cy="35" r="3"/><circle cx="125" cy="35" r="3"/>
              <circle cx="5" cy="65" r="3"/><circle cx="35" cy="65" r="3"/><circle cx="65" cy="65" r="3"/><circle cx="95" cy="65" r="3"/><circle cx="125" cy="65" r="3"/>
              <circle cx="5" cy="95" r="3"/><circle cx="35" cy="95" r="3"/><circle cx="65" cy="95" r="3"/><circle cx="95" cy="95" r="3"/><circle cx="125" cy="95" r="3"/>
              <circle cx="5" cy="125" r="3"/><circle cx="35" cy="125" r="3"/><circle cx="65" cy="125" r="3"/><circle cx="95" cy="125" r="3"/><circle cx="125" cy="125" r="3"/>
            </g>
          </svg>
        </div>

        <div class="home-lp__testimonial-inner">
          <BrandTestimonialCard
            v-reveal="{ type: 'scale' }"
            :quote="homeLandingTestimonial.quote"
            :name="homeLandingTestimonial.name"
            :role="homeLandingTestimonial.role"
            :avatar-src="publicAsset(`img/landing/home/${homeLandingTestimonial.avatar}`)"
            :avatar-alt="homeLandingTestimonial.name"
            size="default"
          />
        </div>
      </section>

      <!-- ═══ FAQ ═══ -->
      <section class="home-lp__faq-section">
        <div class="home-lp__faq-inner">
          <div class="home-lp__faq-layout">
            <div class="home-lp__faq-intro" v-reveal="{ type: 'fadeLeft' }">
              <p class="home-lp__faq-badge">● FAQ</p>
              <h2>Perguntas frequentes</h2>
              <p>Aqui está tudo o que você precisa saber sobre o Adsmagic, desde os recursos até os primeiros passos.</p>

              <div class="home-lp__faq-contact">
                <span>Tem alguma dúvida específica?</span>
                <a class="home-lp__btn home-lp__btn--green home-lp__btn--sm home-lp__btn--pill" :href="homeLandingLinks.contact" target="_blank" rel="noreferrer">Fale conosco</a>
              </div>
            </div>

            <div class="home-lp__faq-list" v-reveal="{ type: 'fadeRight' }">
              <BrandFaqAccordion
                :items="homeLandingFaqs"
                variant="minimal"
                :default-open-index="0"
              />
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- ═══ FOOTER ═══ -->
    <footer class="home-lp__footer">
      <div class="home-lp__footer-inner">
        <div class="home-lp__footer-grid">
          <div class="home-lp__footer-left">
            <a class="home-lp__brand" href="#top" aria-label="Adsmagic home">
              <img :src="publicAsset('logo-wordmark.svg')" alt="Adsmagic" class="home-lp__brand-icon" />
            </a>

            <div class="home-lp__footer-contact">
              <span>contato@adsmagic.com.br</span>
            </div>

            <div class="home-lp__footer-social">
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X" class="home-lp__social-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" class="home-lp__social-link">
                <Linkedin :size="14" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube" class="home-lp__social-link">
                <Youtube :size="14" />
              </a>
            </div>
          </div>

          <div class="home-lp__footer-right">
            <div class="home-lp__footer-links">
              <a :href="homeLandingLinks.privacy" target="_blank" rel="noreferrer">Política de Privacidade</a>
              <a :href="homeLandingLinks.cookies" target="_blank" rel="noreferrer">Política de Cookies</a>
              <a :href="homeLandingLinks.terms" target="_blank" rel="noreferrer">Termos de Serviço</a>
            </div>
          </div>
        </div>

        <div class="home-lp__footer-bottom">
          <p class="home-lp__footer-copy">© 2026 Adsmagic Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
      /* ══════════════════════════════════════
         DESIGN TOKENS (from design.json)
         Color: #3BB56D (green), #010542 (navy)
         Font: Roboto, 300-800
         ══════════════════════════════════════ */

      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;800&display=swap');

      /* ── Reset ── */
      .home-lp {
        font-family: 'Roboto', sans-serif;
        color: #010542;
        background: #ffffff;
        overflow-x: clip;
        -webkit-font-smoothing: antialiased;
      }

      .home-lp *,
      .home-lp *::before,
      .home-lp *::after {
        box-sizing: border-box;
      }

      .home-lp a {
        text-decoration: none;
      }

      .home-lp a:not(.home-lp__btn):not(.home-lp__cta-band-btn) {
        color: inherit;
      }

      /* ══════════════════════════════════════
         SCROLL REVEAL — v-reveal directive
         ══════════════════════════════════════ */

      /* Base state — hidden before intersection */
      .rv {
        opacity: 0;
        transition:
          opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--rv-delay, 0s),
          transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--rv-delay, 0s);
      }

      .rv--fadeUp    { transform: translateY(52px); }
      .rv--fadeLeft  { transform: translateX(-56px); }
      .rv--fadeRight { transform: translateX(56px); }
      .rv--scale     { transform: scale(0.88); }
      .rv--fadeIn    { transform: none; }

      /* Revealed state */
      .rv.rv-in {
        opacity: 1;
        transform: none !important;
      }

      /* Stagger children animation */
      .rv--staggerChildren > * {
        opacity: 0;
        transform: translateY(36px);
        transition:
          opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
          transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .rv--staggerChildren.rv-in > *:nth-child(1) { opacity: 1; transform: none; transition-delay: 0s; }
      .rv--staggerChildren.rv-in > *:nth-child(2) { opacity: 1; transform: none; transition-delay: 0.1s; }
      .rv--staggerChildren.rv-in > *:nth-child(3) { opacity: 1; transform: none; transition-delay: 0.2s; }
      .rv--staggerChildren.rv-in > *:nth-child(4) { opacity: 1; transform: none; transition-delay: 0.3s; }
      .rv--staggerChildren.rv-in > *:nth-child(5) { opacity: 1; transform: none; transition-delay: 0.4s; }
      .rv--staggerChildren.rv-in > *:nth-child(6) { opacity: 1; transform: none; transition-delay: 0.5s; }

      /* Hero entrance — above fold, plays on load */
      .home-lp__hero-copy  { animation: rv-hero-left  0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both; }
      .home-lp__hero-visual { animation: rv-hero-right 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s  both; }

      @keyframes rv-hero-left {
        from { opacity: 0; transform: translateX(-48px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes rv-hero-right {
        from { opacity: 0; transform: translateX(48px); }
        to   { opacity: 1; transform: translateX(0); }
      }

      /* Reduce motion — respect user preference */
      @media (prefers-reduced-motion: reduce) {
        .rv, .rv--staggerChildren > * { transition: opacity 0.01s !important; transform: none !important; }
        .home-lp__hero-copy, .home-lp__hero-visual { animation: none; }
      }

      .home-lp img {
        display: block;
        max-width: 100%;
      }

      /* ── Shared button ── */
      .home-lp__btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        border: none;
        text-decoration: none;
        font-weight: 500;
        transition: all 220ms ease;
      }

      .home-lp__btn--green {
        background: #3BB56D;
        color: #ffffff;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 16px;
      }

      .home-lp__btn--green:hover {
        background: #2a9e58;
        transform: translateY(-1px);
        box-shadow: 0 14px 36px rgba(59, 181, 109, 0.3);
      }

      .home-lp__btn--lg {
        padding: 12px 24px;
        font-size: 16px;
      }

      .home-lp__btn--sm {
        padding: 10px 20px;
        font-size: 14px;
      }

      .home-lp__btn--full {
        width: 100%;
      }

      .home-lp__btn--outline {
        background: transparent;
        color: #3BB56D;
        border: 1px solid rgba(59, 181, 109, 0.45);
        border-radius: 8px;
        padding: 10px 20px;
        font-size: 14px;
      }

      .home-lp__btn--outline:hover {
        border-color: #3BB56D;
        color: #2a9e58;
        background: rgba(59, 181, 109, 0.08);
      }

      .home-lp__btn--pill {
        border-radius: 9999px;
        padding: 10px 22px;
        font-size: 14px;
      }

      /* ── Brand ── */
      .home-lp__brand {
        display: inline-flex;
        align-items: center;
        text-decoration: none;
      }

      .home-lp__brand-mark {
        height: 2rem;
        width: auto;
      }

      /* ══════════════════════════════════════
         CTA DARK
         ══════════════════════════════════════ */
      .home-lp__cta-dark {
        position: relative;
        background: linear-gradient(165deg, #010d2e 0%, #010543 35%, #020833 70%, #0a1628 100%);
        overflow: hidden;
      }

      .home-lp__cta-band-grafismo,
      .home-lp__cta-band-icons {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }

      .home-lp__cta-band-bars {
        position: absolute;
      }

      .home-lp__cta-band-bars--left {
        left: -12px;
        bottom: -72px;
        width: 220px;
        height: 360px;
      }

      .home-lp__cta-band-bars--right {
        top: -32px;
        right: 12px;
        width: 176px;
        height: 316px;
      }

      .home-lp__cta-band-star {
        position: absolute;
      }

      .home-lp__cta-band-star--1 {
        top: 56px;
        left: 14%;
        width: 76px;
        height: 72px;
      }

      .home-lp__cta-band-star--2 {
        right: 16%;
        bottom: 76px;
        width: 54px;
        height: 52px;
      }

      .home-lp__cta-band-icon {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }

      .home-lp__cta-band-icon--1 {
        width: 56px;
        height: 56px;
        top: 30%;
        left: 6%;
        animation: home-lp-cta-float-1 8s ease-in-out infinite;
      }

      .home-lp__cta-band-icon--2 {
        width: 48px;
        height: 48px;
        bottom: 15%;
        left: 12%;
        animation: home-lp-cta-float-2 9s ease-in-out 1s infinite;
      }

      .home-lp__cta-band-icon--3 {
        width: 56px;
        height: 56px;
        top: 35%;
        right: 6%;
        animation: home-lp-cta-float-3 7s ease-in-out 0.5s infinite;
      }

      .home-lp__cta-band-icon--4 {
        width: 44px;
        height: 44px;
        top: 10%;
        left: 25%;
        filter: blur(1px);
        opacity: 0.6;
        animation: home-lp-cta-float-4 10s ease-in-out 2s infinite;
      }

      .home-lp__cta-band-icon--5 {
        width: 40px;
        height: 40px;
        top: 12%;
        right: 15%;
        filter: blur(1px);
        opacity: 0.5;
        animation: home-lp-cta-float-1 11s ease-in-out 3s infinite;
      }

      .home-lp__cta-band-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 700px;
        height: 500px;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: radial-gradient(ellipse, rgba(59, 181, 109, 0.08) 0%, transparent 70%);
        pointer-events: none;
      }

      @keyframes home-lp-cta-float-1 {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-14px) rotate(3deg); }
      }

      @keyframes home-lp-cta-float-2 {
        0%, 100% { transform: translateY(0) translateX(0); }
        33% { transform: translateY(-10px) translateX(5px); }
        66% { transform: translateY(6px) translateX(-3px); }
      }

      @keyframes home-lp-cta-float-3 {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-12px) rotate(-2deg); }
      }

      @keyframes home-lp-cta-float-4 {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-8px) scale(1.04); }
      }

      .home-lp__cta-dark-inner {
        position: relative;
        z-index: 2;
        max-width: 860px;
        margin: 0 auto;
        padding: 88px 48px 96px;
        text-align: center;
      }

      .home-lp__cta-band-heading {
        margin: 0;
        font-size: 48px;
        font-weight: 700;
        line-height: 1.2;
        color: #ffffff;
      }

      .home-lp__cta-band-relief {
        margin: 20px 0 0;
        font-size: 24px;
        font-weight: 600;
        color: #3BB56D;
        letter-spacing: -0.01em;
      }

      .home-lp__cta-band-sub {
        margin: 12px auto 0;
        max-width: 620px;
        font-size: 18px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.74);
      }

      .home-lp__cta-band-btn {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-top: 32px;
        padding: 14px 32px;
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
        background: #3bb56d;
        border-radius: 8px;
        box-shadow: 0 2px 12px rgba(59, 181, 109, 0.25);
        transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
      }

      .home-lp__cta-band-btn:hover {
        background: #33a060;
        transform: translateY(-1px);
        box-shadow: 0 8px 26px rgba(59, 181, 109, 0.24);
      }

      .home-lp__cta-band-btn:hover .home-lp__cta-band-btn-icon {
        transform: translateX(4px);
      }

      .home-lp__cta-band-btn-icon {
        transition: transform 0.2s ease;
      }

      .home-lp__cta-dark-fade {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 120px;
        background: linear-gradient(to bottom, transparent, rgba(1, 5, 66, 0.92));
        pointer-events: none;
        z-index: 1;
      }

/* ══════════════════════════════════════
   HEADER
   ══════════════════════════════════════ */
.home-lp__header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: transparent;
  backdrop-filter: none;
  padding: 16px 24px 12px;
  transition: background 300ms ease, backdrop-filter 300ms ease, box-shadow 300ms ease;
}

.home-lp__header.is-stuck {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 1px 0 rgba(1, 5, 66, 0.07);
}

.home-lp__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 24px;
  border-radius: 20px;
  background: transparent;
  box-shadow: none;
}

.home-lp__nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.home-lp__nav .home-lp__btn {
  min-height: 40px;
  padding: 0 24px;
  line-height: 1.2;
}

.home-lp__nav-link {
  font-size: 14px;
  font-weight: 500;
  color: #010542;
  text-decoration: none;
  transition: color 180ms ease;
}

.home-lp__nav-link:hover {
  color: #3BB56D;
}

.home-lp__menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  padding: 8px;
  cursor: pointer;
  color: #010542;
}

.home-lp__mobile-sheet {
  display: grid;
  gap: 12px;
  padding: 16px 48px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.home-lp__mobile-sheet a {
  display: flex;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  color: #010542;
  text-decoration: none;
  font-weight: 500;
}

/* ══════════════════════════════════════
   HERO — Copy left, dashboard right
   ══════════════════════════════════════ */
.home-lp__hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 48px;
  row-gap: 0;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 48px 28px;
}

.home-lp__hero-copy {
  display: grid;
  gap: 18px;
  align-content: center;
  position: relative;
  z-index: 2;
}

.home-lp__tagline {
  margin: 0;
  color: #3BB56D;
  font-size: 24px;
  font-weight: 500;
  line-height: 1.4;
}

.home-lp__hero h1 {
  margin: 0;
  font-size: 54px;
  font-weight: 700;
  line-height: 1.12;
  color: #010542;
}

.home-lp__hero-cta {
  display: flex;
  width: 100%;
}

.home-lp__hero-cta .home-lp__btn {
  font-weight: 600;
  width: 100%;
  min-width: 0;
  padding-inline: 28px;
  border-radius: 12px;
}

.home-lp__hero-desc {
  margin: 0;
  font-size: 18px;
  line-height: 1.5;
  color: #637083;
}

.home-lp__partners {
  display: grid;
  gap: 8px;
  margin-top: 0;
  justify-items: center;
  text-align: center;
  width: fit-content;
  justify-self: center;
}

.home-lp__partners-label {
  font-size: 14px;
  font-weight: 500;
  color: #637083;
}

.home-lp__partners-logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}

.home-lp__partners-logos img + img {
  padding-left: 32px;
  border-left: 1px solid #c8cdd5;
}

.home-lp__partner-logo {
  height: 56px;
  width: auto;
  opacity: 0.85;
  transition: opacity 200ms ease;
}

.home-lp__partner-logo:hover {
  opacity: 1;
}

/* ── Hero visual ── */
.home-lp__hero-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  align-self: center;
  padding-top: 0;
  transform: none;
  overflow: visible;
  z-index: 1;
}

.home-lp__hero-grafismos {
  position: absolute;
  inset: -96px -132px -220px 24px;
  overflow: visible;
  pointer-events: none;
}

.home-lp__brand-bars {
  position: absolute;
  pointer-events: none;
}

.home-lp__brand-bars--top {
  top: -88px;
  right: -118px;
  width: 620px;
  height: 920px;
  opacity: 1;
  z-index: 0;
}

.home-lp__brand-bars--bottom {
  left: 74px;
  bottom: -146px;
  width: 470px;
  height: 740px;
  opacity: 0.96;
  z-index: 0;
}

.home-lp img.home-lp__hero-img {
  display: block;
  width: 172%;
  max-width: none;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 30px 80px rgba(1, 5, 66, 0.12);
  position: relative;
  z-index: 2;
}

/* ══════════════════════════════════════
   DO CLIQUE AO ROI
   ══════════════════════════════════════ */
.home-lp__flow-section {
  background: #edf2fa;
  padding: 80px 0;
}

.home-lp__flow-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
  text-align: center;
}

.home-lp__flow-inner .home-lp__tagline {
  text-align: center;
  margin-bottom: 8px;
  color: #010542;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.02em;
}

.home-lp__flow-inner h2 {
  margin: 0 0 24px;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  color: #010542;
}

.home-lp__flow-desc {
  max-width: 800px;
  margin: 0 auto 48px;
  font-size: 18px;
  line-height: 1.5;
  color: #637083;
}

.home-lp__flow-img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}

/* ══════════════════════════════════════
   FEATURES GRID
   ══════════════════════════════════════ */
.home-lp__features-section {
  padding: 80px 0;
}

.home-lp__features-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
}

.home-lp__features-head {
  text-align: center;
  margin-bottom: 48px;
}

.home-lp__features-head h2 {
  margin: 0 0 12px;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  color: #010542;
}

.home-lp__features-head p {
  margin: 0;
  font-size: 18px;
  color: #637083;
}

.home-lp__features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.home-lp__feature-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  border-radius: 16px;
  background: #edf2fa;
  border: 1px solid rgba(226, 232, 240, 0.6);
  transition: box-shadow 200ms ease, transform 200ms ease;
}

.home-lp__feature-card:hover {
  box-shadow: 0 20px 60px rgba(1, 5, 66, 0.08);
  transform: translateY(-2px);
}

.home-lp__feature-img-wrap {
  background: #edf2fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.home-lp__feature-img {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  aspect-ratio: 593 / 501;
  object-fit: contain;
  border-radius: 8px;
}

.home-lp__feature-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
}

.home-lp__feature-text h3 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.4;
  color: #010542;
}

.home-lp__feature-text p {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  color: #637083;
}

/* ══════════════════════════════════════
   PRICING
   ══════════════════════════════════════ */
.home-lp__pricing-section {
  padding: 80px 0;
}

.home-lp__pricing-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
  text-align: center;
}

.home-lp__pricing-inner > h2 {
  margin: 0 0 8px;
  font-size: 40px;
  font-weight: 800;
  color: #010542;
  line-height: 1.2;
}

.home-lp__pricing-sub {
  margin: 0 0 32px;
  font-size: 16px;
  color: #64748b;
}

.home-lp__cycle-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 8px;
  background: #f0fdf4;
  margin-bottom: 48px;
}

.home-lp__cycle-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 180ms ease;
}

.home-lp__cycle-btn.is-active {
  background: #3BB56D;
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(59, 181, 109, 0.25);
}

.home-lp__discount-badge {
  margin-left: 8px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: #3BB56D;
  background: rgba(59, 181, 109, 0.1);
}

/* Plans grid */
.home-lp__pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  text-align: left;
}

.home-lp__plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 32px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  transition: box-shadow 200ms ease, border-color 200ms ease;
}

.home-lp__plan-card.is-recommended {
  border: 2px solid #010542;
  box-shadow: 0 30px 80px rgba(1, 5, 66, 0.12);
}

.home-lp__plan-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 16px;
  border-radius: 20px;
  background: #010542;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.home-lp__plan-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.home-lp__plan-name {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 800;
  color: #010542;
}

.home-lp__plan-desc {
  margin: 0 0 24px;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.home-lp__plan-price {
  margin: 0 0 4px;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.home-lp__plan-currency {
  font-size: 20px;
  font-weight: 700;
  color: #010542;
}

.home-lp__plan-amount {
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
  color: #010542;
}

.home-lp__plan-period {
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
}

.home-lp__plan-billing {
  margin: 0 0 24px;
  font-size: 13px;
  color: #64748b;
}

.home-lp__plan-features {
  list-style: none;
  margin: 0 0 32px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.home-lp__plan-features li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #3a3f5f;
}

.home-lp__plan-features li svg {
  flex-shrink: 0;
}

.home-lp__plan-card .home-lp__btn {
  min-height: 54px;
  margin-top: auto;
  padding: 0 20px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

/* Navy button variants */
.home-lp__btn--navy {
  background: linear-gradient(180deg, #111a76 0%, #010542 100%);
  color: #ffffff;
  border: 2px solid #010542;
  box-shadow: 0 14px 28px rgba(1, 5, 66, 0.18);
}

.home-lp a.home-lp__btn--navy {
  color: #ffffff;
}

.home-lp__btn--navy:hover {
  background: #0a0f5c;
  border-color: #0a0f5c;
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(1, 5, 66, 0.24);
}

.home-lp__btn--outline-navy {
  background: #f8fafc;
  color: #010542;
  border: 2px solid #010542;
}

.home-lp a.home-lp__btn--outline-navy {
  color: #010542;
}

.home-lp__btn--outline-navy:hover {
  background: #010542;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(1, 5, 66, 0.14);
}

.home-lp a.home-lp__btn--outline-navy:hover {
  color: #ffffff;
}

/* ══════════════════════════════════════
   TESTIMONIAL
   ══════════════════════════════════════ */
.home-lp__testimonial-section {
  position: relative;
  overflow: hidden;
  padding: 96px 0;
  background: #fafafa;
}

.home-lp__testimonial-grafismo {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.home-lp__testimonial-inner {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  justify-content: center;
}

.home-lp__testimonial-card {
  position: relative;
  width: 100%;
  max-width: 760px;
  padding: 40px 42px 36px;
  border-radius: 24px;
  border: 1px solid #e6e6e6;
  background: #ffffff;
  text-align: left;
}

.home-lp__testimonial-quote-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 18px;
}

.home-lp__testimonial-quote {
  margin: 0;
  font-size: 20px;
  line-height: 1.9;
  color: #414e62;
  font-style: italic;
  font-weight: 400;
}

.home-lp__testimonial-author {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 28px;
}

.home-lp__testimonial-avatar {
  width: 52px;
  height: 52px;
  border-radius: 9999px;
  object-fit: cover;
  flex-shrink: 0;
}

.home-lp__testimonial-name,
.home-lp__testimonial-role {
  margin: 0;
}

.home-lp__testimonial-name {
  font-size: 16px;
  font-weight: 700;
  color: #010543;
}

.home-lp__testimonial-role {
  margin-top: 2px;
  font-size: 14px;
  color: #637083;
}

.home-lp__testimonial-star,
.home-lp__testimonial-dots {
  position: absolute;
}

.home-lp__testimonial-star--lg {
  top: -26px;
  right: 5%;
  width: 150px;
  height: 143px;
}

.home-lp__testimonial-star--sm {
  right: 8%;
  bottom: 12%;
  width: 64px;
  height: 61px;
}

.home-lp__testimonial-dots {
  left: 3%;
  bottom: 10%;
  width: 130px;
  height: 130px;
}

/* ══════════════════════════════════════
   FAQ
   ══════════════════════════════════════ */
.home-lp__faq-section {
  background: #ffffff;
  padding: 80px 0;
}

.home-lp__faq-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
}

.home-lp__faq-layout {
  display: grid;
  grid-template-columns: 0.4fr 0.6fr;
  gap: 48px;
  align-items: start;
}

.home-lp__faq-intro {
  display: grid;
  gap: 12px;
}

.home-lp__faq-badge {
  margin: 0;
  width: fit-content;
  padding: 6px 14px;
  border: 1px solid #d6dbe3;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
  color: #637083;
  background: #ffffff;
}

.home-lp__faq-intro h2 {
  margin: 0;
  font-size: 36px;
  font-weight: 500;
  line-height: 1.2;
  color: #010542;
}

.home-lp__faq-intro > p {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
  color: #666666;
}

.home-lp__faq-contact {
  display: grid;
  gap: 12px;
  margin-top: 12px;
  font-size: 18px;
  color: #666666;
  justify-items: start;
}

.home-lp__faq-contact a {
  font-weight: 700;
  text-decoration: none;
}

.home-lp__faq-contact a:hover {
  text-decoration: underline;
}

.home-lp__faq-list {
  display: grid;
  gap: 12px;
}

/* ══════════════════════════════════════
   FOOTER
   ══════════════════════════════════════ */
.home-lp__footer {
  background: #fdfffa;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
}

.home-lp__footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 72px 48px;
  display: grid;
  gap: 32px;
}

.home-lp__footer-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 48px;
  align-items: start;
}

.home-lp__footer-left {
  display: grid;
  gap: 16px;
}

.home-lp__brand-icon {
  height: 28px;
  width: auto;
}

.home-lp__footer-social {
  display: flex;
  gap: 12px;
}

.home-lp__social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3BB56D;
  color: #ffffff;
  text-decoration: none;
  transition: background 180ms ease;
}

.home-lp__social-link:hover {
  background: #2a9e58;
}

.home-lp__footer-right .home-lp__footer-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.home-lp__footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.home-lp__footer-contact {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666666;
}

.home-lp__footer-bottom {
  padding-top: 24px;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
}

.home-lp__footer-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.home-lp__footer-links a {
  font-size: 14px;
  line-height: 1.2;
  color: #666666;
  text-decoration: none;
}

.home-lp__footer-links a:hover {
  color: #3BB56D;
}

.home-lp__footer-copy {
  margin: 0;
  font-size: 12px;
  line-height: 1.2;
  font-weight: 500;
  color: #666666;
}

/* ══════════════════════════════════════
   TRANSITIONS
   ══════════════════════════════════════ */
.home-lp-fade-enter-active,
.home-lp-fade-leave-active,
.home-lp-faq-enter-active,
.home-lp-faq-leave-active {
  transition: all 200ms ease;
}

.home-lp-fade-enter-from,
.home-lp-fade-leave-to,
.home-lp-faq-enter-from,
.home-lp-faq-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ══════════════════════════════════════
   RESPONSIVE
   ══════════════════════════════════════ */
@media (max-width: 1080px) {
  .home-lp__hero {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 48px 24px 56px;
  }

  .home-lp__hero h1 {
    font-size: 40px;
  }

  .home-lp img.home-lp__hero-img {
    width: 100%;
    max-width: 100%;
    border-radius: 12px;
  }

  .home-lp__hero-visual {
    padding-top: 24px;
    transform: none;
  }

  .home-lp__partners {
    justify-items: center;
    text-align: center;
    width: 100%;
  }

  .home-lp__partners-logos {
    justify-content: center;
  }

  .home-lp__hero-grafismos {
    inset: -48px -60px -120px 6px;
  }

  .home-lp__brand-bars--top {
    top: -24px;
    right: -42px;
    width: 382px;
    height: 588px;
  }

  .home-lp__brand-bars--bottom {
    left: 38px;
    bottom: -84px;
    width: 308px;
    height: 482px;
  }

  .home-lp__flow-inner h2,
  .home-lp__features-head h2,
  .home-lp__cta-dark h2,
  .home-lp__pricing-inner > h2,
  .home-lp__faq-intro h2 {
    font-size: 32px;
  }

  .home-lp__pricing-grid {
    grid-template-columns: 1fr;
    max-width: 420px;
    margin: 0 auto;
  }

  .home-lp__testimonial-inner {
    padding: 0 24px;
  }

  .home-lp__testimonial-card {
    max-width: 720px;
  }

  .home-lp__testimonial-quote {
    font-size: 18px;
    line-height: 1.75;
  }

  .home-lp__faq-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .home-lp__header {
    padding: 10px 10px 0;
  }

  .home-lp__nav {
    padding: 10px 16px;
    border-radius: 16px;
  }

  .home-lp__nav-actions {
    display: none;
  }

  .home-lp__menu-toggle {
    display: inline-flex;
  }

  .home-lp__mobile-sheet {
    padding: 12px 20px 20px;
  }

  .home-lp__hero {
    padding: 32px 20px 40px;
  }

  .home-lp__hero h1 {
    font-size: 32px;
  }

  .home-lp__hero-desc {
    max-width: none;
  }

  .home-lp__tagline {
    font-size: 18px;
  }

  .home-lp__hero-cta .home-lp__btn {
    width: 100%;
    min-width: 0;
  }

  .home-lp__partners-logos {
    gap: 20px;
  }

  .home-lp__partners-logos img + img {
    padding-left: 20px;
  }

  .home-lp__partner-logo {
    height: 48px;
  }

  .home-lp__flow-inner,
  .home-lp__features-inner,
  .home-lp__cta-dark-inner,
  .home-lp__pricing-inner,
  .home-lp__faq-inner,
  .home-lp__footer-inner {
    padding-left: 20px;
    padding-right: 20px;
  }

  .home-lp__features-grid {
    grid-template-columns: 1fr;
  }

  .home-lp__feature-card {
    grid-template-columns: 1fr;
  }

  .home-lp__plan-amount {
    font-size: 36px;
  }

  .home-lp__pricing-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }

  .home-lp__testimonial-section {
    padding: 72px 0;
  }

  .home-lp__testimonial-inner {
    padding: 0 20px;
  }

  .home-lp__testimonial-card {
    padding: 28px 24px 24px;
    border-radius: 20px;
  }

  .home-lp__testimonial-quote {
    font-size: 17px;
    line-height: 1.7;
  }

  .home-lp__testimonial-author {
    margin-top: 24px;
  }

  .home-lp__testimonial-star--lg {
    top: -18px;
    right: -18px;
    width: 104px;
    height: 100px;
  }

  .home-lp__testimonial-star--sm {
    right: 6%;
    bottom: 8%;
    width: 48px;
    height: 46px;
  }

  .home-lp__testimonial-dots {
    left: -12px;
    bottom: 8%;
    width: 92px;
    height: 92px;
  }

  .home-lp__footer-top {
    flex-direction: column;
    align-items: start;
  }

  .home-lp__footer-bottom {
    flex-direction: column;
    align-items: start;
  }

  .home-lp__cta-dark h2 {
    font-size: 28px;
  }

  .home-lp__cta-band-icons,
  .home-lp__cta-band-grafismo {
    display: none;
  }

  .home-lp__hero-grafismos,
  .home-lp__brand-bars--bottom {
    display: none;
  }
}
</style>
