import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({ baseURL: API })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isTeller = computed(() => user.value?.role === 'teller')
  const isAdminOrTeller = computed(() => isAdmin.value || isTeller.value)

  async function login(username: string, password: string) {
    loading.value = true; error.value = null
    try {
      const { data } = await api.post('/auth/login', { username, password })
      if (data.requiresMfa) return data
      setAuth(data.token, data.user)
      return { success: true, user: data.user }
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Login failed'
      throw error.value
    } finally { loading.value = false }
  }

  async function verifyMfa(userId: string, otp: string) {
    loading.value = true; error.value = null
    try {
      const { data } = await api.post('/auth/mfa/verify', { userId, otp })
      setAuth(data.token, data.user)
      return { success: true, user: data.user }
    } catch (e: any) {
      error.value = e.response?.data?.message || 'Invalid OTP'
      throw error.value
    } finally { loading.value = false }
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const { data } = await api.get('/auth/me')
      user.value = data
    } catch { logout() }
  }

  async function logout() {
    try { await api.post('/auth/logout') } catch {}
    localStorage.removeItem('token')
    token.value = null
    user.value = null
  }

  function setAuth(t: string, u: any) {
    token.value = t
    user.value = u
    localStorage.setItem('token', t)
  }

  return { user, token, loading, error, isAuthenticated, isAdmin, isTeller, isAdminOrTeller, login, verifyMfa, fetchMe, logout, api }
})

export { api }
