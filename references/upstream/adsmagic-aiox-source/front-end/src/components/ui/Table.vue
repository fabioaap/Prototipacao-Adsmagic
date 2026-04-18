<script setup lang="ts">
// DEPRECATED: Use components from @/components/ui/table/ instead
// This file exists only for backward compatibility during migration
import TableLegacy from './TableLegacy.vue'
</script>

<template>
  <TableLegacy>
    <slot name="head" />
    <slot />
  </TableLegacy>
</template>
