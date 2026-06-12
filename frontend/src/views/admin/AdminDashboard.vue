<template>
  <div>
    <div class="dash-header">
      <h2>Admin Dashboard</h2>
      <p class="sub">System overview and quick actions</p>
    </div>

    <div class="stats-grid" v-if="dashboard">
      <div v-for="s in statCards" :key="s.label" class="stat-card" :class="'stat-' + s.color">
        <div class="stat-icon">{{ s.icon }}</div>
        <div class="stat-val">{{ s.value }}</div>
        <div class="stat-lbl">{{ s.label }}</div>
      </div>
    </div>

    <!-- Recent Audit Logs -->
    <div class="recent-logs card">
      <h3>Recent Activity</h3>
      <div v-if="dashboard?.recentLogs?.length === 0" class="empty">No recent activity</div>
      <div v-for="log in dashboard?.recentLogs" :key="log.id" class="log-row">
        <div class="log-action">{{ log.action }}</div>
        <div class="log-detail">{{ log.details }}</div>
        <div class="log-time">{{ new Date(log.createdAt).toLocaleString() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '../../stores/auth'

const dashboard = ref<any>(null)

const statCards = computed(() => {
  if (!dashboard.value) return []
  const s = dashboard.value.stats
  return [
    { icon: '👥', label: 'Total Users', value: s.totalUsers, color: 'blue' },
    { icon: '✅', label: 'Active Users', value: s.activeUsers, color: 'green' },
    { icon: '🔒', label: 'Locked Accounts', value: s.lockedUsers, color: 'red' },
    { icon: '💸', label: 'Total Transactions', value: s.totalTransactions, color: 'purple' },
    { icon: '🚩', label: 'Flagged Transactions', value: s.flaggedTransactions, color: 'orange' },
    { icon: '🌐', label: 'Active Sessions', value: s.activeSessions, color: 'teal' },
    { icon: '🎫', label: 'Open Tickets', value: s.openTickets, color: 'yellow' },
  ]
})

onMounted(async () => {
  const { data } = await api.get('/admin/dashboard')
  dashboard.value = data
})
</script>

<style scoped>
.dash-header { margin-bottom: 24px; }
.dash-header h2 { font-size: 22px; font-weight: 800; }
.sub { color: var(--text-medium); font-size: 14px; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat-card { background: white; border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow); border-left: 4px solid transparent; }
.stat-blue { border-color: #3B82F6; }
.stat-green { border-color: #10B981; }
.stat-red { border-color: #EF4444; }
.stat-purple { border-color: #8B5CF6; }
.stat-orange { border-color: #F59E0B; }
.stat-teal { border-color: #14B8A6; }
.stat-yellow { border-color: #F59E0B; }
.stat-icon { font-size: 24px; margin-bottom: 8px; }
.stat-val { font-size: 32px; font-weight: 800; color: var(--text-dark); }
.stat-lbl { font-size: 12px; color: var(--text-medium); margin-top: 4px; }
.recent-logs h3 { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
.log-row { display: flex; gap: 16px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
.log-row:last-child { border-bottom: none; }
.log-action { font-weight: 600; color: var(--primary); min-width: 140px; }
.log-detail { flex: 1; color: var(--text-medium); }
.log-time { color: var(--text-light); min-width: 140px; text-align: right; }
.empty { text-align: center; color: var(--text-light); padding: 40px; }
</style>
