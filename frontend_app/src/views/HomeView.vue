<template>
  <v-container class="py-8 px-2 px-md-10" fluid>
    <v-row class="gy-8">
      <v-col cols="12" md="7" class="mb-4">
        <ExpenseTracker />
      </v-col>
      <v-col cols="12" md="5" class="mb-4">
        <ExpensePieChart />
        <v-card class="mt-8 pa-4 rounded-lg text-center"
          style="background: linear-gradient(90deg,#e3f0fa 10%, #f4f8fb 100%); border:1px solid #f2f4f7;">
          <span class="font-weight-bold text-h6" style="color:#2167b4;">
            Want full control? Delete, add, and explore categories – everything is instant and local.
          </span>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import ExpenseTracker from '../components/ExpenseTracker.vue'
import ExpensePieChart from '../components/ExpensePieChart.vue'
</script>
