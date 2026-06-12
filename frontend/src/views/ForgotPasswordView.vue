<template>
  <div class="auth-page">
    <div class="auth-box">
      <div class="auth-logo" @click="$router.push('/')">🏦 NexaBank</div>

      <div v-if="step === 'email'">
        <h2>Forgot Password</h2>
        <p class="sub">Enter your email and we'll send a reset code</p>
        <form @submit.prevent="handleForgot">
          <div class="form-group">
            <label>Email Address</label>
            <input v-model="email" type="email" placeholder="Enter your email" required />
          </div>
          <p v-if="error" class="error-msg">{{ error }}</p>
          <p v-if="success" class="success-msg">{{ success }}</p>
          <button type="submit" class="btn btn-primary btn-lg w-full">Send Reset Code</button>
        </form>
      </div>

      <div v-if="step === 'reset'">
        <h2>Reset Password</h2>
        <p class="sub">Enter the code from your email and new password</p>
        <div class="demo-box">Demo code: <strong>{{ demoToken }}</strong></div>
        <form @submit.prevent="handleReset">
          <div class="form-group">
            <label>Reset Code</label>
            <input v-model="token" placeholder="Enter reset code" required />
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input v-model="newPassword" type="password" placeholder="New password (min 6 chars)" required minlength="6" />
          </div>
          <p v-if="error" class="error-msg">{{ error }}</p>
          <p v-if="success" class="success-msg">{{ success }}</p>
          <button type="submit" class="btn btn-primary btn-lg w-full">Reset Password</button>
        </form>
      </div>

      <div v-if="step === 'done'" class="done-step">
        <div class="done-icon">✅</div>
        <h2>Password Reset!</h2>
        <p>Your password has been reset successfully.</p>
        <button class="btn btn-primary btn-lg w-full" @click="$router.push('/login')">Go to Login</button>
      </div>

      <router-link to="/login" class="back-link">← Back to Login</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from '../stores/auth'

const step = ref<'email' | 'reset' | 'done'>('email')
const email = ref('')
const token = ref('')
const newPassword = ref('')
const error = ref('')
const success = ref('')
const demoToken = ref('')

async function handleForgot() {
  error.value = ''; success.value = ''
  try {
    const { data } = await api.post('/auth/forgot-password', { email: email.value })
    demoToken.value = data.demoToken
    success.value = data.message
    step.value = 'reset'
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to send reset code'
  }
}

async function handleReset() {
  error.value = ''; success.value = ''
  try {
    await api.post('/auth/reset-password', { token: token.value, newPassword: newPassword.value })
    step.value = 'done'
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Invalid or expired code'
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh; background: var(--bg-light);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.auth-box {
  background: white; border-radius: var(--radius-lg);
  padding: 40px; max-width: 440px; width: 100%;
  box-shadow: var(--shadow-md);
}
.auth-logo { font-size: 20px; font-weight: 800; color: var(--primary); margin-bottom: 24px; cursor: pointer; }
.auth-box h2 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
.sub { color: var(--text-medium); margin-bottom: 24px; font-size: 14px; }
.error-msg { color: var(--error); font-size: 13px; margin-bottom: 12px; }
.success-msg { color: var(--success); font-size: 13px; margin-bottom: 12px; }
.w-full { width: 100%; justify-content: center; }
.demo-box { background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 16px; }
.done-step { text-align: center; padding: 20px 0; }
.done-icon { font-size: 60px; margin-bottom: 16px; }
.done-step p { color: var(--text-medium); margin-bottom: 24px; }
.back-link { display: block; text-align: center; margin-top: 20px; font-size: 13px; color: var(--primary); font-weight: 500; }
</style>
