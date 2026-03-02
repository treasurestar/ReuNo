<template>
  <div v-if="authLoading" class="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-dark-bg">
    <div class="flex flex-col items-center gap-4">
      <img src="/logo-claro.png" alt="Reunô" class="h-12 block dark:hidden" />
      <img src="/logo-escuro.png" alt="Reunô" class="h-12 hidden dark:block" />
      <span class="material-symbols-outlined animate-spin text-[#94A3B8] dark:text-[#71717a]">progress_activity</span>
    </div>
  </div>
  <NuxtLayout v-else>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { loading: authLoading, initialize } = useAuth()

onMounted(() => {
  initialize()
})
</script>
