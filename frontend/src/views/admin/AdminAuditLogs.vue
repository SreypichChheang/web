<template>
  <div>
    <div class="page-header">
      <div><h2>Audit Logs</h2><p class="sub">Complete system activity log</p></div>
    </div>
    <div class="filters card">
      <div class="form-group">
        <label>Search</label>
        <input v-model="search" placeholder="Search by action or details..." @input="load" />
      </div>
    </div>
    <div class="card table-card">
      <div v-if="loading" class="empty">Loading...</div>
      <div v-else-if="logs.length === 0" class="empty">No logs found</div>
      <table v-else class="data-table">
        <thead><tr><th>Timestamp</th><th>Action</th><th>User ID</th><th>Details</th><th>IP</th></tr></thead>
        <tbody>
          <tr v-for="l in logs" :key="l.id">
            <td class="time">{{ new Date(l.createdAt).toLocaleString() }}</td>
            <td><span class="action-badge">{{ l.action }}</span></td>
            <td class="mono">{{ l.userId?.slice(0,8) || '—' }}...</td>
            <td>{{ l.details || '—' }}</td>
            <td>{{ l.ipAddress || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../../stores/auth'
const logs = ref<any[]>([])
const loading = ref(true)
const search = ref('')
async function load() {
  loading.value = true
  try {
    const params: any = {}
    if (search.value) params.search = search.value
    const { data } = await api.get('/admin/audit-logs', { params })
    logs.value = data
  } finally { loading.value = false }
}
onMounted(load)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.page-header h2 { font-size: 22px; font-weight: 800; }
.sub { color: var(--text-medium); font-size: 14px; }
.filters { margin-bottom: 16px; }
.table-card { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; color: var(--text-medium); background: var(--bg-light); text-transform: uppercase; }
.data-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); }
.action-badge { font-size: 11px; font-weight: 700; background: #DBEAFE; color: #1E40AF; padding: 3px 8px; border-radius: 4px; }
.time { font-size: 12px; color: var(--text-light); white-space: nowrap; }
.mono { font-family: monospace; font-size: 12px; color: var(--text-light); }
.empty { text-align: center; color: var(--text-light); padding: 60px; }
</style>
