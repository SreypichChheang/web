<template>
  <div>
    <h2 class="title">Support Tickets</h2>
    <p class="sub">Manage and respond to customer support requests</p>
    <div class="card table-card">
      <div v-if="loading" class="empty">Loading...</div>
      <div v-else-if="tickets.length === 0" class="empty">No tickets</div>
      <table v-else class="data-table">
        <thead><tr><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="t in tickets" :key="t.id">
            <td><div class="subject">{{ t.subject }}</div><div class="tid">{{ t.userId?.slice(0,8) }}...</div></td>
            <td><span class="badge badge-gray">{{ t.category }}</span></td>
            <td><span class="badge" :class="priorityBadge(t.priority)">{{ t.priority }}</span></td>
            <td><span class="badge" :class="statusBadge(t.status)">{{ t.status }}</span></td>
            <td>{{ new Date(t.createdAt).toLocaleDateString() }}</td>
            <td>
              <button class="btn btn-sm btn-outline" @click="openReply(t)">Reply</button>
              <select class="status-select" v-model="t.status" @change="updateStatus(t)">
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Reply Modal -->
    <div v-if="replyTicket" class="modal-overlay" @click.self="replyTicket = null">
      <div class="modal">
        <div class="modal-header"><h3>Reply to Ticket</h3><button @click="replyTicket = null">✕</button></div>
        <div class="ticket-preview">
          <strong>{{ replyTicket.subject }}</strong>
          <p>{{ replyTicket.description }}</p>
        </div>
        <div class="form-group">
          <label>Admin Response</label>
          <textarea v-model="replyText" rows="4" placeholder="Write your response..."></textarea>
        </div>
        <p v-if="replySuccess" class="success-msg">{{ replySuccess }}</p>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="replyTicket = null">Cancel</button>
          <button class="btn btn-primary" @click="submitReply">Send Reply</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../../stores/auth'
const tickets = ref<any[]>([])
const loading = ref(true)
const replyTicket = ref<any>(null)
const replyText = ref('')
const replySuccess = ref('')

function statusBadge(s: string) { const m: any = { open: 'badge-warning', in_progress: 'badge-info', resolved: 'badge-success', closed: 'badge-gray' }; return m[s] || 'badge-gray' }
function priorityBadge(p: string) { const m: any = { low: 'badge-gray', medium: 'badge-info', high: 'badge-warning', urgent: 'badge-error' }; return m[p] || 'badge-gray' }

async function updateStatus(t: any) { await api.patch(`/admin/support/tickets/${t.id}`, { status: t.status }) }
function openReply(t: any) { replyTicket.value = t; replyText.value = t.adminResponse || '' }
async function submitReply() {
  await api.patch(`/admin/support/tickets/${replyTicket.value.id}`, { adminResponse: replyText.value, status: 'in_progress' })
  replySuccess.value = 'Reply sent!'
  setTimeout(() => { replyTicket.value = null; replySuccess.value = '' }, 1200)
}

onMounted(async () => {
  loading.value = true
  try { const { data } = await api.get('/admin/support/tickets'); tickets.value = data }
  finally { loading.value = false }
})
</script>

<style scoped>
.title { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
.sub { color: var(--text-medium); font-size: 14px; margin-bottom: 20px; }
.table-card { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; color: var(--text-medium); background: var(--bg-light); text-transform: uppercase; }
.data-table td { padding: 12px; border-bottom: 1px solid var(--border); vertical-align: top; }
.subject { font-weight: 600; font-size: 13px; }
.tid { font-size: 11px; color: var(--text-light); font-family: monospace; }
.status-select { margin-left: 6px; font-size: 12px; padding: 4px 6px; border: 1px solid var(--border); border-radius: 6px; cursor: pointer; }
.empty { text-align: center; color: var(--text-light); padding: 60px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px; }
.modal { background: white; border-radius: var(--radius-lg); padding: 28px; width: 100%; max-width: 480px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.modal-header h3 { font-size: 18px; font-weight: 700; }
.modal-header button { background: none; font-size: 18px; cursor: pointer; }
.ticket-preview { background: var(--bg-light); padding: 14px; border-radius: 8px; margin-bottom: 16px; }
.ticket-preview strong { font-size: 14px; }
.ticket-preview p { font-size: 13px; color: var(--text-medium); margin-top: 6px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
.success-msg { color: var(--success); font-size: 13px; }
</style>
