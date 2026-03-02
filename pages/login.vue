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

        <div class="my-8 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          <span class="h-px flex-1 bg-slate-200 dark:bg-dark-border"></span>
          Ou continue com
          <span class="h-px flex-1 bg-slate-200 dark:bg-dark-border"></span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <button
            class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-white dark:border-dark-border dark:bg-dark-card dark:text-[#e4e4e7] dark:hover:bg-dark-hover disabled:opacity-50"
            type="button"
            :disabled="oauthSubmitting"
            @click="handleOAuth('google')"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
          <button
            class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-white dark:border-dark-border dark:bg-dark-card dark:text-[#e4e4e7] dark:hover:bg-dark-hover disabled:opacity-50"
            type="button"
            :disabled="oauthSubmitting"
            @click="handleOAuth('azure')"
          >
            <svg class="h-5 w-5" viewBox="0 0 23 23" aria-hidden="true">
              <path d="M1 1h10v10H1z" fill="#f35325" />
              <path d="M12 1h10v10H12z" fill="#81bc06" />
              <path d="M1 12h10v10H1z" fill="#05a6f0" />
              <path d="M12 12h10v10H12z" fill="#ffba08" />
            </svg>
            Microsoft
          </button>
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

// B4: OAuth loading
const oauthSubmitting = ref(false)

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
    const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail.value.trim())
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

// B4: OAuth com loading e error handling
const handleOAuth = async (provider: 'google' | 'azure') => {
  oauthSubmitting.value = true
  errorMsg.value = ''
  try {
    const { error } = await supabase.auth.signInWithOAuth({ provider })
    if (error) {
      errorMsg.value = provider === 'azure'
        ? 'Login Microsoft indisponível. Use e-mail e senha.'
        : translateError(error.message)
    }
  } catch {
    errorMsg.value = 'Erro ao conectar com o provedor. Tente novamente.'
  } finally {
    oauthSubmitting.value = false
  }
}
</script>
