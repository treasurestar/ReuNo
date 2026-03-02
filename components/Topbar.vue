<template>
  <header class="relative flex flex-col gap-6 border-b border-[#E2E8F0] bg-[#FEFEFF] px-6 py-6 dark:border-dark-border dark:bg-dark-sidebar sm:flex-row sm:items-center sm:justify-between sm:px-10">
    <div>
      <div class="text-xs font-bold uppercase tracking-[0.2em] text-[#94A3B8] dark:text-[#71717a]">
        Escritório Central
      </div>
      <h1 class="mt-2 text-2xl font-extrabold text-[#1E293B] dark:text-[#fafafa]">
        Sala de Reuniões
      </h1>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <!-- Calendar trigger -->
      <button
        ref="calendarTriggerRef"
        class="hidden items-center gap-3 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 text-xs font-bold text-[#475569] transition-all hover:bg-[#F1F5F9] dark:border-dark-border dark:bg-dark-card dark:text-[#a1a1aa] dark:hover:bg-dark-hover lg:flex"
        @click="toggleCalendar"
      >
        <span class="material-symbols-outlined text-base">calendar_today</span>
        {{ todayFormatted }}
        <span class="material-symbols-outlined text-sm">{{ calendarOpen ? 'expand_less' : 'expand_more' }}</span>
      </button>

      <ThemeToggle />
      <button class="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#94A3B8] transition-all hover:bg-[#F8FAFC] dark:border-dark-border dark:text-[#a1a1aa] dark:hover:bg-dark-hover">
        <span class="material-symbols-outlined">notifications</span>
      </button>
      <NuxtLink class="button-primary" to="/agendar">
        <span class="material-symbols-outlined">add</span>
        Nova reunião
      </NuxtLink>
    </div>

    <!-- Calendar popup -->
    <Transition name="fade">
      <div
        v-if="calendarOpen"
        ref="calendarRef"
        class="absolute right-6 top-full z-50 mt-2 w-80 rounded-2xl border border-[#E2E8F0] bg-[#FEFEFF] shadow-panel dark:border-dark-border dark:bg-dark-card dark:shadow-dark-sm sm:right-10"
      >
        <DatePicker
          :model-value="selectedCalendarDate"
          :meeting-dates="meetingDates"
          :min-date="todayStr"
          :show-legend="true"
          :borderless="true"
          class="p-5"
          @update:model-value="navigateToDate"
          @month-change="onMonthChange"
        />
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const meetingsApi = useMeetings()
const { data: booking } = useBookingFlow()

const calendarOpen = ref(false)
const calendarRef = ref<HTMLElement | null>(null)
const calendarTriggerRef = ref<HTMLElement | null>(null)
const meetingDates = ref<Set<string>>(new Set())

const todayStr = new Date().toLocaleDateString('en-CA')
const selectedCalendarDate = ref(todayStr)

const todayFormatted = computed(() =>
  new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
)

const toggleCalendar = () => {
  calendarOpen.value = !calendarOpen.value
  if (calendarOpen.value) loadMonthData(new Date().getFullYear(), new Date().getMonth() + 1)
}

const loadMonthData = async (year: number, month: number) => {
  const data = await meetingsApi.fetchByMonth(year, month)
  meetingDates.value = new Set(data.map(m => m.date))
}

const onMonthChange = (payload: { year: number; month: number }) => {
  loadMonthData(payload.year, payload.month)
}

const navigateToDate = (date: string) => {
  if (!date || date < todayStr) return
  booking.value.date = date
  calendarOpen.value = false
  navigateTo('/disponibilidade')
}

const onClickOutside = (e: MouseEvent) => {
  if (
    calendarRef.value &&
    !calendarRef.value.contains(e.target as Node) &&
    calendarTriggerRef.value &&
    !calendarTriggerRef.value.contains(e.target as Node)
  ) {
    calendarOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
