<template>
  <section class="space-y-10">
    <!-- Hero: Reunião atual ou próxima -->
    <div class="grid gap-8 xl:grid-cols-12">
      <div class="xl:col-span-7">
        <!-- Reunião ao vivo -->
        <template v-if="liveMeeting">
          <div class="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-8 dark:border-indigo-500/30 dark:from-indigo-950/50 dark:to-dark-card">
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              <span class="relative flex h-2.5 w-2.5">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
              </span>
              Acontecendo agora
            </div>
            <h2 class="mt-4 text-3xl font-extrabold text-slate-900 dark:text-[#fafafa]">{{ liveMeeting.title }}</h2>
            <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">
              {{ formatTime(liveMeeting.start_time) }} – {{ formatTime(liveMeeting.end_time) }}
              <span v-if="liveMeeting.creator"> &bull; {{ liveMeeting.creator.full_name }}</span>
            </p>
            <div class="mt-4 flex items-center gap-3">
              <span class="material-symbols-outlined text-base text-indigo-500">timer</span>
              <span class="text-sm font-bold text-indigo-600 dark:text-indigo-400">Termina em {{ countdown }}</span>
            </div>

            <!-- Participantes -->
            <div v-if="liveParticipants.length" class="mt-6">
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#71717a]">Participantes confirmados</p>
              <div class="mt-3 flex flex-wrap gap-3">
                <div v-for="p in liveParticipants" :key="p.id" class="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 dark:border-dark-border dark:bg-dark-card">
                  <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" :class="avatarColor(pName(p))">
                    {{ pInitials(p) }}
                  </div>
                  <span class="text-sm font-semibold text-slate-700 dark:text-[#e4e4e7]">{{ pName(p) }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Próxima reunião (contagem regressiva) -->
        <template v-else-if="nextMeeting">
          <div class="rounded-3xl border border-slate-200 bg-white p-8 dark:border-dark-border dark:bg-dark-card">
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
              <span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
              Próxima reunião
            </div>
            <h2 class="mt-4 text-3xl font-extrabold text-slate-900 dark:text-[#fafafa]">{{ nextMeeting.title }}</h2>
            <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">
              {{ formatTime(nextMeeting.start_time) }} – {{ formatTime(nextMeeting.end_time) }}
              <span v-if="nextMeeting.creator"> &bull; {{ nextMeeting.creator.full_name }}</span>
            </p>
            <div class="mt-4 flex items-center gap-3">
              <span class="material-symbols-outlined text-base text-amber-500">schedule</span>
              <span class="text-sm font-bold text-amber-600 dark:text-amber-400">Começa em {{ countdown }}</span>
            </div>

            <!-- Participantes -->
            <div v-if="nextParticipants.length" class="mt-6">
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-[#71717a]">Participantes confirmados</p>
              <div class="mt-3 flex flex-wrap gap-3">
                <div v-for="p in nextParticipants" :key="p.id" class="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-dark-border dark:bg-dark-card">
                  <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" :class="avatarColor(pName(p))">
                    {{ pInitials(p) }}
                  </div>
                  <span class="text-sm font-semibold text-slate-700 dark:text-[#e4e4e7]">{{ pName(p) }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Nenhuma reunião -->
        <template v-else-if="!loadingMeetings">
          <div class="rounded-3xl border border-slate-200 bg-white p-8 dark:border-dark-border dark:bg-dark-card">
            <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              Sala livre
            </div>
            <h2 class="mt-4 text-3xl font-extrabold text-slate-900 dark:text-[#fafafa]">
              Nenhuma reunião
              <span class="text-slate-400">agendada para hoje.</span>
            </h2>
            <div class="mt-6">
              <NuxtLink class="button-primary" to="/agendar">
                <span class="material-symbols-outlined">bolt</span>
                Reservar agora
              </NuxtLink>
            </div>
          </div>
        </template>
      </div>

      <div class="xl:col-span-5">
        <div class="card p-6">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Uso diário</p>
          <div class="mt-4 flex items-end gap-3">
            <span class="text-5xl font-extrabold text-slate-900 dark:text-[#fafafa]">{{ occupancy }}%</span>
          </div>
          <div class="mt-6 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-dark-border">
            <div class="h-full bg-slate-900 transition-all dark:bg-[#fafafa]" :style="{ width: `${occupancy}%` }"></div>
          </div>
          <div class="mt-6 grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
            <div>
              <p class="text-slate-500 dark:text-[#a1a1aa]">Capacidade</p>
              <p class="mt-2 text-lg font-extrabold text-slate-900 dark:text-[#fafafa]">{{ roomConfig?.max_capacity ?? 12 }} pessoas</p>
            </div>
            <div>
              <p class="text-slate-500 dark:text-[#a1a1aa]">Reuniões hoje</p>
              <p class="mt-2 text-lg font-extrabold text-slate-900 dark:text-[#fafafa]">{{ todayMeetings.length }}</p>
            </div>
          </div>
        </div>
        <div class="mt-4 flex gap-3">
          <NuxtLink class="button-primary flex-1 text-center" to="/agendar">
            <span class="material-symbols-outlined">bolt</span>
            Reservar
          </NuxtLink>
          <NuxtLink class="button-outline flex-1 text-center" to="/disponibilidade">Ver agenda</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Agenda de hoje + Próximas -->
    <div class="grid gap-8 xl:grid-cols-12 stagger">
      <div class="xl:col-span-8">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <h3 class="text-2xl font-bold text-slate-900 dark:text-[#fafafa]">Agenda de hoje</h3>
          <div class="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600 dark:border-dark-border dark:bg-dark-card dark:text-[#a1a1aa]">
            <span class="material-symbols-outlined text-base">calendar_today</span>
            {{ todayFormatted }}
          </div>
        </div>

        <div v-if="loadingMeetings" class="mt-6 flex items-center gap-3 text-sm text-slate-500">
          <span class="material-symbols-outlined animate-spin">progress_activity</span>
          Carregando agenda...
        </div>

        <div v-else-if="todayMeetings.length === 0" class="mt-6 rounded-3xl border border-slate-100 bg-slate-50/50 p-8 text-center dark:border-dark-border dark:bg-dark-card/60">
          <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-[#52525b]">event_available</span>
          <p class="mt-3 text-sm font-semibold text-slate-500 dark:text-[#a1a1aa]">Nenhuma reunião agendada para hoje</p>
          <NuxtLink class="mt-4 inline-block text-sm font-bold text-primary hover:underline" to="/agendar">Agendar agora</NuxtLink>
        </div>

        <div v-else class="mt-6 space-y-4">
          <div
            v-for="meeting in todayMeetings"
            :key="meeting.id"
            class="rounded-3xl border p-6 transition-all"
            :class="meetingCardClass(meeting)"
          >
            <div class="flex items-start gap-6">
              <div class="w-20 text-right">
                <p class="text-sm font-bold" :class="meetingTimeClass(meeting)">{{ formatTime(meeting.start_time) }}</p>
                <p class="text-[10px] font-bold uppercase" :class="meetingTimeSubClass(meeting)">{{ timeLabel(meeting.start_time) }}</p>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between gap-3">
                  <p class="font-bold text-slate-900 dark:text-[#fafafa]" :class="isLive(meeting) ? 'text-xl' : 'text-lg'">{{ meeting.title }}</p>
                  <span class="chip" :class="statusChipClass(meeting)">{{ statusLabel(meeting) }}</span>
                </div>
                <div class="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-[#a1a1aa]">
                  <span v-if="meeting.creator" class="inline-flex items-center gap-1">
                    <span class="material-symbols-outlined text-base">person</span>
                    {{ meeting.creator.full_name }}
                  </span>
                  <span class="text-xs text-slate-400 dark:text-[#71717a]">{{ meeting.duration_minutes }} min</span>
                </div>

                <!-- Participantes do card -->
                <div v-if="confirmedParticipants(meeting).length" class="mt-3">
                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="p in confirmedParticipants(meeting).slice(0, 6)"
                      :key="p.id"
                      class="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 dark:border-dark-border dark:bg-dark-card"
                      :title="pName(p)"
                    >
                      <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold" :class="avatarColor(pName(p))">
                        {{ pInitials(p) }}
                      </div>
                      <span class="text-xs font-medium text-slate-600 dark:text-[#a1a1aa]">{{ pName(p) }}</span>
                    </div>
                    <span
                      v-if="confirmedParticipants(meeting).length > 6"
                      class="flex items-center rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-400 dark:border-dark-border dark:bg-dark-card dark:text-[#71717a]"
                    >
                      +{{ confirmedParticipants(meeting).length - 6 }}
                    </span>
                  </div>
                </div>

                <div class="mt-3 flex flex-wrap gap-2">
                  <template v-if="meeting.outlook_event_id">
                    <span class="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <span class="material-symbols-outlined text-sm">check</span>
                      Outlook sincronizado
                    </span>
                  </template>
                  <template v-else>
                    <a
                      :href="calendarLinks.outlookCalendarUrl({ title: meeting.title, date: meeting.date, startTime: meeting.start_time, endTime: meeting.end_time, description: meeting.description || '' })"
                      target="_blank"
                      rel="noopener"
                      class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-white dark:border-dark-border dark:bg-dark-card dark:text-[#e4e4e7] dark:hover:bg-dark-hover"
                    >
                      <svg class="h-3.5 w-3.5" viewBox="0 0 23 23"><path d="M1 1h10v10H1z" fill="#f35325"/><path d="M12 1h10v10H12z" fill="#81bc06"/><path d="M1 12h10v10H1z" fill="#05a6f0"/><path d="M12 12h10v10H12z" fill="#ffba08"/></svg>
                      Outlook
                    </a>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="xl:col-span-4 space-y-8">
        <div class="card p-6">
          <h4 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Próximas reuniões</h4>
          <div v-if="upcomingMeetings.length === 0" class="mt-4 text-sm text-slate-500 dark:text-[#a1a1aa]">
            Nenhuma reunião futura agendada.
          </div>
          <div v-else class="mt-5 space-y-5">
            <div v-for="m in upcomingMeetings.slice(0, 3)" :key="m.id" class="flex items-start gap-4">
              <div class="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white dark:border-dark-border dark:bg-dark-card">
                <span class="text-[10px] font-bold uppercase text-slate-400">{{ weekdayShort(m.date) }}</span>
                <span class="text-sm font-bold text-slate-900 dark:text-[#fafafa]">{{ dayNumber(m.date) }}</span>
              </div>
              <div>
                <p class="text-sm font-bold text-slate-900 dark:text-[#fafafa]">{{ m.title }}</p>
                <p class="text-xs text-slate-500 dark:text-[#a1a1aa]">{{ formatTime(m.start_time) }} – {{ m.duration_minutes }}min</p>
                <!-- Avatares dos participantes confirmados -->
                <div v-if="confirmedParticipants(m).length" class="mt-2 flex -space-x-1.5">
                  <div
                    v-for="p in confirmedParticipants(m).slice(0, 4)"
                    :key="p.id"
                    class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold dark:border-dark-card"
                    :class="avatarColor(pName(p))"
                    :title="pName(p)"
                  >
                    {{ pInitials(p) }}
                  </div>
                  <div
                    v-if="confirmedParticipants(m).length > 4"
                    class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[8px] font-bold text-slate-500 dark:border-dark-card dark:bg-dark-border dark:text-[#a1a1aa]"
                  >
                    +{{ confirmedParticipants(m).length - 4 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <NuxtLink class="button-outline mt-6 w-full" to="/disponibilidade">
            Abrir calendário
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Meeting, MeetingParticipant } from '~/types/database'

const { profile } = useAuth()
const { config: roomConfig, fetch: fetchConfig } = useRoomConfig()
const meetings = useMeetings()
const calendarLinks = useCalendarLinks()

const todayMeetings = ref<Meeting[]>([])
const upcomingMeetings = ref<Meeting[]>([])
const loadingMeetings = ref(true)
const occupancy = ref(0)
const countdown = ref('')

const now = ref(new Date())
const todayStr = now.value.toLocaleDateString('en-CA')

const todayFormatted = computed(() =>
  new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(now.value)
)

const formatTime = (t: string) => t.slice(0, 5)
const timeLabel = (t: string) => (parseInt(t.split(':')[0], 10) < 12 ? 'AM' : 'PM')

const weekdayShort = (date: string) => {
  const d = new Date(date + 'T12:00:00')
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(d).replace('.', '')
}

const dayNumber = (date: string) => new Date(date + 'T12:00:00').getDate()

const currentTime = computed(() => {
  const h = now.value.getHours()
  const m = now.value.getMinutes()
  const s = now.value.getSeconds()
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const isLive = (m: Meeting) => m.start_time <= currentTime.value && m.end_time > currentTime.value
const isPast = (m: Meeting) => m.end_time <= currentTime.value

const liveMeeting = computed(() => todayMeetings.value.find(m => isLive(m)) ?? null)

const nextMeeting = computed(() => {
  if (liveMeeting.value) return null
  return todayMeetings.value.find(m => m.start_time > currentTime.value) ?? null
})

const confirmedParticipants = (m: Meeting) =>
  (m.meeting_participants ?? []).filter(p => p.status === 'confirmed')

const liveParticipants = computed(() =>
  liveMeeting.value ? confirmedParticipants(liveMeeting.value) : []
)

const nextParticipants = computed(() =>
  nextMeeting.value ? confirmedParticipants(nextMeeting.value) : []
)

// Helpers de participantes
const pName = (p: MeetingParticipant) => p.profile?.full_name || p.guest_name || 'Sem nome'

const pInitials = (p: MeetingParticipant) => {
  const name = pName(p)
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

// Cores de avatar baseadas no nome (determinístico)
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

// Countdown timer
const updateCountdown = () => {
  const target = liveMeeting.value || nextMeeting.value
  if (!target) { countdown.value = ''; return }

  const n = new Date()
  const [th, tm, ts] = (liveMeeting.value ? target.end_time : target.start_time).split(':').map(Number)
  const targetDate = new Date(n.getFullYear(), n.getMonth(), n.getDate(), th, tm, ts || 0)
  const diff = Math.max(0, Math.floor((targetDate.getTime() - n.getTime()) / 1000))

  const hours = Math.floor(diff / 3600)
  const mins = Math.floor((diff % 3600) / 60)
  const secs = diff % 60

  if (hours > 0) {
    countdown.value = `${hours}h ${String(mins).padStart(2, '0')}min`
  } else if (mins > 0) {
    countdown.value = `${mins}min ${String(secs).padStart(2, '0')}s`
  } else {
    countdown.value = `${secs}s`
  }
}

const statusLabel = (m: Meeting) => {
  if (isLive(m)) return 'Ao vivo'
  if (isPast(m)) return 'Finalizada'
  return 'Agendada'
}

const meetingCardClass = (m: Meeting) => {
  if (isLive(m)) return 'border-indigo-100 bg-indigo-50/80 dark:border-indigo-500/30 dark:bg-indigo-950/40'
  if (isPast(m)) return 'border-slate-100 bg-slate-50/50 opacity-70 hover:opacity-100 dark:border-dark-border dark:bg-dark-card/60'
  return 'border-slate-100 bg-white dark:border-dark-border dark:bg-dark-card'
}

const meetingTimeClass = (m: Meeting) => {
  if (isLive(m)) return 'text-indigo-600 font-extrabold'
  if (isPast(m)) return 'text-slate-400'
  return 'text-slate-600 dark:text-[#a1a1aa]'
}

const meetingTimeSubClass = (m: Meeting) => {
  if (isLive(m)) return 'text-indigo-300'
  return 'text-slate-300 dark:text-[#52525b]'
}

const statusChipClass = (m: Meeting) => {
  if (isLive(m)) return 'bg-indigo-600 text-white'
  if (isPast(m)) return 'bg-slate-100 text-slate-500 dark:bg-dark-border dark:text-[#a1a1aa]'
  return 'border border-slate-200 text-slate-400 dark:border-dark-border'
}

let countdownInterval: ReturnType<typeof setInterval> | null = null
let timeInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await fetchConfig()

  const { data } = await meetings.fetchToday()
  todayMeetings.value = data

  const stats = await meetings.fetchStats()
  occupancy.value = stats.occupancy

  if (profile.value) {
    const all = await meetings.fetchMyMeetings(profile.value.id)
    upcomingMeetings.value = all.filter(m => m.date > todayStr || (m.date === todayStr && m.start_time > currentTime.value))
  }

  loadingMeetings.value = false

  // Atualiza countdown e horário atual a cada segundo
  updateCountdown()
  countdownInterval = setInterval(updateCountdown, 1000)
  timeInterval = setInterval(() => { now.value = new Date() }, 30000)
})

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
  if (timeInterval) clearInterval(timeInterval)
})
</script>
