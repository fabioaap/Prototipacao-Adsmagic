<script setup lang="ts">
import { ShieldCheck, BarChart3, Search, TrendingUp, ArrowRight, Zap, MessageSquare, Target } from 'lucide-vue-next'

const valueProps = [
  {
    icon: ShieldCheck,
    title: 'Prova de receita',
    desc: 'Mostre qual campanha gerou proposta, aprovação e venda — não apenas lead.'
  },
  {
    icon: BarChart3,
    title: 'Otimização com sinal real',
    desc: 'Envie eventos qualificados para Meta e Google Ads, no estágio certo do funil.'
  },
  {
    icon: Search,
    title: 'Diagnóstico de funil',
    desc: 'Identifique se o gargalo está na campanha, no atendimento ou no fechamento.'
  },
  {
    icon: TrendingUp,
    title: 'Diferenciação comercial',
    desc: 'Enquanto outras agências reportam CPL, a sua conversa sobre venda e receita.'
  }
]

const steps = [
  { icon: Target, label: 'Ads', desc: 'Captura a origem via UTM e identifica campanha, conjunto e criativo.' },
  { icon: MessageSquare, label: 'WhatsApp', desc: 'Acompanha a conversa e classifica estágios: lead, proposta, aprovação, venda.' },
  { icon: Zap, label: 'Fechamento', desc: 'Devolve sinais qualificados para as plataformas e mapeia gargalos do funil.' }
]
</script>

<template>
  <div class="deck-page">
    <!-- Page 1 -->
    <section class="deck-sheet">
      <!-- Header -->
      <header class="deck-header">
        <div class="deck-logo">
          <span class="logo-icon">✦</span>
          <span class="logo-text">Adsmagic</span>
        </div>
        <div class="deck-badge">One-Pager Comercial</div>
      </header>

      <!-- Hero -->
      <div class="deck-hero">
        <h1>Pare de reportar lead.<br /><span class="hero-accent">Comece a provar venda.</span></h1>
        <p class="hero-sub">
          O Adsmagic conecta Ads, WhatsApp e fechamento para que sua agência mostre
          o que realmente gera proposta, aprovação e venda.
        </p>
      </div>

      <!-- Problem -->
      <div class="deck-section">
        <h2 class="section-label">O problema</h2>
        <div class="problem-grid">
          <div class="problem-item">
            <span class="problem-num">1</span>
            <p><strong>Otimização cega</strong> — campanhas otimizam para lead sem saber quem realmente compra.</p>
          </div>
          <div class="problem-item">
            <span class="problem-num">2</span>
            <p><strong>CPL enganoso</strong> — CPL baixo pode esconder campanhas que não geram receita nenhuma.</p>
          </div>
          <div class="problem-item">
            <span class="problem-num">3</span>
            <p><strong>Escala travada</strong> — ao aumentar budget, o resultado piora por falta de feedback real.</p>
          </div>
          <div class="problem-item">
            <span class="problem-num">4</span>
            <p><strong>Funil opaco</strong> — o WhatsApp vira caixa preta entre conversa e fechamento.</p>
          </div>
        </div>
      </div>

      <!-- Value Props -->
      <div class="deck-section">
        <h2 class="section-label">O que sua agência ganha</h2>
        <div class="value-grid">
          <div v-for="vp in valueProps" :key="vp.title" class="value-card">
            <component :is="vp.icon" :size="20" class="value-icon" />
            <div>
              <strong>{{ vp.title }}</strong>
              <p>{{ vp.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Mechanism -->
      <div class="deck-section">
        <h2 class="section-label">Como funciona</h2>
        <div class="mechanism-row">
          <div v-for="(step, i) in steps" :key="step.label" class="mechanism-step">
            <div class="step-header">
              <component :is="step.icon" :size="18" />
              <span class="step-label">{{ step.label }}</span>
            </div>
            <p class="step-desc">{{ step.desc }}</p>
            <ArrowRight v-if="i < steps.length - 1" :size="16" class="step-arrow" />
          </div>
        </div>
      </div>

      <!-- Anti-category + Pricing + CTA -->
      <div class="deck-bottom">
        <div class="anti-block">
          <h3>O que o Adsmagic <strong>não</strong> é</h3>
          <div class="anti-pills">
            <span>Não é CRM completo</span>
            <span>Não é chatbot</span>
            <span>Não é automação ampla</span>
            <span>Não é tracker genérico</span>
          </div>
        </div>

        <div class="cta-block">
          <div class="pricing-badge">
            <span class="price-label">A partir de</span>
            <span class="price-value">R$ 147<small>/mês</small></span>
          </div>
          <a href="#" class="cta-button">
            Agende uma demo diagnóstica
            <ArrowRight :size="16" />
          </a>
        </div>
      </div>

      <!-- Footer -->
      <footer class="deck-footer">
        <span>Adsmagic — Plataforma de atribuição, inteligência e envio de conversões</span>
        <span>adsmagic.com.br</span>
      </footer>
    </section>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* ── Reset & Page ── */
.deck-page {
  min-height: 100vh;
  background: hsl(var(--background));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'Inter', system-ui, sans-serif;
  color: #e2e2e8;
}

.deck-sheet {
  width: 210mm;
  min-height: 297mm;
  background: linear-gradient(180deg, hsl(217.2 32.6% 10%) 0%, hsl(var(--background)) 100%);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 12px;
  padding: 2.4rem 2.8rem;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  box-shadow: 0 0 80px rgba(99, 102, 241, 0.08);
}

/* ── Header ── */
.deck-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.deck-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 1.4rem;
  color: #6366f1;
}

.logo-text {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 1.3rem;
  color: #fff;
}

.deck-badge {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(99, 102, 241, 0.7);
  border: 1px solid rgba(99, 102, 241, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
}

/* ── Hero ── */
.deck-hero {
  text-align: center;
  padding: 1rem 0 0.4rem;
}

.deck-hero h1 {
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 1.8rem;
  line-height: 1.2;
  color: #fff;
  margin: 0 0 0.6rem;
}

.hero-accent {
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 50%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-sub {
  font-size: 0.88rem;
  line-height: 1.5;
  color: rgba(226, 226, 232, 0.7);
  max-width: 520px;
  margin: 0 auto;
}

/* ── Sections ── */
.deck-section {
  flex-shrink: 0;
}

.section-label {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6366f1;
  margin: 0 0 0.6rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid rgba(99, 102, 241, 0.15);
}

/* ── Problem Grid ── */
.problem-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.problem-item {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  padding: 0.5rem 0.6rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
}

.problem-num {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
}

.problem-item p {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.45;
  color: rgba(226, 226, 232, 0.75);
}

.problem-item strong {
  color: #fff;
}

/* ── Value Grid ── */
.value-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.value-card {
  display: flex;
  gap: 0.5rem;
  padding: 0.55rem 0.6rem;
  background: rgba(99, 102, 241, 0.04);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 8px;
}

.value-icon {
  flex-shrink: 0;
  color: #6366f1;
  margin-top: 2px;
}

.value-card strong {
  display: block;
  font-size: 0.78rem;
  color: #fff;
  margin-bottom: 0.15rem;
}

.value-card p {
  margin: 0;
  font-size: 0.7rem;
  line-height: 1.4;
  color: rgba(226, 226, 232, 0.65);
}

/* ── Mechanism ── */
.mechanism-row {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0.4rem;
}

.mechanism-step {
  flex: 1;
  max-width: 200px;
  padding: 0.6rem;
  background: rgba(99, 102, 241, 0.04);
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 8px;
  position: relative;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #818cf8;
  margin-bottom: 0.3rem;
}

.step-label {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  color: #fff;
}

.step-desc {
  font-size: 0.68rem;
  line-height: 1.4;
  color: rgba(226, 226, 232, 0.6);
  margin: 0;
}

.step-arrow {
  position: absolute;
  right: -14px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(99, 102, 241, 0.4);
}

/* ── Bottom ── */
.deck-bottom {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: auto;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(99, 102, 241, 0.1);
}

.anti-block {
  flex: 1;
}

.anti-block h3 {
  font-size: 0.75rem;
  color: rgba(226, 226, 232, 0.5);
  margin: 0 0 0.4rem;
  font-weight: 500;
}

.anti-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.anti-pills span {
  font-size: 0.62rem;
  font-weight: 500;
  color: rgba(226, 226, 232, 0.5);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0.2rem 0.5rem;
  border-radius: 100px;
}

.cta-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.pricing-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.price-label {
  font-size: 0.62rem;
  color: rgba(226, 226, 232, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.price-value {
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  font-size: 1.6rem;
  color: #fff;
}

.price-value small {
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(226, 226, 232, 0.5);
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.2rem;
  background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}

.cta-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 28px rgba(99, 102, 241, 0.4);
}

/* ── Footer ── */
.deck-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 0.6rem;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 0.6rem;
  color: rgba(226, 226, 232, 0.3);
}

/* ── Print ── */
@media print {
  .deck-page {
    background: #fff;
    padding: 0;
  }

  .deck-sheet {
    width: 100%;
    min-height: auto;
    border: none;
    border-radius: 0;
    box-shadow: none;
    background: #fff;
    color: #1a1a2e;
    padding: 1.5cm;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .deck-hero h1 {
    color: #1a1a2e;
  }

  .hero-accent {
    -webkit-text-fill-color: #6366f1;
    color: #6366f1;
  }

  .hero-sub {
    color: #4a4a5a;
  }

  .section-label {
    color: #6366f1;
    border-bottom-color: #e5e5ea;
  }

  .problem-item {
    background: #f8f8fa;
    border-color: #e5e5ea;
  }

  .problem-item p {
    color: #4a4a5a;
  }

  .problem-item strong {
    color: #1a1a2e;
  }

  .value-card {
    background: #eef2ff;
    border-color: #e5e5ea;
  }

  .value-card strong {
    color: #1a1a2e;
  }

  .value-card p {
    color: #4a4a5a;
  }

  .mechanism-step {
    background: #eef2ff;
    border-color: #e5e5ea;
  }

  .step-label {
    color: #1a1a2e;
  }

  .step-desc {
    color: #4a4a5a;
  }

  .anti-block h3 {
    color: #6a6a7a;
  }

  .anti-pills span {
    color: #6a6a7a;
    border-color: #d5d5da;
    background: #f0f0f3;
  }

  .price-value {
    color: #1a1a2e;
  }

  .cta-button {
    box-shadow: none;
  }

  .deck-footer {
    border-top-color: #e5e5ea;
    color: #9a9aaa;
  }

  .deck-bottom {
    border-top-color: #e5e5ea;
  }
}

/* ── Mobile ── */
@media screen and (max-width: 640px) {
  .deck-page {
    padding: 1rem;
  }

  .deck-sheet {
    width: 100%;
    min-height: auto;
    padding: 1.5rem;
  }

  .deck-hero h1 {
    font-size: 1.4rem;
  }

  .problem-grid,
  .value-grid {
    grid-template-columns: 1fr;
  }

  .mechanism-row {
    flex-direction: column;
    align-items: stretch;
  }

  .mechanism-step {
    max-width: none;
  }

  .step-arrow {
    display: none;
  }

  .deck-bottom {
    flex-direction: column;
    text-align: center;
  }
}
</style>
