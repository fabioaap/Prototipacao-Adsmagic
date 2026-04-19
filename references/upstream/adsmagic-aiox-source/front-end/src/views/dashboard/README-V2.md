# Dashboard V2

## Overview

Dashboard V2 is a complete redesign of the dashboard following the PRD requirements. It focuses on:

1. **Reducing information overload** - Only 5 North Star KPIs in the first fold
2. **Actionable insights** - Smart alerts that guide users to specific issues
3. **Efficient drill-down** - Click on any metric to see detailed breakdowns
4. **Clear empty states** - Contextual messages with clear CTAs
5. **Full accessibility** - Keyboard navigation, ARIA labels, and no color-only indicators

## Architecture

### Store (`stores/dashboardV2.ts`)
- Manages global filters (period, compare, origin, view mode)
- Persists filter state to localStorage
- Handles drill-down drawer state
- Auto-reloads data when project changes

### Service (`services/api/dashboardV2.ts`)
- Provides RPC stubs for backend aggregations
- Falls back to mock data for development
- Methods:
  - `getSummary()` - North Star KPIs + insights
  - `getFunnelStats()` - Conversion funnel metrics
  - `getPipelineStats()` - Sales pipeline stages
  - `getOriginBreakdown()` - Performance by channel
  - `getTimeSeries()` - Historical data for charts
  - `getDrillDownEntities()` - Filtered contacts/deals

### Components

#### Core Components
- **KpiCard** - Displays metric with delta, tooltip, and trend indicator
- **DashboardFiltersBar** - Global filters (period, origin, compare toggle)
- **InsightsRow** - Actionable alert chips (clickable)
- **EmptyState** - Contextual empty states with CTAs

#### Diagnostic Panels
- **AcquisitionPanel** - Mini metrics (impressions, clicks, CTR, CPC)
- **FunnelPanel** - Conversion funnel with clickable stages
- **PipelinePanel** - Sales stages with time and value metrics

#### Detail Views
- **OriginPerformanceTable** - Sortable table with drill-down
- **PerformanceChart** - Time series with ApexCharts
- **EntityListDrawer** - Slide-out list for drill-down details

## Usage

### Accessing Dashboard V2

Navigate to: `/:locale/projects/:projectId/dashboard-v2`

Example: `/pt/projects/abc123/dashboard-v2`

### Filter Persistence

Filters are automatically saved to localStorage with key:
```
adsmagic_dashboard_v2_filters
```

This includes:
- Selected period (7d, 30d, 90d, custom)
- Compare toggle state
- Selected origin filter
- View mode preference

### View Modes

Dashboard supports 4 view modes (future enhancement):
- **Executivo** - Focus on ROI, revenue, and high-level metrics
- **Marketing** - Emphasis on acquisition metrics (CTR, CPC, impressions)
- **Comercial** - Sales pipeline and conversion focus
- **Completo** - All sections visible (default)

## Key Metrics Definitions

### North Star KPIs

1. **Receita** (Revenue)
   - Formula: Sum of all won deals
   - Source: `deals` table where `status = 'won'`

2. **Vendas** (Sales)
   - Formula: Count of won deals
   - Source: `deals` table where `status = 'won'`

3. **Gastos** (Spend)
   - Formula: Sum of ad spend from all sources
   - Source: `ad_spend_daily` table

4. **ROI** (Return on Investment)
   - Formula: `Receita / Gastos`
   - Good: ≥ 2.0x
   - Warning: 1.0x - 2.0x
   - Bad: < 1.0x

5. **CAC** (Customer Acquisition Cost)
   - Formula: `Gastos / Vendas`
   - Lower is better
   - Inverted trend indicator (↓ = good, ↑ = bad)

### Secondary Metrics

- **CTR** (Click-Through Rate): `(Clicks / Impressions) * 100`
- **CPC** (Cost Per Click): `Gastos / Clicks`
- **Taxa de Conversão**: `(Vendas / Contatos) * 100`

## Backend Integration

### Required Supabase RPCs

When implementing backend RPCs, follow these signatures:

#### 1. get_dashboard_summary
```sql
CREATE OR REPLACE FUNCTION get_dashboard_summary(
  start_date DATE,
  end_date DATE,
  compare BOOLEAN,
  source TEXT,
  team_id UUID
) RETURNS JSON
```

Returns:
```json
{
  "northStar": {
    "revenue": { "value": 45000, "delta": 28.57 },
    "sales": { "value": 89, "delta": 27.14 },
    "spend": { "value": 15000, "delta": 12.5 },
    "roi": { "value": 3.0, "delta": 15.38 },
    "cac": { "value": 168.54, "delta": -12.31 }
  },
  "secondary": {
    "impressions": 250000,
    "clicks": 12500,
    "ctr": 5.0,
    "cpc": 1.2
  },
  "insights": [
    {
      "id": "insight-1",
      "severity": "warn",
      "title": "ROI caiu 12% em Meta Ads",
      "cta": { "type": "open_tab", "payload": {...} }
    }
  ]
}
```

#### 2. get_funnel_stats
Returns array of funnel stages with conversion rates.

#### 3. get_pipeline_stats
Returns array of sales pipeline stages with time and value metrics.

#### 4. get_origin_breakdown
Returns performance metrics broken down by origin/channel.

#### 5. get_timeseries
Returns daily/weekly/monthly time series for charts.

## Telemetry Events

Track these events for analytics:

- `dashboard_viewed` - When user opens Dashboard V2
- `filter_changed` - When any filter is modified
- `compare_toggled` - When comparison mode is toggled
- `view_mode_changed` - When view mode is switched
- `insight_clicked` - When user clicks an insight
- `funnel_stage_clicked` - When funnel stage is clicked
- `pipeline_stage_clicked` - When pipeline stage is clicked
- `origin_row_clicked` - When origin table row is clicked
- `export_clicked` - When export button is clicked

## Accessibility Features

✅ **Keyboard Navigation**
- All interactive elements are keyboard accessible
- Focus states are clearly visible
- Tab order is logical

✅ **ARIA Labels**
- All sections have descriptive labels
- Interactive elements have aria-labels
- Status messages use aria-live

✅ **Color Independence**
- Trends shown with icons (↑/↓) + text, not just color
- All semantic colors have text fallbacks
- High contrast ratios throughout

✅ **Screen Reader Support**
- Semantic HTML structure
- Hidden text for context
- Descriptive button labels

## Responsive Design

### Breakpoints
- **Mobile**: 375px - 767px (single column)
- **Tablet**: 768px - 1279px (2 columns)
- **Desktop**: 1280px+ (3+ columns)

### Mobile Optimizations
- KPIs stack vertically
- Diagnostic panels stack in single column
- Tables scroll horizontally
- Filters wrap to multiple rows
- Drawer uses full width

## Development Notes

### Mock Data
Currently using mock data from `dashboardV2Service.ts`. Set `USE_MOCK = false` when backend RPCs are ready.

### Performance Considerations
- All data loaded in parallel with `Promise.all()`
- Charts only render when visible
- Large lists use virtual scrolling (future enhancement)
- Skeleton states prevent layout shifts

### Testing Checklist
- [ ] Filter persistence works across page reloads
- [ ] Compare mode shows correct comparison data
- [ ] All drill-down flows navigate correctly
- [ ] Empty states show appropriate messages
- [ ] Charts render correctly with various data sizes
- [ ] Mobile layout works on small screens
- [ ] Keyboard navigation works throughout
- [ ] Screen readers announce content correctly

## Future Enhancements

1. **View Mode Implementation**
   - Reorder sections based on mode
   - Hide/show specific panels
   - Save preference per user

2. **Advanced Insights**
   - ML-powered anomaly detection
   - Predictive trends
   - Automated recommendations

3. **Custom Date Ranges**
   - Date picker for custom periods
   - Preset ranges (last month, last quarter)
   - Comparison with custom periods

4. **Export Functionality**
   - PDF reports
   - Excel exports
   - Scheduled email reports

5. **Real-time Updates**
   - WebSocket subscriptions
   - Auto-refresh on data changes
   - Live notifications

## Support

For questions or issues:
- Check `/doc/prd.md` for requirements
- Review `/.cursor/rules/cursorrules.mdc` for standards
- See existing Dashboard V1 at `DashboardView.vue` for reference
