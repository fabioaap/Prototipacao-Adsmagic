<script setup lang="ts">
import { RefreshCw, Settings2 } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import Tabs from '@/components/ui/Tabs.vue'
import TabsList from '@/components/ui/TabsList.vue'
import TabsTrigger from '@/components/ui/TabsTrigger.vue'
import TabsContent from '@/components/ui/TabsContent.vue'
import AdsMetricsTable from '@/components/campaigns/AdsMetricsTable.vue'
import AdsIndicatorsConfigDrawer from '@/components/campaigns/AdsIndicatorsConfigDrawer.vue'
import CampaignsFiltersBar from '@/components/campaigns/CampaignsFiltersBar.vue'
import CampaignsBreadcrumb from '@/components/campaigns/CampaignsBreadcrumb.vue'
import MetaAdsLogoIcon from '@/components/icons/MetaAdsLogoIcon.vue'
import { useMetaAdsPerformance } from '@/composables/campaigns/useMetaAdsPerformance'
import {
  BASE_INDICATOR_OPTIONS,
  CUSTOM_INDICATOR_OPTIONS,
} from '@/views/campaigns/config/tableColumns'
import type { AdsTableRow } from '@/components/campaigns/AdsMetricsTable.vue'

const {
  activeTab,
  filterState,
  filterStartDate,
  filterEndDate,
  hierarchySelection,
  isConfigDrawerOpen,
  isConfigSaving,
  isLoading,
  errorMessage,
  rowsByLevel,
  sortStateByLevel,
  currentConfigState,
  customMetricDefinitions,
  stageOptions,
  getColumnsForLevel,
  refreshActiveLevel,
  handleSort,
  saveTableConfig,
  selectCampaign,
  selectAdset,
  clearHierarchyFilter,
  navigateBackToLevel,
  handlePeriodChange,
  handleDateRangeChange,
  handleCompareToggle,
  handleFilterStartDateUpdate,
  handleFilterEndDateUpdate,
} = useMetaAdsPerformance()

function handleCampaignRowClick(row: AdsTableRow) {
  const name = typeof row.name === 'string' ? row.name : String(row.name ?? '')
  selectCampaign(row.id, name)
}

function handleAdsetRowClick(row: AdsTableRow) {
  const name = typeof row.name === 'string' ? row.name : String(row.name ?? '')
  selectAdset(row.id, name)
}
</script>

<template>
  <AppLayout>
    <div class="page-shell section-stack-md">
      <PageHeader
        title="Meta Ads"
        description="Acompanhe campanhas, grupos de anúncio e anúncios com dados de mídia + atribuição de contatos e vendas."
      >
        <template #title>
          <MetaAdsLogoIcon :size="28" />
          <span>Meta Ads</span>
        </template>
      </PageHeader>

      <CampaignsFiltersBar
        :period="filterState.period"
        :start-date="filterStartDate"
        :end-date="filterEndDate"
        :compare="filterState.compare"
        :loading="isLoading"
        @period-change="handlePeriodChange"
        @date-range-change="handleDateRangeChange"
        @compare-toggle="handleCompareToggle"
        @update:start-date="handleFilterStartDateUpdate"
        @update:end-date="handleFilterEndDateUpdate"
      >
        <template #actions>
          <Button variant="outline" :loading="isLoading" @click="refreshActiveLevel">
            <RefreshCw class="h-4 w-4 mr-2" />
            Atualizar
          </Button>

          <Button variant="outline" @click="isConfigDrawerOpen = true">
            <Settings2 class="h-4 w-4 mr-2" />
            Configurar indicadores
          </Button>
        </template>
      </CampaignsFiltersBar>

      <CampaignsBreadcrumb
        :selection="hierarchySelection"
        :active-tab="activeTab"
        @navigate="navigateBackToLevel"
        @clear="clearHierarchyFilter"
      />

      <div
        v-if="errorMessage"
        class="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        {{ errorMessage }}
      </div>

      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="campaign" class="min-w-0 px-2 text-xs sm:px-3 sm:text-sm">
            Campanha
          </TabsTrigger>
          <TabsTrigger
            value="adset"
            class="min-w-0 px-2 text-xs sm:px-3 sm:text-sm"
            aria-label="Grupo de anúncio"
          >
            <span class="sm:hidden">Grupo</span>
            <span class="hidden sm:inline">Grupo de anúncio</span>
          </TabsTrigger>
          <TabsTrigger value="ad" class="min-w-0 px-2 text-xs sm:px-3 sm:text-sm">
            Anúncios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaign">
          <AdsMetricsTable
            :columns="getColumnsForLevel('campaign')"
            :rows="rowsByLevel.campaign"
            :loading="isLoading && activeTab === 'campaign'"
            :sort-by="sortStateByLevel.campaign.sortBy"
            :sort-direction="sortStateByLevel.campaign.sortDirection"
            :selectable="true"
            @sort="(columnId) => handleSort('campaign', columnId)"
            @row-click="handleCampaignRowClick"
          />
        </TabsContent>

        <TabsContent value="adset">
          <AdsMetricsTable
            :columns="getColumnsForLevel('adset')"
            :rows="rowsByLevel.adset"
            :loading="isLoading && activeTab === 'adset'"
            :sort-by="sortStateByLevel.adset.sortBy"
            :sort-direction="sortStateByLevel.adset.sortDirection"
            :selectable="true"
            @sort="(columnId) => handleSort('adset', columnId)"
            @row-click="handleAdsetRowClick"
          />
        </TabsContent>

        <TabsContent value="ad">
          <AdsMetricsTable
            :columns="getColumnsForLevel('ad')"
            :rows="rowsByLevel.ad"
            :loading="isLoading && activeTab === 'ad'"
            :sort-by="sortStateByLevel.ad.sortBy"
            :sort-direction="sortStateByLevel.ad.sortDirection"
            @sort="(columnId) => handleSort('ad', columnId)"
          />
        </TabsContent>
      </Tabs>

      <AdsIndicatorsConfigDrawer
        :open="isConfigDrawerOpen"
        :base-options="BASE_INDICATOR_OPTIONS"
        :custom-options="CUSTOM_INDICATOR_OPTIONS"
        :selected-column-ids="currentConfigState.selectedColumnIds"
        :column-order="currentConfigState.columnOrder"
        :saving="isConfigSaving"
        :stages="stageOptions"
        :custom-metrics="customMetricDefinitions"
        @update:open="isConfigDrawerOpen = $event"
        @save="saveTableConfig"
      />
    </div>
  </AppLayout>
</template>
