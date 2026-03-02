<template>
  <div v-if="authLoading" class="flex min-h-screen items-center justify-center bg-[#F8FAFC] dark:bg-dark-bg">
    <div class="flex flex-col items-center gap-4">
      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/30">
        <span class="material-symbols-outlined text-2xl">diamond</span>
      </div>
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
