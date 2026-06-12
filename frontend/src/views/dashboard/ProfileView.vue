<template>
  <div>
    <h2 class="page-title">Profile Settings</h2>
    <div class="profile-grid">
      <!-- Personal Info -->
      <div class="card">
        <h3>Personal Information</h3>
        <form @submit.prevent="updateProfile">
          <div class="two-col">
            <div class="form-group">
              <label>First Name</label>
              <input v-model="profile.firstName" placeholder="First name" />
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input v-model="profile.lastName" placeholder="Last name" />
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input :value="profile.email" readonly class="readonly-input" />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input v-model="profile.phone" placeholder="Phone number" />
          </div>
          <div class="form-group">
            <label>Address</label>
            <textarea v-model="profile.address" rows="2" placeholder="Your address"></textarea>
          </div>
          <p v-if="profileMsg" :class="profileMsgType === 'error' ? 'error-msg' : 'success-msg'">{{ profileMsg }}</p>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
      </div>

      <!-- Change Password -->
      <div class="card">
        <h3>Change Password</h3>
        <form @submit.prevent="changePassword">
          <div class="form-group">
            <label>Current Password</label>
            <input v-model="pwForm.currentPassword" type="password" placeholder="Current password" required />
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input v-model="pwForm.newPassword" type="password" placeholder="New password" required minlength="6" />
          </div>
          <div class="form-group">
            <label>Confirm New Password</label>
            <input v-model="pwForm.confirmPassword" type="password" placeholder="Confirm new password" required />
          </div>
          <p v-if="pwMsg" :class="pwMsgType === 'error' ? 'error-msg' : 'success-msg'">{{ pwMsg }}</p>
          <button type="submit" class="btn btn-primary">Change Password</button>
        </form>
      </div>

      <!-- MFA Settings -->
      <div class="card">
        <h3>Two-Factor Authentication</h3>
        <p class="current-mfa">Current method: <strong>{{ profile.mfaMethod }}</strong></p>
        <div class="mfa-options">
          <label v-for="method in mfaMethods" :key="method.value" class="mfa-option" :class="{ active: profile.mfaMethod === method.value }">
            <input type="radio" v-model="profile.mfaMethod" :value="method.value" style="display:none" @change="updateMfa(method.value)" />
            <span class="mfa-icon">{{ method.icon }}</span>
            <span class="mfa-label">{{ method.label }}</span>
          </label>
        </div>
        <p v-if="mfaMsg" class="success-msg">{{ mfaMsg }}</p>
      </div>

      <!-- Active Sessions -->
      <div class="card">
        <h3>Active Sessions</h3>
        <div v-if="sessions.length === 0" class="empty">No active sessions</div>
        <div v-for="s in sessions" :key="s.id" class="session-item">
          <div class="session-info">
            <div class="session-device">{{ s.device || 'Unknown Device' }}</div>
            <div class="session-ip">{{ s.ipAddress }} · {{ new Date(s.createdAt).toLocaleString() }}</div>
          </div>
          <button class="btn btn-sm btn-danger" @click="revokeSession(s.id)">Revoke</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../../stores/auth'

const profile = ref<any>({ firstName: '', lastName: '', email: '', phone: '', address: '', mfaMethod: 'none' })
const sessions = ref<any[]>([])
const pwForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const profileMsg = ref(''), profileMsgType = ref<'success'|'error'>('success')
const pwMsg = ref(''), pwMsgType = ref<'success'|'error'>('success')
const mfaMsg = ref('')

const mfaMethods = [
  { value: 'none', icon: '🚫', label: 'Disabled' },
  { value: 'email', icon: '📧', label: 'Email OTP' },
  { value: 'sms', icon: '📱', label: 'SMS OTP' },
  { value: 'authenticator', icon: '🔑', label: 'Authenticator App' },
]

async function updateProfile() {
  try {
    await api.patch('/profile', { firstName: profile.value.firstName, lastName: profile.value.lastName, phone: profile.value.phone, address: profile.value.address })
    profileMsg.value = 'Profile updated!'; profileMsgType.value = 'success'
  } catch (e: any) { profileMsg.value = e.response?.data?.message || 'Failed'; profileMsgType.value = 'error' }
}

async function changePassword() {
  if (pwForm.value.newPassword !== pwForm.value.confirmPassword) { pwMsg.value = 'Passwords do not match'; pwMsgType.value = 'error'; return }
  try {
    await api.post('/profile/change-password', { currentPassword: pwForm.value.currentPassword, newPassword: pwForm.value.newPassword })
    pwMsg.value = 'Password changed!'; pwMsgType.value = 'success'
    pwForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (e: any) { pwMsg.value = e.response?.data?.message || 'Failed'; pwMsgType.value = 'error' }
}

async function updateMfa(method: string) {
  try { await api.patch('/profile/mfa', { method }); mfaMsg.value = `MFA updated to ${method}!` } catch {}
}

async function revokeSession(id: string) {
  await api.delete(`/profile/sessions/${id}`)
  sessions.value = sessions.value.filter(s => s.id !== id)
}

onMounted(async () => {
  const [profileRes, sessionsRes] = await Promise.all([api.get('/profile'), api.get('/profile/sessions')])
  profile.value = profileRes.data
  sessions.value = sessionsRes.data
})
</script>

<style scoped>
.page-title { font-size: 22px; font-weight: 800; margin-bottom: 24px; }
.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.card h3 { font-size: 16px; font-weight: 700; margin-bottom: 20px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.readonly-input { background: var(--bg-light) !important; color: var(--text-light) !important; cursor: not-allowed !important; }
.current-mfa { font-size: 14px; color: var(--text-medium); margin-bottom: 16px; }
.mfa-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.mfa-option {
  display: flex; align-items: center; gap: 10px;
  padding: 12px; border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  cursor: pointer; transition: all 0.2s;
}
.mfa-option.active { border-color: var(--primary); background: #EFF6FF; }
.mfa-icon { font-size: 20px; }
.mfa-label { font-size: 13px; font-weight: 500; }
.session-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); }
.session-item:last-child { border-bottom: none; }
.session-device { font-size: 14px; font-weight: 500; }
.session-ip { font-size: 12px; color: var(--text-light); margin-top: 2px; }
.error-msg { color: var(--error); font-size: 13px; margin-bottom: 12px; }
.success-msg { color: var(--success); font-size: 13px; margin-bottom: 12px; }
.empty { text-align: center; color: var(--text-light); padding: 20px; }
@media (max-width: 768px) { .profile-grid { grid-template-columns: 1fr; } .two-col { grid-template-columns: 1fr; } }
</style>
