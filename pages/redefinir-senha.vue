<template>
  <div class="w-full max-w-md">
    <div class="relative">
      <div class="glass-card rounded-3xl p-10 stagger relative">
        <div class="flex flex-col items-center gap-2 text-center">
          <img src="/logo-claro.png" alt="Reunô" class="h-12 block dark:hidden" />
          <img src="/logo-escuro.png" alt="Reunô" class="h-12 hidden dark:block" />
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-[#fafafa]">Nova senha</h1>
          <p class="text-sm text-slate-500 dark:text-[#a1a1aa]">Defina sua nova senha de acesso.</p>
        </div>

        <!-- Estado: carregando sessão -->
        <div v-if="loading" class="mt-8 flex flex-col items-center gap-3">
          <span class="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
          <p class="text-sm text-slate-500 dark:text-[#a1a1aa]">Verificando link de recuperação...</p>
        </div>

        <!-- Estado: link inválido -->
        <div v-else-if="invalidLink" class="mt-8 text-center">
          <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
            Link de recuperação inválido ou expirado.
          </div>
          <NuxtLink
            to="/login"
            class="mt-4 inline-block text-sm font-bold text-primary hover:underline"
          >
            Voltar ao login
          </NuxtLink>
        </div>

        <!-- Estado: senha alterada com sucesso -->
        <div v-else-if="success" class="mt-8 text-center">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <span class="material-symbols-outlined text-3xl text-emerald-600 dark:text-emerald-400">check_circle</span>
          </div>
          <p class="mt-4 text-sm font-semibold text-slate-700 dark:text-[#fafafa]">Senha alterada com sucesso!</p>
          <NuxtLink
            to="/login"
            class="mt-4 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:brightness-110"
          >
            Fazer login
          </NuxtLink>
        </div>

        <!-- Estado: formulário -->
        <form v-else class="mt-8 space-y-5 font-inter" @submit.prevent="handleSubmit">
          <div
            v-if="errorMsg"
            class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
          >
            {{ errorMsg }}
          </div>

          <div>
            <label class="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]" for="new-password">
              Nova senha
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
              <input
                id="new-password"
                v-model="newPassword"
                type="password"
                class="input-soft pl-10"
                placeholder="Mínimo 6 caracteres"
                required
                minlength="6"
              />
            </div>
          </div>

          <div>
            <label class="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]" for="confirm-password">
              Confirmar senha
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
              <input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                class="input-soft pl-10"
                placeholder="Repita a senha"
                required
                minlength="6"
              />
            </div>
          </div>

          <button
            class="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:brightness-110 disabled:opacity-50"
            type="submit"
            :disabled="submitting"
          >
            <span v-if="submitting">Salvando...</span>
            <span v-else>Redefinir senha</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabase()

const newPassword = ref('')
const confirmPassword = ref('')
const submitting = ref(false)
const errorMsg = ref('')
const success = ref(false)
const loading = ref(true)
const invalidLink = ref(false)

onMounted(async () => {
  // Supabase detecta o token de recovery do hash da URL automaticamente
  // Esperamos o evento PASSWORD_RECOVERY ou verificamos a sessão
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      loading.value = false
    }
  })

  // Fallback: se após 3s não recebeu o evento, verifica sessão
  setTimeout(async () => {
    if (loading.value) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        loading.value = false
      } else {
        loading.value = false
        invalidLink.value = true
      }
    }
  }, 3000)
})

const handleSubmit = async () => {
  errorMsg.value = ''

  if (newPassword.value.length < 6) {
    errorMsg.value = 'A senha deve ter no mínimo 6 caracteres.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'As senhas não coincidem.'
    return
  }

  submitting.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword.value })
    if (error) {
      errorMsg.value = error.message === 'New password should be different from the old password.'
        ? 'A nova senha deve ser diferente da senha atual.'
        : 'Erro ao redefinir senha. Tente novamente.'
    } else {
      success.value = true
      // Faz logout para forçar novo login com a senha atualizada
      await supabase.auth.signOut()
    }
  } catch {
    errorMsg.value = 'Erro inesperado. Tente novamente.'
  } finally {
    submitting.value = false
  }
}
</script>
