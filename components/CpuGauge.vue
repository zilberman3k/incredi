<template>
  <div>
    <h3 class="font-medium mb-2">CPU Usage</h3>
    <div class="relative h-32 flex items-center justify-center">
      <svg class="w-full h-full" viewBox="0 0 100 50">
        <!-- Background arc -->
        <path
            d="M10,50 A40,40 0 1,1 90,50"
            fill="none"
            stroke="#e5e7eb"
            stroke-width="10"
            stroke-linecap="round"
        />

        <!-- Foreground arc -->
        <path
            :d="progressArc"
            fill="none"
            :stroke="gaugeColor"
            stroke-width="10"
            stroke-linecap="round"
        />

        <!-- Value text -->
        <text
            x="50"
            y="60"
            font-size="15"
            text-anchor="middle"
            font-weight="bold"
        >
          {{ Math.round(value) }}%
        </text>
      </svg>
    </div>
    <div class="text-center mt-2">
      <div class="text-sm" :class="statusTextColor">{{ statusText }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    default: 0
  }
})

// Calculate the arc path based on percentage
const progressArc = computed(() => {
  // Ensure value is within 0-100 range
  const val = Math.min(Math.max(props.value, 0), 100)

  // Calculate angle
  const angle = (val / 100) * Math.PI

  // Start at the left side (10,50)
  const startX = 10
  const startY = 50

  // Calculate end point on the arc
  const endX = 50 - Math.cos(angle) * 40
  const endY = 50 - Math.sin(angle) * 40

  // Create arc flag (0 for small arc, 1 for large arc)
  const arcFlag = val > 50 ? 1 : 0

  return `M10,50 A40,40 0 ${arcFlag},1 ${endX},${endY}`
})

// Color based on CPU usage
const gaugeColor = computed(() => {
  if (props.value < 60) return '#10b981' // Green for low usage
  if (props.value < 85) return '#f59e0b' // Yellow for medium usage
  return '#ef4444' // Red for high usage
})

// Status text
const statusText = computed(() => {
  if (props.value < 60) return 'Normal'
  if (props.value < 85) return 'Moderate'
  return 'High'
})

// Status text color
const statusTextColor = computed(() => {
  if (props.value < 60) return 'text-green-600'
  if (props.value < 85) return 'text-yellow-600'
  return 'text-red-600'
})
</script>
