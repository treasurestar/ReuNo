<template>
  <section class="space-y-8">
    <template v-if="created">
      <div class="card p-8 text-center max-w-2xl mx-auto">
        <span class="material-symbols-outlined text-5xl text-emerald-500">check_circle</span>
        <h2 class="mt-4 text-2xl font-extrabold text-slate-900 dark:text-[#fafafa]">
          {{ seriesResult ? 'Série de reuniões criada!' : 'Reunião criada!' }}
        </h2>
        <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">Compartilhe o link abaixo para visitantes confirmarem presença.</p>

        <div v-if="seriesResult" class="mt-4 w-full text-left">
          <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/30">
            <p class="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              {{ seriesResult.created.length }} reuniões criadas
            </p>
          </div>
          <div v-if="seriesResult.skipped.length" class="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/30">
            <p class="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              {{ seriesResult.skipped.length }} datas puladas por conflito
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span v-for="d in seriesResult.skipped" :key="d" class="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                <span class="material-symbols-outlined text-[14px]">warning</span>
                {{ formatDateShort(d) }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold text-slate-600 break-all dark:border-dark-border dark:bg-dark-card dark:text-[#a1a1aa]">
          {{ meetingLink }}
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button class="button-primary" @click="copyLink">
            <span class="material-symbols-outlined text-base">{{ copied ? 'check' : 'content_copy' }}</span>
            {{ copied ? 'Copiado!' : 'Copiar link' }}
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition-all hover:brightness-110"
            @click="shareWhatsApp"
          >
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </button>
        </div>

        <div v-if="registeredEmails.length || guestEmails.length" class="mt-6 w-full text-left">
          <div v-if="registeredEmails.length" class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/30">
            <p class="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Usuários registrados (notificados no sistema)</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span v-for="e in registeredEmails" :key="e" class="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                <span class="material-symbols-outlined text-[14px]">person</span>
                {{ e }}
              </span>
            </div>
          </div>
          <div v-if="guestEmails.length" class="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/30">
            <p class="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Visitantes (envie o link acima)</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span v-for="e in guestEmails" :key="e" class="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                <span class="material-symbols-outlined text-[14px]">link</span>
                {{ e }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-6 w-full">
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#71717a]">Adicionar à agenda</p>
          <div class="mt-3 flex flex-wrap items-center justify-center gap-3">
            <template v-if="gcalSynced">
              <span class="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                <span class="material-symbols-outlined text-base">check_circle</span>
                Google Calendar sincronizado
              </span>
            </template>
            <template v-else>
              <a
                :href="googleLink"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-white dark:border-dark-border dark:bg-dark-card dark:text-[#e4e4e7] dark:hover:bg-dark-hover"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google Calendar
              </a>
            </template>
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

        <NuxtLink class="button-outline mt-6" to="/">Ir para o início</NuxtLink>
      </div>
    </template>
    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Confirmação</p>
          <h2 class="mt-2 text-3xl font-extrabold text-slate-900 dark:text-[#fafafa]">Revisar e confirmar</h2>
        </div>
        <div class="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 dark:border-dark-border dark:bg-dark-card dark:text-[#a1a1aa]">
          Etapa 3 de 3
        </div>
      </div>

      <div class="grid gap-8 xl:grid-cols-12 stagger">
      <div class="xl:col-span-8 space-y-6">
        <div class="card p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Resumo da reunião</h3>
          <div class="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Título</p>
              <p class="mt-2 text-base font-semibold text-slate-900 dark:text-[#fafafa]">{{ booking.title }}</p>
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Sala</p>
              <p class="mt-2 text-base font-semibold text-slate-900 dark:text-[#fafafa]">{{ roomConfig?.name ?? 'Sala de Reuniões' }}</p>
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Data</p>
              <p class="mt-2 text-base font-semibold text-slate-900 dark:text-[#fafafa]">{{ formattedDate }}</p>
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Horário</p>
              <p class="mt-2 text-base font-semibold text-slate-900 dark:text-[#fafafa]">{{ booking.startTime?.slice(0, 5) }} – {{ booking.endTime?.slice(0, 5) }}</p>
            </div>
          </div>
        </div>

        <!-- Recurrence preview card -->
        <div v-if="booking.recurrence.enabled && recurrenceDates.length" class="card p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">
            <span class="material-symbols-outlined mr-1 align-middle text-primary">repeat</span>
            Recorrência
          </h3>
          <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">
            {{ frequencyLabel }} — {{ recurrenceDates.length }} ocorrências
          </p>
          <div class="mt-4 space-y-2 max-h-60 overflow-y-auto">
            <div
              v-for="d in recurrenceDates"
              :key="d"
              class="flex items-center gap-2 text-sm"
              :class="skippedDatesPreview.has(d) ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-[#a1a1aa]'"
            >
              <span class="material-symbols-outlined text-base">{{ skippedDatesPreview.has(d) ? 'warning' : 'check_circle' }}</span>
              {{ formatDateShort(d) }}
              <span v-if="skippedDatesPreview.has(d)" class="text-xs">(conflito — será pulada)</span>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Participantes</h3>
          <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">
            {{ booking.expectedParticipants }} esperados
            <span v-if="emailList.length"> • {{ emailList.length }} convidados por e-mail</span>
          </p>
          <div v-if="emailList.length" class="mt-4 flex flex-wrap gap-3">
            <span v-for="(em, i) in emailList" :key="i" class="chip bg-slate-100 text-slate-600 dark:bg-dark-card dark:text-[#a1a1aa]">{{ em }}</span>
          </div>
          <p class="mt-4 text-xs text-slate-400 dark:text-[#71717a]">
            Convidados sem conta confirmam presença via link. Caso não confirmem, o criador informa a quantidade presente.
          </p>
        </div>

        <div v-if="booking.notifications.length" class="card p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Notificações</h3>
          <div class="mt-4 flex flex-wrap gap-3">
            <span v-for="n in booking.notifications" :key="n" class="chip bg-slate-100 text-slate-600 dark:bg-dark-card dark:text-[#a1a1aa]">
              {{ formatMinutes(n) }}
            </span>
          </div>
        </div>
      </div>

      <div class="xl:col-span-4 space-y-6">
        <div class="card p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Ações</h3>
          <p v-if="errorMsg" class="mt-3 text-xs font-semibold text-red-500">{{ errorMsg }}</p>
          <button class="button-primary mt-4 w-full" :disabled="submitting" @click="confirmMeeting">
            <span v-if="submitting">Criando...</span>
            <span v-else>{{ booking.recurrence.enabled ? 'Confirmar série' : 'Confirmar reunião' }}</span>
          </button>
          <NuxtLink class="button-outline mt-3 w-full text-center" to="/disponibilidade">
            Editar detalhes
          </NuxtLink>
          <NuxtLink class="mt-3 block text-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" to="/agendar">
            Voltar para edição
          </NuxtLink>
        </div>
      </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { Meeting } from '~/types/database'

const { data: booking, step, reset } = useBookingFlow()
const { config: roomConfig, fetch: fetchConfig } = useRoomConfig()
const { profile } = useAuth()
const meetingsApi = useMeetings()
const supabase = useSupabase()
const { googleCalendarUrl, outlookCalendarUrl } = useCalendarLinks()
const { connected: gcalConnected, checkConnection: gcalCheckConnection, createEvent: gcalCreateEvent } = useGoogleCalendar()
const gcalSynced = ref(false)

const submitting = ref(false)
const errorMsg = ref('')
const created = ref(false)
const meetingToken = ref('')
const copied = ref(false)
const registeredEmails = ref<string[]>([])
const guestEmails = ref<string[]>([])
const createdMeeting = ref<{ title: string; date: string; startTime: string; endTime: string; description: string }>({
  title: '', date: '', startTime: '', endTime: '', description: '',
})
const seriesResult = ref<{ created: Meeting[]; skipped: string[] } | null>(null)
const skippedDatesPreview = ref<Set<string>>(new Set())
const loadingPreview = ref(false)

const googleLink = computed(() => googleCalendarUrl(createdMeeting.value))
const outlookLink = computed(() => outlookCalendarUrl(createdMeeting.value))

const formattedDate = computed(() => {
  if (!booking.value.date) return ''
  const d = new Date(booking.value.date + 'T12:00:00')
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
})

const formatDateShort = (d: string) => {
  const dt = new Date(d + 'T12:00:00')
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(dt)
}

const frequencyLabels: Record<string, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  monthly: 'Mensal',
}
const frequencyLabel = computed(() => frequencyLabels[booking.value.recurrence.frequency] || '')

const recurrenceDates = computed(() => {
  if (!booking.value.recurrence.enabled || !booking.value.date) return []
  const allowWeekends = roomConfig.value?.allow_weekends ?? true
  return meetingsApi.generateOccurrenceDates({
    startDate: booking.value.date,
    frequency: booking.value.recurrence.frequency,
    daysOfWeek: booking.value.recurrence.daysOfWeek,
    endType: booking.value.recurrence.endType,
    endDate: booking.value.recurrence.endDate,
    maxOccurrences: booking.value.recurrence.maxOccurrences || 10,
    allowWeekends,
  })
})

const emailList = computed(() =>
  booking.value.invitedEmails
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)
)

const formatMinutes = (m: number) => {
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const min = m % 60
    return min > 0 ? `${h}h ${min}m` : `${h}h`
  }
  return `${m}m`
}

const meetingLink = computed(() => {
  if (!meetingToken.value) return ''
  if (process.client) return `${window.location.origin}/confirmar-presenca?meeting=${meetingToken.value}`
  return `/confirmar-presenca?meeting=${meetingToken.value}`
})

const copyLink = async () => {
  if (!meetingLink.value) return
  try {
    await navigator.clipboard.writeText(meetingLink.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) {
    console.warn('[confirmar] Falha ao copiar link:', e)
  }
}

const shareWhatsApp = () => {
  if (!meetingLink.value) return
  const text = encodeURIComponent(`Confirme sua presença na reunião: ${meetingLink.value}`)
  window.open(`https://wa.me/?text=${text}`, '_blank')
}

// Build participants list from emails
const buildParticipants = async (profileId: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const invalidEmails = emailList.value.filter(e => !emailRegex.test(e))
  if (invalidEmails.length > 0) {
    return { participants: null, error: `E-mails inválidos: ${invalidEmails.join(', ')}`, profileMap: new Map() }
  }

  const participants: { user_id?: string; guest_email?: string; guest_name?: string; is_organizer?: boolean }[] = [
    { user_id: profileId, is_organizer: true },
  ]

  let profileMap = new Map<string, string>()
  if (emailList.value.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .in('email', emailList.value)
    profileMap = new Map(profiles?.map((p: { id: string; email: string }) => [p.email, p.id]) ?? [])
  }

  for (const email of emailList.value) {
    const userId = profileMap.get(email)
    if (userId) {
      participants.push({ user_id: userId })
    } else {
      participants.push({ guest_email: email, guest_name: email.split('@')[0] })
    }
  }

  return { participants, error: null, profileMap }
}

const confirmMeeting = async () => {
  if (!profile.value) return
  submitting.value = true
  errorMsg.value = ''

  try {
    const { participants, error: partBuildError, profileMap } = await buildParticipants(profile.value.id)
    if (partBuildError || !participants) {
      errorMsg.value = partBuildError || 'Erro ao processar participantes.'
      submitting.value = false
      return
    }

    // ── Recurrence flow ──
    if (booking.value.recurrence.enabled && recurrenceDates.value.length > 0) {
      const { created: createdMeetings, skipped, error } = await meetingsApi.createWithSeries({
        meetingBase: {
          title: booking.value.title,
          description: booking.value.description || undefined,
          start_time: booking.value.startTime,
          end_time: booking.value.endTime,
          duration_minutes: booking.value.duration,
          expected_participants: booking.value.expectedParticipants,
          created_by: profile.value.id,
        },
        dates: recurrenceDates.value,
        seriesConfig: {
          frequency: booking.value.recurrence.frequency,
          daysOfWeek: booking.value.recurrence.daysOfWeek,
          interval: booking.value.recurrence.frequency === 'biweekly' ? 2 : 1,
          endDate: booking.value.recurrence.endType === 'date' ? booking.value.recurrence.endDate : null,
          maxOccurrences: booking.value.recurrence.endType === 'occurrences' ? booking.value.recurrence.maxOccurrences : null,
        },
      })

      if (error) {
        errorMsg.value = error.message || 'Erro ao criar série de reuniões.'
        submitting.value = false
        return
      }

      // Add participants and notifications to each created meeting
      for (const meeting of createdMeetings) {
        await meetingsApi.addParticipants(meeting.id, participants)
        if (booking.value.notifications.length) {
          await meetingsApi.addNotifications(meeting.id, meeting.date, booking.value.startTime, booking.value.notifications)
        }
      }

      // Sync com Google Calendar se conectado
      if (gcalConnected.value && createdMeetings.length) {
        for (const m of createdMeetings) {
          await gcalCreateEvent({
            meetingId: m.id,
            title: m.title,
            description: m.description || '',
            date: m.date,
            startTime: m.start_time,
            endTime: m.end_time,
          })
        }
        gcalSynced.value = true
      }

      seriesResult.value = { created: createdMeetings, skipped }
      meetingToken.value = createdMeetings[0]?.invite_token ?? ''
      registeredEmails.value = emailList.value.filter(e => profileMap.has(e))
      guestEmails.value = emailList.value.filter(e => !profileMap.has(e))
      createdMeeting.value = {
        title: booking.value.title,
        date: createdMeetings[0]?.date || booking.value.date,
        startTime: booking.value.startTime,
        endTime: booking.value.endTime,
        description: booking.value.description || '',
      }
      created.value = true
      reset()
      return
    }

    // ── Single meeting flow ──
    const { data: meeting, error } = await meetingsApi.create({
      title: booking.value.title,
      description: booking.value.description || undefined,
      date: booking.value.date,
      start_time: booking.value.startTime,
      end_time: booking.value.endTime,
      duration_minutes: booking.value.duration,
      expected_participants: booking.value.expectedParticipants,
      created_by: profile.value.id,
    })

    if (error || !meeting) {
      errorMsg.value = error?.message ?? 'Erro ao criar reunião.'
      submitting.value = false
      return
    }

    const { error: partError } = await meetingsApi.addParticipants(meeting.id, participants)
    if (partError) {
      console.warn('[confirmar] Erro ao adicionar participantes, cancelando reunião:', partError.message)
      await meetingsApi.cancel(meeting.id, profile.value.id)
      errorMsg.value = 'Erro ao adicionar participantes. A reunião foi cancelada. Tente novamente.'
      submitting.value = false
      return
    }

    if (booking.value.notifications.length) {
      const { error: notifError } = await meetingsApi.addNotifications(meeting.id, booking.value.date, booking.value.startTime, booking.value.notifications)
      if (notifError) {
        console.warn('[confirmar] Erro ao adicionar notificações (não-crítico):', notifError.message)
      }
    }

    // Sync com Google Calendar se conectado
    if (gcalConnected.value) {
      await gcalCreateEvent({
        meetingId: meeting.id,
        title: booking.value.title,
        description: booking.value.description || '',
        date: booking.value.date,
        startTime: booking.value.startTime,
        endTime: booking.value.endTime,
      })
      gcalSynced.value = true
    }

    meetingToken.value = meeting.invite_token ?? ''
    registeredEmails.value = emailList.value.filter(e => profileMap.has(e))
    guestEmails.value = emailList.value.filter(e => !profileMap.has(e))
    createdMeeting.value = {
      title: booking.value.title,
      date: booking.value.date,
      startTime: booking.value.startTime,
      endTime: booking.value.endTime,
      description: booking.value.description || '',
    }
    created.value = true
    reset()
  } catch (e: any) {
    errorMsg.value = e?.message || 'Erro inesperado ao criar reunião.'
    submitting.value = false
  }
}

// Check conflicts for preview
const checkConflictsForPreview = async () => {
  if (!booking.value.recurrence.enabled || !recurrenceDates.value.length) {
    skippedDatesPreview.value = new Set()
    return
  }
  loadingPreview.value = true
  const skipped = new Set<string>()
  for (const date of recurrenceDates.value) {
    const { data: existing } = await meetingsApi.fetchByDate(date)
    const conflict = existing.some(m => {
      return booking.value.startTime < m.end_time && booking.value.endTime > m.start_time
    })
    if (conflict) skipped.add(date)
  }
  skippedDatesPreview.value = skipped
  loadingPreview.value = false
}

onMounted(async () => {
  await fetchConfig()
  gcalCheckConnection()
  step.value = 3
  if (!booking.value.title) navigateTo('/agendar')
  await checkConflictsForPreview()
})
</script>
