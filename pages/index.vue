<template>
  <section class="space-y-10">
    <div class="grid gap-8 xl:grid-cols-12">
      <div class="xl:col-span-7">
        <div class="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em]" :class="roomAvailable ? 'text-emerald-600' : 'text-amber-600'">
          <span class="h-2.5 w-2.5 rounded-full" :class="roomAvailable ? 'bg-emerald-500' : 'bg-amber-500'"></span>
          {{ roomAvailable ? 'Disponível agora' : 'Ocupada agora' }}
          <template v-if="nextMeeting">
            <span class="text-[#CBD5E1] dark:text-[#71717a]">•</span>
            <span class="text-slate-500">Próxima reunião em {{ nextMeetingLabel }}</span>
          </template>
        </div>
        <h2 class="mt-6 text-4xl font-extrabold leading-tight text-slate-900 dark:text-[#fafafa] sm:text-5xl">
          Espaço pronto para
          <span class="text-slate-400">boas decisões.</span>
        </h2>
        <p class="mt-4 max-w-2xl text-base text-slate-500 dark:text-[#a1a1aa]">
          Agende reuniões em minutos, sincronize com Google Calendar e Outlook, e mantenha o time
          informado com notificações automáticas.
        </p>
        <div class="mt-8 flex flex-wrap items-center gap-4">
          <NuxtLink class="button-primary" to="/agendar">
            <span class="material-symbols-outlined">bolt</span>
            Reservar rápido
          </NuxtLink>
          <NuxtLink class="button-outline" to="/disponibilidade">Ver agenda completa</NuxtLink>
        </div>
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
              <p class="text-slate-500 dark:text-[#a1a1aa]">Sala única</p>
              <p class="mt-2 text-lg font-extrabold text-slate-900 dark:text-[#fafafa]">{{ roomConfig?.max_capacity ?? 12 }} pessoas</p>
            </div>
            <div>
              <p class="text-slate-500 dark:text-[#a1a1aa]">Mínimo</p>
              <p class="mt-2 text-lg font-extrabold text-slate-900 dark:text-[#fafafa]">{{ roomConfig?.min_participants ?? 3 }} pessoas</p>
            </div>
          </div>
        </div>
      </div>
    </div>

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
                  <span class="inline-flex items-center gap-1">
                    <span class="material-symbols-outlined text-base">groups</span>
                    {{ meeting.expected_participants }} participantes
                  </span>
                  <span class="text-xs text-slate-400 dark:text-[#71717a]">{{ meeting.duration_minutes }} min</span>
                </div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <template v-if="meeting.google_event_id">
                    <span class="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <span class="material-symbols-outlined text-sm">check</span>
                      Sincronizado
                    </span>
                  </template>
                  <template v-else>
                    <a
                      :href="calendarLinks.googleCalendarUrl({ title: meeting.title, date: meeting.date, startTime: meeting.start_time, endTime: meeting.end_time, description: meeting.description || '' })"
                      target="_blank"
                      rel="noopener"
                      class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-white dark:border-dark-border dark:bg-dark-card dark:text-[#e4e4e7] dark:hover:bg-dark-hover"
                    >
                      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Google Calendar
                    </a>
                  </template>
                  <a
                    :href="calendarLinks.outlookCalendarUrl({ title: meeting.title, date: meeting.date, startTime: meeting.start_time, endTime: meeting.end_time, description: meeting.description || '' })"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all hover:bg-white dark:border-dark-border dark:bg-dark-card dark:text-[#e4e4e7] dark:hover:bg-dark-hover"
                  >
                    <svg class="h-3.5 w-3.5" viewBox="0 0 23 23"><path d="M1 1h10v10H1z" fill="#f35325"/><path d="M12 1h10v10H12z" fill="#81bc06"/><path d="M1 12h10v10H1z" fill="#05a6f0"/><path d="M12 12h10v10H12z" fill="#ffba08"/></svg>
                    Outlook
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="xl:col-span-4 space-y-8">
        <div>
          <h4 class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Amenidades</h4>
          <div class="mt-4 grid grid-cols-2 gap-4">
            <div class="amenity-card card p-4">
              <span class="amenity-icon material-symbols-outlined text-slate-400">tv</span>
              <p class="mt-3 text-xs font-bold text-slate-700 dark:text-[#a1a1aa]">TV Samsung</p>
            </div>
            <div class="amenity-card card p-4">
              <span class="amenity-icon material-symbols-outlined text-slate-400">groups</span>
              <p class="mt-3 text-xs font-bold text-slate-700 dark:text-[#a1a1aa]">{{ roomConfig?.max_capacity ?? 12 }} lugares</p>
            </div>
            <div class="amenity-card card p-4">
              <span class="amenity-icon material-symbols-outlined text-slate-400">videocam</span>
              <p class="mt-3 text-xs font-bold text-slate-700 dark:text-[#a1a1aa]">Videoconferência</p>
            </div>
            <div class="amenity-card card p-4">
              <span class="amenity-icon material-symbols-outlined text-slate-400">wifi</span>
              <p class="mt-3 text-xs font-bold text-slate-700 dark:text-[#a1a1aa]">Internet rápida</p>
            </div>
          </div>
        </div>
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
                <div class="mt-1.5 flex gap-1.5">
                  <template v-if="m.google_event_id">
                    <span class="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:border-emerald-800 dark:text-emerald-400">
                      <span class="material-symbols-outlined text-xs">check</span>
                    </span>
                  </template>
                  <template v-else>
                    <a
                      :href="calendarLinks.googleCalendarUrl({ title: m.title, date: m.date, startTime: m.start_time, endTime: m.end_time, description: m.description || '' })"
                      target="_blank"
                      rel="noopener"
                      class="rounded-lg border border-slate-200 px-2 py-1 transition-all hover:bg-slate-50 dark:border-dark-border dark:hover:bg-dark-hover"
                      title="Google Calendar"
                    >
                      <svg class="h-3 w-3" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    </a>
                  </template>
                  <a
                    :href="calendarLinks.outlookCalendarUrl({ title: m.title, date: m.date, startTime: m.start_time, endTime: m.end_time, description: m.description || '' })"
                    target="_blank"
                    rel="noopener"
                    class="rounded-lg border border-slate-200 px-2 py-1 transition-all hover:bg-slate-50 dark:border-dark-border dark:hover:bg-dark-hover"
                    title="Outlook"
                  >
                    <svg class="h-3 w-3" viewBox="0 0 23 23"><path d="M1 1h10v10H1z" fill="#f35325"/><path d="M12 1h10v10H12z" fill="#81bc06"/><path d="M1 12h10v10H1z" fill="#05a6f0"/><path d="M12 12h10v10H12z" fill="#ffba08"/></svg>
                  </a>
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
import type { Meeting } from '~/types/database'

const { profile } = useAuth()
const { config: roomConfig, fetch: fetchConfig } = useRoomConfig()
const meetings = useMeetings()
const calendarLinks = useCalendarLinks()

const todayMeetings = ref<Meeting[]>([])
const upcomingMeetings = ref<Meeting[]>([])
const loadingMeetings = ref(true)
const occupancy = ref(0)

const now = new Date()
const todayStr = now.toLocaleDateString('en-CA')

const todayFormatted = computed(() =>
  new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(now)
)

const formatTime = (t: string) => t.slice(0, 5)
const timeLabel = (t: string) => (parseInt(t.split(':')[0], 10) < 12 ? 'AM' : 'PM')

const weekdayShort = (date: string) => {
  const d = new Date(date + 'T12:00:00')
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(d).replace('.', '')
}

const dayNumber = (date: string) => new Date(date + 'T12:00:00').getDate()

const currentTime = computed(() => {
  const h = now.getHours()
  const m = now.getMinutes()
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
})

const isLive = (m: Meeting) => m.start_time <= currentTime.value && m.end_time > currentTime.value
const isPast = (m: Meeting) => m.end_time <= currentTime.value

const roomAvailable = computed(() => !todayMeetings.value.some(m => isLive(m)))

const nextMeeting = computed(() =>
  todayMeetings.value.find(m => m.start_time > currentTime.value)
)

const nextMeetingLabel = computed(() => {
  if (!nextMeeting.value) return ''
  const [h, m] = nextMeeting.value.start_time.split(':').map(Number)
  const diffMin = (h * 60 + m) - (now.getHours() * 60 + now.getMinutes())
  if (diffMin < 60) return `${diffMin}min`
  const hrs = Math.floor(diffMin / 60)
  const mins = diffMin % 60
  return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`
})

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
})
</script>

<style scoped>
.amenity-card {
  cursor: default;
  transform-origin: center;
  transition: transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 350ms ease;
}

.amenity-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.10), 0 4px 8px rgba(15, 23, 42, 0.06);
}

:global(html.dark) .amenity-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35), 0 4px 8px rgba(0, 0, 0, 0.2);
}

.amenity-icon {
  transition: transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1), color 250ms ease;
}

.amenity-card:hover .amenity-icon {
  transform: scale(1.2) rotate(-8deg);
  color: #135BEC;
}
</style>
