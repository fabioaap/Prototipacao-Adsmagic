/**
 * Composable para gráficos responsivos
 * Detecta breakpoints Tailwind e retorna dimensões/opções otimizadas
 * 
 * @module useResponsiveChart
 */

import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'

export interface ChartDimensions {
    height: number
    fontSize: number
    legendPosition: 'top' | 'bottom' | 'left' | 'right'
    showLabels: boolean
    padding: number
}

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * Hook para gráficos responsivos
 * Retorna breakpoint atual e dimensões otimizadas
 */
export function useResponsiveChart(containerRef?: Ref<HTMLElement | null>) {
    const width = ref<number>(window.innerWidth)
    const height = ref<number>(window.innerHeight)

    const breakpoint = computed<Breakpoint>(() => {
        const w = width.value
        if (w < 640) return 'xs'
        if (w < 768) return 'sm'
        if (w < 1024) return 'md'
        if (w < 1280) return 'lg'
        if (w < 1536) return 'xl'
        return '2xl'
    })

    const isMobile = computed(() => breakpoint.value === 'xs' || breakpoint.value === 'sm')
    const isTablet = computed(() => breakpoint.value === 'md')
    const isDesktop = computed(() => breakpoint.value === 'lg' || breakpoint.value === 'xl' || breakpoint.value === '2xl')

    /**
     * Dimensões otimizadas por breakpoint
     */
    const dimensions = computed<ChartDimensions>(() => {
        const bp = breakpoint.value

        // Mobile (xs/sm)
        if (bp === 'xs' || bp === 'sm') {
            return {
                height: 240,
                fontSize: 10,
                legendPosition: 'bottom',
                showLabels: false,
                padding: 8
            }
        }

        // Tablet (md)
        if (bp === 'md') {
            return {
                height: 280,
                fontSize: 11,
                legendPosition: 'bottom',
                showLabels: true,
                padding: 12
            }
        }

        // Desktop (lg/xl/2xl)
        return {
            height: 320,
            fontSize: 12,
            legendPosition: 'right',
            showLabels: true,
            padding: 16
        }
    })

    /**
     * Opções para Chart.js otimizadas por breakpoint
     */
    const chartOptions = computed(() => {
        const { fontSize, legendPosition, showLabels } = dimensions.value

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: legendPosition,
                    labels: {
                        font: { size: fontSize },
                        padding: isMobile.value ? 8 : 12
                    }
                },
                tooltip: {
                    enabled: true,
                    titleFont: { size: fontSize },
                    bodyFont: { size: fontSize - 1 }
                }
            },
            scales: {
                x: {
                    display: showLabels,
                    ticks: {
                        font: { size: fontSize },
                        maxRotation: isMobile.value ? 45 : 0,
                        minRotation: isMobile.value ? 45 : 0
                    }
                },
                y: {
                    display: showLabels,
                    ticks: {
                        font: { size: fontSize }
                    }
                }
            }
        }
    })

    let resizeObserver: ResizeObserver | null = null

    const updateSize = () => {
        width.value = window.innerWidth
        height.value = window.innerHeight
    }

    const setupResizeObserver = () => {
        if (!containerRef?.value) return

        resizeObserver = new ResizeObserver(() => {
            updateSize()
        })

        resizeObserver.observe(containerRef.value)
    }

    const setupWindowListener = () => {
        window.addEventListener('resize', updateSize)
    }

    onMounted(() => {
        updateSize()

        if (containerRef) {
            setupResizeObserver()
        } else {
            setupWindowListener()
        }
    })

    onUnmounted(() => {
        if (resizeObserver) {
            resizeObserver.disconnect()
        } else {
            window.removeEventListener('resize', updateSize)
        }
    })

    return {
        breakpoint,
        isMobile,
        isTablet,
        isDesktop,
        dimensions,
        chartOptions,
        width,
        height
    }
}
