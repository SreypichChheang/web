<template>
  <div>
    <div class="page-header">
      <div><h2>Support</h2><p class="sub">Get help from our team</p></div>
      <button class="btn btn-primary" @click="showCreate = true">+ New Ticket</button>
    </div>

    <div class="support-grid">
      <!-- Tickets -->
      <div class="tickets-section">
        <h3>My Tickets</h3>
        <div class="ticket-list" v-if="!loading">
          <div v-if="tickets.length === 0" class="empty">No tickets yet</div>
          <div v-for="t in tickets" :key="t.id" class="ticket-card">
            <div class="ticket-top">
              <h4>{{ t.subject }}</h4>
              <span class="badge" :class="statusBadge(t.status)">{{ t.status }}</span>
            </div>
            <p class="ticket-desc">{{ t.description }}</p>
            <div class="ticket-meta">
              <span class="badge badge-gray">{{ t.category }}</span>
              <span class="badge" :class="priorityBadge(t.priority)">{{ t.priority }}</span>
              <span class="ticket-date">{{ new Date(t.createdAt).toLocaleDateString() }}</span>
            </div>
            <div v-if="t.adminResponse" class="admin-reply">
              <strong>📬 Admin Reply:</strong> {{ t.adminResponse }}
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ & Contact -->
      <div class="info-section">
        <div class="faq-box card">
          <h3>Frequently Asked Questions</h3>
          <div v-for="faq in faqs" :key="faq.q" class="faq-item">
            <div class="faq-q" @click="faq.open = !faq.open">
              {{ faq.q }} <span>{{ faq.open ? '▲' : '▼' }}</span>
            </div>
            <div v-if="faq.open" class="faq-a">{{ faq.a }}</div>
          </div>
        </div>
        <div class="contact-box card">
          <h3>Contact Us</h3>
          <div class="contact-item">📞 +1 (800) 555-0199</div>
          <div class="contact-item">📧 support@nexabank.com</div>
          <div class="contact-item">🕐 Mon-Fri: 9:00 - 18:00</div>
          <div class="contact-item">💬 Live chat: Available 24/7</div>
        </div>
      </div>
    </div>

    <!-- Create Ticket Modal -->
    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Create Support Ticket</h3>
          <button @click="showCreate = false">✕</button>
        </div>
        <form @submit.prevent="createTicket">
          <div class="form-group">
            <label>Subject</label>
            <input v-model="ticketForm.subject" placeholder="Brief description of your issue" required />
          </div>
          <div class="form-group">
            <label>Category</label>
            <select v-model="ticketForm.category">
              <option value="account">Account</option>
              <option value="transaction">Transaction</option>
              <option value="card">Card</option>
              <option value="loan">Loan</option>
              <option value="security">Security</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Priority</label>
            <select v-model="ticketForm.priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="ticketForm.description" rows="4" placeholder="Describe your issue in detail" required></textarea>
          </div>
          <p v-if="error" class="error-msg">{{ error }}</p>
          <p v-if="success" class="success-msg">{{ success }}</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="showCreate = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Submit Ticket</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { api } from '../../stores/auth'

const tickets = ref<any[]>([])
const loading = ref(true)
const showCreate = ref(false)
const error = ref(''), success = ref('')
const ticketForm = ref({ subject: '', description: '', category: 'account', priority: 'medium' })
const faqs = reactive([
  { q: 'How do I reset my PIN?', a: 'Go to Cards section and click "Change PIN" on your card.', open: false },
  { q: 'How to transfer money?', a: 'Use the Transfer button on the dashboard or Transactions page.', open: false },
  { q: 'Why was my transfer flagged?', a: 'Transfers over $10,000 are automatically flagged for security review.', open: false },
  { q: 'How to freeze my card?', a: 'Go to Cards section and click the Freeze button on your card.', open: false },
])

function statusBadge(s: string) {
  const m: any = { open: 'badge-warning', in_progress: 'badge-info', resolved: 'badge-success', closed: 'badge-gray' }
  return m[s] || 'badge-gray'
}
function priorityBadge(p: string) {
  const m: any = { low: 'badge-gray', medium: 'badge-info', high: 'badge-warning', urgent: 'badge-error' }
  return m[p] || 'badge-gray'
}

async function createTicket() {
  error.value = ''; success.value = ''
  try {
    await api.post('/support/tickets', ticketForm.value)
    success.value = 'Ticket submitted!'
    setTimeout(() => { showCreate.value = false; load() }, 1200)
  } catch (e: any) { error.value = e.response?.data?.message || 'Failed' }
}

async function load() {
  loading.value = true
  try { const { data } = await api.get('/support/tickets'); tickets.value = data }
  finally { loading.value = false }
}
onMounted(load)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-header h2 { font-size: 22px; font-weight: 800; }
.sub { color: var(--text-medium); font-size: 14px; }
.support-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
.tickets-section h3, .info-section h3 { font-size: 16px; font-weight: 700; margin-bottom: 16px; }
.ticket-card { background: white; border-radius: var(--radius); padding: 18px; margin-bottom: 14px; box-shadow: var(--shadow); }
.ticket-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.ticket-top h4 { font-size: 14px; font-weight: 600; }
.ticket-desc { font-size: 13px; color: var(--text-medium); margin-bottom: 10px; }
.ticket-meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.ticket-date { font-size: 12px; color: var(--text-light); margin-left: auto; }
.admin-reply { margin-top: 12px; padding: 10px; background: #F0FFF4; border-radius: 8px; font-size: 13px; color: var(--text-medium); }
.faq-box, .contact-box { margin-bottom: 16px; }
.faq-item { border-bottom: 1px solid var(--border); }
.faq-item:last-child { border-bottom: none; }
.faq-q { display: flex; justify-content: space-between; padding: 12px 0; font-size: 14px; font-weight: 500; cursor: pointer; }
.faq-a { padding: 0 0 12px; font-size: 13px; color: var(--text-medium); }
.contact-item { padding: 8px 0; font-size: 14px; color: var(--text-medium); border-bottom: 1px solid var(--border); }
.contact-item:last-child { border-bottom: none; }
.empty { text-align: center; color: var(--text-light); padding: 40px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px; }
.modal { background: white; border-radius: var(--radius-lg); padding: 28px; width: 100%; max-width: 480px; max-height: 85vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { font-size: 18px; font-weight: 700; }
.modal-header button { background: none; font-size: 18px; cursor: pointer; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
.error-msg { color: var(--error); font-size: 13px; margin-bottom: 8px; }
.success-msg { color: var(--success); font-size: 13px; margin-bottom: 8px; }
@media (max-width: 768px) { .support-grid { grid-template-columns: 1fr; } }
</style>
