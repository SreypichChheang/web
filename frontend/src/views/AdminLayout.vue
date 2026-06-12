<template>
  <div class="app-layout">
    <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="sidebar-header">
        <div class="sidebar-logo">🏦 <span>Admin Panel</span></div>
        <button class="close-btn" @click="sidebarOpen = false">✕</button>
      </div>
      <div class="user-info">
        <div class="user-avatar">{{ initials }}</div>
        <div>
          <div class="user-name">{{ auth.user?.firstName }} {{ auth.user?.lastName }}</div>
          <div class="user-role admin-badge">{{ auth.user?.role }}</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <router-link v-for="item in navItems" :key="item.to" :to="item.to" class="nav-item" @click="sidebarOpen = false">
          <span class="nav-icon">{{ item.icon }}</span><span>{{ item.label }}</span>
        </router-link>
        <div class="nav-separator"></div>
        <router-link to="/dashboard" class="nav-item">
          <span class="nav-icon">👤</span><span>User View</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <button class="nav-item logout-btn" @click="handleLogout">
          <span class="nav-icon">🚪</span><span>Logout</span>
        </button>
      </div>
    </aside>
    <div v-if="sidebarOpen" class="overlay" @click="sidebarOpen = false"></div>
    <div class="main-area">
      <header class="topbar">
        <button class="hamburger" @click="sidebarOpen = true">☰</button>
        <div class="topbar-title">{{ pageTitle }}</div>
        <div class="topbar-right">
          <span class="admin-chip">{{ auth.user?.role }}</span>
          <div class="user-avatar-sm">{{ initials }}</div>
        </div>
      </header>
      <main class="page-content"><RouterView /></main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)

const initials = computed(() => (auth.user?.firstName?.[0] || '') + (auth.user?.lastName?.[0] || ''))
const pageTitles: Record<string, string> = { 'admin-dashboard': 'Admin Dashboard', 'admin-users': 'User Management', 'admin-transactions': 'Transactions', 'admin-sessions': 'Active Sessions', 'admin-audit': 'Audit Logs', 'admin-support': 'Support Tickets' }
const pageTitle = computed(() => pageTitles[route.name as string] || 'Admin Panel')

const navItems = [
  { to: '/admin', icon: '📊', label: 'Dashboard' },
  { to: '/admin/users', icon: '👥', label: 'Users' },
  { to: '/admin/transactions', icon: '💸', label: 'Transactions' },
  { to: '/admin/sessions', icon: '🔐', label: 'Sessions' },
  { to: '/admin/audit', icon: '📋', label: 'Audit Logs' },
  { to: '/admin/support', icon: '🎫', label: 'Support' },
]

async function handleLogout() { await auth.logout(); router.push('/login') }
</script>

<style scoped>
.app-layout { display: flex; min-height: 100vh; background: #F1F5F9; }
.sidebar { width: 260px; flex-shrink: 0; background: #1E293B; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; z-index: 50; transition: transform 0.3s; }
.sidebar-header { padding: 20px; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; }
.sidebar-logo { font-size: 17px; font-weight: 800; color: #7CA2C1; }
.close-btn { display: none; background: none; font-size: 18px; color: white; }
.user-info { padding: 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #334155; }
.user-avatar { width: 42px; height: 42px; background: #7CA2C1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
.user-name { font-size: 14px; font-weight: 600; color: white; }
.user-role { font-size: 12px; text-transform: capitalize; }
.admin-badge { color: #FCD34D; }
.sidebar-nav { padding: 12px; flex: 1; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 8px; font-size: 14px; font-weight: 500; color: #94A3B8; transition: all 0.2s; cursor: pointer; margin-bottom: 2px; text-decoration: none; border: none; width: 100%; }
.nav-item:hover { background: #334155; color: white; }
.nav-item.router-link-exact-active { background: #334155; color: #7CA2C1; }
.nav-icon { font-size: 18px; width: 22px; text-align: center; }
.nav-separator { height: 1px; background: #334155; margin: 8px 0; }
.sidebar-footer { padding: 12px; border-top: 1px solid #334155; }
.logout-btn:hover { background: #7F1D1D !important; color: #FCA5A5 !important; }
.main-area { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.topbar { background: white; border-bottom: 1px solid #E2E8F0; padding: 0 24px; height: 64px; display: flex; align-items: center; gap: 16px; position: sticky; top: 0; z-index: 40; }
.hamburger { display: none; background: none; font-size: 22px; }
.topbar-title { font-size: 18px; font-weight: 700; flex: 1; }
.topbar-right { display: flex; align-items: center; gap: 12px; }
.admin-chip { background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
.user-avatar-sm { width: 32px; height: 32px; background: #7CA2C1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
.page-content { padding: 28px; flex: 1; }
.overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 45; }
@media (max-width: 768px) { .sidebar { position: fixed; left: 0; top: 0; bottom: 0; transform: translateX(-100%); } .sidebar-open { transform: translateX(0); } .close-btn { display: block; } .hamburger { display: block; } .overlay { display: block; } .page-content { padding: 16px; } }
</style>
