<template>
  <section class="mx-auto max-w-3xl space-y-6">
    <!-- Loading -->
    <div v-if="loading" class="card p-8 text-center">
      <span class="material-symbols-outlined animate-spin text-3xl text-slate-400">progress_activity</span>
      <p class="mt-3 text-sm text-[#94A3B8] dark:text-[#a1a1aa]">Verificando convite...</p>
    </div>

    <!-- Sucesso -->
    <div v-else-if="success" class="card p-8 text-center">
      <span class="material-symbols-outlined text-5xl text-emerald-500">check_circle</span>
      <h2 class="mt-4 text-2xl font-extrabold text-[#1E293B] dark:text-[#fafafa]">Presença confirmada!</h2>
      <p class="mt-2 text-sm text-[#94A3B8] dark:text-[#a1a1aa]">Sua participação foi registrada com sucesso.</p>

      <div v-if="meetingInfo" class="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-dark-border dark:bg-dark-card">
        <p class="text-sm font-bold text-slate-900 dark:text-[#fafafa]">{{ meetingInfo.title }}</p>
        <p class="mt-1 text-xs text-slate-500 dark:text-[#a1a1aa]">
          {{ formatDate(meetingInfo.date) }} &bull; {{ meetingInfo.start_time?.slice(0, 5) }} – {{ meetingInfo.end_time?.slice(0, 5) }}
        </p>
      </div>

      <div v-if="meetingInfo" class="mt-4 w-full">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#71717a]">Adicionar à agenda</p>
        <div class="mt-3 flex flex-wrap items-center justify-center gap-3">
          <a
            :href="googleLink"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-white dark:border-dark-border dark:bg-dark-card dark:text-[#e4e4e7] dark:hover:bg-dark-hover"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google Calendar
          </a>
          <a
            :href="outlookLink"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-white dark:border-dark-border dark:bg-dark-card dark:text-[#e4e4e7] dark:hover:bg-dark-hover"
          >
            <svg class="h-4 w-4" viewBox="0 0 23 23"><path d="M1 1h10v10H1z" fill="#f35325"/><path d="M12 1h10v10H12z" fill="#81bc06"/><path d="M1 12h10v10H1z" fill="#05a6f0"/><path d="M12 12h10v10H12z" fill="#ffba08"/></svg>
            Outlook
          </a>
        </div>
      </div>

      <!-- Participantes confirmados -->
      <div v-if="confirmedList.length" class="mt-6 w-full text-left">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#71717a]">Quem confirmou</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <div
            v-for="p in confirmedList"
            :key="p.id"
            class="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-dark-border dark:bg-dark-card"
          >
            <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" :class="avatarColor(pName(p))">
              {{ pInitials(p) }}
            </div>
            <span class="text-sm font-semibold text-slate-700 dark:text-[#e4e4e7]">{{ pName(p) }}</span>
          </div>
        </div>
      </div>

      <NuxtLink class="button-primary mt-6 inline-flex" to="/">Ir para o início</NuxtLink>
    </div>

    <!-- Erro -->
    <div v-else-if="errorMsg" class="card p-8 text-center">
      <span class="material-symbols-outlined text-5xl text-red-400">error</span>
      <h2 class="mt-4 text-2xl font-extrabold text-[#1E293B] dark:text-[#fafafa]">Erro no convite</h2>
      <p class="mt-2 text-sm text-red-500">{{ errorMsg }}</p>
    </div>

    <!-- Formulário de confirmação -->
    <div v-else class="card p-8">
      <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Confirmação de presença</p>
      <h2 class="mt-2 text-3xl font-extrabold text-[#1E293B] dark:text-[#fafafa]">Você foi convidado!</h2>

      <!-- Card com info da reunião -->
      <div v-if="meetingInfo" class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-dark-border dark:bg-dark-card">
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined mt-0.5 text-primary">event</span>
          <div>
            <p class="text-sm font-bold text-slate-900 dark:text-[#fafafa]">{{ meetingInfo.title }}</p>
            <p class="mt-1 text-xs text-slate-500 dark:text-[#a1a1aa]">
              {{ formatDate(meetingInfo.date) }} &bull; {{ meetingInfo.start_time?.slice(0, 5) }} – {{ meetingInfo.end_time?.slice(0, 5) }}
            </p>
            <p v-if="creatorName" class="mt-1 text-xs text-slate-400 dark:text-[#71717a]">
              Organizado por {{ creatorName }}
            </p>
          </div>
        </div>
      </div>

      <!-- Quem já confirmou -->
      <div v-if="confirmedList.length" class="mt-4">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#71717a]">Quem já confirmou</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <div
            v-for="p in confirmedList"
            :key="p.id"
            class="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-dark-border dark:bg-dark-card"
          >
            <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold" :class="avatarColor(pName(p))">
              {{ pInitials(p) }}
            </div>
            <span class="text-xs font-medium text-slate-600 dark:text-[#a1a1aa]">{{ pName(p) }}</span>
          </div>
        </div>
      </div>

      <!-- Usuário logado: confirmação direta -->
      <div v-if="isLoggedIn" class="mt-6">
        <p class="text-sm text-slate-600 dark:text-[#a1a1aa]">
          Olá, <span class="font-bold text-slate-900 dark:text-[#fafafa]">{{ profile?.full_name }}</span>!
        </p>
        <button
          class="button-primary mt-4 w-full"
          :disabled="submitting"
          @click="confirmAsUser"
        >
          {{ submitting ? 'Confirmando...' : 'Confirmar presença' }}
        </button>
      </div>

      <!-- Não logado: duas opções -->
      <div v-else class="mt-6 space-y-4">
        <!-- Opção 1: Já tem conta -->
        <NuxtLink
          :to="loginReturnUrl"
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-white dark:border-dark-border dark:bg-dark-card dark:text-[#e4e4e7] dark:hover:bg-dark-hover"
        >
          <span class="material-symbols-outlined text-base">login</span>
          Já tenho conta
        </NuxtLink>

        <div class="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          <span class="h-px flex-1 bg-slate-200 dark:bg-dark-border"></span>
          ou
          <span class="h-px flex-1 bg-slate-200 dark:bg-dark-border"></span>
        </div>

        <!-- Opção 2: Visitante -->
        <button
          v-if="!showGuestForm"
          class="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:brightness-110"
          @click="showGuestForm = true"
        >
          <span class="material-symbols-outlined text-base align-middle">person_add</span>
          Confirmar como visitante
        </button>

        <!-- Formulário visitante -->
        <form v-if="showGuestForm" class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-dark-border dark:bg-dark-card" @submit.prevent="confirmAsGuest">
          <p class="text-sm font-semibold text-slate-700 dark:text-[#fafafa]">Dados do visitante</p>
          <div>
            <label class="text-xs font-bold uppercase tracking-widest text-[#94A3B8] dark:text-[#a1a1aa]">Nome completo</label>
            <input v-model="guestName" class="input-soft mt-2" placeholder="Digite seu nome" required />
          </div>
          <div>
            <label class="text-xs font-bold uppercase tracking-widest text-[#94A3B8] dark:text-[#a1a1aa]">E-mail (opcional)</label>
            <input v-model="guestEmail" class="input-soft mt-2" placeholder="nome@empresa.com" type="email" />
          </div>
          <button class="button-primary w-full" type="submit" :disabled="submitting">
            {{ submitting ? 'Confirmando...' : 'Confirmar presença' }}
          </button>
        </form>
      </div>

      <p class="mt-4 text-xs text-[#94A3B8] dark:text-[#71717a]">
        Caso não confirme, o criador poderá informar apenas a quantidade presente.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Meeting, MeetingParticipant } from '~/types/database'

definePageMeta({ layout: 'auth' })

const route = useRoute()
const meetingsApi = useMeetings()
const supabase = useSupabase()
const { profile } = useAuth()
const { googleCalendarUrl, outlookCalendarUrl } = useCalendarLinks()

const token = computed(() => (route.query.token as string) || '')
const meetingToken = computed(() => (route.query.meeting as string) || '')
const guestName = ref('')
const guestEmail = ref('')
const loading = ref(true)
const submitting = ref(false)
const success = ref(false)
const errorMsg = ref('')
const showGuestForm = ref(false)
const isLoggedIn = computed(() => Boolean(profile.value?.id))
const meetingInfo = ref<Meeting | null>(null)
const creatorName = ref('')
const confirmedList = ref<MeetingParticipant[]>([])

// Helpers de participantes
const pName = (p: MeetingParticipant) => p.profile?.full_name || p.guest_name || 'Sem nome'

const pInitials = (p: MeetingParticipant) => {
  const name = pName(p)
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

const avatarColors = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
]

const avatarColor = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

const loginReturnUrl = computed(() => {
  const currentUrl = route.fullPath
  return `/login?returnTo=${encodeURIComponent(currentUrl)}`
})

const googleLink = computed(() => {
  if (!meetingInfo.value) return ''
  return googleCalendarUrl({
    title: meetingInfo.value.title,
    date: meetingInfo.value.date,
    startTime: meetingInfo.value.start_time,
    endTime: meetingInfo.value.end_time,
    description: meetingInfo.value.description || '',
  })
})

const outlookLink = computed(() => {
  if (!meetingInfo.value) return ''
  return outlookCalendarUrl({
    title: meetingInfo.value.title,
    date: meetingInfo.value.date,
    startTime: meetingInfo.value.start_time,
    endTime: meetingInfo.value.end_time,
    description: meetingInfo.value.description || '',
  })
})

const formatDate = (d?: string) => {
  if (!d) return ''
  const date = new Date(d + 'T12:00:00')
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}

const loadMeetingInfo = async () => {
  if (meetingToken.value) {
    const { data } = await supabase
      .from('meetings')
      .select('*, creator:created_by(full_name), meeting_participants(*, profile:profiles!user_id(*))')
      .eq('invite_token', meetingToken.value)
      .single()
    if (data) {
      meetingInfo.value = data as Meeting
      creatorName.value = (data as any).creator?.full_name || ''
      confirmedList.value = ((data as any).meeting_participants ?? [])
        .filter((p: any) => p.status === 'confirmed') as MeetingParticipant[]
    }
  } else if (token.value) {
    const { data } = await supabase
      .from('meeting_participants')
      .select('meeting_id, meetings:meeting_id(*, creator:created_by(full_name), meeting_participants(*, profile:profiles!user_id(*)))')
      .eq('invite_token', token.value)
      .single()
    if (data?.meetings) {
      meetingInfo.value = data.meetings as unknown as Meeting
      creatorName.value = (data.meetings as any).creator?.full_name || ''
      confirmedList.value = ((data.meetings as any).meeting_participants ?? [])
        .filter((p: any) => p.status === 'confirmed') as MeetingParticipant[]
    }
  }
}

const confirmAsUser = async () => {
  submitting.value = true
  errorMsg.value = ''

  const { error } = await meetingsApi.confirmByMeetingToken(meetingToken.value || token.value, {
    userId: profile.value?.id,
  })

  if (error) {
    errorMsg.value = error.message || 'Erro ao confirmar presença.'
  } else {
    await loadMeetingInfo()
    success.value = true
  }
  submitting.value = false
}

const confirmAsGuest = async () => {
  if (!guestName.value.trim()) return
  submitting.value = true
  errorMsg.value = ''

  const { error } = token.value
    ? await meetingsApi.confirmGuest(token.value, guestName.value)
    : await meetingsApi.confirmByMeetingToken(meetingToken.value, {
        guestName: guestName.value.trim(),
        guestEmail: guestEmail.value.trim() || undefined,
      })

  if (error) {
    errorMsg.value = error.message || 'Erro ao confirmar presença.'
  } else {
    await loadMeetingInfo()
    success.value = true
  }
  submitting.value = false
}

onMounted(async () => {
  if (!token.value && !meetingToken.value) {
    errorMsg.value = 'Nenhum token de convite encontrado. Verifique o link recebido.'
    loading.value = false
    return
  }
  await loadMeetingInfo()
  if (!meetingInfo.value) {
    errorMsg.value = 'Reunião não encontrada ou link inválido.'
  }
  loading.value = false
})
</script>
