<template>
  <div class="w-full max-w-md">
    <div class="relative">
      <div class="glass-card rounded-3xl p-10 stagger relative">
        <!-- Header -->
        <div class="flex flex-col items-center gap-2 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/30">
            <span class="material-symbols-outlined text-2xl">diamond</span>
          </div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-[#fafafa]">Criar conta</h1>
          <p class="text-sm text-slate-500 dark:text-[#a1a1aa]">
            <template v-if="step === 1">Preencha seus dados pessoais</template>
            <template v-else-if="step === 2">Selecione seu setor e cargo</template>
            <template v-else>Verifique seu e-mail</template>
          </p>
        </div>

        <!-- Step indicator -->
        <div v-if="step <= 2" class="mt-6 flex items-center justify-center gap-0">
          <template v-for="s in 2" :key="s">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all"
              :class="s < step
                ? 'bg-emerald-500 text-white'
                : s === step
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-slate-200 text-slate-400 dark:bg-dark-border dark:text-[#71717a]'"
            >
              <span v-if="s < step" class="material-symbols-outlined text-base">check</span>
              <span v-else>{{ s }}</span>
            </div>
            <div
              v-if="s < 2"
              class="h-0.5 w-10 transition-all"
              :class="s < step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-dark-border'"
            />
          </template>
        </div>

        <!-- Error message -->
        <div
          v-if="errorMsg"
          class="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
        >
          {{ errorMsg }}
        </div>

        <!-- Step 1: Dados pessoais -->
        <form v-if="step === 1" class="mt-8 space-y-5 font-inter" @submit.prevent="validateStep1">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]" for="firstName">
                Nome
              </label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                <input
                  id="firstName"
                  v-model="firstName"
                  type="text"
                  class="input-soft pl-10"
                  placeholder="Nome"
                  required
                />
              </div>
            </div>
            <div>
              <label class="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]" for="lastName">
                Sobrenome
              </label>
              <input
                id="lastName"
                v-model="lastName"
                type="text"
                class="input-soft"
                placeholder="Sobrenome"
                required
              />
            </div>
          </div>
          <div>
            <label class="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]" for="email">
              E-mail corporativo
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
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
            <label class="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]" for="password">
              Senha
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
              <input
                id="password"
                v-model="password"
                type="password"
                class="input-soft pl-10"
                placeholder="Mínimo 6 caracteres"
                required
                minlength="6"
              />
            </div>
          </div>
          <div>
            <label class="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]" for="confirmPassword">
              Confirmar senha
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                class="input-soft pl-10"
                placeholder="Repita a senha"
                required
              />
            </div>
          </div>
          <button
            class="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:brightness-110"
            type="submit"
          >
            Continuar
            <span class="material-symbols-outlined text-base align-middle">arrow_forward</span>
          </button>
        </form>

        <!-- Step 2: Setor e Cargo -->
        <form v-else-if="step === 2" class="mt-8 space-y-5 font-inter" @submit.prevent="handleSignUp">
          <div>
            <label class="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]" for="sector">
              Setor
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">corporate_fare</span>
              <select
                id="sector"
                v-model="selectedSector"
                class="input-soft pl-10 appearance-none"
                required
              >
                <option value="" disabled>Selecione o setor</option>
                <option v-for="s in allSectors" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
          </div>
          <div>
            <label class="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]" for="position">
              Cargo <span class="normal-case tracking-normal font-normal">(opcional)</span>
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">badge</span>
              <select
                id="position"
                v-model="selectedPosition"
                class="input-soft pl-10 appearance-none"
                :disabled="!selectedSector || filteredPositions.length === 0"
              >
                <option value="">Nenhum</option>
                <option v-for="p in filteredPositions" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <p v-if="selectedSector && filteredPositions.length === 0" class="mt-1 text-xs text-slate-400 dark:text-[#71717a]">
              Nenhum cargo cadastrado para este setor.
            </p>
          </div>
          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 rounded-xl border border-slate-200 bg-white/70 py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-white dark:border-dark-border dark:bg-dark-card dark:text-[#e4e4e7] dark:hover:bg-dark-hover"
              @click="step = 1"
            >
              <span class="material-symbols-outlined text-base align-middle">arrow_back</span>
              Voltar
            </button>
            <button
              class="flex-[2] rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:brightness-110 disabled:opacity-50"
              type="submit"
              :disabled="submitting"
            >
              <span v-if="submitting">Criando conta...</span>
              <span v-else>
                Criar conta
                <span class="material-symbols-outlined text-base align-middle">arrow_forward</span>
              </span>
            </button>
          </div>
        </form>

        <!-- Step 3: Sucesso — confirmar por e-mail -->
        <div v-else class="mt-8 text-center font-inter">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20">
            <span class="material-symbols-outlined text-3xl text-primary">mark_email_read</span>
          </div>
          <h2 class="text-lg font-bold text-slate-800 dark:text-[#fafafa]">Quase lá!</h2>
          <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">
            Enviamos um link de confirmação para
          </p>
          <p class="mt-1 text-sm font-bold text-slate-800 dark:text-[#fafafa]">{{ email }}</p>
          <p class="mt-3 text-sm text-slate-500 dark:text-[#a1a1aa]">
            Clique no link do e-mail para ativar sua conta e depois faça login.
          </p>
          <NuxtLink
            to="/login"
            class="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:brightness-110"
          >
            Ir para o login
            <span class="material-symbols-outlined text-base">arrow_forward</span>
          </NuxtLink>
        </div>

        <!-- Footer link -->
        <p v-if="step <= 2" class="mt-8 text-center text-sm text-slate-500 dark:text-[#a1a1aa]">
          Já tem conta?
          <NuxtLink class="font-bold text-primary hover:underline" to="/login">Entrar</NuxtLink>
        </p>
      </div>
      <p class="mt-6 text-center text-xs text-slate-400">&copy; 2026 Reunô. Todos os direitos reservados.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Sector, Position } from '~/types/database'

definePageMeta({ layout: 'auth' })

const supabase = useSupabase()

// State
const step = ref(1)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const selectedSector = ref('')
const selectedPosition = ref('')
const submitting = ref(false)
const errorMsg = ref('')

// Sectors & positions
const allSectors = ref<Sector[]>([])
const allPositions = ref<Position[]>([])

const filteredPositions = computed(() =>
  selectedSector.value
    ? allPositions.value.filter(p => p.sector_id === selectedSector.value)
    : []
)

// Load sectors and positions on mount
onMounted(async () => {
  const { data: sData } = await supabase.from('sectors').select('*').order('name')
  allSectors.value = (sData as Sector[]) || []

  const { data: pData } = await supabase.from('positions').select('*').order('name')
  allPositions.value = (pData as Position[]) || []
})

// Reset position when sector changes
watch(selectedSector, () => {
  selectedPosition.value = ''
})

// Step 1: Validate fields
const validateStep1 = () => {
  errorMsg.value = ''

  if (!firstName.value.trim() || !lastName.value.trim()) {
    errorMsg.value = 'Informe seu nome e sobrenome.'
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value.trim())) {
    errorMsg.value = 'Informe um e-mail válido.'
    return
  }
  if (password.value.length < 6) {
    errorMsg.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'As senhas não coincidem.'
    return
  }

  step.value = 2
}

// Step 2: Create account (Supabase sends confirmation link automatically)
const handleSignUp = async () => {
  errorMsg.value = ''

  if (!selectedSector.value) {
    errorMsg.value = 'Selecione um setor.'
    return
  }

  submitting.value = true
  try {
    const fullName = `${firstName.value.trim()} ${lastName.value.trim()}`
    const { data, error } = await supabase.auth.signUp({
      email: email.value.trim(),
      password: password.value,
      options: {
        data: {
          full_name: fullName,
          sector_id: selectedSector.value,
          position_id: selectedPosition.value || null,
        },
      },
    })

    if (error) {
      const errorTranslations: Record<string, string> = {
        'User already registered': 'Este e-mail já está cadastrado.',
        'Signup requires a valid password': 'Senha inválida.',
        'Email rate limit exceeded': 'Limite de envios atingido. Tente novamente mais tarde.',
      }
      errorMsg.value = errorTranslations[error.message] ?? error.message
      return
    }

    // If signUp returns a session (auto-confirm enabled), update profile directly
    if (data?.user && data?.session) {
      await supabase.from('profiles').update({
        sector_id: selectedSector.value || null,
        position_id: selectedPosition.value || null,
      }).eq('id', data.user.id)
      await supabase.auth.signOut()
    }

    step.value = 3
  } catch {
    errorMsg.value = 'Erro inesperado. Tente novamente.'
  } finally {
    submitting.value = false
  }
}
</script>
