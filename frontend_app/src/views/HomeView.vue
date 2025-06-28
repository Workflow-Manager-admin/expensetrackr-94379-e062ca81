<template>
  <v-container class="py-4" fluid>
    <v-row>
      <v-col cols="12" md="7">
        <ExpenseTracker />
      </v-col>
      <v-col cols="12" md="5">
        <ExpensePieChart />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import ExpenseTracker from '../components/ExpenseTracker.vue'
import ExpensePieChart from '../components/ExpensePieChart.vue'
</script>
