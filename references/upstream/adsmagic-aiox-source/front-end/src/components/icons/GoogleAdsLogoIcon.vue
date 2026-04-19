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
    :width="size"
    :height="size"
    viewBox="0 0 192 192"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <!-- Google Ads triangle logo -->
    <path
      d="M133.559 57.992L68.445 170.09c-8.614 14.844-27.69 19.906-42.607 11.318C11.079 172.788 5.973 153.764 14.547 138.882l65.103-112.093c8.588-14.847 27.664-19.909 42.58-11.322 14.906 8.618 19.939 27.629 11.329 42.525z"
      fill="#FBBC04"
    />
    <path
      d="M177.453 138.882l-65.114 112.098c-8.574 14.882-27.664 19.911-42.58 11.323-14.906-8.618-19.939-27.629-11.329-42.525l65.103-112.093c8.588-14.847 27.664-19.909 42.58-11.322 14.949 8.587 20.009 27.661 11.34 42.519z"
      fill="#4285F4"
    />
    <circle cx="28" cy="164" r="24" fill="#34A853" />
  </svg>
</template>
