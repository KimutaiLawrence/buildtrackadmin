import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      try {
        const data = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/v1/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const token = (data as { data?: { access_token?: string } }).data?.access_token
        if (token) {
          localStorage.setItem('admin_access_token', token)
          error.config.headers.Authorization = `Bearer ${token}`
          return api(error.config)
        }
      } catch {
        // fall through
      }
      localStorage.removeItem('admin_access_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error?.response?.data || error)
  }
)

export default api
