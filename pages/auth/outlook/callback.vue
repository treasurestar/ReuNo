<template>
  <section class="mx-auto max-w-md py-20 text-center">
    <!-- Processando -->
    <div v-if="processing" class="card p-8">
      <span class="material-symbols-outlined animate-spin text-3xl text-slate-400 dark:text-[#71717a]">
        progress_activity
      </span>
      <p class="mt-4 text-sm text-slate-500 dark:text-[#a1a1aa]">
        Conectando Outlook Calendar...
      </p>
    </div>

    <!-- Erro -->
    <div v-else-if="errorMsg" class="card p-8">
      <span class="material-symbols-outlined text-5xl text-red-400">error</span>
      <h2 class="mt-4 text-xl font-extrabold text-[#1E293B] dark:text-[#fafafa]">
        Erro na conexão
      </h2>
      <p class="mt-2 text-sm text-red-500">{{ errorMsg }}</p>
      <NuxtLink
        class="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1E293B] px-6 py-3 text-sm font-bold text-white shadow-soft transition-all hover:shadow-lg dark:bg-[#fafafa] dark:text-[#18181b] dark:shadow-dark-sm"
        to="/"
      >
        Voltar ao início
      </NuxtLink>
    </div>

    <!-- Sucesso -->
    <div v-else class="card p-8">
      <span class="material-symbols-outlined text-5xl text-emerald-500">check_circle</span>
      <h2 class="mt-4 text-xl font-extrabold text-[#1E293B] dark:text-[#fafafa]">
        Outlook Calendar conectado!
      </h2>
      <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">
        Suas reuniões serão sincronizadas automaticamente.
      </p>
      <NuxtLink
        class="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1E293B] px-6 py-3 text-sm font-bold text-white shadow-soft transition-all hover:shadow-lg dark:bg-[#fafafa] dark:text-[#18181b] dark:shadow-dark-sm"
        :to="returnTo"
      >
        Continuar
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()
const { exchangeCode, error: outlookError } = useOutlookCalendar()

const processing = ref(true)
const errorMsg = ref('')
const returnTo = ref('/')

onMounted(async () => {
  const code = route.query.code as string
  const queryError = route.query.error as string

  returnTo.value = sessionStorage.getItem('outlook-return-to') || '/'
  sessionStorage.removeItem('outlook-return-to')

  if (queryError) {
    errorMsg.value = queryError === 'access_denied'
      ? 'Acesso negado. Você cancelou a autorização.'
      : `Erro da Microsoft: ${queryError}`
    processing.value = false
    return
  }

  if (!code) {
    errorMsg.value = 'Código de autorização não encontrado.'
    processing.value = false
    return
  }

  const success = await exchangeCode(code)
  if (!success) {
    errorMsg.value = outlookError.value || 'Falha ao conectar Outlook Calendar.'
  }

  processing.value = false
})
</script>
