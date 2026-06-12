<template>
  <div>
    <div class="page-header">
      <div><h2>My Accounts</h2><p class="sub">Manage your bank accounts</p></div>
      <button class="btn btn-primary" @click="showOpen = true">+ Open Account</button>
    </div>

    <div class="accounts-grid" v-if="!loading">
      <div v-for="acc in accounts" :key="acc.id" class="account-card">
        <div class="ac-top">
          <div class="ac-type-icon">{{ typeIcon(acc.type) }}</div>
          <div class="badge" :class="statusBadge(acc.status)">{{ acc.status }}</div>
        </div>
        <div class="ac-type">{{ acc.type }} Account</div>
        <div class="ac-number">{{ acc.accountNumber }}</div>
        <div class="ac-balance" :class="{ negative: acc.balance < 0 }">
          ${{ Math.abs(Number(acc.balance)).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </div>
        <div class="ac-meta">
          <span v-if="acc.interestRate > 0">Interest: {{ acc.interestRate }}%</span>
          <span>{{ acc.currency }}</span>
        </div>
        <div class="ac-date">Opened {{ new Date(acc.createdAt).toLocaleDateString() }}</div>
      </div>
    </div>
    <div v-if="!loading && accounts.length === 0" class="empty">No accounts found</div>

    <!-- Open Account Modal -->
    <div v-if="showOpen" class="modal-overlay" @click.self="showOpen = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Open New Account</h3>
          <button @click="showOpen = false">✕</button>
        </div>
        <form @submit.prevent="openAccount">
          <div class="form-group">
            <label>Account Type</label>
            <select v-model="openForm.type" required>
              <option value="savings">Savings Account</option>
              <option value="current">Current Account</option>
            </select>
          </div>
          <div class="form-group">
            <label>Currency</label>
            <select v-model="openForm.currency">
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>
          <p v-if="error" class="error-msg">{{ error }}</p>
          <p v-if="success" class="success-msg">{{ success }}</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="showOpen = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Open Account</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../../stores/auth'

const accounts = ref<any[]>([])
const loading = ref(true)
const showOpen = ref(false)
const error = ref(''), success = ref('')
const openForm = ref({ type: 'savings', currency: 'USD' })

function typeIcon(t: string) { return { savings: '💰', current: '🏦', loan: '📋' }[t] || '🏦' }
function statusBadge(s: string) { return { active: 'badge-success', frozen: 'badge-warning', inactive: 'badge-gray', closed: 'badge-error' }[s] || 'badge-gray' }

async function openAccount() {
  error.value = ''; success.value = ''
  try {
    await api.post('/accounts', openForm.value)
    success.value = 'Account opened successfully!'
    setTimeout(() => { showOpen.value = false; load() }, 1200)
  } catch (e: any) { error.value = e.response?.data?.message || 'Failed' }
}

async function load() {
  loading.value = true
  try { const { data } = await api.get('/accounts'); accounts.value = data }
  finally { loading.value = false }
}
onMounted(load)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-header h2 { font-size: 22px; font-weight: 800; }
.sub { color: var(--text-medium); font-size: 14px; }
.accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
.account-card { background: white; border-radius: var(--radius); padding: 22px; box-shadow: var(--shadow); }
.ac-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.ac-type-icon { font-size: 28px; }
.ac-type { font-size: 13px; color: var(--text-medium); text-transform: capitalize; margin-bottom: 4px; }
.ac-number { font-family: monospace; font-size: 15px; font-weight: 600; margin-bottom: 12px; }
.ac-balance { font-size: 28px; font-weight: 800; color: var(--primary); margin-bottom: 8px; }
.negative { color: var(--error) !important; }
.ac-meta { display: flex; gap: 16px; font-size: 13px; color: var(--text-light); margin-bottom: 8px; }
.ac-date { font-size: 12px; color: var(--text-light); }
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
