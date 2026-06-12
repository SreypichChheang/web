<template>
  <div class="dashboard-home">
    <!-- Greeting -->
    <div class="greeting-bar">
      <div>
        <h1 class="greeting">Good {{ timeOfDay }}, {{ auth.user?.firstName }}! 👋</h1>
        <p class="greeting-sub">Here's your financial overview</p>
      </div>
      <button class="btn btn-primary" @click="showTransfer = true">+ New Transfer</button>
    </div>

    <!-- Balance cards -->
    <div class="balance-grid" v-if="!loading">
      <div class="balance-card total-card">
        <div class="bc-label">Total Balance</div>
        <div class="bc-value">${{ formatMoney(totalBalance) }}</div>
        <div class="bc-sub">Across all accounts</div>
      </div>
      <div v-for="acc in accounts" :key="acc.id" class="balance-card">
        <div class="bc-label">{{ acc.type | capitalize }}</div>
        <div class="bc-value" :class="{ negative: acc.balance < 0 }">${{ formatMoney(acc.balance) }}</div>
        <div class="bc-sub">{{ acc.accountNumber }}</div>
        <div class="bc-badge" :class="'badge-' + (acc.status === 'active' ? 'success' : 'warning')">{{ acc.status }}</div>
      </div>
    </div>
    <div v-else class="loading-grid">
      <div v-for="i in 4" :key="i" class="skeleton-card"></div>
    </div>

    <!-- Quick actions -->
    <div class="quick-actions">
      <h3>Quick Actions</h3>
      <div class="actions-row">
        <button v-for="a in quickActions" :key="a.label" class="action-btn" @click="a.action()">
          <div class="action-icon">{{ a.icon }}</div>
          <div class="action-label">{{ a.label }}</div>
        </button>
      </div>
    </div>

    <!-- Recent transactions -->
    <div class="recent-section">
      <div class="section-header">
        <h3>Recent Transactions</h3>
        <router-link to="/dashboard/transactions" class="see-all">See All →</router-link>
      </div>
      <div class="txn-list" v-if="!loading">
        <div v-if="transactions.length === 0" class="empty-state">No transactions yet</div>
        <div v-for="t in transactions.slice(0, 5)" :key="t.id" class="txn-row">
          <div class="txn-icon" :class="'txn-' + t.type.split('_')[0]">
            {{ getTxnIcon(t.type) }}
          </div>
          <div class="txn-info">
            <div class="txn-desc">{{ t.description || t.type.replace(/_/g, ' ') }}</div>
            <div class="txn-date">{{ formatDate(t.createdAt) }}</div>
          </div>
          <div class="txn-right">
            <div class="txn-amount" :class="getAmountClass(t)">
              {{ getAmountSign(t) }}${{ formatMoney(t.amount) }}
            </div>
            <div class="badge" :class="getStatusBadge(t.status)">{{ t.status }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <div v-if="showTransfer" class="modal-overlay" @click.self="showTransfer = false">
      <div class="modal">
        <div class="modal-header">
          <h3>New Transfer</h3>
          <button @click="showTransfer = false">✕</button>
        </div>
        <form @submit.prevent="submitTransfer">
          <div class="form-group">
            <label>Transfer Type</label>
            <select v-model="transferForm.type">
              <option value="internal">Internal (between my accounts)</option>
              <option value="external">External (to other bank)</option>
            </select>
          </div>
          <div class="form-group">
            <label>From Account</label>
            <select v-model="transferForm.fromAccountId" required>
              <option v-for="acc in accounts.filter(a => a.balance > 0)" :key="acc.id" :value="acc.id">
                {{ acc.type }} - ${{ formatMoney(acc.balance) }}
              </option>
            </select>
          </div>
          <div class="form-group" v-if="transferForm.type === 'internal'">
            <label>To Account</label>
            <select v-model="transferForm.toAccountId" required>
              <option v-for="acc in accounts.filter(a => a.id !== transferForm.fromAccountId)" :key="acc.id" :value="acc.id">
                {{ acc.type }} - {{ acc.accountNumber }}
              </option>
            </select>
          </div>
          <template v-else>
            <div class="form-group">
              <label>To Account Number</label>
              <input v-model="transferForm.toAccountNumber" placeholder="Recipient account number" required />
            </div>
            <div class="form-group">
              <label>Bank Name</label>
              <input v-model="transferForm.toBankName" placeholder="e.g. Chase Bank" />
            </div>
          </template>
          <div class="form-group">
            <label>Amount (USD)</label>
            <input v-model.number="transferForm.amount" type="number" min="1" step="0.01" placeholder="0.00" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <input v-model="transferForm.description" placeholder="Transfer note" />
          </div>
          <div class="form-group">
            <label>Schedule Date (optional)</label>
            <input v-model="transferForm.scheduledAt" type="datetime-local" />
          </div>
          <p v-if="transferError" class="error-msg">{{ transferError }}</p>
          <p v-if="transferSuccess" class="success-msg">{{ transferSuccess }}</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="showTransfer = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Send Transfer</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, api } from '../../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const loading = ref(true)
const accounts = ref<any[]>([])
const transactions = ref<any[]>([])
const showTransfer = ref(false)
const transferError = ref('')
const transferSuccess = ref('')
const transferForm = ref({ type: 'internal', fromAccountId: '', toAccountId: '', toAccountNumber: '', toBankName: '', amount: 0, description: '', scheduledAt: '' })

const timeOfDay = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Morning'
  if (h < 17) return 'Afternoon'
  return 'Evening'
})

const totalBalance = computed(() => accounts.value.reduce((s, a) => s + Number(a.balance), 0))

const quickActions = [
  { icon: '💸', label: 'Transfer', action: () => showTransfer.value = true },
  { icon: '🏦', label: 'Accounts', action: () => router.push('/dashboard/accounts') },
  { icon: '💳', label: 'Cards', action: () => router.push('/dashboard/cards') },
  { icon: '📊', label: 'Transactions', action: () => router.push('/dashboard/transactions') },
  { icon: '🆘', label: 'Support', action: () => router.push('/dashboard/support') },
]

function formatMoney(v: number) {
  return Math.abs(Number(v)).toLocaleString('en-US', { minimumFractionDigits: 2 })
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function getTxnIcon(type: string) {
  const map: any = { transfer_internal: '🔄', transfer_external: '➡️', deposit: '⬇️', withdrawal: '⬆️', scheduled: '📅' }
  return map[type] || '💰'
}
function getAmountClass(t: any) {
  if (t.type === 'deposit') return 'amount-positive'
  if (t.type === 'withdrawal' || t.type.includes('transfer')) return 'amount-negative'
  return ''
}
function getAmountSign(t: any) {
  return t.type === 'deposit' ? '+' : '-'
}
function getStatusBadge(status: string) {
  const map: any = { completed: 'badge-success', pending: 'badge-warning', flagged: 'badge-error', failed: 'badge-error', approved: 'badge-success', rejected: 'badge-error' }
  return map[status] || 'badge-gray'
}

async function submitTransfer() {
  transferError.value = ''; transferSuccess.value = ''
  try {
    await api.post('/transactions/transfer', transferForm.value)
    transferSuccess.value = 'Transfer submitted successfully!'
    setTimeout(() => { showTransfer.value = false; loadData() }, 1500)
  } catch (e: any) {
    transferError.value = e.response?.data?.message || 'Transfer failed'
  }
}

async function loadData() {
  loading.value = true
  try {
    const [accRes, txnRes] = await Promise.all([api.get('/accounts'), api.get('/transactions')])
    accounts.value = accRes.data
    transactions.value = txnRes.data
  } finally { loading.value = false }
}

onMounted(loadData)
</script>

<style scoped>
.dashboard-home { max-width: 900px; }
.greeting-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
.greeting { font-size: 26px; font-weight: 800; margin-bottom: 4px; }
.greeting-sub { color: var(--text-medium); }

/* Balance grid */
.balance-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
.balance-card {
  background: white; border-radius: var(--radius); padding: 20px;
  box-shadow: var(--shadow); position: relative;
}
.total-card { background: linear-gradient(135deg, var(--primary), var(--accent)); color: white; }
.bc-label { font-size: 13px; opacity: 0.8; margin-bottom: 8px; }
.bc-value { font-size: 24px; font-weight: 800; }
.negative { color: var(--error); }
.bc-sub { font-size: 12px; opacity: 0.7; margin-top: 4px; }
.bc-badge { position: absolute; top: 14px; right: 14px; padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }

.loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
.skeleton-card { height: 100px; border-radius: var(--radius); background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }

/* Quick actions */
.quick-actions { background: white; border-radius: var(--radius); padding: 20px; margin-bottom: 24px; box-shadow: var(--shadow); }
.quick-actions h3 { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
.actions-row { display: flex; gap: 12px; flex-wrap: wrap; }
.action-btn { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 24px; border-radius: var(--radius-sm); border: 1.5px solid var(--border); background: var(--bg-light); cursor: pointer; transition: all 0.2s; min-width: 80px; }
.action-btn:hover { border-color: var(--primary); background: #EFF6FF; }
.action-icon { font-size: 24px; }
.action-label { font-size: 12px; font-weight: 600; color: var(--text-medium); }

/* Transactions */
.recent-section { background: white; border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { font-size: 16px; font-weight: 700; }
.see-all { font-size: 13px; color: var(--primary); font-weight: 600; }
.txn-row { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--border); }
.txn-row:last-child { border-bottom: none; }
.txn-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; background: var(--bg-light); flex-shrink: 0; }
.txn-info { flex: 1; }
.txn-desc { font-size: 14px; font-weight: 500; text-transform: capitalize; }
.txn-date { font-size: 12px; color: var(--text-light); }
.txn-right { text-align: right; }
.txn-amount { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
.amount-positive { color: var(--success); }
.amount-negative { color: var(--error); }
.empty-state { text-align: center; color: var(--text-light); padding: 32px; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px; }
.modal { background: white; border-radius: var(--radius-lg); padding: 28px; width: 100%; max-width: 480px; max-height: 80vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { font-size: 18px; font-weight: 700; }
.modal-header button { background: none; font-size: 18px; cursor: pointer; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
.error-msg { color: var(--error); font-size: 13px; margin-bottom: 8px; }
.success-msg { color: var(--success); font-size: 13px; margin-bottom: 8px; }
</style>
