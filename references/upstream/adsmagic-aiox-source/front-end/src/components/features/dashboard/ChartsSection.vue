<script setup lang="ts">
import SalesByOriginChart from './SalesByOriginChart.vue'
import RevenueByOriginChart from './RevenueByOriginChart.vue'
import ContactsSalesLineChart from './ContactsSalesLineChart.vue'
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SalesByOriginChart />
      <RevenueByOriginChart />
    </div>
    
    <ContactsSalesLineChart />
  </div>
</template>
