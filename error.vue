<template>
  <div class="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6 dark:bg-dark-bg">
    <div class="w-full max-w-md text-center animate-slideUp">
      <div class="flex justify-center">
        <div
          class="flex h-20 w-20 items-center justify-center rounded-3xl"
          :class="is404 ? 'bg-[#F1F5F9] dark:bg-dark-card' : 'bg-red-50 dark:bg-red-900/20'"
        >
          <span
            class="material-symbols-outlined text-4xl"
            :class="is404 ? 'text-[#94A3B8] dark:text-[#71717a]' : 'text-red-400'"
          >
            {{ is404 ? 'explore_off' : 'error' }}
          </span>
        </div>
      </div>

      <h1 class="mt-6 text-5xl font-extrabold text-[#1E293B] dark:text-[#fafafa]">
        {{ error?.statusCode || 500 }}
      </h1>

      <p class="mt-4 text-lg font-bold text-[#475569] dark:text-[#a1a1aa]">
        {{ is404 ? 'Página não encontrada' : 'Algo deu errado' }}
      </p>

      <p class="mt-2 text-sm text-[#94A3B8] dark:text-[#71717a]">
        {{ is404
          ? 'O endereço que você acessou não existe ou foi removido.'
          : (error?.message || 'Ocorreu um erro inesperado. Tente novamente.')
        }}
      </p>

      <div class="mt-8 flex flex-col items-center gap-3">
        <button class="button-primary" @click="handleError">
          <span class="material-symbols-outlined text-base">home</span>
          Voltar ao início
        </button>
        <button
          v-if="!is404"
          class="text-sm font-semibold text-[#94A3B8] transition-all hover:text-[#475569] dark:text-[#71717a] dark:hover:text-[#a1a1aa]"
          @click="reloadPage"
        >
          Tentar novamente
        </button>
      </div>

      <p class="mt-12 text-xs text-[#94A3B8] dark:text-[#71717a]">&copy; 2026 Reunô</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const is404 = computed(() => props.error?.statusCode === 404)

const handleError = () => clearError({ redirect: '/' })
const reloadPage = () => window.location.reload()
</script>
