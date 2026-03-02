<template>
  <section class="space-y-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Disponibilidade</p>
        <h2 class="mt-2 text-3xl font-extrabold text-slate-900 dark:text-[#fafafa]">{{ selectedDateFormatted }}</h2>
        <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">Escolha um horário para a reserva.</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex rounded-xl border border-slate-200 dark:border-dark-border">
          <button
            class="px-3 py-2 text-xs font-bold transition-all rounded-l-xl"
            :class="viewMode === 'day' ? 'bg-slate-900 text-white dark:bg-[#fafafa] dark:text-[#18181b]' : 'text-slate-500 hover:bg-slate-50 dark:text-[#a1a1aa] dark:hover:bg-dark-hover'"
            @click="viewMode = 'day'"
          >
            Dia
          </button>
          <button
            class="px-3 py-2 text-xs font-bold transition-all rounded-r-xl"
            :class="viewMode === 'week' ? 'bg-slate-900 text-white dark:bg-[#fafafa] dark:text-[#18181b]' : 'text-slate-500 hover:bg-slate-50 dark:text-[#a1a1aa] dark:hover:bg-dark-hover'"
            @click="viewMode = 'week'"
          >
            Semana
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-sm">
      <DatePicker
        :model-value="selectedDate"
        :min-date="todayMinDate"
        :allow-weekends="allowWeekends"
        :meeting-dates="calendarMeetingDates"
        :show-legend="true"
        @update:model-value="selectDate"
        @month-change="onCalendarMonthChange"
      />
    </div>

    <!-- Modo Dia -->
    <template v-if="viewMode === 'day'">
      <div class="grid gap-8 xl:grid-cols-12 stagger">
        <div class="xl:col-span-8 space-y-4">
          <div class="card p-6">
            <div v-if="loadingSlots" class="flex items-center gap-3 text-sm text-slate-500">
              <span class="material-symbols-outlined animate-spin">progress_activity</span>
              Carregando horários...
            </div>
            <div v-else-if="errorMsg" class="flex items-center gap-3 text-sm text-red-500">
              <span class="material-symbols-outlined">error</span>
              {{ errorMsg }}
            </div>
            <div v-else class="space-y-5">
              <div class="rounded-2xl border p-4 text-sm" :class="availabilityClass">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined">{{ availabilityIcon }}</span>
                  <transition name="fade-slide">
                    <p :key="availabilityMessage" class="font-semibold">{{ availabilityMessage }}</p>
                  </transition>
                </div>
                <p class="mt-1 text-xs text-slate-500 dark:text-[#a1a1aa]">
                  O horário precisa estar dentro do expediente e sem sobreposição.
                </p>
              </div>

              <div class="space-y-3">
                <p class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Reuniões do dia</p>
                <div v-if="!dayMeetings.length" class="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-dark-border dark:text-[#a1a1aa]">
                  Nenhuma reunião registrada para esta data.
                </div>
                <div v-else class="space-y-3">
                  <div v-for="meeting in dayMeetings" :key="meeting.id" class="rounded-2xl border border-slate-100 bg-white p-4 dark:border-dark-border dark:bg-dark-card">
                    <div class="flex items-center justify-between gap-4">
                      <div>
                        <p class="text-sm font-bold text-slate-900 dark:text-[#fafafa]">{{ meeting.title }}</p>
                        <p class="text-xs text-slate-500 dark:text-[#a1a1aa]">
                          {{ formatTime(meeting.start_time) }} – {{ formatTime(meeting.end_time) }} • {{ meeting.expected_participants }} participantes
                        </p>
                      </div>
                      <span class="chip bg-slate-100 text-slate-500 dark:bg-dark-border dark:text-[#a1a1aa]">Reservado</span>
                    </div>
          </div>
                </div>
          </div>
            </div>
          </div>
        </div>

        <div class="xl:col-span-4 space-y-6">
          <div class="card p-6">
            <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Resumo da seleção</h3>
            <div v-if="booking.startTime" class="mt-4 space-y-3 text-sm text-slate-600 dark:text-[#a1a1aa]">
              <div class="flex items-center justify-between">
                <span>Horário</span>
                <span class="font-semibold text-slate-900 dark:text-[#fafafa]">{{ formatTime(booking.startTime) }} – {{ formatTime(booking.endTime) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Duração</span>
                <span class="font-semibold text-slate-900 dark:text-[#fafafa]">{{ booking.duration }}min</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Participantes</span>
                <span class="font-semibold text-slate-900 dark:text-[#fafafa]">{{ booking.expectedParticipants }}</span>
              </div>
          </div>
            <div v-else class="mt-4 text-sm text-slate-500 dark:text-[#a1a1aa]">
              Selecione um horário na agenda.
            </div>
            <div class="mt-6 flex flex-col gap-3">
              <NuxtLink class="button-outline w-full text-center" to="/agendar">Voltar</NuxtLink>
              <button class="button-primary w-full" :disabled="!isTimeValid" @click="goToConfirm">Continuar</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modo Semana -->
    <template v-else>
      <div class="card p-6">
        <div v-if="loadingSlots" class="flex items-center gap-3 text-sm text-slate-500">
          <span class="material-symbols-outlined animate-spin">progress_activity</span>
          Carregando horários da semana...
        </div>
        <div v-else class="overflow-x-auto">
          <div class="grid grid-cols-[60px_repeat(7,1fr)] gap-1 min-w-[820px]">
            <!-- Header row -->
            <div></div>
            <div v-for="day in weekDays" :key="day.date" class="py-2 text-center text-xs font-bold uppercase tracking-widest" :class="day.isSelected ? 'text-primary' : 'text-slate-400'">
              {{ day.label }} {{ day.number }}
            </div>

            <!-- Time rows -->
            <template v-for="hour in weekHours" :key="hour">
              <div class="py-2 text-right pr-3 text-xs font-bold text-slate-400">{{ hour }}</div>
              <div
                v-for="day in weekDays"
                :key="`${day.date}-${hour}`"
                class="rounded-lg border py-2 px-1 text-center text-[10px] transition-all min-h-[40px] flex items-center justify-center"
                :class="weekCellClass(day, hour)"
              >
                <template v-if="weekCellMeeting(day, hour)">
                  <span class="font-bold text-primary dark:text-blue-400 truncate">{{ weekCellMeeting(day, hour)!.title }}</span>
                </template>
                <template v-else-if="day.isPast || day.isBlocked">
                  <span class="text-slate-300 dark:text-[#3f3f46]">–</span>
                </template>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="flex justify-end">
        <div class="card p-6 w-full max-w-sm">
          <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Reservar horário</h3>
          <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">Selecione um dia acima e mude para a visualização "Dia" para escolher um horário.</p>
          <div class="mt-4 flex flex-col gap-3">
            <NuxtLink class="button-outline w-full text-center" to="/agendar">Voltar</NuxtLink>
            <button class="button-primary w-full" @click="viewMode = 'day'">Selecionar horário</button>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { Meeting } from '~/types/database'

const { data: booking, step, calcEndTime } = useBookingFlow()
const { config: roomConfig, fetch: fetchConfig } = useRoomConfig()
const meetingsApi = useMeetings()

const loadingSlots = ref(true)
const errorMsg = ref('')
const dayMeetings = ref<Meeting[]>([])
const weekMeetings = ref<Map<string, Meeting[]>>(new Map())
const viewMode = ref<'day' | 'week'>('day')
const calendarMeetingDates = ref<Set<string>>(new Set())
const todayMinDate = new Date().toLocaleDateString('en-CA')

const selectedDate = computed({
  get: () => booking.value.date || new Date().toLocaleDateString('en-CA'),
  set: (v: string) => { booking.value.date = v },
})

const selectedDateFormatted = computed(() => {
  const d = new Date(selectedDate.value + 'T12:00:00')
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' }).format(d)
})

const allowWeekends = computed(() => roomConfig.value?.allow_weekends ?? true)

const weekDays = computed(() => {
  const sel = new Date(selectedDate.value + 'T12:00:00')
  const dow = sel.getDay()
  const mondayOffset = (dow + 6) % 7
  const monday = new Date(sel)
  monday.setDate(sel.getDate() - mondayOffset)

  const days = []
  const todayStr = new Date().toLocaleDateString('en-CA')
  const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toLocaleDateString('en-CA')
    const isWeekend = i >= 5
    days.push({
      date: dateStr,
      label: labels[i],
      number: d.getDate(),
      isWeekend,
      isBlocked: !allowWeekends.value && isWeekend,
      isPast: dateStr < todayStr,
      isSelected: dateStr === selectedDate.value,
    })
  }
  return days
})

const weekHours = computed(() => {
  const openH = parseInt((roomConfig.value?.open_time ?? '08:00').split(':')[0])
  const closeH = parseInt((roomConfig.value?.close_time ?? '19:00').split(':')[0])
  const hours: string[] = []
  for (let h = openH; h < closeH; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`)
  }
  return hours
})

const formatTime = (t: string) => t?.slice(0, 5) ?? ''

const normalizeTime = (t: string) => t?.slice(0, 5) ?? ''

const updateEndTime = () => {
  if (!booking.value.startTime) {
    booking.value.endTime = ''
    return
  }
  booking.value.endTime = calcEndTime(booking.value.startTime, booking.value.duration)
}

const isTimeValid = computed(() => {
  if (!booking.value.startTime) return false
  const dayOfWeek = new Date(selectedDate.value + 'T12:00:00').getDay()
  if (!allowWeekends.value && (dayOfWeek === 0 || dayOfWeek === 6)) return false
  const start = normalizeTime(booking.value.startTime)
  const end = normalizeTime(calcEndTime(start, booking.value.duration))
  const openTime = normalizeTime(roomConfig.value?.open_time ?? '08:00')
  const closeTime = normalizeTime(roomConfig.value?.close_time ?? '19:00')

  if (start < openTime || end > closeTime) return false

  const conflict = dayMeetings.value.some(m => {
    const mStart = normalizeTime(m.start_time)
    const mEnd = normalizeTime(m.end_time)
    return start < mEnd && end > mStart
  })

  return !conflict
})

const availabilityMessage = computed(() => {
  if (!booking.value.startTime) return 'Escolha um horário para verificar disponibilidade.'
  const dayOfWeek = new Date(selectedDate.value + 'T12:00:00').getDay()
  if (!allowWeekends.value && (dayOfWeek === 0 || dayOfWeek === 6)) return 'Reservas em fins de semana estão desativadas.'
  const start = normalizeTime(booking.value.startTime)
  const end = normalizeTime(calcEndTime(start, booking.value.duration))
  const openTime = normalizeTime(roomConfig.value?.open_time ?? '08:00')
  const closeTime = normalizeTime(roomConfig.value?.close_time ?? '19:00')

  if (start < openTime) return 'Horário anterior ao expediente da sala.'
  if (end > closeTime) return 'O término ultrapassa o horário de funcionamento.'

  const conflict = dayMeetings.value.some(m => {
    const mStart = normalizeTime(m.start_time)
    const mEnd = normalizeTime(m.end_time)
    return start < mEnd && end > mStart
  })

  if (conflict) return 'Existe conflito com outra reunião.'
  return 'Horário disponível para reserva.'
})

const availabilityIcon = computed(() => {
  if (!booking.value.startTime) return 'schedule'
  return isTimeValid.value ? 'check_circle' : 'error'
})

const availabilityClass = computed(() => {
  if (!booking.value.startTime) return 'border-slate-200 bg-slate-50 text-slate-600 dark:border-dark-border dark:bg-dark-card dark:text-[#a1a1aa]'
  return isTimeValid.value
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-300'
    : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-300'
})

const clearSelection = () => {
  booking.value.startTime = ''
  booking.value.endTime = ''
}
const selectDate = async (date: string) => {
  selectedDate.value = date
  clearSelection()
  await loadMeetings()
}

const onCalendarMonthChange = async (payload: { year: number; month: number }) => {
  const data = await meetingsApi.fetchByMonth(payload.year, payload.month)
  calendarMeetingDates.value = new Set(data.map(m => m.date))
}

const loadMeetings = async () => {
  loadingSlots.value = true
  errorMsg.value = ''
  try {
    const { data } = await meetingsApi.fetchByDate(selectedDate.value)
    dayMeetings.value = data

    if (viewMode.value === 'week') {
      await loadWeekMeetings()
    }
  } catch (e: any) {
    errorMsg.value = 'Erro ao carregar horários. Tente novamente.'
  } finally {
    loadingSlots.value = false
  }
}

const loadWeekMeetings = async () => {
  const map = new Map<string, Meeting[]>()
  for (const day of weekDays.value) {
    if (day.isBlocked) {
      map.set(day.date, [])
      continue
    }
    const { data } = await meetingsApi.fetchByDate(day.date)
    map.set(day.date, data)
  }
  weekMeetings.value = map
}

const weekCellMeeting = (day: any, hour: string) => {
  const meetings = weekMeetings.value.get(day.date) ?? []
  return meetings.find(m => {
    const mStart = m.start_time.slice(0, 5)
    const mEnd = m.end_time.slice(0, 5)
    return hour >= mStart && hour < mEnd
  }) ?? null
}

const weekCellClass = (day: any, hour: string) => {
  if (day.isPast || day.isBlocked) return 'border-slate-100 bg-slate-50/50 dark:border-dark-border/50 dark:bg-dark-bg/50'
  if (weekCellMeeting(day, hour)) return 'border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10'
  return 'border-slate-100 bg-white dark:border-dark-border dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-dark-hover'
}

const goToConfirm = () => {
  if (!isTimeValid.value) return
  step.value = 3
  navigateTo('/confirmar')
}

watch([() => booking.value.startTime, () => booking.value.duration], () => {
  updateEndTime()
})

watch(viewMode, async (mode) => {
  if (mode === 'week') {
    loadingSlots.value = true
    try {
      await loadWeekMeetings()
    } finally {
      loadingSlots.value = false
    }
  }
})

onMounted(async () => {
  await fetchConfig()
  step.value = 2
  if (!booking.value.date) booking.value.date = new Date().toLocaleDateString('en-CA')
  updateEndTime()
  await loadMeetings()

  const now = new Date()
  const initYear = booking.value.date ? new Date(booking.value.date + 'T12:00:00').getFullYear() : now.getFullYear()
  const initMonth = booking.value.date ? new Date(booking.value.date + 'T12:00:00').getMonth() + 1 : now.getMonth() + 1
  await onCalendarMonthChange({ year: initYear, month: initMonth })
})
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>



