<template>
  <div>
    <div class="flex justify-end mb-2">
      <div class="flex items-center space-x-4">
        <button
            v-for="metric in availableMetrics"
            :key="metric.value"
            @click="setActiveMetric(metric.value)"
            class="px-3 py-1 text-sm rounded"
            :class="activeMetric === metric.value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
        >
          {{ metric.label }}
        </button>
      </div>
    </div>

    <canvas ref="chartContainer" class="w-full h-64"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const chartContainer = ref(null)
let chart = null
const activeMetric = ref('cpu')

const availableMetrics = [
  { label: 'CPU', value: 'cpu' },
  { label: 'Memory', value: 'memory' },
  { label: 'Network', value: 'network' }
]

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) return { labels: [], datasets: [] }

  const labels = props.data.map(item => {
    const date = new Date(item.timestamp)
    return date.toLocaleTimeString()
  })

  let datasets = []

  if (activeMetric.value === 'cpu') {
    datasets = [{
      label: 'CPU Usage (%)',
      data: props.data.map(item => item.cpu.usage),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.3
    }]
  }
  else if (activeMetric.value === 'memory') {
    datasets = [{
      label: 'Memory Usage (%)',
      data: props.data.map(item => item.memory.usagePercentage),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.3
    }]
  }
  else if (activeMetric.value === 'network') {
    datasets = [
      {
        label: 'Download (B/s)',
        data: props.data.map(item => item.network.rx_sec),
        borderColor: '#8b5cf6',
        backgroundColor: 'transparent',
        tension: 0.3
      },
      {
        label: 'Upload (B/s)',
        data: props.data.map(item => item.network.tx_sec),
        borderColor: '#f97316',
        backgroundColor: 'transparent',
        tension: 0.3
      }
    ]
  }

  return { labels, datasets }
})

onMounted(() => {
  createChart()
})

watch(() => props.data, () => {
  updateChart()
}, { deep: true })

watch(activeMetric, () => {
  updateChart()
})

function createChart() {
  const ctx = chartContainer.value.getContext('2d')
  const data = chartData.value

  chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      },
      plugins: {
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false
        }
      }
    }
  })
}

function updateChart() {
  if (!chart) return

  const data = chartData.value
  chart.data.labels = data.labels
  chart.data.datasets = data.datasets
  chart.update()
}

function setActiveMetric(metric) {
  activeMetric.value = metric
}
</script>
