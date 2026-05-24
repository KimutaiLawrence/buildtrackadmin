<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Please enter your email and password.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await authStore.login(email.value, password.value)
    router.push('/dashboard')
  } catch (e: unknown) {
    error.value = (e as { message?: string })?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-gold-top" />
      <div class="login-header">
        <div class="login-logo">BUILD<span class="gold">TRACK</span></div>
        <div class="login-subtitle">Admin Portal</div>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input
            v-model="email"
            type="email"
            class="form-input"
            placeholder="admin@buildtrack.co.ke"
            autocomplete="email"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            v-model="password"
            type="password"
            class="form-input"
            placeholder="••••••••"
            autocomplete="current-password"
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="login-error">
          {{ error }}
        </div>

        <button
          type="submit"
          class="login-btn"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner" />
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
      </form>

      <div class="login-footer">
        <span>Restricted access — authorized personnel only</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #0D1829;
  border: 0.5px solid rgba(201,150,60,0.18);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
}

.login-gold-top {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #C9963C, transparent);
}

.login-header {
  padding: 36px 32px 28px;
  text-align: center;
  border-bottom: 0.5px solid rgba(201,150,60,0.1);
}

.login-logo {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #F2EDE4;
  line-height: 1;
}
.login-logo .gold { color: #C9963C; }

.login-subtitle {
  margin-top: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(201,150,60,0.55);
}

.login-form {
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(242,237,228,0.45);
}

.form-input {
  background: #122038;
  border: 0.5px solid rgba(201,150,60,0.18);
  border-radius: 4px;
  color: #F2EDE4;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  padding: 11px 14px;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}
.form-input::placeholder { color: rgba(242,237,228,0.2); }
.form-input:focus { border-color: rgba(201,150,60,0.5); }
.form-input:disabled { opacity: 0.5; cursor: not-allowed; }

.login-error {
  background: rgba(224,84,84,0.1);
  border: 0.5px solid rgba(224,84,84,0.3);
  border-radius: 4px;
  padding: 10px 14px;
  font-size: 13px;
  color: #E05454;
}

.login-btn {
  background: #C9963C;
  color: #080F1E;
  border: none;
  border-radius: 4px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  padding: 12px;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}
.login-btn:hover:not(:disabled) { background: #d9a84c; }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(8,15,30,0.3);
  border-top-color: #080F1E;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.login-footer {
  padding: 14px 32px 20px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(242,237,228,0.2);
}
</style>
