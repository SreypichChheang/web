<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="sidebar-header">
        <div class="sidebar-logo">🏦 <span>NexaBank</span></div>
        <button class="close-btn" @click="sidebarOpen = false">✕</button>
      </div>

      <div class="user-info">
        <div class="user-avatar">{{ userInitials }}</div>
        <div>
          <div class="user-name">{{ auth.user?.firstName }} {{ auth.user?.lastName }}</div>
          <div class="user-role">{{ auth.user?.role }}</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link v-for="item in navItems" :key="item.to" :to="item.to" class="nav-item" @click="sidebarOpen = false">
          <span class="nav-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item logout-btn" @click="handleLogout">
          <span class="nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Overlay -->
    <div v-if="sidebarOpen" class="overlay" @click="sidebarOpen = false"></div>

    <!-- Main content -->
    <div class="main-area">
      <!-- Top bar -->
      <header class="topbar">
        <button class="hamburger" @click="sidebarOpen = true">☰</button>
        <div class="topbar-title">{{ pageTitle }}</div>
        <div class="topbar-right">
          <button class="notif-btn" @click="$router.push('/dashboard/notifications')">
            🔔
            <span v-if="unreadCount > 0" class="notif-count">{{ unreadCount }}</span>
          </button>
          <div class="topbar-user">
            <div class="user-avatar-sm">{{ userInitials }}</div>
            <span>{{ auth.user?.firstName }}</span>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="page-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, api } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)
const unreadCount = ref(0)

const userInitials = computed(() => {
  const u = auth.user
  if (!u) return '?'
  return (u.firstName?.[0] || '') + (u.lastName?.[0] || '')
})

const pageTitles: Record<string, string> = {
  'dashboard': 'Dashboard',
  'accounts': 'Accounts',
  'transactions': 'Transactions',
  'cards': 'Cards',
  'profile': 'Profile',
  'notifications': 'Notifications',
  'support': 'Support',
}

const pageTitle = computed(() => {
  const name = route.name as string
  return pageTitles[name] || 'Dashboard'
})

const navItems = computed(() => [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/dashboard/accounts', icon: '🏦', label: 'Accounts' },
  { to: '/dashboard/transactions', icon: '💸', label: 'Transactions' },
  { to: '/dashboard/cards', icon: '💳', label: 'Cards' },
  { to: '/dashboard/notifications', icon: '🔔', label: 'Notifications', badge: unreadCount.value || undefined },
  { to: '/dashboard/support', icon: '🆘', label: 'Support' },
  { to: '/dashboard/profile', icon: '👤', label: 'Profile' },
])

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    const { data } = await api.get('/notifications')
    unreadCount.value = data.unreadCount
  } catch {}
})
</script>

<style scoped>
.app-layout {
  display: flex; min-height: 100vh; background: var(--bg-light);
}

/* Sidebar */
.sidebar {
  width: 260px; flex-shrink: 0;
  background: white;
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  position: sticky; top: 0; height: 100vh;
  overflow-y: auto;
  z-index: 50;
  transition: transform 0.3s;
}
.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.sidebar-logo { font-size: 18px; font-weight: 800; color: var(--primary); }
.close-btn { display: none; background: none; font-size: 18px; }

.user-info {
  padding: 20px;
  display: flex; align-items: center; gap: 12px;
  border-bottom: 1px solid var(--border);
}
.user-avatar {
  width: 42px; height: 42px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 15px;
  flex-shrink: 0;
}
.user-name { font-size: 14px; font-weight: 600; }
.user-role { font-size: 12px; color: var(--text-light); text-transform: capitalize; }

.sidebar-nav { padding: 12px; flex: 1; }
.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 14px;
  border-radius: var(--radius-sm);
  font-size: 14px; font-weight: 500;
  color: var(--text-medium);
  transition: all 0.2s;
  cursor: pointer; margin-bottom: 2px;
  text-decoration: none;
}
.nav-item:hover { background: var(--bg-light); color: var(--primary); }
.nav-item.router-link-exact-active { background: #EFF6FF; color: var(--primary); font-weight: 600; }
.nav-icon { font-size: 18px; width: 22px; text-align: center; }
.nav-badge {
  margin-left: auto;
  background: var(--error); color: white;
  border-radius: 10px; padding: 1px 7px; font-size: 11px; font-weight: 700;
}
.sidebar-footer { padding: 12px; border-top: 1px solid var(--border); }
.logout-btn { background: none; border: none; width: 100%; }
.logout-btn:hover { background: #FEE2E2; color: var(--error); }

/* Main */
.main-area { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.topbar {
  background: white;
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  height: 64px;
  display: flex; align-items: center; gap: 16px;
  position: sticky; top: 0; z-index: 40;
}
.hamburger { display: none; background: none; font-size: 22px; }
.topbar-title { font-size: 18px; font-weight: 700; flex: 1; }
.topbar-right { display: flex; align-items: center; gap: 16px; }
.notif-btn {
  position: relative;
  background: none; border: none;
  font-size: 22px; cursor: pointer;
}
.notif-count {
  position: absolute; top: -6px; right: -6px;
  background: var(--error); color: white;
  border-radius: 50%; width: 18px; height: 18px;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.topbar-user { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; }
.user-avatar-sm {
  width: 32px; height: 32px;
  background: var(--primary); color: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
}
.page-content { padding: 28px; flex: 1; }

/* Overlay */
.overlay {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 45;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed; left: 0; top: 0; bottom: 0;
    transform: translateX(-100%);
  }
  .sidebar-open { transform: translateX(0); }
  .close-btn { display: block; }
  .hamburger { display: block; }
  .overlay { display: block; }
  .page-content { padding: 16px; }
}
</style>
