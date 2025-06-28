<template>
  <v-card
    class="rounded-lg px-0 py-0 elevation-1 expense-card"
    style="max-width: 700px; margin: 0 auto; background: #fff;"
  >
    <v-card-title class="d-flex align-center px-5 pt-5 pb-0">
      <v-icon class="mr-3" color="primary">mdi-note-plus-outline</v-icon>
      <span class="font-weight-bold text-h5" style="letter-spacing:0.2px;">Track <span class="text-primary">Expenses</span></span>
      <v-spacer />
    </v-card-title>
    <div class="px-5 pt-4 pb-2">
      <v-form @submit.prevent="onAddExpense" ref="formRef">
        <v-row dense>
          <v-col cols="12" sm="5" class="py-1">
            <v-text-field
              v-model="expenseName"
              label="What did you spend on?"
              placeholder="E.g. Groceries"
              variant="outlined"
              density="compact"
              :prepend-inner-icon="'mdi-pen'"
              autocomplete="off"
              required
              class="rounded-pill"
            />
          </v-col>
          <v-col cols="6" sm="3" class="py-1">
            <v-text-field
              v-model="expenseAmount"
              label="Amount"
              type="number"
              min="0.01"
              max="9999"
              step="0.01"
              prefix="$"
              variant="outlined"
              density="compact"
              placeholder="0.00"
              hide-spin-buttons
              required
              class="rounded-pill"
            />
          </v-col>
          <v-col cols="6" sm="3" class="py-1">
            <v-select
              v-model="expenseCategory"
              :items="categories"
              label="Category"
              placeholder="Choose"
              required
              variant="outlined"
              density="compact"
              item-title="title"
              item-value="value"
              :menu-props="{ maxHeight: '200px' }"
              :prepend-inner-icon="categoryIcon(expenseCategory)"
              class="rounded-pill"
              hide-details
            >
              <template #selection="{ item }">
                <v-icon class="mr-1">{{ categoryIcon(item.value) }}</v-icon>
                {{ item.title }}
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" sm="1" class="d-flex align-center py-1">
            <v-btn
              :disabled="!formValid"
              color="primary"
              type="submit"
              icon="mdi-plus"
              variant="flat"
              size="large"
              elevation="1"
              title="Add expense"
            />
          </v-col>
        </v-row>
      </v-form>
    </div>
    <v-divider class="mx-5 my-0"></v-divider>
    <v-card-subtitle class="px-5 py-2 text-subtitle-1 text-secondary font-weight-medium d-flex align-center">
      <v-icon class="mr-2 text-info" size="20">mdi-format-list-bulleted-square</v-icon>
      <span>Expenses</span>
      <v-spacer />
      <span class="mr-1">
        <v-chip size="small" color="success" variant="text" v-if="expenses.length > 0">
          <v-icon start size="20">mdi-cash</v-icon>
          {{ expenses.map(e => e.amount).reduce((a, b) => a + b, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}
        </v-chip>
      </span>
    </v-card-subtitle>
    <v-list v-if="expenses.length > 0" density="compact" class="px-0 py-0">
      <v-list-item
        v-for="expense in expenses"
        :key="expense.id"
        class="expense-row"
        style="border-bottom: 1px solid #f0f1f2;"
      >
        <template #prepend>
          <v-avatar color="accent" size="32">
            <v-icon>{{ categoryIcon(expense.category) }}</v-icon>
          </v-avatar>
        </template>
        <div class="d-flex flex-column">
          <v-list-item-title class="font-weight-medium">{{ expense.name }}</v-list-item-title>
          <v-list-item-subtitle class="d-flex align-center pt-0">
            <span class="mr-2 text-grey">${{ expense.amount.toFixed(2) }}</span>
            <v-chip color="primary" variant="tonal" size="small" class="ml-0 mr-1">
              <v-icon start>{{ categoryIcon(expense.category) }}</v-icon>
              {{ expense.category }}
            </v-chip>
          </v-list-item-subtitle>
        </div>
        <template #append>
          <v-btn icon="mdi-delete-outline" variant="text" color="error" @click="deleteExpense(expense.id)" title="Delete" />
        </template>
      </v-list-item>
    </v-list>
    <div v-else class="px-5 pt-2 pb-5 text-center empty-state-container">
      <v-divider class="my-6" />
      <v-icon class="mb-2 mt-2 empty-icon" size="74" color="grey-lighten-1">mdi-emoticon-neutral-outline</v-icon>
      <div class="text-h6 font-weight-medium mb-2 text-grey">No expenses yet!</div>
      <div class="text-body-2 mb-2" style="color: #888;">
        Add your first expense above or use the sample data shown when you first visit.
      </div>
      <v-chip color="info" variant="tonal" size="small" class="mt-1 mb-5" v-if="!expenses.length">
        Tip: You can remove these later or add your own!
      </v-chip>
    </div>
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      location="top"
      multi-line
      timeout="1800"
      rounded="pill"
      elevation="4"
      class="mb-0"
    >
      {{ snackbarMsg }}
    </v-snackbar>
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

const sampleExpenses: Expense[] = [
  {
    id: 10001,
    name: 'Groceries',
    amount: 52.80,
    category: 'Food'
  },
  {
    id: 10002,
    name: 'Bus monthly pass',
    amount: 30.00,
    category: 'Transport'
  },
  {
    id: 10003,
    name: 'Electricity bill',
    amount: 75.25,
    category: 'Bills'
  },
  {
    id: 10004,
    name: 'Movie tickets',
    amount: 28.50,
    category: 'Entertainment'
  },
  {
    id: 10005,
    name: 'Shoes',
    amount: 49.99,
    category: 'Shopping'
  },
  {
    id: 10006,
    name: 'Coffee with friends',
    amount: 12.50,
    category: 'Food'
  },
  {
    id: 10007,
    name: 'Phone credit',
    amount: 18.00,
    category: 'Other'
  }
]

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
const snackbar = ref(false)
const snackbarMsg = ref('')
const snackbarColor = ref('primary')
const showEmptyState = ref(false)

const formValid = computed(() =>
  !!expenseName.value && !!expenseAmount.value && !!expenseCategory.value && parseFloat(String(expenseAmount.value)) > 0
)

// PUBLIC_INTERFACE
function categoryIcon(cat: string): string {
  const found = categories.find((c) => c.value === cat)
  return found?.icon || 'mdi-tag'
}

// PUBLIC_INTERFACE
function triggerSnackbar(message: string, color: string = "primary") {
  snackbarMsg.value = message
  snackbarColor.value = color
  snackbar.value = false
  setTimeout(() => {
    snackbar.value = true
  }, 20)
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
  triggerSnackbar("Expense added!", "primary")
  expenseName.value = ''
  expenseAmount.value = ''
  expenseCategory.value = categories[0].value
}

// PUBLIC_INTERFACE
function deleteExpense(id: number) {
  expenses.value = expenses.value.filter(e => e.id !== id)
  saveExpensesToStorage()
  triggerSnackbar("Expense deleted.", "error")
}

function tryPopulateSampleExpensesFirstLoad() {
  const currentData = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (!currentData || (Array.isArray(JSON.parse(currentData)) && JSON.parse(currentData).length === 0)) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sampleExpenses))
  }
}

onMounted(() => {
  tryPopulateSampleExpensesFirstLoad()
  loadExpensesFromStorage()
  showEmptyState.value = expenses.value.length === 0
})

watch(expenses, (val) => {
  saveExpensesToStorage()
  showEmptyState.value = val.length === 0
}, { deep: true })
</script>

<style scoped>
.expense-card {
  background: #f9fafd !important;
  box-shadow: 0 2px 12px rgba(33,46,74,0.07) !important;
}
.v-list-item__append {
  margin-right: 12px;
}
.v-list.expense-list {
  border-radius: 9px;
  background: none !important;
}
.expense-row {
  padding-left: 2px;
  border-radius: 7px;
  margin-bottom: 1px;
  background: transparent !important;
  transition: background 0.2s;
}
.expense-row:hover {
  background: #f0f4fa !important;
}
.empty-state-container .empty-icon {
  opacity: 0.16;
}
@media (max-width: 767px) {
  .expense-card {
    padding: 0 !important;
  }
}
</style>
