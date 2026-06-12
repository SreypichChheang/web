<template>
  <div>
    <h2 class="title">Active Sessions</h2>
    <p class="sub">All currently active user sessions</p>
    <div class="card table-card">
      <table class="data-table" v-if="sessions.length > 0">
        <thead><tr><th>User ID</th><th>IP Address</th><th>Device</th><th>Started</th><th>Expires</th></tr></thead>
        <tbody>
          <tr v-for="s in sessions" :key="s.id">
            <td class="mono">{{ s.userId?.slice(0, 8) }}...</td>
            <td>{{ s.ipAddress || '—' }}</td>
            <td>{{ s.device || 'Unknown' }}</td>
            <td>{{ new Date(s.createdAt).toLocaleString() }}</td>
            <td>{{ s.expiresAt ? new Date(s.expiresAt).toLocaleString() : '—' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="sessions.length === 0" class="empty">No active sessions</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../../stores/auth'
const sessions = ref<any[]>([])
onMounted(async () => { const { data } = await api.get('/admin/sessions'); sessions.value = data })
</script>

<style scoped>
.title { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
.sub { color: var(--text-medium); font-size: 14px; margin-bottom: 20px; }
.table-card { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; color: var(--text-medium); background: var(--bg-light); text-transform: uppercase; }
.data-table td { padding: 12px; border-bottom: 1px solid var(--border); }
.mono { font-family: monospace; font-size: 12px; color: var(--text-light); }
.empty { text-align: center; color: var(--text-light); padding: 60px; }
</style>
