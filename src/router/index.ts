import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', component: () => import('@/views/DashboardView.vue') },
  { path: '/developers', component: () => import('@/views/DevelopersView.vue') },
  { path: '/developers/:id', component: () => import('@/views/DeveloperDetailView.vue') },
  { path: '/projects', component: () => import('@/views/ProjectsView.vue') },
  { path: '/projects/:id', component: () => import('@/views/ProjectDetailView.vue') },
  { path: '/buyers', component: () => import('@/views/BuyersView.vue') },
  { path: '/uploads', component: () => import('@/views/UploadsView.vue') },
  { path: '/uploads/flagged', component: () => import('@/views/FlaggedUploadsView.vue') },
  { path: '/notifications', component: () => import('@/views/NotificationLogView.vue') },
  { path: '/audit-log', component: () => import('@/views/AuditLogView.vue') },
  { path: '/subscriptions', component: () => import('@/views/SubscriptionsView.vue') },
  { path: '/settings', component: () => import('@/views/SettingsView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta['public'] && !auth.isAuthenticated) {
    return '/login'
  }
  if (to.path === '/login' && auth.isAuthenticated) {
    return '/dashboard'
  }
})

export default router
