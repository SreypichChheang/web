<template>
  <div class="login-page">
    <div class="login-left">
      <div class="login-brand" @click="$router.push('/')">
        <div class="brand-icon">🏦</div>
        <div>
          <div class="brand-name">NexaBank</div>
          <div class="brand-tag">Digital Banking Platform</div>
        </div>
      </div>
      <div class="login-visual">
        <div class="visual-card vc-1">
          <div class="vc-icon">💰</div>
          <div class="vc-text">Savings: $15,420</div>
        </div>
        <div class="visual-card vc-2">
          <div class="vc-icon">📈</div>
          <div class="vc-text">+2.4% this month</div>
        </div>
        <div class="visual-card vc-3">
          <div class="vc-icon">🔒</div>
          <div class="vc-text">Bank-grade security</div>
        </div>
      </div>
      <p class="login-tagline">Your finances, secured and simplified</p>
    </div>

    <div class="login-right">
      <div class="login-box">
        <!-- Login Step -->
        <div v-if="step === 'login'">
          <h2 class="login-title">Welcome Back</h2>
          <p class="login-subtitle">Sign in to your account</p>

          <div class="demo-box">
            <p><strong>Demo Accounts:</strong></p>
            <div v-for="a in demoAccounts" :key="a.user" class="demo-row">
              <span class="demo-badge" :class="a.badge">{{ a.role }}</span>
              <code>{{ a.user }}</code> / <code>{{ a.pass }}</code>
              <button @click="fillDemo(a.user, a.pass)" class="demo-fill-btn">Use</button>
            </div>
          </div>

          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label>Username or Email</label>
              <input v-model="form.username" placeholder="Enter username or email" required />
            </div>
            <div class="form-group">
              <label>Password</label>
              <div class="password-wrap">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter password" required
                />
                <button type="button" class="pw-toggle" @click="showPassword = !showPassword">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>
            <div class="form-footer">
              <router-link to="/forgot-password" class="forgot-link">Forgot password?</router-link>
            </div>
            <p v-if="error" class="error-msg">{{ error }}</p>
            <button type="submit" class="btn btn-primary btn-lg login-btn" :disabled="authStore.loading">
              <span v-if="authStore.loading">⏳ Signing in...</span>
              <span v-else>Sign In →</span>
            </button>
          </form>
        </div>

        <!-- MFA Step -->
        <div v-if="step === 'mfa'">
          <button class="back-btn" @click="step = 'login'">← Back</button>
          <h2 class="login-title">Two-Factor Authentication</h2>
          <p class="login-subtitle">
            Enter the OTP sent via <strong>{{ mfaMethod }}</strong>
          </p>

          <div v-if="demoOtp" class="demo-box otp-box">
            <p>Demo OTP: <strong class="otp-val">{{ demoOtp }}</strong></p>
          </div>

          <form @submit.prevent="handleMfa">
            <div class="form-group">
              <label>One-Time Password</label>
              <input
                v-model="otpCode"
                placeholder="Enter 6-digit OTP"
                maxlength="6"
                class="otp-input"
                required
              />
            </div>
            <p v-if="error" class="error-msg">{{ error }}</p>
            <button type="submit" class="btn btn-primary btn-lg login-btn" :disabled="authStore.loading">
              <span v-if="authStore.loading">⏳ Verifying...</span>
              <span v-else>Verify OTP →</span>
            </button>
            <div class="resend-wrap">
              <span v-if="resendCountdown > 0">Resend in {{ resendCountdown }}s</span>
              <button v-else type="button" @click="resendOtp" class="resend-btn">Resend OTP</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { api } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const step = ref<'login' | 'mfa'>('login')
const form = ref({ username: '', password: '' })
const showPassword = ref(false)
const error = ref('')
const mfaUserId = ref('')
const mfaMethod = ref('')
const demoOtp = ref('')
const otpCode = ref('')
const resendCountdown = ref(0)
let countdownTimer: any = null

const demoAccounts = [
  { role: 'Customer', badge: 'badge-info', user: 'john.doe', pass: 'password123' },
  { role: 'Customer', badge: 'badge-info', user: 'jane.smith', pass: 'password123' },
  { role: 'Admin', badge: 'badge-error', user: 'admin', pass: 'admin123' },
  { role: 'Teller', badge: 'badge-warning', user: 'teller01', pass: 'teller123' },
]

function fillDemo(user: string, pass: string) {
  form.value.username = user
  form.value.password = pass
}

async function handleLogin() {
  error.value = ''
  try {
    const result = await authStore.login(form.value.username, form.value.password)
    if (result.requiresMfa) {
      step.value = 'mfa'
      mfaUserId.value = result.userId
      mfaMethod.value = result.mfaMethod
      demoOtp.value = result.demoOtp || ''
      startCountdown()
    } else {
      redirectAfterLogin(result.user)
    }
  } catch (e: any) {
    error.value = typeof e === 'string' ? e : 'Login failed'
  }
}

async function handleMfa() {
  error.value = ''
  try {
    const result = await authStore.verifyMfa(mfaUserId.value, otpCode.value)
    redirectAfterLogin(result.user)
  } catch (e: any) {
    error.value = typeof e === 'string' ? e : 'Invalid OTP'
  }
}

function redirectAfterLogin(user: any) {
  if (user.role === 'admin' || user.role === 'teller') {
    router.push('/admin')
  } else {
    router.push('/dashboard')
  }
}

async function resendOtp() {
  await api.post('/auth/resend-otp', { userId: mfaUserId.value })
  startCountdown()
}

function startCountdown() {
  resendCountdown.value = 60
  countdownTimer = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0) clearInterval(countdownTimer)
  }, 1000)
}

onUnmounted(() => { if (countdownTimer) clearInterval(countdownTimer) })
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

/* Left */
.login-left {
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  position: relative;
  overflow: hidden;
}
.login-left::before {
  content: '';
  position: absolute;
  top: -100px; right: -100px;
  width: 400px; height: 400px;
  background: rgba(255,255,255,0.05);
  border-radius: 50%;
}
.login-brand { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.brand-icon { font-size: 32px; }
.brand-name { font-size: 22px; font-weight: 800; }
.brand-tag { font-size: 12px; opacity: 0.8; }

.login-visual { display: flex; flex-direction: column; gap: 16px; }
.visual-card {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex; align-items: center; gap: 12px;
  max-width: 280px;
}
.vc-1 { margin-left: 0; }
.vc-2 { margin-left: 40px; }
.vc-3 { margin-left: 20px; }
.vc-icon { font-size: 24px; }
.vc-text { font-size: 15px; font-weight: 600; }
.login-tagline { font-size: 18px; opacity: 0.85; font-style: italic; }

/* Right */
.login-right {
  background: var(--bg-light);
  display: flex; align-items: center; justify-content: center;
  padding: 40px;
}
.login-box {
  width: 100%;
  max-width: 440px;
  background: white;
  border-radius: var(--radius-lg);
  padding: 40px;
  box-shadow: var(--shadow-md);
}
.login-title { font-size: 28px; font-weight: 800; margin-bottom: 6px; }
.login-subtitle { color: var(--text-medium); margin-bottom: 24px; }

.demo-box {
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: var(--radius-sm);
  padding: 14px;
  margin-bottom: 24px;
  font-size: 13px;
}
.demo-row { display: flex; align-items: center; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
.demo-row code { font-size: 12px; background: #E5E7EB; padding: 2px 6px; border-radius: 4px; }
.demo-fill-btn {
  margin-left: auto;
  background: var(--primary);
  color: white;
  border: none;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}
.otp-box { background: #FEF3C7; border-color: #FCD34D; }
.otp-val { font-size: 20px; color: var(--primary); letter-spacing: 4px; }

.password-wrap { position: relative; }
.password-wrap input { width: 100%; padding-right: 44px; }
.pw-toggle {
  position: absolute; right: 12px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none;
  font-size: 16px; cursor: pointer;
}

.form-footer { display: flex; justify-content: flex-end; margin-bottom: 16px; }
.forgot-link { font-size: 13px; color: var(--primary); font-weight: 500; }
.error-msg { color: var(--error); font-size: 13px; margin-bottom: 12px; }
.login-btn { width: 100%; justify-content: center; border-radius: var(--radius-sm); }

.otp-input { font-size: 24px; letter-spacing: 8px; text-align: center; }
.resend-wrap { text-align: center; margin-top: 16px; font-size: 13px; color: var(--text-light); }
.resend-btn { background: none; border: none; color: var(--primary); font-size: 13px; font-weight: 600; cursor: pointer; }
.back-btn { background: none; border: none; color: var(--primary); font-size: 14px; cursor: pointer; margin-bottom: 16px; }

@media (max-width: 768px) {
  .login-page { grid-template-columns: 1fr; }
  .login-left { display: none; }
  .login-right { padding: 24px; }
}
</style>
