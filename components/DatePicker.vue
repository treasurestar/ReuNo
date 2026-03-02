<template>
  <div
    class="datepicker"
    :class="borderless ? '' : 'rounded-2xl border border-[#E2E8F0] bg-[#FEFEFF] p-5 dark:border-dark-border dark:bg-dark-card'"
  >
    <!-- Month navigation -->
    <div class="flex items-center justify-between">
      <button
        type="button"
        class="flex h-8 w-8 items-center justify-center rounded-xl text-[#94A3B8] transition-all hover:bg-[#F1F5F9] dark:text-[#71717a] dark:hover:bg-dark-hover"
        @click="changeMonth(-1)"
      >
        <span class="material-symbols-outlined text-lg">chevron_left</span>
      </button>
      <p class="text-sm font-bold capitalize text-[#1E293B] dark:text-[#fafafa]">
        {{ monthLabel }}
      </p>
      <button
        type="button"
        class="flex h-8 w-8 items-center justify-center rounded-xl text-[#94A3B8] transition-all hover:bg-[#F1F5F9] dark:text-[#71717a] dark:hover:bg-dark-hover"
        @click="changeMonth(1)"
      >
        <span class="material-symbols-outlined text-lg">chevron_right</span>
      </button>
    </div>

    <!-- Day labels (Mon–Sun) -->
    <div class="mt-4 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] dark:text-[#71717a]">
      <span v-for="d in dayLabels" :key="d">{{ d }}</span>
    </div>

    <!-- Calendar grid -->
    <div class="mt-2 grid grid-cols-7">
      <div v-for="(day, i) in calendarDays" :key="i" class="flex items-center justify-center py-[2px]">
        <button
          v-if="day.date"
          type="button"
          class="relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all"
          :class="dayClass(day)"
          :disabled="day.disabled"
          @click="selectDay(day.date)"
        >
          {{ day.number }}
          <span
            v-if="day.hasMeeting && !day.isSelected"
            class="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-500"
          />
        </button>
        <div v-else class="h-9 w-9" />
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-3 dark:border-dark-border">
      <button
        type="button"
        class="text-xs font-bold text-primary transition-all hover:text-primary/80"
        @click="goToToday"
      >
        Hoje
      </button>
      <div v-if="showLegend" class="flex items-center gap-3">
        <div class="flex items-center gap-1.5 text-[10px] text-[#94A3B8] dark:text-[#71717a]">
          <span class="h-2 w-2 rounded-full bg-primary" />
          Hoje
        </div>
        <div class="flex items-center gap-1.5 text-[10px] text-[#94A3B8] dark:text-[#71717a]">
          <span class="h-2 w-2 rounded-full bg-primary/30" />
          Selecionado
        </div>
        <div v-if="meetingDates?.size" class="flex items-center gap-1.5 text-[10px] text-[#94A3B8] dark:text-[#71717a]">
          <span class="h-2 w-2 rounded-full bg-emerald-500" />
          Com reunião
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  minDate?: string
  allowWeekends?: boolean
  meetingDates?: Set<string>
  showLegend?: boolean
  borderless?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  minDate: '',
  allowWeekends: true,
  showLegend: false,
  borderless: false,
})

const emit = defineEmits<{
  'update:modelValue': [date: string]
  'monthChange': [payload: { year: number; month: number }]
}>()

const dayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const todayStr = new Date().toLocaleDateString('en-CA')

const displayMonth = ref(0)
const displayYear = ref(0)

const initDisplay = () => {
  const base = props.modelValue ? new Date(props.modelValue + 'T12:00:00') : new Date()
  displayMonth.value = base.getMonth()
  displayYear.value = base.getFullYear()
}

onMounted(initDisplay)

watch(() => props.modelValue, (val) => {
  if (val) {
    const d = new Date(val + 'T12:00:00')
    if (d.getMonth() !== displayMonth.value || d.getFullYear() !== displayYear.value) {
      displayMonth.value = d.getMonth()
      displayYear.value = d.getFullYear()
    }
  }
})

const monthLabel = computed(() => {
  const d = new Date(displayYear.value, displayMonth.value, 1)
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(d)
})

interface CalendarDay {
  date: string | null
  number: number | null
  isToday: boolean
  isSelected: boolean
  hasMeeting: boolean
  disabled: boolean
}

const calendarDays = computed<CalendarDay[]>(() => {
  const firstDay = new Date(displayYear.value, displayMonth.value, 1)
  const lastDay = new Date(displayYear.value, displayMonth.value + 1, 0)
  // Monday-start offset: getDay() 0=Sun → offset 6, 1=Mon → 0, etc.
  const startOffset = (firstDay.getDay() + 6) % 7

  const days: CalendarDay[] = []

  for (let i = 0; i < startOffset; i++) {
    days.push({ date: null, number: null, isToday: false, isSelected: false, hasMeeting: false, disabled: true })
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateObj = new Date(displayYear.value, displayMonth.value, d)
    const dateStr = dateObj.toLocaleDateString('en-CA')
    const dow = dateObj.getDay()
    const isWeekend = dow === 0 || dow === 6
    const isPast = props.minDate ? dateStr < props.minDate : false
    const isBlockedWeekend = !props.allowWeekends && isWeekend

    days.push({
      date: dateStr,
      number: d,
      isToday: dateStr === todayStr,
      isSelected: dateStr === props.modelValue,
      hasMeeting: props.meetingDates?.has(dateStr) ?? false,
      disabled: isPast || isBlockedWeekend,
    })
  }

  return days
})

const dayClass = (day: CalendarDay) => {
  if (day.isSelected) {
    return 'bg-primary text-white shadow-sm hover:bg-primary/90'
  }
  if (day.isToday) {
    return 'bg-primary/10 text-primary font-bold ring-1 ring-primary/20 hover:bg-primary/20 dark:bg-primary/20 dark:ring-primary/30 dark:hover:bg-primary/30'
  }
  if (day.disabled) {
    return 'text-[#CBD5E1] dark:text-[#3f3f46] cursor-not-allowed'
  }
  return 'text-[#475569] hover:bg-[#F1F5F9] dark:text-[#a1a1aa] dark:hover:bg-dark-hover'
}

const changeMonth = (delta: number) => {
  const d = new Date(displayYear.value, displayMonth.value + delta, 1)
  displayMonth.value = d.getMonth()
  displayYear.value = d.getFullYear()
  emit('monthChange', { year: displayYear.value, month: displayMonth.value + 1 })
}

const selectDay = (date: string | null) => {
  if (!date) return
  emit('update:modelValue', date)
}

const goToToday = () => {
  displayMonth.value = new Date().getMonth()
  displayYear.value = new Date().getFullYear()
  emit('update:modelValue', todayStr)
}
</script>
