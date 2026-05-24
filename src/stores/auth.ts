import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/api'

export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: 'admin'
}

interface LoginResponse {
  data: {
    access_token: string
    user: AdminUser
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AdminUser | null>(
    JSON.parse(localStorage.getItem('admin_user') || 'null')
  )
  const isAuthenticated = computed(() => !!user.value && user.value.role === 'admin')

  async function login(email: string, password: string) {
    const res = await api.post('/v1/auth/login/admin', { email, password }) as LoginResponse
    const { access_token, user: userData } = res.data
    if (userData.role !== 'admin') throw new Error('Access denied: not an admin')
    user.value = userData
    localStorage.setItem('admin_user', JSON.stringify(userData))
    localStorage.setItem('admin_access_token', access_token)
  }

  async function logout() {
    try { await api.post('/v1/auth/logout') } catch { /* ignore */ }
    user.value = null
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_access_token')
  }

  return { user, isAuthenticated, login, logout }
})
