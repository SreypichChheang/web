<template>
  <div>
    <div class="page-header">
      <div><h2>Transactions</h2><p class="sub">Your complete transaction history</p></div>
      <button class="btn btn-outline btn-sm" @click="downloadStatement">⬇ Download CSV</button>
    </div>

    <!-- Filters -->
    <div class="filters card">
      <div class="form-group">
        <label>Type</label>
        <select v-model="filters.type" @change="load">
          <option value="">All Types</option>
          <option value="transfer_internal">Internal Transfer</option>
          <option value="transfer_external">External Transfer</option>
          <option value="deposit">Deposit</option>
          <option value="withdrawal">Withdrawal</option>
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select v-model="filters.status" @change="load">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="flagged">Flagged</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <div class="form-group">
        <label>Start Date</label>
        <input type="date" v-model="filters.startDate" @change="load" />
      </div>
      <div class="form-group">
        <label>End Date</label>
        <input type="date" v-model="filters.endDate" @change="load" />
      </div>
    </div>

    <!-- Table -->
    <div class="table-card card">
      <div v-if="loading" class="loading-text">Loading transactions...</div>
      <div v-else-if="transactions.length === 0" class="empty">No transactions found</div>
      <table v-else class="txn-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in transactions" :key="t.id" :class="{ 'flagged-row': t.isFlagged }">
            <td>{{ new Date(t.createdAt).toLocaleDateString() }}</td>
            <td><span class="type-badge">{{ t.type.replace(/_/g, ' ') }}</span></td>
            <td>{{ t.description || '—' }}</td>
            <td :class="t.type === 'deposit' ? 'text-success' : 'text-error'">
              {{ t.type === 'deposit' ? '+' : '-' }}${{ Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </td>
            <td>
              <span class="badge" :class="statusBadge(t.status)">{{ t.status }}</span>
              <span v-if="t.isFlagged" class="flag-icon" title="Flagged">🚩</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../../stores/auth'

const transactions = ref<any[]>([])
const loading = ref(true)
const filters = ref({ type: '', status: '', startDate: '', endDate: '' })

function statusBadge(s: string) {
  const map: any = { completed: 'badge-success', pending: 'badge-warning', flagged: 'badge-error', failed: 'badge-error', approved: 'badge-success', rejected: 'badge-error' }
  return map[s] || 'badge-gray'
}

async function load() {
  loading.value = true
  try {
    const params = Object.fromEntries(Object.entries(filters.value).filter(([, v]) => v))
    const { data } = await api.get('/transactions', { params })
    transactions.value = data
  } finally { loading.value = false }
}

async function downloadStatement() {
  const res = await api.get('/transactions/statement', { responseType: 'blob' })
  const url = URL.createObjectURL(new Blob([res.data]))
  const a = document.createElement('a'); a.href = url; a.download = 'statement.csv'; a.click()
}

onMounted(load)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.page-header h2 { font-size: 22px; font-weight: 800; }
.sub { color: var(--text-medium); font-size: 14px; }
.filters { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; margin-bottom: 20px; }
.table-card { overflow-x: auto; }
.txn-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.txn-table th { padding: 12px 14px; text-align: left; font-size: 12px; font-weight: 600; color: var(--text-medium); background: var(--bg-light); text-transform: uppercase; letter-spacing: 0.5px; }
.txn-table td { padding: 14px; border-bottom: 1px solid var(--border); }
.txn-table tr:last-child td { border-bottom: none; }
.flagged-row { background: #FFF5F5; }
.type-badge { font-size: 12px; font-weight: 600; text-transform: capitalize; color: var(--text-medium); }
.flag-icon { margin-left: 6px; }
.empty { text-align: center; color: var(--text-light); padding: 60px; }
.loading-text { text-align: center; color: var(--text-light); padding: 40px; }
</style>
