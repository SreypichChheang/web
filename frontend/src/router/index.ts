import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'landing', component: () => import('../views/LandingView.vue') },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
    { path: '/forgot-password', name: 'forgot-password', component: () => import('../views/ForgotPasswordView.vue') },
    {
      path: '/dashboard',
      component: () => import('../views/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: () => import('../views/dashboard/DashboardHome.vue') },
        { path: 'accounts', name: 'accounts', component: () => import('../views/dashboard/AccountsView.vue') },
        { path: 'transactions', name: 'transactions', component: () => import('../views/dashboard/TransactionsView.vue') },
        { path: 'cards', name: 'cards', component: () => import('../views/dashboard/CardsView.vue') },
        { path: 'profile', name: 'profile', component: () => import('../views/dashboard/ProfileView.vue') },
        { path: 'notifications', name: 'notifications', component: () => import('../views/dashboard/NotificationsView.vue') },
        { path: 'support', name: 'support', component: () => import('../views/dashboard/SupportView.vue') },
      ]
    },
    {
      path: '/admin',
      component: () => import('../views/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: '', name: 'admin-dashboard', component: () => import('../views/admin/AdminDashboard.vue') },
        { path: 'users', name: 'admin-users', component: () => import('../views/admin/AdminUsers.vue') },
        { path: 'transactions', name: 'admin-transactions', component: () => import('../views/admin/AdminTransactions.vue') },
        { path: 'sessions', name: 'admin-sessions', component: () => import('../views/admin/AdminSessions.vue') },
        { path: 'audit', name: 'admin-audit', component: () => import('../views/admin/AdminAuditLogs.vue') },
        { path: 'support', name: 'admin-support', component: () => import('../views/admin/AdminSupport.vue') },
      ]
    },
  ]
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  if (!auth.user && auth.token) await auth.fetchMe()

  if (to.meta.requiresAuth && !auth.isAuthenticated) return next('/login')
  if (to.meta.requiresAdmin && !auth.isAdminOrTeller) return next('/dashboard')
  if (to.name === 'login' && auth.isAuthenticated) {
    return next(auth.isAdminOrTeller ? '/admin' : '/dashboard')
  }
  next()
})

export default router
