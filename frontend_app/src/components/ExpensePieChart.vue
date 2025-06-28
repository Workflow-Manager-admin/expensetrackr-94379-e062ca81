<template>
  <v-card elevation="3" class="py-5 px-2">
    <v-card-title class="font-weight-bold text-h5 px-0 pb-2">Spending by Category</v-card-title>
    <div style="min-height: 280px;">
      <canvas ref="pieChartRef"></canvas>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js'
import type { ChartData } from 'chart.js'

Chart.register(PieController, ArcElement, Tooltip, Legend)

const LOCAL_STORAGE_KEY = 'expenses-v1'
const pieChartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

interface Expense {
  id: number,
  name: string,
  amount: number,
  category: string
}

function getExpenses(): Expense[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function generatePieData(expenses: Expense[]): ChartData<'pie'> {
  const categoriesMap: Record<string, number> = {}
  for (const expense of expenses) {
    categoriesMap[expense.category] = (categoriesMap[expense.category] || 0) + expense.amount
  }
  const labels = Object.keys(categoriesMap)
  const data = Object.values(categoriesMap)
  const palette = [
    '#1976d2', '#43a047', '#fbc02d', '#e53935', '#3f51b5', '#607d8b', '#9c27b0'
  ]
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: labels.map((_, i) => palette[i % palette.length]),
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  }
}

function renderChart() {
  const expenses = getExpenses()
  if (!pieChartRef.value) return
  if (chart) chart.destroy()
  chart = new Chart(pieChartRef.value, {
    type: 'pie',
    data: generatePieData(expenses),
    options: {
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const datasetData = ctx.dataset?.data as number[]
              const total = datasetData.reduce((a: number, b: number) => a + b, 0)
              const value = ctx.parsed
              const percent = ((value / total) * 100).toFixed(1)
              return `${ctx.label}: $${value} (${percent}%)`
            }
          }
        }
      }
    }
  })
}

onMounted(() => {
  renderChart()
  window.addEventListener('storage', renderChart)
})

watch(
  () => localStorage.getItem(LOCAL_STORAGE_KEY),
  () => renderChart()
)

window.addEventListener('expenses-updated', renderChart)
</script>

<style scoped>
/* Responsive fix for chart's parent */
@media (max-width: 767px) {
  div[style*="min-height"] {
    min-height: 180px !important;
  }
}
</style>
