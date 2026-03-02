<template>
  <div class="w-full max-w-md">
    <div class="relative">
      <div class="glass-card rounded-3xl p-10 stagger relative">
        <div class="flex flex-col items-center gap-2 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/30">
            <span class="material-symbols-outlined text-2xl">diamond</span>
          </div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-[#fafafa]">Reunô</h1>
          <p class="text-sm text-slate-500 dark:text-[#a1a1aa]">Acesso seguro para agendar a sala</p>
        </div>

        <div
          v-if="errorMsg"
          class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
        >
          {{ errorMsg }}
        </div>

        <form class="mt-8 space-y-5 font-inter" @submit.prevent="handleSignIn">
          <div>
            <label class="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]" for="email">
              E-mail corporativo
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                mail
              </span>
              <input
                id="email"
                v-model="email"
                type="email"
                class="input-soft pl-10"
                placeholder="nome@empresa.com"
                required
              />
            </div>
          </div>
          <div>
            <div class="mb-2 flex items-center justify-between">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]" for="password">
                Senha
              </label>
              <button type="button" class="text-xs font-semibold text-primary hover:underline" @click="showRecovery = !showRecovery">
                Esqueci
              </button>
            </div>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                lock
              </span>
              <input
                id="password"
                v-model="password"
                type="password"
                class="input-soft pl-10"
                placeholder="********"
                required
              />
            </div>
          </div>
          <button
            class="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:brightness-110 disabled:opacity-50"
            type="submit"
            :disabled="submitting"
          >
            <span v-if="submitting">Entrando...</span>
            <span v-else>
              Entrar
              <span class="material-symbols-outlined text-base align-middle">arrow_forward</span>
            </span>
          </button>
        </form>

        <!-- B1: Painel de recuperação de senha -->
        <div v-if="showRecovery" class="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-dark-border dark:bg-dark-card">
          <p class="text-sm font-semibold text-slate-700 dark:text-[#fafafa]">Recuperar senha</p>
          <p class="mt-1 text-xs text-slate-500 dark:text-[#a1a1aa]">Informe seu e-mail para receber o link de redefinição.</p>
          <div class="mt-3 flex gap-2">
            <input
              v-model="recoveryEmail"
              type="email"
              class="input-soft flex-1"
              placeholder="nome@empresa.com"
            />
            <button
              type="button"
              class="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
              :disabled="recoverySubmitting"
              @click="handleRecovery"
            >
              {{ recoverySubmitting ? 'Enviando...' : 'Enviar' }}
            </button>
          </div>
          <p v-if="recoveryMsg" class="mt-3 text-xs font-semibold" :class="recoverySuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'">
            {{ recoveryMsg }}
          </p>
        </div>

        <p class="mt-8 text-center text-sm text-slate-500 dark:text-[#a1a1aa]">
          Sem conta?
          <NuxtLink class="font-bold text-primary hover:underline" to="/registro">Criar conta</NuxtLink>
        </p>
      </div>
      <p class="mt-6 text-center text-xs text-slate-400">&copy; 2026 Reunô. Todos os direitos reservados.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const supabase = useSupabase()
const { revalidate, isAdmin, bootstrapAdmin } = useAuth()
const email = ref('')
const password = ref('')
const submitting = ref(false)
const errorMsg = ref('')

// B1: Recuperação de senha
const showRecovery = ref(false)
const recoveryEmail = ref('')
const recoverySubmitting = ref(false)
const recoveryMsg = ref('')
const recoverySuccess = ref(false)

// B5: Mapa de tradução de erros do Supabase
const translateError = (msg: string): string => {
  const map: Record<string, string> = {
    'Invalid login credentials': 'E-mail ou senha inválidos.',
    'Email not confirmed': 'E-mail ainda não confirmado. Verifique sua caixa de entrada.',
    'Too many requests': 'Muitas tentativas. Aguarde alguns minutos.',
    'User not found': 'Usuário não encontrado.',
    'Invalid email or password': 'E-mail ou senha inválidos.',
    'Signup requires a valid password': 'Senha inválida.',
    'Email rate limit exceeded': 'Limite de envios atingido. Tente novamente mais tarde.',
    'For security purposes, you can only request this after 60 seconds.': 'Aguarde 60 segundos antes de tentar novamente.',
  }
  return map[msg] ?? msg
}

const handleSignIn = async () => {
  if (!email.value.trim() || !password.value) return
  submitting.value = true
  errorMsg.value = ''

  // B6: Trim no email
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value,
  })

  if (error) {
    errorMsg.value = translateError(error.message)
    submitting.value = false
    return
  }

  // B3: try-finally para sempre resetar submitting
  try {
    await revalidate()
    await bootstrapAdmin()
    await revalidate()
    navigateTo(isAdmin.value ? '/admin' : '/')
  } catch (e) {
    console.warn('[login] Erro pós-login:', e)
    errorMsg.value = 'Erro ao finalizar o login. Tente novamente.'
  } finally {
    submitting.value = false
  }
}

// B1: Recuperação de senha
const handleRecovery = async () => {
  if (!recoveryEmail.value.trim()) return
  recoverySubmitting.value = true
  recoveryMsg.value = ''
  recoverySuccess.value = false
  try {
    const redirectTo = window.location.origin + '/redefinir-senha'
    const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail.value.trim(), { redirectTo })
    if (error) {
      recoveryMsg.value = translateError(error.message)
    } else {
      recoveryMsg.value = 'Link de recuperação enviado! Verifique seu e-mail.'
      recoverySuccess.value = true
    }
  } catch {
    recoveryMsg.value = 'Erro ao enviar. Tente novamente.'
  } finally {
    recoverySubmitting.value = false
  }
}

</script>
