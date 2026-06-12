<template>
  <div>
    <div class="page-header">
      <div><h2>Transaction Control</h2><p class="sub">Manage and review all transactions</p></div>
      <label class="toggle-flagged">
        <input type="checkbox" v-model="showFlagged" @change="load" />
        <span>Flagged Only</span>
      </label>
    </div>

    <div class="card table-card">
      <div v-if="loading" class="loading-text">Loading...</div>
      <div v-else-if="transactions.length === 0" class="empty">No transactions</div>
      <table v-else class="data-table">
        <thead><tr><th>Date</th><th>User</th><th>Type</th><th>Amount</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="t in transactions" :key="t.id" :class="{ 'flagged-row': t.isFlagged }">
            <td>{{ new Date(t.createdAt).toLocaleDateString() }}</td>
            <td class="user-id">{{ t.userId?.slice(0, 8) }}...</td>
            <td>{{ t.type.replace(/_/g,' ') }}</td>
            <td :class="t.type === 'deposit' ? 'text-success' : 'text-error'">${{ Number(t.amount).toLocaleString() }}</td>
            <td>{{ t.description || '—' }}</td>
            <td>
              <span class="badge" :class="statusBadge(t.status)">{{ t.status }}</span>
              <span v-if="t.isFlagged" title="Flagged" class="flag">🚩</span>
            </td>
            <td>
              <div v-if="t.isFlagged || t.status === 'pending'" class="action-btns">
                <button class="btn btn-sm btn-success" @click="updateTxn(t.id, 'approve')">Approve</button>
                <button class="btn btn-sm btn-danger" @click="updateTxn(t.id, 'reject')">Reject</button>
              </div>
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
const showFlagged = ref(false)

function statusBadge(s: string) { const m: any = { completed: 'badge-success', pending: 'badge-warning', flagged: 'badge-error', approved: 'badge-success', rejected: 'badge-error' }; return m[s] || 'badge-gray' }

async function updateTxn(id: string, action: string) {
  await api.patch(`/admin/transactions/${id}`, { action })
  load()
}

async function load() {
  loading.value = true
  try {
    const params: any = {}
    if (showFlagged.value) params.isFlagged = 'true'
    const { data } = await api.get('/admin/transactions', { params })
    transactions.value = data
  } finally { loading.value = false }
}
onMounted(load)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.page-header h2 { font-size: 22px; font-weight: 800; }
.sub { color: var(--text-medium); font-size: 14px; }
.toggle-flagged { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; cursor: pointer; }
.table-card { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; color: var(--text-medium); background: var(--bg-light); text-transform: uppercase; letter-spacing: 0.5px; }
.data-table td { padding: 12px; border-bottom: 1px solid var(--border); }
.flagged-row { background: #FFF5F5; }
.flag { margin-left: 4px; }
.action-btns { display: flex; gap: 6px; }
.loading-text, .empty { text-align: center; color: var(--text-light); padding: 40px; }
.user-id { font-family: monospace; font-size: 12px; color: var(--text-light); }
</style>
