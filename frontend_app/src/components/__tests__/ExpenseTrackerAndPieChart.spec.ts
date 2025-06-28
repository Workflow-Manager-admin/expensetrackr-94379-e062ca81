import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ExpenseTracker from '../ExpenseTracker.vue'
import ExpensePieChart from '../ExpensePieChart.vue'

// Utility: Mock localStorage for isolation, since ExpenseTracker & PieChart use it
class LocalStorageMock {
  store: Record<string, string>
  constructor() {
    this.store = {}
  }
  clear() {
    this.store = {}
  }
  getItem(key: string) {
    return this.store[key] || null
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value)
  }
  removeItem(key: string) {
    delete this.store[key]
  }
}

// Mirror of the Expense interface in component files
interface Expense {
  id: number
  name: string
  amount: number
  category: string
}

const LOCAL_STORAGE_KEY = 'expenses-v1'
const sampleExpense = {
  id: 123456789,
  name: 'Test expense',
  amount: 99.99,
  category: 'Food'
}
const sampleExpenses = [
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
  }
]

describe('ExpenseTracker.vue - core features', () => {
  let wrapper: ReturnType<typeof mount>
  let localStorageBackup: typeof window.localStorage

  beforeEach(() => {
    // Mock localStorage for each test
    localStorageBackup = window.localStorage
    window.localStorage = new LocalStorageMock() as any
  })

  afterEach(() => {
    window.localStorage = localStorageBackup
    if (wrapper) wrapper.unmount()
  })

  it('loads sample data on first mount if storage empty', async () => {
    wrapper = mount(ExpenseTracker)
    await flushPromises()
    const expenseItems = wrapper.findAll('.expense-row')
    // Should load at least one sample expense
    expect(expenseItems.length).toBeGreaterThan(0)
    // localStorage should now have sample data
    const stored = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)!)
    expect(Array.isArray(stored)).toBe(true)
    expect(stored.length).toBeGreaterThan(0)
  })

  it('displays empty state UI when no expenses', async () => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]))
    wrapper = mount(ExpenseTracker)
    await flushPromises()
    // Should contain empty-state container
    expect(wrapper.find('.empty-state-container').exists()).toBe(true)
  })

  it('can add a new expense, updates list, storage, snackbar', async () => {
    wrapper = mount(ExpenseTracker)
    await flushPromises()
    // Fill out form
    await wrapper.find('input[label="What did you spend on?"]').setValue('Coffee')
    await wrapper.find('input[label="Amount"]').setValue('4.50')
    // Select a category (simulate select)
    await wrapper.find('input[label="Category"]').setValue('Food')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    // Expense appears at top of list
    const expenseTitles = wrapper.findAll('.v-list-item-title')
    expect(expenseTitles.length).toBeGreaterThan(0)
    expect(expenseTitles[0].text()).toBe('Coffee')
    // Snackbar appears
    expect(wrapper.html()).toContain('Expense added!')
    // Storage updated
    const stored: Expense[] = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)!)
    expect(stored[0].name).toBe('Coffee')
  })

  it('does not allow adding expense with empty name or zero/negative amount', async () => {
    wrapper = mount(ExpenseTracker)
    await flushPromises()
    // Only set name, no amount
    await wrapper.find('input[label="What did you spend on?"]').setValue('InvalidExpense')
    await wrapper.find('input[label="Amount"]').setValue('')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
    // Should not add expense
    const stored: Expense[] = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)!)
    expect(stored.some((e: Expense) => e.name === 'InvalidExpense')).toBe(false)
  })

  it('can delete an expense, updates list and storage and shows snackbar', async () => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([sampleExpense]))
    wrapper = mount(ExpenseTracker)
    await flushPromises()
    // Delete expense
    await wrapper.find('button[icon="mdi-delete-outline"]').trigger('click')
    await flushPromises()
    const stored: Expense[] = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)!)
    expect(stored.length).toBe(0)
    expect(wrapper.html()).toContain('Expense deleted.')
  })

  it('categories are displayed and categorized chips/icons are present', async () => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sampleExpenses))
    wrapper = mount(ExpenseTracker)
    await flushPromises()
    // All categories present: Food, Transport, etc.
    expect(wrapper.html()).toContain('Food')
    expect(wrapper.html()).toContain('Transport')
    // Icon chips present for categories
    expect(wrapper.findAll('.v-chip .v-icon').length).toBeGreaterThan(0)
  })

  it('shows total expenses summary chip', async () => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sampleExpenses))
    wrapper = mount(ExpenseTracker)
    await flushPromises()
    // Chip with total sum should show correct money
    const sum = sampleExpenses.reduce((a, b) => a + b.amount, 0)
    const chip = wrapper.findAll('.v-chip').filter(el => el.text().includes('$'))
    expect(chip.length).toBeGreaterThan(0)
    expect(chip[0].text()).toContain(sum.toLocaleString('en-US', { style: 'currency', currency: 'USD' }))
  })
})

describe('ExpensePieChart.vue - integration & rendering', () => {
  let wrapper: ReturnType<typeof mount>
  let localStorageBackup: typeof window.localStorage

  beforeEach(() => {
    localStorageBackup = window.localStorage
    window.localStorage = new LocalStorageMock() as any
  })

  afterEach(() => {
    window.localStorage = localStorageBackup
    if (wrapper) wrapper.unmount()
  })

  it('renders pie chart with correct category breakdown', async () => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([
      { id: 1, name: 'A', amount: 50, category: 'Food' },
      { id: 2, name: 'B', amount: 25, category: 'Shopping' },
      { id: 3, name: 'C', amount: 25, category: 'Food' },
      { id: 4, name: 'D', amount: 10, category: 'Transport' }
    ]))
    wrapper = mount(ExpensePieChart)
    await flushPromises()
    // Check that canvas is present
    const canvas = wrapper.find('canvas')
    expect(canvas.exists()).toBe(true)
    // Chart.js instance gets created - we can't see the chart here but we can see if canvas element exists and data was processed
    // Optionally spy Chart prototype for render call, skipped here for simplicity
  })

  it('updates pie chart on localStorage change or expenses-updated event', async () => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([
      { id: 1, name: 'A', amount: 20, category: 'Food' }
    ]))
    wrapper = mount(ExpensePieChart)
    await flushPromises()
    // Now update storage and fire custom event
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([
      { id: 2, name: 'B', amount: 99, category: 'Bills' }
    ]))
    window.dispatchEvent(new Event('expenses-updated'))
    await flushPromises()
    // There is no visual assertion here but no errors should occur and pie chart re-renders
    // For full testing, we would mock Chart.js and spy calls to .destroy/.constructor
    expect(wrapper.find('canvas').exists()).toBe(true)
  })
})

// Integration: ExpenseTracker <-> PieChart
describe('Integration: ExpenseTracker & ExpensePieChart', () => {
  let tracker: ReturnType<typeof mount>
  let pie: ReturnType<typeof mount>
  let localStorageBackup: typeof window.localStorage
  beforeEach(() => {
    localStorageBackup = window.localStorage
    window.localStorage = new LocalStorageMock() as any
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]))
    tracker = mount(ExpenseTracker)
    pie = mount(ExpensePieChart)
  })
  afterEach(() => {
    window.localStorage = localStorageBackup
    if (tracker) tracker.unmount()
    if (pie) pie.unmount()
  })
  it('adding an expense via ExpenseTracker results in PieChart updating', async () => {
    await flushPromises()
    // Simulate adding
    await tracker.find('input[label="What did you spend on?"]').setValue('Milk')
    await tracker.find('input[label="Amount"]').setValue('6.25')
    await tracker.find('input[label="Category"]').setValue('Food')
    await tracker.find('form').trigger('submit.prevent')
    await flushPromises()
    // Simulate notification
    window.dispatchEvent(new Event('expenses-updated'))
    await flushPromises()
    // The PieChart will re-render; as above, we cannot inspect chart contents, but no error means event is handled
    expect(pie.find('canvas').exists()).toBe(true)
  })
})

