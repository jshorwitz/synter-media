import type { ChartOptions } from 'chart.js';

// Tactical theme colors
const colors = {
  grid: 'rgba(255,255,255,0.06)',
  gridMinor: 'rgba(255,255,255,0.03)',
  axis: '#8B94A3',
  tooltipBg: 'rgba(11,14,18,0.95)',
  tooltipBorder: '#2A303A',
  tooltipText: '#E6E9EF',
  
  // Data series colors
  cyan: '#4DD6FF',
  lime: '#9CFF5A',
  amber: '#F0B34C',
  red: '#E4453A',
  green: '#3EE08F',
  teal: '#297F87',
  yellow: '#E7F24B',
};

export const tacticalChartOptions: Partial<ChartOptions<any>> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Use custom legend for tactical UI
    },
    tooltip: {
      backgroundColor: colors.tooltipBg,
      titleColor: colors.axis,
      bodyColor: colors.tooltipText,
      borderColor: colors.tooltipBorder,
      borderWidth: 1,
      padding: 10,
      displayColors: true,
      titleFont: {
        family: 'IBM Plex Mono, monospace',
        size: 11,
        weight: '600',
      },
      bodyFont: {
        family: 'IBM Plex Mono, monospace',
        size: 12,
        weight: '400',
      },
      cornerRadius: 6,
      caretPadding: 8,
    },
  },
  scales: {
    x: {
      grid: {
        color: colors.gridMinor,
        drawBorder: true,
        borderColor: colors.grid,
        tickLength: 4,
      },
      ticks: {
        color: colors.axis,
        font: {
          family: 'IBM Plex Mono, monospace',
          size: 11,
          weight: '400',
        },
        padding: 8,
      },
    },
    y: {
      grid: {
        color: colors.grid,
        drawBorder: true,
        borderColor: colors.grid,
        tickLength: 4,
      },
      ticks: {
        color: colors.axis,
        font: {
          family: 'IBM Plex Mono, monospace',
          size: 11,
          weight: '400',
        },
        padding: 8,
      },
    },
  },
  elements: {
    line: {
      borderWidth: 2,
      tension: 0.25, // Slight curve
    },
    point: {
      radius: 0,
      hitRadius: 8,
      hoverRadius: 4,
      borderWidth: 2,
    },
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
};

// Color mapping for different metrics
export const metricColors = {
  spend: colors.amber,
  revenue: colors.lime,
  ctr: colors.cyan,
  cpa: colors.red,
  roas: colors.green,
  conversions: colors.green,
  clicks: colors.cyan,
  impressions: colors.teal,
  cpc: colors.yellow,
};

// Dataset template for line charts
export const createTacticalDataset = (
  label: string,
  data: number[],
  color: string,
  fill = false
) => ({
  label,
  data,
  borderColor: color,
  backgroundColor: fill ? `${color}33` : 'transparent', // 20% opacity for fill
  fill,
  pointBackgroundColor: color,
  pointBorderColor: color,
  pointHoverBackgroundColor: color,
  pointHoverBorderColor: '#0B0E12',
});

// Gradient helper for area charts
export const createGradient = (
  ctx: CanvasRenderingContext2D,
  color: string,
  height: number
) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `${color}40`); // 25% opacity at top
  gradient.addColorStop(1, `${color}00`); // 0% opacity at bottom
  return gradient;
};

// Export all colors for use in other components
export { colors };
