<script setup lang="ts">
interface Props {
  quote: string
  name: string
  role: string
  avatarSrc: string
  avatarAlt?: string
  size?: 'default' | 'compact'
}

const props = withDefaults(defineProps<Props>(), {
  avatarAlt: undefined,
  size: 'default',
})
</script>

<template>
  <article class="brand-testimonial-card" :class="[`is-${props.size}`]">
    <svg class="brand-testimonial-card__quote-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M6 18h6l-4 8H4l4-8H6a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H6Zm16 0h6l-4 8h-4l4-8h-2a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-4Z" fill="#3BB56D" fill-opacity="0.12" />
    </svg>

    <p class="brand-testimonial-card__quote">
      &ldquo;{{ props.quote }}&rdquo;
    </p>

    <div class="brand-testimonial-card__author">
      <img class="brand-testimonial-card__avatar" :src="props.avatarSrc" :alt="props.avatarAlt ?? props.name" loading="lazy" />
      <div>
        <p class="brand-testimonial-card__name">{{ props.name }}</p>
        <p class="brand-testimonial-card__role">{{ props.role }}</p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.brand-testimonial-card {
  position: relative;
  width: 100%;
  border-radius: 24px;
  border: 1px solid #e6e6e6;
  background: #ffffff;
  text-align: left;
}

.brand-testimonial-card.is-default {
  max-width: 760px;
  padding: 40px 42px 36px;
}

.brand-testimonial-card.is-compact {
  max-width: 600px;
  padding: 2.5rem 2rem;
}

.brand-testimonial-card__quote-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 18px;
}

.brand-testimonial-card__quote {
  margin: 0;
  color: #414e62;
  font-style: italic;
  font-weight: 400;
}

.brand-testimonial-card.is-default .brand-testimonial-card__quote {
  font-size: 20px;
  line-height: 1.9;
}

.brand-testimonial-card.is-compact .brand-testimonial-card__quote {
  font-size: 1.125rem;
  line-height: 1.7;
}

.brand-testimonial-card__author {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 28px;
}

.brand-testimonial-card.is-compact .brand-testimonial-card__author {
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.brand-testimonial-card__avatar {
  border-radius: 9999px;
  object-fit: cover;
  flex-shrink: 0;
}

.brand-testimonial-card.is-default .brand-testimonial-card__avatar {
  width: 52px;
  height: 52px;
}

.brand-testimonial-card.is-compact .brand-testimonial-card__avatar {
  width: 2.75rem;
  height: 2.75rem;
}

.brand-testimonial-card__name,
.brand-testimonial-card__role {
  margin: 0;
}

.brand-testimonial-card__name {
  font-size: 16px;
  font-weight: 700;
  color: #010543;
}

.brand-testimonial-card.is-compact .brand-testimonial-card__name {
  font-size: 1rem;
  font-weight: 600;
}

.brand-testimonial-card__role {
  margin-top: 2px;
  font-size: 14px;
  color: #637083;
}

@media (max-width: 767px) {
  .brand-testimonial-card.is-default,
  .brand-testimonial-card.is-compact {
    padding: 24px;
  }

  .brand-testimonial-card.is-default .brand-testimonial-card__quote,
  .brand-testimonial-card.is-compact .brand-testimonial-card__quote {
    font-size: 1rem;
    line-height: 1.75;
  }
}
</style>