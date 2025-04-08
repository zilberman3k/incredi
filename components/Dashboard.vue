<template>
  <div>
    <div v-if="isLoading && !latestMetrics" class="flex justify-center items-center h-64">
      <div class="text-center">
        <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none"
             viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-gray-600">Loading metrics...</p>
      </div>
    </div>

    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
      <p>{{ error }}</p>
      <button @click="refetch" class="text-sm underline mt-2">Try again</button>
    </div>

    <div v-else class="space-y-6">
      <div class="bg-gray-900 p-2 text-white flex items-center justify-around sticky top-0 z-10">
        <img src="../public/incredibuild-logo-1.svg" alt="logo"/>
        <span class="text-lg font-medium pt-2">Resource Monitor</span>
        <span class="text-lg font-medium pt-2">Last Update: {{ formattedLastUpdate }}</span>
      </div>
      <div class="bg-white p-4 rounded-lg shadow pt-0">

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <CpuGauge :value="cpuUsage"/>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium mb-2">Memory Usage</h3>
            <div class="h-32 flex items-center justify-center">
              <MemoryUsageChart :data="memoryData"/>
            </div>
            <p class="text-sm text-gray-600 mt-2">
              Used: {{ formatBytes(memoryUsed) }} / {{ formatBytes(memoryTotal) }}
            </p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium mb-2">Network Traffic</h3>
            <div class="grid grid-cols-2 gap-2">
              <div class="text-center">
                <p class="text-xs text-gray-500">Download</p>
                <p class="text-lg font-medium">{{ formatNetworkSpeed(networkRx) }}</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-500">Upload</p>
                <p class="text-lg font-medium">{{ formatNetworkSpeed(networkTx) }}</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium mb-2">System Info</h3>
            <p class="text-sm">CPU Cores: {{ cpuCores }}</p>
            <p class="text-sm">Disk Count: {{ diskCount }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-medium mb-4">Disk Usage</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filesystem</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(disk, index) in disks" :key="index">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ disk.fs }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatBytes(disk.size) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatBytes(disk.used) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: `${disk.usagePercentage}%` }"></div>
                  </div>
                  <span class="ml-2 text-sm text-gray-500">{{ Math.round(disk.usagePercentage) }}%</span>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Historical Data -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h2 class="text-lg font-medium mb-4">Historical Data</h2>
        <HistoricalChart :data="historicalData"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import {useQuery, useQueryClient} from '@tanstack/vue-query'
import axios from 'axios'

const queryClient = useQueryClient()

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const fetchLatestMetrics = async () => {
  const response = await axios.get(`${API_URL}/latest-metrics`)
  return response.data
}

const fetchHistoricalData = async () => {
  const response = await axios.get(`${API_URL}/metrics?limit=20`)
  return response.data.metrics.reverse()
}


const REFETCH_INTERVAL = 4000;
const {data: latestMetrics, isLoading: loading1, error: error1} = useQuery({
  queryKey: ['latestMetrics'],
  queryFn: fetchLatestMetrics,
  refetchInterval: REFETCH_INTERVAL
})

const {data: historicalData, isLoading: loading2, error: error2} = useQuery({
  queryKey: ['historicalData'],
  queryFn: fetchHistoricalData,
  refetchInterval: REFETCH_INTERVAL
})

const refetch = () => {
  queryClient.invalidateQueries()
}

const isLoading = computed(() => loading1.value || loading2.value)
const error = computed(() => error1.value || error2.value)

// Computed properties for the UI
const cpuUsage = computed(() => {
  return latestMetrics.value ? latestMetrics.value.cpu.usage : 0
})

const cpuCores = computed(() => {
  return latestMetrics.value ? latestMetrics.value.cpu.cores : 0
})

const memoryTotal = computed(() => {
  return latestMetrics.value ? latestMetrics.value.memory.total : 0
})

const memoryUsed = computed(() => {
  return latestMetrics.value ? latestMetrics.value.memory.used : 0
})

const memoryData = computed(() => {
  if (!latestMetrics.value) return {used: 0, free: 0}
  return {
    used: latestMetrics.value.memory.used,
    free: latestMetrics.value.memory.total - latestMetrics.value.memory.used
  }
})

const networkRx = computed(() => {
  return latestMetrics.value ? latestMetrics.value.network.rx_sec : 0
})

const networkTx = computed(() => {
  return latestMetrics.value ? latestMetrics.value.network.tx_sec : 0
})

const disks = computed(() => {
  return latestMetrics.value ? latestMetrics.value.disk : []
})

const diskCount = computed(() => {
  return disks.value.length
})

const formattedLastUpdate = computed(() => {
  if (!latestMetrics.value) return 'N/A'
  const date = new Date(latestMetrics.value.timestamp)
  return date.toLocaleString()
})

// Utility functions
function formatBytes(bytes, decimals = 2) {
  if (!bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function formatNetworkSpeed(bytesPerSec) {
  return `${formatBytes(bytesPerSec)}/s`
}
</script>
