<template>
  <div>
    <div class="page-header">
      <div><h2>Cards</h2><p class="sub">Manage your debit and credit cards</p></div>
      <button class="btn btn-primary" @click="showRequest = true">+ Request Card</button>
    </div>

    <div class="cards-grid" v-if="!loading">
      <div v-for="card in cards" :key="card.id" class="card-item">
        <div class="card-visual" :class="card.type + '-card'">
          <div class="card-top">
            <div class="card-bank">🏦 NexaBank</div>
            <div class="card-network">{{ card.network === 'visa' ? '💳 VISA' : '🔵 MC' }}</div>
          </div>
          <div class="card-chip">◈</div>
          <div class="card-number">{{ card.cardNumber }}</div>
          <div class="card-bottom">
            <div>
              <div class="card-label">CARD HOLDER</div>
              <div class="card-val">{{ card.cardHolderName }}</div>
            </div>
            <div>
              <div class="card-label">EXPIRES</div>
              <div class="card-val">{{ card.expiryMonth }}/{{ card.expiryYear }}</div>
            </div>
            <div class="card-type-badge">{{ card.type.toUpperCase() }}</div>
          </div>
        </div>
        <div class="card-info">
          <div class="card-status">
            <span class="badge" :class="statusBadge(card.status)">{{ card.status }}</span>
            <span class="daily-limit">Daily limit: ${{ Number(card.dailyLimit).toLocaleString() }}</span>
          </div>
          <div class="card-actions">
            <button v-if="card.status !== 'blocked'" class="btn btn-sm" :class="card.status === 'frozen' ? 'btn-success' : 'btn-outline'" @click="updateCard(card.id, 'freeze')">
              {{ card.status === 'frozen' ? '❄️ Unfreeze' : '❄️ Freeze' }}
            </button>
            <button v-if="card.status !== 'blocked'" class="btn btn-sm btn-danger" @click="blockCard(card)">Block</button>
            <button class="btn btn-sm btn-outline" @click="changePin(card.id)">Change PIN</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!loading && cards.length === 0" class="empty">No cards found. Request your first card!</div>

    <!-- Request Card Modal -->
    <div v-if="showRequest" class="modal-overlay" @click.self="showRequest = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Request New Card</h3>
          <button @click="showRequest = false">✕</button>
        </div>
        <form @submit.prevent="requestCard">
          <div class="form-group">
            <label>Card Holder Name</label>
            <input v-model="cardForm.cardHolderName" placeholder="JOHN DOE" style="text-transform:uppercase" required />
          </div>
          <div class="form-group">
            <label>Card Type</label>
            <select v-model="cardForm.type">
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
            </select>
          </div>
          <div class="form-group">
            <label>Network</label>
            <select v-model="cardForm.network">
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
            </select>
          </div>
          <div class="form-group">
            <label>Daily Limit ($)</label>
            <input v-model.number="cardForm.dailyLimit" type="number" min="100" placeholder="3000" />
          </div>
          <p v-if="error" class="error-msg">{{ error }}</p>
          <p v-if="success" class="success-msg">{{ success }}</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="showRequest = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Request Card</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../../stores/auth'

const cards = ref<any[]>([])
const loading = ref(true)
const showRequest = ref(false)
const error = ref(''), success = ref('')
const cardForm = ref({ cardHolderName: '', type: 'debit', network: 'visa', dailyLimit: 3000 })

function statusBadge(s: string) {
  const map: any = { active: 'badge-success', frozen: 'badge-warning', blocked: 'badge-error', expired: 'badge-gray' }
  return map[s] || 'badge-gray'
}

async function updateCard(id: string, action: string) {
  try { await api.patch(`/cards/${id}`, { action }); load() } catch {}
}

async function blockCard(card: any) {
  if (confirm(`Permanently block card ${card.cardNumber}? This cannot be undone.`)) {
    await updateCard(card.id, 'block')
  }
}

async function changePin(id: string) {
  const pin = prompt('Enter new 4-digit PIN:')
  if (pin && pin.length === 4) {
    try { await api.patch(`/cards/${id}`, { action: 'changePin', pin }); alert('PIN changed!') } catch {}
  }
}

async function requestCard() {
  error.value = ''; success.value = ''
  try {
    await api.post('/cards', cardForm.value)
    success.value = 'Card requested!'
    setTimeout(() => { showRequest.value = false; load() }, 1200)
  } catch (e: any) { error.value = e.response?.data?.message || 'Failed' }
}

async function load() {
  loading.value = true
  try { const { data } = await api.get('/cards'); cards.value = data }
  finally { loading.value = false }
}
onMounted(load)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-header h2 { font-size: 22px; font-weight: 800; }
.sub { color: var(--text-medium); font-size: 14px; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
.card-item { background: white; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); }
.card-visual {
  padding: 24px;
  color: white;
  min-height: 180px;
  display: flex; flex-direction: column; justify-content: space-between;
  position: relative;
}
.debit-card { background: linear-gradient(135deg, var(--primary), var(--accent)); }
.credit-card { background: linear-gradient(135deg, #1a1a2e, #16213e); }
.card-top { display: flex; justify-content: space-between; align-items: center; }
.card-bank { font-size: 14px; font-weight: 700; }
.card-network { font-size: 13px; }
.card-chip { font-size: 24px; }
.card-number { font-family: monospace; font-size: 18px; letter-spacing: 2px; font-weight: 600; }
.card-bottom { display: flex; align-items: flex-end; gap: 20px; }
.card-label { font-size: 10px; opacity: 0.7; margin-bottom: 2px; }
.card-val { font-size: 13px; font-weight: 600; }
.card-type-badge { margin-left: auto; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.card-info { padding: 16px 20px; }
.card-status { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.daily-limit { font-size: 13px; color: var(--text-medium); }
.card-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.empty { text-align: center; color: var(--text-light); padding: 60px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px; }
.modal { background: white; border-radius: var(--radius-lg); padding: 28px; width: 100%; max-width: 440px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { font-size: 18px; font-weight: 700; }
.modal-header button { background: none; font-size: 18px; cursor: pointer; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
.error-msg { color: var(--error); font-size: 13px; margin-bottom: 8px; }
.success-msg { color: var(--success); font-size: 13px; margin-bottom: 8px; }
</style>
