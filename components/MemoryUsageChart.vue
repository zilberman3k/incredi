<template>
  <div class="w-full h-full">
    <canvas ref="chartContainer" class="w-full h-full"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({ used: 0, free: 0 })
  }
})

const chartContainer = ref(null)
let chart = null

onMounted(() => {
  createChart()
})

watch(() => props.data, (newData) => {
  if (chart) {
    chart.data.datasets[0].data = [newData.used, newData.free]
    chart.update()
  }
}, { deep: true })

function createChart() {
  const ctx = chartContainer.value.getContext('2d')

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Used', 'Free'],
      datasets: [{
        data: [props.data.used, props.data.free],
        backgroundColor: ['#3b82f6', '#e5e7eb'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 10
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw
              // Convert bytes to human-readable format
              const units = ['B', 'KB', 'MB', 'GB', 'TB']
              let i = 0
              let size = value

              while (size >= 1024 && i < units.length - 1) {
                size /= 1024
                i++
              }

              return `${context.label}: ${size.toFixed(2)} ${units[i]}`
            }
          }
        }
      }
    }
  })
}
</script>
