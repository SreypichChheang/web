<template>
  <div>
    <div class="page-header">
      <div><h2>User Management</h2><p class="sub">Manage all system users</p></div>
      <button class="btn btn-primary" @click="showCreate = true">+ Create User</button>
    </div>

    <div class="filters card">
      <div class="form-group">
        <label>Search</label>
        <input v-model="search" placeholder="Username, email, name..." @input="load" />
      </div>
      <div class="form-group">
        <label>Role</label>
        <select v-model="roleFilter" @change="load">
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
          <option value="teller">Teller</option>
        </select>
      </div>
    </div>

    <div class="card table-card">
      <table class="data-table" v-if="!loading && users.length > 0">
        <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>MFA</th><th>Joined</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td><div class="user-cell"><div class="ava">{{ u.firstName?.[0] }}{{ u.lastName?.[0] }}</div><div><div class="un">{{ u.username }}</div><div class="fn">{{ u.firstName }} {{ u.lastName }}</div></div></div></td>
            <td>{{ u.email }}</td>
            <td><span class="badge" :class="roleBadge(u.role)">{{ u.role }}</span></td>
            <td>
              <span class="badge" :class="u.isLocked ? 'badge-error' : u.isActive ? 'badge-success' : 'badge-gray'">
                {{ u.isLocked ? 'Locked' : u.isActive ? 'Active' : 'Disabled' }}
              </span>
            </td>
            <td><span class="badge badge-info">{{ u.mfaMethod }}</span></td>
            <td>{{ new Date(u.createdAt).toLocaleDateString() }}</td>
            <td class="actions-cell">
              <button class="btn btn-sm btn-outline" @click="viewUser(u)">View</button>
              <button class="btn btn-sm" :class="u.isActive ? 'btn-danger' : 'btn-success'" @click="toggleActive(u)">{{ u.isActive ? 'Disable' : 'Enable' }}</button>
              <button v-if="u.isLocked" class="btn btn-sm btn-success" @click="unlockUser(u)">Unlock</button>
              <button class="btn btn-sm btn-outline" @click="forceLogout(u)">Force Logout</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!loading && users.length === 0" class="empty">No users found</div>
    </div>

    <!-- User Detail Modal -->
    <div v-if="selectedUser" class="modal-overlay" @click.self="selectedUser = null">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3>{{ selectedUser.user.firstName }} {{ selectedUser.user.lastName }}</h3>
          <button @click="selectedUser = null">✕</button>
        </div>
        <div class="user-detail">
          <div class="detail-grid">
            <div><strong>Username:</strong> {{ selectedUser.user.username }}</div>
            <div><strong>Email:</strong> {{ selectedUser.user.email }}</div>
            <div><strong>Role:</strong> {{ selectedUser.user.role }}</div>
            <div><strong>MFA:</strong> {{ selectedUser.user.mfaMethod }}</div>
            <div><strong>Phone:</strong> {{ selectedUser.user.phone || '—' }}</div>
            <div><strong>Address:</strong> {{ selectedUser.user.address || '—' }}</div>
          </div>
          <h4>Accounts ({{ selectedUser.accounts.length }})</h4>
          <div v-for="a in selectedUser.accounts" :key="a.id" class="detail-account">
            <span>{{ a.type }} — {{ a.accountNumber }}</span>
            <strong>${{ Number(a.balance).toLocaleString() }}</strong>
          </div>
          <h4>Recent Transactions</h4>
          <div v-for="t in selectedUser.transactions.slice(0,5)" :key="t.id" class="detail-txn">
            <span>{{ t.type.replace(/_/g,' ') }}</span>
            <span>${{ t.amount }}</span>
            <span class="badge" :class="statusBadge(t.status)">{{ t.status }}</span>
          </div>
          <div class="detail-actions">
            <button class="btn btn-warning" @click="resetCreds(selectedUser.user.id)">Reset Credentials</button>
            <button class="btn btn-danger" @click="forceLogoutById(selectedUser.user.id)">Force Logout All</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create User Modal -->
    <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
      <div class="modal">
        <div class="modal-header"><h3>Create New User</h3><button @click="showCreate = false">✕</button></div>
        <form @submit.prevent="createUser">
          <div class="two-col">
            <div class="form-group"><label>First Name</label><input v-model="createForm.firstName" required /></div>
            <div class="form-group"><label>Last Name</label><input v-model="createForm.lastName" required /></div>
          </div>
          <div class="form-group"><label>Username</label><input v-model="createForm.username" required /></div>
          <div class="form-group"><label>Email</label><input v-model="createForm.email" type="email" required /></div>
          <div class="form-group"><label>Password</label><input v-model="createForm.password" type="password" required minlength="6" /></div>
          <div class="form-group"><label>Role</label><select v-model="createForm.role"><option value="customer">Customer</option><option value="teller">Teller</option><option value="admin">Admin</option></select></div>
          <p v-if="createError" class="error-msg">{{ createError }}</p>
          <p v-if="createSuccess" class="success-msg">{{ createSuccess }}</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="showCreate = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Create User</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../../stores/auth'

const users = ref<any[]>([])
const loading = ref(true)
const search = ref(''), roleFilter = ref('')
const selectedUser = ref<any>(null)
const showCreate = ref(false)
const createError = ref(''), createSuccess = ref('')
const createForm = ref({ firstName: '', lastName: '', username: '', email: '', password: '', role: 'customer' })

function roleBadge(r: string) { return { customer: 'badge-info', admin: 'badge-error', teller: 'badge-warning' }[r] || 'badge-gray' }
function statusBadge(s: string) { const m: any = { completed: 'badge-success', pending: 'badge-warning', flagged: 'badge-error' }; return m[s] || 'badge-gray' }

async function load() {
  loading.value = true
  try {
    const params: any = {}
    if (search.value) params.search = search.value
    if (roleFilter.value) params.role = roleFilter.value
    const { data } = await api.get('/admin/users', { params })
    users.value = data
  } finally { loading.value = false }
}

async function viewUser(u: any) {
  const { data } = await api.get(`/admin/users/${u.id}`)
  selectedUser.value = data
}

async function toggleActive(u: any) {
  await api.patch(`/admin/users/${u.id}`, { isActive: !u.isActive })
  load()
}

async function unlockUser(u: any) {
  await api.patch(`/admin/users/${u.id}`, { isLocked: false })
  load()
}

async function forceLogout(u: any) {
  await api.post(`/admin/users/${u.id}/force-logout`)
  alert(`All sessions for ${u.username} terminated`)
}

async function forceLogoutById(id: string) {
  await api.post(`/admin/users/${id}/force-logout`)
  alert('All sessions terminated')
}

async function resetCreds(id: string) {
  const { data } = await api.post(`/admin/users/${id}/reset-credentials`)
  alert(`New temp password: ${data.temporaryPassword}`)
}

async function createUser() {
  createError.value = ''; createSuccess.value = ''
  try {
    await api.post('/admin/users', createForm.value)
    createSuccess.value = 'User created!'
    setTimeout(() => { showCreate.value = false; load() }, 1200)
  } catch (e: any) { createError.value = e.response?.data?.message || 'Failed' }
}

onMounted(load)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.page-header h2 { font-size: 22px; font-weight: 800; }
.sub { color: var(--text-medium); font-size: 14px; }
.filters { display: grid; grid-template-columns: 1fr auto; gap: 16px; margin-bottom: 16px; }
.table-card { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; color: var(--text-medium); background: var(--bg-light); text-transform: uppercase; letter-spacing: 0.5px; }
.data-table td { padding: 12px; border-bottom: 1px solid var(--border); }
.user-cell { display: flex; align-items: center; gap: 10px; }
.ava { width: 32px; height: 32px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.un { font-weight: 600; font-size: 13px; }
.fn { font-size: 12px; color: var(--text-light); }
.actions-cell { display: flex; gap: 6px; flex-wrap: wrap; }
.empty { text-align: center; color: var(--text-light); padding: 60px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px; }
.modal { background: white; border-radius: var(--radius-lg); padding: 28px; width: 100%; max-width: 480px; max-height: 85vh; overflow-y: auto; }
.modal-lg { max-width: 640px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-header h3 { font-size: 18px; font-weight: 700; }
.modal-header button { background: none; font-size: 18px; cursor: pointer; }
.user-detail h4 { font-size: 14px; font-weight: 700; margin: 16px 0 8px; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px; background: var(--bg-light); padding: 14px; border-radius: 8px; margin-bottom: 16px; }
.detail-account { display: flex; justify-content: space-between; padding: 8px; background: var(--bg-light); border-radius: 6px; font-size: 13px; margin-bottom: 6px; }
.detail-txn { display: flex; gap: 12px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
.detail-actions { display: flex; gap: 10px; margin-top: 16px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
.btn-warning { background: var(--warning); color: white; }
.error-msg { color: var(--error); font-size: 13px; margin-bottom: 8px; }
.success-msg { color: var(--success); font-size: 13px; margin-bottom: 8px; }
</style>
