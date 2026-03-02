<template>
  <aside class="hidden w-72 flex-col border-r border-[#E2E8F0] bg-[#FEFEFF] px-7 py-8 dark:border-dark-border dark:bg-dark-sidebar lg:flex">
    <div class="flex items-center justify-center">
      <div class="flex flex-col items-center">
        <img class="h-12 w-auto drop-shadow-md dark:hidden" src="/logo-claro.png" alt="Reunô" />
        <img class="hidden h-12 w-auto drop-shadow-[0_10px_24px_rgba(15,23,42,0.5)] dark:block" src="/logo-escuro.png" alt="Reunô" />
        <p class="mt-2 text-center text-[11px] font-bold uppercase tracking-[0.3em] text-[#475569] dark:text-[#a1a1aa]">
          Sala única
        </p>
      </div>
    </div>

    <div class="mt-10">
      <p class="px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#94A3B8] dark:text-[#71717a]">Principal</p>
      <nav class="mt-4 space-y-2">
        <NuxtLink :class="navClass('/')" to="/">
          <span class="material-symbols-outlined text-[22px]">grid_view</span>
          Dashboard
        </NuxtLink>
        <NuxtLink :class="navClass('/agendar')" to="/agendar">
          <span class="material-symbols-outlined text-[22px]">add</span>
          Nova reunião
        </NuxtLink>
        <NuxtLink :class="navClass('/disponibilidade')" to="/disponibilidade">
          <span class="material-symbols-outlined text-[22px]">calendar_today</span>
          Disponibilidade
        </NuxtLink>
        <NuxtLink :class="navClass('/minhas-reunioes')" to="/minhas-reunioes">
          <span class="material-symbols-outlined text-[22px]">history</span>
          Minhas reuniões
        </NuxtLink>
        <NuxtLink v-if="isAdmin" :class="navClass('/admin')" to="/admin">
          <span class="material-symbols-outlined text-[22px]">insights</span>
          Admin
        </NuxtLink>
      </nav>
    </div>

    <div class="mt-10 border-t border-[#E2E8F0] pt-6 dark:border-dark-border">
      <p class="px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#94A3B8] dark:text-[#71717a]">Sala</p>
      <div class="mt-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-dark-border dark:bg-dark-bg">
        <p class="text-xs font-bold uppercase tracking-widest text-[#94A3B8] dark:text-[#71717a]">{{ roomConfig?.name ?? 'Sala de Reuniões' }}</p>
        <p class="mt-2 text-2xl font-extrabold" :class="roomAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'">
          {{ roomAvailable ? 'Disponível' : 'Ocupada' }}
        </p>
        <p v-if="nextMeetingLabel" class="mt-1 text-sm text-[#94A3B8] dark:text-[#a1a1aa]">Próxima reunião em {{ nextMeetingLabel }}</p>
        <div class="mt-4 flex items-center gap-2 text-xs text-[#94A3B8] dark:text-[#a1a1aa]">
          <span class="material-symbols-outlined text-base text-[#94A3B8]">groups</span>
          {{ roomConfig?.max_capacity ?? 12 }} pessoas máx.
        </div>
      </div>
    </div>

    <!-- Integrações -->
    <div class="mt-10 border-t border-[#E2E8F0] pt-6 dark:border-dark-border">
      <p class="px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#94A3B8] dark:text-[#71717a]">Integrações</p>
      <div class="mt-4 px-3">
        <template v-if="gcalConnected">
          <div class="flex items-center gap-2">
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">Conectado</span>
          </div>
          <button
            class="mt-2 text-[11px] font-semibold text-red-500 hover:underline dark:text-red-400"
            :disabled="gcalLoading"
            @click="handleDisconnectGcal"
          >
            {{ gcalLoading ? 'Desconectando...' : 'Desconectar' }}
          </button>
        </template>
        <template v-else>
          <button
            class="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2 text-xs font-bold text-[#475569] transition-all hover:bg-[#F1F5F9] dark:border-dark-border dark:text-[#a1a1aa] dark:hover:bg-dark-hover"
            :disabled="gcalLoading"
            @click="handleConnectGcal"
          >
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {{ gcalLoading ? 'Conectando...' : 'Google Calendar' }}
          </button>
        </template>
      </div>
    </div>

    <div class="mt-auto flex items-center gap-3 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 dark:border-dark-border dark:bg-dark-card">
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#CBD5E1] text-xs font-bold text-[#475569] dark:bg-dark-active dark:text-[#a1a1aa]">
        {{ initials }}
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-[#1E293B] dark:text-[#fafafa]">{{ profile?.full_name || 'Usuário' }}</p>
        <p class="truncate text-[11px] text-[#94A3B8] dark:text-[#a1a1aa]">{{ profile?.email }}</p>
      </div>
      <button
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] transition-all hover:bg-[#E2E8F0] hover:text-red-500 dark:text-[#71717a] dark:hover:bg-dark-hover dark:hover:text-red-400"
        aria-label="Sair"
        title="Sair"
        @click="signOut"
      >
        <span class="material-symbols-outlined text-[20px]">exit_to_app</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { Meeting } from '~/types/database'

const route = useRoute()
const { profile, signOut, isAdmin } = useAuth()
const { config: roomConfig, fetch: fetchConfig } = useRoomConfig()
const meetingsApi = useMeetings()
const { connected: gcalConnected, loading: gcalLoading, connect: gcalConnect, disconnect: gcalDisconnect, checkConnection: gcalCheckConnection } = useGoogleCalendar()

const handleConnectGcal = () => gcalConnect()
const handleDisconnectGcal = async () => {
  if (window.confirm('Desconectar Google Calendar? Novas reuniões não serão mais sincronizadas.')) {
    await gcalDisconnect()
  }
}

const todayMeetings = ref<Meeting[]>([])
const roomAvailable = ref(true)
const nextMeetingLabel = ref('')

const initials = computed(() => {
  const name = profile.value?.full_name ?? ''
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
})

const navClass = (path: string) => {
  const isActive = route.path === path
  return [
    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
    isActive
      ? 'bg-[#1E293B] text-white shadow-soft dark:bg-[#fafafa] dark:text-[#18181b] dark:shadow-dark-sm'
      : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#1E293B] dark:text-[#a1a1aa] dark:hover:bg-dark-hover dark:hover:text-[#fafafa]',
  ]
}

onMounted(async () => {
  await fetchConfig()
  gcalCheckConnection()
  const { data } = await meetingsApi.fetchToday()
  todayMeetings.value = data

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`

  const live = todayMeetings.value.find(m => m.start_time <= currentTime && m.end_time > currentTime)
  roomAvailable.value = !live

  const next = todayMeetings.value.find(m => m.start_time > currentTime)
  if (next) {
    const [h, m] = next.start_time.split(':').map(Number)
    const diffMin = (h * 60 + m) - (now.getHours() * 60 + now.getMinutes())
    if (diffMin < 60) nextMeetingLabel.value = `${diffMin}min`
    else {
      const hrs = Math.floor(diffMin / 60)
      const mins = diffMin % 60
      nextMeetingLabel.value = mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`
    }
  }
})
</script>
