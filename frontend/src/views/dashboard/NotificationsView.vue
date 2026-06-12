<template>
  <div>
    <div class="page-header">
      <div><h2>Notifications</h2><p class="sub">Stay updated on your account activity</p></div>
      <button class="btn btn-outline btn-sm" @click="markAll">✓ Mark All Read</button>
    </div>

    <div class="notif-list card" v-if="!loading">
      <div v-if="notifications.length === 0" class="empty">No notifications</div>
      <div v-for="n in notifications" :key="n.id" class="notif-item" :class="{ unread: !n.isRead }">
        <div class="notif-icon" :class="'notif-' + n.type">{{ typeIcon(n.type) }}</div>
        <div class="notif-body">
          <div class="notif-title">{{ n.title }}</div>
          <div class="notif-message">{{ n.message }}</div>
          <div class="notif-date">{{ new Date(n.createdAt).toLocaleString() }}</div>
        </div>
        <div class="notif-actions">
          <span class="badge" :class="typeBadge(n.type)">{{ n.type }}</span>
          <button v-if="!n.isRead" class="read-btn" @click="markOne(n.id)">Mark read</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../../stores/auth'

const notifications = ref<any[]>([])
const loading = ref(true)

function typeIcon(t: string) {
  const m: any = { transfer: '💸', login: '🔐', security: '🛡️', alert: '⚠️', system: '⚙️' }
  return m[t] || '🔔'
}
function typeBadge(t: string) {
  const m: any = { transfer: 'badge-info', login: 'badge-success', security: 'badge-error', alert: 'badge-warning', system: 'badge-gray' }
  return m[t] || 'badge-gray'
}

async function markAll() {
  await api.post('/notifications/read')
  notifications.value.forEach(n => n.isRead = true)
}

async function markOne(id: string) {
  await api.post(`/notifications/read/${id}`)
  const n = notifications.value.find(x => x.id === id)
  if (n) n.isRead = true
}

onMounted(async () => {
  try { const { data } = await api.get('/notifications'); notifications.value = data.notifications }
  finally { loading.value = false }
})
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.page-header h2 { font-size: 22px; font-weight: 800; }
.sub { color: var(--text-medium); font-size: 14px; }
.notif-item { display: flex; gap: 14px; align-items: flex-start; padding: 16px 0; border-bottom: 1px solid var(--border); }
.notif-item:last-child { border-bottom: none; }
.unread { background: #F0F9FF; margin: 0 -24px; padding: 16px 24px; border-radius: 8px; }
.notif-icon { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; background: var(--bg-light); flex-shrink: 0; }
.notif-transfer { background: #DBEAFE; }
.notif-security { background: #FEE2E2; }
.notif-login { background: #D1FAE5; }
.notif-alert { background: #FEF3C7; }
.notif-body { flex: 1; }
.notif-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.notif-message { font-size: 13px; color: var(--text-medium); margin-bottom: 4px; }
.notif-date { font-size: 12px; color: var(--text-light); }
.notif-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.read-btn { background: none; border: none; font-size: 12px; color: var(--primary); cursor: pointer; font-weight: 500; }
.empty { text-align: center; color: var(--text-light); padding: 60px; }
</style>
