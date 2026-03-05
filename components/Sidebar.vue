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
        <template v-if="outlookConnected">
          <div class="flex items-center gap-2">
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 23 23">
              <path d="M1 1h10v10H1z" fill="#f35325"/>
              <path d="M12 1h10v10H12z" fill="#81bc06"/>
              <path d="M1 12h10v10H1z" fill="#05a6f0"/>
              <path d="M12 12h10v10H12z" fill="#ffba08"/>
            </svg>
            <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">Conectado</span>
          </div>
          <button
            class="mt-2 text-[11px] font-semibold text-red-500 hover:underline dark:text-red-400"
            :disabled="outlookLoading"
            @click="handleDisconnectOutlook"
          >
            {{ outlookLoading ? 'Desconectando...' : 'Desconectar' }}
          </button>
        </template>
        <template v-else>
          <button
            class="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2 text-xs font-bold text-[#475569] transition-all hover:bg-[#F1F5F9] dark:border-dark-border dark:text-[#a1a1aa] dark:hover:bg-dark-hover"
            :disabled="outlookLoading"
            @click="handleConnectOutlook"
          >
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 23 23">
              <path d="M1 1h10v10H1z" fill="#f35325"/>
              <path d="M12 1h10v10H12z" fill="#81bc06"/>
              <path d="M1 12h10v10H1z" fill="#05a6f0"/>
              <path d="M12 12h10v10H12z" fill="#ffba08"/>
            </svg>
            {{ outlookLoading ? 'Conectando...' : 'Outlook Calendar' }}
          </button>
          <p v-if="outlookError" class="mt-1 text-[11px] text-red-500">{{ outlookError }}</p>
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
const { connected: outlookConnected, loading: outlookLoading, error: outlookError, connect: outlookConnect, disconnect: outlookDisconnect, checkConnection: outlookCheckConnection } = useOutlookCalendar()

const handleConnectOutlook = () => outlookConnect()
const handleDisconnectOutlook = async () => {
  if (window.confirm('Desconectar Outlook Calendar? Novas reuniões não serão mais sincronizadas.')) {
    await outlookDisconnect()
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
  outlookCheckConnection()
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
