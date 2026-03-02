<template>
  <section class="space-y-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Nova reunião</p>
        <h2 class="mt-2 text-3xl font-extrabold text-slate-900 dark:text-[#fafafa]">Defina os detalhes</h2>
      </div>
      <div class="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 dark:border-dark-border dark:bg-dark-card dark:text-[#a1a1aa]">
        Etapa 1 de 3
      </div>
    </div>

    <div class="grid gap-8 xl:grid-cols-12 stagger">
      <div class="xl:col-span-8 space-y-6">
        <div class="card p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Dados principais</h3>
          <div class="mt-6 grid gap-5 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Título</label>
              <input v-model="booking.title" class="input-soft mt-2" placeholder="Ex: Revisão de roadmap" />
            </div>
            <div class="sm:col-span-2">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Data</label>
              <div class="mt-2">
                <DatePicker
                  v-model="booking.date"
                  :min-date="todayStr"
                  :allow-weekends="allowWeekends"
                />
              </div>
              <transition name="fade-slide">
                <div v-if="booking.date" class="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <span class="material-symbols-outlined text-sm">event</span>
                  {{ formatSelectedDate(booking.date) }}
                </div>
              </transition>
            </div>
            <div class="sm:col-span-2">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Horário inicial</label>
              <div class="mt-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-slate-200 dark:border-dark-border dark:bg-dark-card dark:hover:border-slate-700">
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="chip transition-all hover:-translate-y-0.5"
                    :class="timeMode === 'select' ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-white text-slate-500 border border-slate-200 dark:bg-dark-bg dark:border-dark-border dark:text-[#a1a1aa]'"
                    @click="timeMode = 'select'"
                  >
                    Selecionar
                  </button>
                  <button
                    type="button"
                    class="chip transition-all hover:-translate-y-0.5"
                    :class="timeMode === 'input' ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-white text-slate-500 border border-slate-200 dark:bg-dark-bg dark:border-dark-border dark:text-[#a1a1aa]'"
                    @click="timeMode = 'input'"
                  >
                    Digitar
                  </button>
                </div>

                <div v-if="timeMode === 'select'" class="mt-4 grid gap-3 sm:grid-cols-2">
                  <select
                    v-model="startHour"
                    class="input-soft transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    :class="startHour ? 'border-primary/30 ring-2 ring-primary/10' : ''"
                  >
                    <option value="" disabled>Hora</option>
                    <option v-for="h in hoursOptions" :key="h" :value="h">{{ h }}</option>
                  </select>
                  <select
                    v-model="startMinute"
                    class="input-soft transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    :class="startMinute ? 'border-primary/30 ring-2 ring-primary/10' : ''"
                  >
                    <option value="" disabled>Minuto</option>
                    <option v-for="m in minutesOptions" :key="m" :value="m">{{ m }}</option>
                  </select>
                </div>
                <div v-else class="mt-4">
                  <input v-model="booking.startTime" class="input-soft transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20" type="time" />
                </div>
                <transition name="fade-slide">
                  <div v-if="booking.startTime" class="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <span class="material-symbols-outlined text-sm">schedule</span>
                    Selecionado: {{ booking.startTime }}
                  </div>
                </transition>
              </div>
            </div>
            <div>
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Duração</label>
              <select v-model.number="booking.duration" class="input-soft mt-2">
                <option :value="15">15 min</option>
                <option :value="30">30 min</option>
                <option :value="45">45 min</option>
                <option :value="60">60 min</option>
                <option :value="90">90 min</option>
                <option :value="120">120 min</option>
                <option :value="150">150 min</option>
                <option :value="180">180 min</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Participantes</label>
              <select v-model.number="booking.expectedParticipants" class="input-soft mt-2">
                <option v-for="n in participantOptions" :key="n" :value="n">{{ n }}</option>
              </select>
            </div>
            <div class="sm:col-span-2">
              <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Participantes convidados</label>
              <div class="mt-2 flex items-center gap-2">
                <input
                  v-model="emailInput"
                  class="input-soft flex-1"
                  type="email"
                  placeholder="email@empresa.com"
                  @keydown.enter.prevent="addEmail"
                />
                <button
                  type="button"
                  class="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                  title="Adicionar participante"
                  @click="addEmail"
                >
                  <span class="material-symbols-outlined text-xl">mail</span>
                </button>
              </div>
              <p v-if="emailError" class="mt-2 text-xs font-semibold text-red-500">{{ emailError }}</p>
              <p class="mt-2 text-xs text-slate-400 dark:text-[#71717a]">
                Para visitantes sem conta, será enviado um link de confirmação de presença.
              </p>
              <div v-if="emailsList.length" class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="(em, i) in emailsList"
                  :key="i"
                  class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-dark-border dark:bg-dark-card dark:text-[#a1a1aa]"
                >
                  <span class="material-symbols-outlined text-sm text-slate-400 dark:text-[#71717a]">person</span>
                  {{ em }}
                  <button
                    type="button"
                    class="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    @click="removeEmail(i)"
                  >
                    <span class="material-symbols-outlined text-sm">close</span>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Notificações</h3>
          <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">
            Defina os avisos antes do horário da reunião.
          </p>
          <div class="mt-4 flex flex-wrap gap-3">
            <label v-for="opt in notificationOptions" :key="opt.value" class="chip cursor-pointer transition-all" :class="booking.notifications.includes(opt.value) ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-slate-100 text-slate-600 dark:bg-dark-card dark:text-[#a1a1aa]'">
              <input type="checkbox" class="sr-only" :value="opt.value" @change="toggleNotification(opt.value)" :checked="booking.notifications.includes(opt.value)" />
              {{ opt.label }}
            </label>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Recorrência</h3>
            <button
              type="button"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="booking.recurrence.enabled ? 'bg-primary' : 'bg-slate-200 dark:bg-dark-border'"
              @click="booking.recurrence.enabled = !booking.recurrence.enabled"
            >
              <span
                class="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                :class="booking.recurrence.enabled ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>
          <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">
            Repita esta reunião automaticamente em várias datas.
          </p>

          <transition name="fade-slide">
            <div v-if="booking.recurrence.enabled" class="mt-5 space-y-5">
              <div>
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Frequência</label>
                <select v-model="booking.recurrence.frequency" class="input-soft mt-2">
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quinzenal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>

              <div v-if="booking.recurrence.frequency === 'weekly' || booking.recurrence.frequency === 'biweekly'">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Dias da semana</label>
                <div class="mt-2 flex flex-wrap gap-2">
                  <button
                    v-for="(label, idx) in dayLabels"
                    :key="idx"
                    type="button"
                    class="chip cursor-pointer transition-all hover:-translate-y-0.5"
                    :class="booking.recurrence.daysOfWeek.includes(idx) ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-slate-100 text-slate-600 dark:bg-dark-card dark:text-[#a1a1aa]'"
                    @click="toggleDayOfWeek(idx)"
                  >
                    {{ label }}
                  </button>
                </div>
              </div>

              <div>
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Encerramento</label>
                <div class="mt-2 flex flex-wrap gap-3">
                  <label class="chip cursor-pointer transition-all" :class="booking.recurrence.endType === 'occurrences' ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-slate-100 text-slate-600 dark:bg-dark-card dark:text-[#a1a1aa]'">
                    <input type="radio" class="sr-only" value="occurrences" v-model="booking.recurrence.endType" />
                    Após ocorrências
                  </label>
                  <label class="chip cursor-pointer transition-all" :class="booking.recurrence.endType === 'date' ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-slate-100 text-slate-600 dark:bg-dark-card dark:text-[#a1a1aa]'">
                    <input type="radio" class="sr-only" value="date" v-model="booking.recurrence.endType" />
                    Até uma data
                  </label>
                </div>
                <div class="mt-3">
                  <input
                    v-if="booking.recurrence.endType === 'occurrences'"
                    v-model.number="booking.recurrence.maxOccurrences"
                    type="number"
                    min="2"
                    max="52"
                    class="input-soft w-32"
                    placeholder="10"
                  />
                  <input
                    v-else
                    v-model="booking.recurrence.endDate"
                    type="date"
                    :min="booking.date || todayStr"
                    class="input-soft w-48"
                  />
                </div>
              </div>

              <div v-if="recurrencePreview" class="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-sm font-semibold text-primary dark:border-primary/30 dark:bg-primary/10">
                <span class="material-symbols-outlined mr-1 text-base align-middle">repeat</span>
                {{ recurrencePreview }}
              </div>
            </div>
          </transition>
        </div>

        <div class="card p-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Continuar</h3>
              <p class="mt-1 text-sm text-slate-500 dark:text-[#a1a1aa]">Siga para escolher a disponibilidade.</p>
            </div>
            <button class="button-primary" @click="goToAvailability">
              Ver disponibilidade
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      <div class="xl:col-span-4 space-y-6">
        <div class="card p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Sala do escritório</h3>
          <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">Única sala disponível para reservas.</p>
          <div class="mt-4 space-y-3 text-sm text-slate-600 dark:text-[#a1a1aa]">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-base text-slate-400">groups</span>
              Capacidade máxima {{ roomConfig?.max_capacity ?? 12 }} pessoas
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-base text-slate-400">group</span>
              Mínimo para reserva {{ roomConfig?.min_participants ?? 3 }} pessoas
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-base text-slate-400">tv</span>
              TV Samsung e videoconferência
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-base text-slate-400">wifi</span>
              Internet de alta velocidade
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Próximo passo</h3>
          <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">
            Verifique os horários disponíveis antes de confirmar.
          </p>
          <p v-if="validationError" class="mt-3 text-xs font-semibold text-red-500">{{ validationError }}</p>
          <button class="button-primary mt-6 w-full" @click="goToAvailability">
            Ver disponibilidade
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { data: booking, step } = useBookingFlow()
const { config: roomConfig, fetch: fetchConfig } = useRoomConfig()
const meetingsApi = useMeetings()

const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const toggleDayOfWeek = (day: number) => {
  const idx = booking.value.recurrence.daysOfWeek.indexOf(day)
  if (idx >= 0) booking.value.recurrence.daysOfWeek.splice(idx, 1)
  else booking.value.recurrence.daysOfWeek.push(day)
}

const recurrencePreview = computed(() => {
  if (!booking.value.recurrence.enabled || !booking.value.date) return ''
  const allowWeekends = roomConfig.value?.allow_weekends ?? true
  const dates = meetingsApi.generateOccurrenceDates({
    startDate: booking.value.date,
    frequency: booking.value.recurrence.frequency,
    daysOfWeek: booking.value.recurrence.daysOfWeek,
    endType: booking.value.recurrence.endType,
    endDate: booking.value.recurrence.endDate,
    maxOccurrences: booking.value.recurrence.maxOccurrences || 10,
    allowWeekends,
  })
  if (!dates.length) return ''
  const fmt = (d: string) => {
    const dt = new Date(d + 'T12:00:00')
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(dt)
  }
  return `${dates.length} reuniões de ${fmt(dates[0])} a ${fmt(dates[dates.length - 1])}`
})

const todayStr = new Date().toLocaleDateString('en-CA')
const validationError = ref('')
const timeMode = ref<'select' | 'input'>('select')
const hoursOptions = computed(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')))
const minutesOptions = computed(() => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')))
const startHour = ref('')
const startMinute = ref('')

const notificationOptions = [
  { label: '2h', value: 120 },
  { label: '1h 30m', value: 90 },
  { label: '1h', value: 60 },
  { label: '45m', value: 45 },
  { label: '30m', value: 30 },
]

const participantOptions = computed(() => {
  const min = roomConfig.value?.min_participants ?? 3
  const max = roomConfig.value?.max_capacity ?? 12
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
})

const allowWeekends = computed(() => roomConfig.value?.allow_weekends ?? true)

const emailInput = ref('')
const emailError = ref('')
const emailsList = ref<string[]>([])
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const addEmail = () => {
  emailError.value = ''
  const email = emailInput.value.trim()
  if (!email) return
  if (!emailRegex.test(email)) {
    emailError.value = 'E-mail inválido.'
    return
  }
  if (emailsList.value.includes(email)) {
    emailError.value = 'Este e-mail já foi adicionado.'
    return
  }
  emailsList.value.push(email)
  emailInput.value = ''
}

const removeEmail = (index: number) => {
  emailsList.value.splice(index, 1)
}

watch(emailsList, (list) => {
  booking.value.invitedEmails = list.join(', ')
}, { deep: true })

const formatSelectedDate = (date: string) => {
  const d = new Date(date + 'T12:00:00')
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(d)
}

const toggleNotification = (value: number) => {
  const idx = booking.value.notifications.indexOf(value)
  if (idx >= 0) booking.value.notifications.splice(idx, 1)
  else booking.value.notifications.push(value)
}

const syncTimeFromBooking = () => {
  if (!booking.value.startTime) {
    startHour.value = ''
    startMinute.value = ''
    return
  }
  const [h, m] = booking.value.startTime.split(':')
  startHour.value = h
  startMinute.value = m
}

const updateStartTime = () => {
  if (!startHour.value || !startMinute.value) {
    booking.value.startTime = ''
    return
  }
  const next = `${startHour.value}:${startMinute.value}`
  if (booking.value.startTime !== next) booking.value.startTime = next
}

const goToAvailability = () => {
  validationError.value = ''

  if (!booking.value.title.trim()) {
    validationError.value = 'Informe o título da reunião.'
    return
  }
  if (!booking.value.date) {
    validationError.value = 'Selecione uma data.'
    return
  }
  if (!allowWeekends.value) {
    const dayOfWeek = new Date(booking.value.date + 'T12:00:00').getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      validationError.value = 'A sala não está disponível nos fins de semana.'
      return
    }
  }

  step.value = 2
  navigateTo('/disponibilidade')
}

onMounted(() => {
  fetchConfig()
  step.value = 1
  syncTimeFromBooking()
  if (booking.value.invitedEmails) {
    emailsList.value = booking.value.invitedEmails.split(',').map(e => e.trim()).filter(Boolean)
  }
})

watch([startHour, startMinute], () => {
  updateStartTime()
})

watch(() => booking.value.startTime, () => {
  syncTimeFromBooking()
})

// Auto-fill day of week when date changes and recurrence is enabled
watch(() => booking.value.date, (newDate) => {
  if (newDate && booking.value.recurrence.enabled && booking.value.recurrence.daysOfWeek.length === 0) {
    const dow = new Date(newDate + 'T12:00:00').getDay()
    booking.value.recurrence.daysOfWeek = [dow]
  }
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

