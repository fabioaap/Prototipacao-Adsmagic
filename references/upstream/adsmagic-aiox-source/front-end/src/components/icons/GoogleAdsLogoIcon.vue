<script setup lang="ts">
interface Props {
  size?: number | string
}

withDefaults(defineProps<Props>(), {
  size: 20,
})
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    aria-hidden="true"
    class="inline-block shrink-0 align-middle"
    :style="{
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
    }"
  >
    <!-- Google Ads triangle logo -->
    <path d="M5.888 166.101l57.6-99.773c12.8-22.186 41.267-29.78 63.52-16.96 22.253 12.82 29.867 41.24 17.067 63.426l-57.6 99.773c-12.8 22.187-41.267 29.78-63.52 16.96-22.187-12.82-29.867-41.24-17.067-63.426z" fill="#FBBC04"/>
    <path d="M250.112 166.101l-57.6-99.773c-12.8-22.186-41.267-29.78-63.52-16.96-22.253 12.82-29.867 41.24-17.067 63.426l57.6 99.773c12.8 22.187 41.267 29.78 63.52 16.96 22.187-12.82 29.867-41.24 17.067-63.426z" fill="#4285F4"/>
    <circle cx="34.56" cy="218.027" r="34.56" fill="#34A853"/>
  </svg>
</template>