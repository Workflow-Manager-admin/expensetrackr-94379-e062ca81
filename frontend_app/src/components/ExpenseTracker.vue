<template>
  <v-card class="px-2 py-5" elevation="3">
    <v-card-title class="px-0 pb-2 font-weight-bold text-h5">
      Add Expense
    </v-card-title>
    <v-form @submit.prevent="onAddExpense" ref="formRef" class="mb-4">
      <v-row dense>
        <v-col cols="5">
          <v-text-field
            v-model="expenseName"
            label="Description"
            variant="outlined"
            required
            density="compact"
          />
        </v-col>
        <v-col cols="3">
          <v-text-field
            v-model="expenseAmount"
            label="Amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            prefix="$"
            variant="outlined"
            density="compact"
          />
        </v-col>
        <v-col cols="3">
          <v-select
            v-model="expenseCategory"
            :items="categories"
            label="Category"
            required
            variant="outlined"
            density="compact"
            :menu-props="{ maxHeight: '200px' }"
            hide-details
          />
        </v-col>
        <v-col cols="1" class="d-flex align-center">
          <v-btn :disabled="!formValid" color="primary" type="submit" icon="mdi-plus" />
        </v-col>
      </v-row>
    </v-form>

    <v-divider class="my-2"></v-divider>
    <v-card-subtitle class="px-0 pb-2 text-subtitle-1 text-secondary">Expenses</v-card-subtitle>
    <v-list v-if="expenses.length > 0" density="compact">
      <v-list-item
        v-for="expense in expenses"
        :key="expense.id"
        class="expense-row"
      >
        <template #prepend>
          <v-avatar color="accent" size="28">
            <v-icon>{{ categoryIcon(expense.category) }}</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title>{{ expense.name }}</v-list-item-title>
        <v-list-item-subtitle>
          <span class="mr-3">$ {{ expense.amount.toFixed(2) }}</span>
          <v-chip color="primary" variant="tonal" size="small">{{ expense.category }}</v-chip>
        </v-list-item-subtitle>
        <template #append>
          <v-btn icon="mdi-delete-outline" variant="text" color="error" @click="deleteExpense(expense.id)" />
        </template>
      </v-list-item>
    </v-list>
    <v-alert v-else type="info" variant="outlined" border="start" class="mt-3" density="compact">
      No expenses added yet.
    </v-alert>
  </v-card>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue'

interface Expense {
  id: number
  name: string
  amount: number
  category: string
}

const LOCAL_STORAGE_KEY = 'expenses-v1'

const categories = [
  { title: 'Food', value: 'Food', icon: 'mdi-silverware-fork-knife' },
  { title: 'Transport', value: 'Transport', icon: 'mdi-bus' },
  { title: 'Shopping', value: 'Shopping', icon: 'mdi-cart' },
  { title: 'Bills', value: 'Bills', icon: 'mdi-receipt' },
  { title: 'Entertainment', value: 'Entertainment', icon: 'mdi-movie-open' },
  { title: 'Other', value: 'Other', icon: 'mdi-dots-horizontal-circle-outline' }
]

const expenseName = ref('')
const expenseAmount = ref<string | number>('')
const expenseCategory = ref('Food')
const expenses = ref<Expense[]>([])
const formRef = ref(null)

const formValid = computed(() =>
  !!expenseName.value && !!expenseAmount.value && !!expenseCategory.value && parseFloat(String(expenseAmount.value)) > 0
)

// PUBLIC_INTERFACE
function categoryIcon(cat: string): string {
  const found = categories.find((c) => c.value === cat)
  return found?.icon || 'mdi-tag'
}

function saveExpensesToStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses.value))
}

function loadExpensesFromStorage() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (data) {
    try {
      expenses.value = JSON.parse(data)
    } catch {
      expenses.value = []
    }
  }
}

// PUBLIC_INTERFACE
function onAddExpense() {
  if (!formValid.value) return
  const newExpense: Expense = {
    id: Date.now(),
    name: expenseName.value.trim(),
    amount: parseFloat(String(expenseAmount.value)),
    category: expenseCategory.value
  }
  expenses.value.unshift(newExpense)
  saveExpensesToStorage()
  expenseName.value = ''
  expenseAmount.value = ''
  expenseCategory.value = categories[0].value
  // .resetValidation not supported here in template ref. No-op for type-safety.
}

// PUBLIC_INTERFACE
function deleteExpense(id: number) {
  expenses.value = expenses.value.filter(e => e.id !== id)
  saveExpensesToStorage()
}

onMounted(() => {
  loadExpensesFromStorage()
})
watch(expenses, saveExpensesToStorage, { deep: true })
</script>

<style scoped>
.expense-row {
  padding-left: 2px;
  padding-bottom: 2px;
  border-radius: 6px;
  margin-bottom: 2px;
}

.v-list-item__append {
  margin-right: 2px;
}
</style>
