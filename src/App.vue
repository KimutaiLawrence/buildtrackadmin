<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Sidebar from '@/components/layout/Sidebar.vue'
import TopBar from '@/components/layout/TopBar.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <div>
    <template v-if="isAuthenticated">
      <Sidebar />
      <div class="main-content">
        <TopBar />
        <div class="page-content">
          <router-view />
        </div>
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
    <ToastContainer />
  </div>
</template>

<style>
.main-content {
  margin-left: 220px;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}
.page-content {
  padding: 1.5rem 2rem;
}
</style>
