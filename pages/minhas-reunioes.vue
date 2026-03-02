<template>
  <section class="space-y-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Histórico</p>
        <h2 class="mt-2 text-3xl font-extrabold text-slate-900 dark:text-[#fafafa]">Minhas reuniões</h2>
      </div>
      <div v-if="invites.length" class="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-600 dark:border-amber-600/30 dark:bg-amber-950/40">
        {{ invites.length }} pendente{{ invites.length > 1 ? 's' : '' }} de confirmação
      </div>
    </div>

    <div class="flex flex-wrap gap-3">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="chip transition-all"
        :class="activeTab === tab.key ? 'bg-slate-900 text-white dark:bg-[#fafafa] dark:text-[#18181b]' : 'border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-dark-border dark:text-[#a1a1aa] dark:hover:bg-dark-hover'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span v-if="tab.key === 'invites' && invites.length" class="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] text-white">{{ invites.length }}</span>
      </button>
    </div>

    <div v-if="loading" class="flex items-center gap-3 text-sm text-slate-500">
      <span class="material-symbols-outlined animate-spin">progress_activity</span>
      Carregando...
    </div>

    <div v-if="toastMessage" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
      {{ toastMessage }}
    </div>

    <div v-else class="grid gap-8 xl:grid-cols-12 stagger">
      <div class="xl:col-span-8 space-y-4">
        <!-- Tab Ativas / Passadas -->
        <template v-if="activeTab !== 'invites'">
          <div v-if="filteredMeetings.length === 0" class="card p-8 text-center">
            <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-[#52525b]">event_busy</span>
            <p class="mt-3 text-sm text-slate-500 dark:text-[#a1a1aa]">Nenhuma reunião nesta categoria.</p>
          </div>

          <div v-for="meeting in filteredMeetings" :key="meeting.id" class="card p-6">
            <div class="flex items-start justify-between gap-4 cursor-pointer" @click="toggleMeeting(meeting.id)">
              <div>
                <p class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">{{ meeting.title }}</p>
                <p class="mt-1 text-sm text-slate-500 dark:text-[#a1a1aa]">
                  {{ formatDate(meeting.date) }} • {{ formatTime(meeting.start_time) }} – {{ formatTime(meeting.end_time) }}
                </p>
                <div class="mt-3 flex flex-wrap gap-3 text-xs">
                  <span class="chip" :class="statusChip(meeting)">{{ statusLabel(meeting) }}</span>
                  <span v-if="meeting.series_id" class="chip bg-primary/10 text-primary border border-primary/30">
                    <span class="material-symbols-outlined text-[13px] mr-0.5">repeat</span>
                    Recorrente
                  </span>
                  <span class="chip bg-slate-100 text-slate-600 dark:bg-dark-border dark:text-[#a1a1aa]">
                    {{ meeting.expected_participants }} participantes
                  </span>
                </div>
              </div>
              <div v-if="meeting.status === 'scheduled'" class="flex flex-col gap-2" @click.stop>
                <div class="flex gap-1.5">
                  <template v-if="meeting.google_event_id">
                    <span class="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <span class="material-symbols-outlined text-sm">check</span>
                      Sincronizado
                    </span>
                  </template>
                  <template v-else>
                    <a
                      :href="calendarLinks.googleCalendarUrl({ title: meeting.title, date: meeting.date, startTime: meeting.start_time, endTime: meeting.end_time, description: meeting.description || '' })"
                      target="_blank"
                      rel="noopener"
                      class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition-all hover:bg-slate-100 dark:border-dark-border dark:hover:bg-dark-hover"
                      title="Google Calendar"
                    >
                      <svg class="inline h-3.5 w-3.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    </a>
                  </template>
                  <a
                    :href="calendarLinks.outlookCalendarUrl({ title: meeting.title, date: meeting.date, startTime: meeting.start_time, endTime: meeting.end_time, description: meeting.description || '' })"
                    target="_blank"
                    rel="noopener"
                    class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition-all hover:bg-slate-100 dark:border-dark-border dark:hover:bg-dark-hover"
                    title="Outlook"
                  >
                    <svg class="inline h-3.5 w-3.5" viewBox="0 0 23 23"><path d="M1 1h10v10H1z" fill="#f35325"/><path d="M12 1h10v10H12z" fill="#81bc06"/><path d="M1 12h10v10H1z" fill="#05a6f0"/><path d="M12 12h10v10H12z" fill="#ffba08"/></svg>
                  </a>
                </div>
                <button
                  v-if="meeting.invite_token"
                  class="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 transition-all hover:bg-slate-100 dark:border-dark-border dark:hover:bg-dark-hover"
                  @click="copyMeetingLink(meeting.invite_token)"
                >
                  <span class="material-symbols-outlined text-sm align-middle">content_copy</span>
                  Link
                </button>
                <button
                  v-if="meeting.invite_token"
                  class="rounded-xl bg-[#25D366] px-3 py-2 text-xs font-bold text-white transition-all hover:brightness-110"
                  @click="shareMeetingWhatsApp(meeting.invite_token)"
                >
                  <svg class="inline h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </button>
                <button
                  v-if="meeting.created_by === profile?.id"
                  class="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                  @click="handleCancelMeeting(meeting.id)"
                >
                  Cancelar reunião
                </button>
                <button
                  v-else
                  class="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                  @click="handleCancelPresence(meeting)"
                >
                  Cancelar presença
                </button>
              </div>
            </div>

            <div v-if="expandedMeetings.has(meeting.id)" class="mt-6 border-t border-slate-100 pt-4 dark:border-dark-border">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-bold text-slate-900 dark:text-[#fafafa]">Presenças confirmadas</h4>
                <span class="text-xs text-slate-400">{{ confirmedParticipants(meeting).length }} confirmados</span>
              </div>
              <div v-if="confirmedParticipants(meeting).length === 0" class="mt-3 text-sm text-slate-500 dark:text-[#a1a1aa]">
                Nenhuma confirmação ainda.
              </div>
              <div v-else class="mt-4 space-y-2">
                <div
                  v-for="p in confirmedParticipants(meeting)"
                  :key="p.id"
                  class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm dark:border-dark-border dark:bg-dark-bg"
                >
                  <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 dark:bg-dark-hover dark:text-[#a1a1aa]">
                      {{ participantInitials(p) }}
                    </div>
                    <div>
                      <p class="font-semibold text-slate-900 dark:text-[#fafafa]">
                        {{ participantName(p) }}
                      </p>
                      <p class="text-xs text-slate-500 dark:text-[#a1a1aa]">{{ participantEmail(p) }}</p>
                    </div>
                  </div>
                  <button
                    v-if="canRemoveParticipant(meeting, p)"
                    class="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                    @click.stop="removeParticipant(meeting, p)"
                  >
                    Remover
                  </button>
                </div>
              </div>

              <div class="mt-6 flex items-center justify-between">
                <h4 class="text-sm font-bold text-slate-900 dark:text-[#fafafa]">Pendentes</h4>
                <span class="text-xs text-slate-400">{{ pendingParticipants(meeting).length }} pendentes</span>
              </div>
              <div v-if="pendingParticipants(meeting).length === 0" class="mt-3 text-sm text-slate-500 dark:text-[#a1a1aa]">
                Nenhum convite pendente.
              </div>
              <div v-else class="mt-4 space-y-2">
                <div
                  v-for="p in pendingParticipants(meeting)"
                  :key="p.id"
                  class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm dark:border-dark-border dark:bg-dark-bg"
                >
                  <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 dark:bg-dark-hover dark:text-[#a1a1aa]">
                      {{ participantInitials(p) }}
                    </div>
                    <div>
                      <p class="font-semibold text-slate-900 dark:text-[#fafafa]">
                        {{ participantName(p) }}
                      </p>
                      <p class="text-xs text-slate-500 dark:text-[#a1a1aa]">{{ participantEmail(p) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <template v-if="!p.user_id && p.invite_token && canManageMeeting(meeting)">
                      <button
                        class="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 dark:border-dark-border dark:hover:bg-dark-hover"
                        title="Copiar link individual"
                        @click.stop="copyParticipantLink(p.invite_token)"
                      >
                        <span class="material-symbols-outlined text-[16px]">content_copy</span>
                      </button>
                      <button
                        class="rounded-lg bg-[#25D366] p-1.5 text-white transition-all hover:brightness-110"
                        title="Enviar via WhatsApp"
                        @click.stop="shareParticipantWhatsApp(p.invite_token, participantName(p))"
                      >
                        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      </button>
                    </template>
                    <button
                      v-if="canRemoveParticipant(meeting, p)"
                      class="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                      @click.stop="removeParticipant(meeting, p)"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex items-center justify-between">
                <h4 class="text-sm font-bold text-slate-900 dark:text-[#fafafa]">Recusados/Cancelados</h4>
                <span class="text-xs text-slate-400">{{ declinedParticipants(meeting).length }} registros</span>
              </div>
              <div v-if="declinedParticipants(meeting).length === 0" class="mt-3 text-sm text-slate-500 dark:text-[#a1a1aa]">
                Nenhum registro.
              </div>
              <div v-else class="mt-4 space-y-2">
                <div
                  v-for="p in declinedParticipants(meeting)"
                  :key="p.id"
                  class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm dark:border-dark-border dark:bg-dark-bg"
                >
                  <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 dark:bg-dark-hover dark:text-[#a1a1aa]">
                      {{ participantInitials(p) }}
                    </div>
                    <div>
                      <p class="font-semibold text-slate-900 dark:text-[#fafafa]">
                        {{ participantName(p) }}
                      </p>
                      <p class="text-xs text-slate-500 dark:text-[#a1a1aa]">{{ participantEmail(p) }}</p>
                    </div>
                  </div>
                  <button
                    v-if="canRemoveParticipant(meeting, p)"
                    class="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                    @click.stop="removeParticipant(meeting, p)"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Tab Convites -->
        <template v-else>
          <div v-if="invites.length === 0" class="card p-8 text-center">
            <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-[#52525b]">mark_email_read</span>
            <p class="mt-3 text-sm text-slate-500 dark:text-[#a1a1aa]">Nenhum convite pendente.</p>
          </div>

          <div v-for="inv in invites" :key="inv.id" class="card p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">{{ inv.meetings?.title }}</p>
                <p class="mt-1 text-sm text-slate-500 dark:text-[#a1a1aa]">
                  {{ formatDate(inv.meetings?.date) }} • {{ formatTime(inv.meetings?.start_time) }} – {{ formatTime(inv.meetings?.end_time) }}
                </p>
                <div class="mt-3 flex flex-wrap gap-3 text-xs">
                  <span class="chip bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">Pendente</span>
                  <span v-if="inv.meetings?.creator" class="chip bg-slate-100 text-slate-600 dark:bg-dark-border dark:text-[#a1a1aa]">
                    Organizador: {{ inv.meetings.creator.full_name }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col items-end gap-2">
                <div class="flex items-center gap-2">
                  <button
                    class="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 transition-all hover:bg-slate-100 dark:border-dark-border dark:hover:bg-dark-hover"
                    @click="handleDecline(inv.id)"
                  >
                    Recusar
                  </button>
                  <button
                    class="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-slate-800 dark:bg-[#fafafa] dark:text-[#18181b] dark:hover:brightness-110"
                    @click="handleConfirmAndShowCalendar(inv)"
                  >
                    Confirmar
                  </button>
                </div>
                <div v-if="inv.meetings" class="flex gap-1.5">
                  <a
                    :href="calendarLinks.googleCalendarUrl({ title: inv.meetings.title, date: inv.meetings.date, startTime: inv.meetings.start_time, endTime: inv.meetings.end_time, description: inv.meetings.description || '' })"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 transition-all hover:bg-slate-50 dark:border-dark-border dark:text-[#a1a1aa] dark:hover:bg-dark-hover"
                    title="Google Calendar"
                  >
                    <svg class="h-3 w-3" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </a>
                  <a
                    :href="calendarLinks.outlookCalendarUrl({ title: inv.meetings.title, date: inv.meetings.date, startTime: inv.meetings.start_time, endTime: inv.meetings.end_time, description: inv.meetings.description || '' })"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 transition-all hover:bg-slate-50 dark:border-dark-border dark:text-[#a1a1aa] dark:hover:bg-dark-hover"
                    title="Outlook"
                  >
                    <svg class="h-3 w-3" viewBox="0 0 23 23"><path d="M1 1h10v10H1z" fill="#f35325"/><path d="M12 1h10v10H12z" fill="#81bc06"/><path d="M1 12h10v10H1z" fill="#05a6f0"/><path d="M12 12h10v10H12z" fill="#ffba08"/></svg>
                    Outlook
                  </a>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="xl:col-span-4 space-y-6">
        <div class="card p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Convites pendentes</h3>
          <div v-if="invites.length === 0" class="mt-4 text-sm text-slate-500 dark:text-[#a1a1aa]">
            Nenhum convite pendente.
          </div>
          <div v-else class="mt-4 space-y-4 text-sm">
            <div v-for="inv in invites" :key="inv.id" class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-dark-border dark:bg-dark-card">
              <div>
                <p class="font-semibold text-slate-900 dark:text-[#fafafa]">{{ inv.meetings?.title }}</p>
                <p class="text-xs text-slate-500 dark:text-[#a1a1aa]">{{ formatDate(inv.meetings?.date) }} • {{ formatTime(inv.meetings?.start_time) }}</p>
              </div>
              <div class="flex items-center gap-2">
                <button class="rounded-xl border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 transition-all hover:bg-slate-100 dark:border-dark-border dark:hover:bg-dark-hover" @click="handleDecline(inv.id)">
                  Recusar
                </button>
                <button class="rounded-xl bg-slate-900 px-3 py-1 text-xs font-bold text-white transition-all hover:bg-slate-800 dark:bg-[#fafafa] dark:text-[#18181b] dark:hover:brightness-110" @click="handleConfirm(inv.id)">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Ações rápidas</h3>
          <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">
            Precisa cancelar algo? Todos os participantes serão notificados automaticamente.
          </p>
          <NuxtLink class="button-outline mt-4 w-full text-center" to="/agendar">
            <span class="material-symbols-outlined text-base">add</span>
            Nova reunião
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Meeting, MeetingParticipant } from '~/types/database'

const { profile, isAdmin } = useAuth()
const meetingsApi = useMeetings()
const calendarLinks = useCalendarLinks()
const { connected: gcalConnected, deleteEvent: gcalDeleteEvent } = useGoogleCalendar()

const loading = ref(true)
const meetings = ref<Meeting[]>([])
const invites = ref<(MeetingParticipant & { meetings: Meeting })[]>([])
const activeTab = ref<'active' | 'invites' | 'past'>('active')
const toastMessage = ref('')

const tabs = [
  { key: 'active' as const, label: 'Ativas' },
  { key: 'invites' as const, label: 'Convites' },
  { key: 'past' as const, label: 'Passadas' },
]

const todayStr = new Date().toLocaleDateString('en-CA')

const filteredMeetings = computed(() => {
  if (activeTab.value === 'active') {
    return meetings.value.filter(m => m.date >= todayStr && m.status === 'scheduled')
  }
  if (activeTab.value === 'past') {
    return meetings.value.filter(m => (m.date < todayStr || m.status === 'completed') && m.status !== 'cancelled')
  }
  return []
})

const formatDate = (d?: string) => {
  if (!d) return ''
  const date = new Date(d + 'T12:00:00')
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

const formatTime = (t?: string) => t?.slice(0, 5) ?? ''

const statusLabel = (m: Meeting) => {
  if (m.status === 'cancelled') return 'Cancelada'
  if (m.status === 'completed') return 'Finalizada'
  if (m.date < todayStr) return 'Finalizada'
  return 'Confirmada'
}

const statusChip = (m: Meeting) => {
  if (m.status === 'cancelled') return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  if (m.status === 'completed' || m.date < todayStr) return 'bg-slate-100 text-slate-500 dark:bg-dark-border dark:text-[#a1a1aa]'
  return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
}

const expandedMeetings = ref<Set<string>>(new Set())

const toggleMeeting = (id: string) => {
  const next = new Set(expandedMeetings.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedMeetings.value = next
}

const confirmedParticipants = (meeting: Meeting) => {
  const list = meeting.meeting_participants ?? []
  return list.filter(p => p.status === 'confirmed')
}

const pendingParticipants = (meeting: Meeting) => {
  const list = meeting.meeting_participants ?? []
  return list.filter(p => p.status === 'pending')
}

const declinedParticipants = (meeting: Meeting) => {
  const list = meeting.meeting_participants ?? []
  return list.filter(p => p.status === 'declined' || p.status === 'cancelled')
}

const participantName = (p: MeetingParticipant) => p.profile?.full_name || p.guest_name || 'Sem nome'
const participantEmail = (p: MeetingParticipant) => p.profile?.email || p.guest_email || ''

const participantInitials = (p: MeetingParticipant) => {
  const name = participantName(p)
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

const handleCancelMeeting = async (meetingId: string) => {
  if (!profile.value) return
  const meeting = meetings.value.find(m => m.id === meetingId)
  if (gcalConnected.value && meeting?.google_event_id) {
    await gcalDeleteEvent(meeting.google_event_id)
  }
  await meetingsApi.cancel(meetingId, profile.value.id)
  await loadData()
}

const handleCancelPresence = async (meeting: Meeting) => {
  if (!profile.value) return
  const participant = meeting.meeting_participants?.find(p => p.user_id === profile.value!.id)
  if (participant) {
    await meetingsApi.cancelParticipation(participant.id)
    await loadData()
  }
}

const handleConfirm = async (participantId: string) => {
  await meetingsApi.confirmParticipation(participantId)
  await loadData()
}

const handleConfirmAndShowCalendar = async (inv: (MeetingParticipant & { meetings: Meeting })) => {
  await meetingsApi.confirmParticipation(inv.id)
  toastMessage.value = 'Presença confirmada! Adicione à sua agenda usando os botões ao lado.'
  setTimeout(() => { toastMessage.value = '' }, 4000)
  await loadData()
}

const handleDecline = async (participantId: string) => {
  await meetingsApi.declineParticipation(participantId)
  await loadData()
}

const canManageMeeting = (meeting: Meeting) => {
  return isAdmin.value || meeting.created_by === profile.value?.id
}

const canRemoveParticipant = (meeting: Meeting, participant: MeetingParticipant) => {
  if (!canManageMeeting(meeting)) return false
  return true
}

const removeParticipant = async (meeting: Meeting, participant: MeetingParticipant) => {
  if (!canRemoveParticipant(meeting, participant)) return
  const isOrganizer = Boolean(participant.is_organizer)
  const isSelf = participant.user_id && participant.user_id === profile.value?.id
  let message = 'Remover este participante da reunião?'
  if (isOrganizer) message = 'Este é o organizador. Tem certeza que deseja remover?'
  if (isSelf) message = 'Você está removendo a si mesmo. Deseja continuar?'
  const ok = window.confirm(message)
  if (!ok) return
  await meetingsApi.removeUserFromMeeting(participant.id)
  await loadData()
  toastMessage.value = 'Participante removido com sucesso.'
  setTimeout(() => { toastMessage.value = '' }, 3000)
}

const buildMeetingLink = (token: string) => {
  const base = process.client ? window.location.origin : ''
  return `${base}/confirmar-presenca?meeting=${token}`
}

const buildParticipantLink = (token: string) => {
  const base = process.client ? window.location.origin : ''
  return `${base}/confirmar-presenca?token=${token}`
}

const copyMeetingLink = async (token: string) => {
  try {
    await navigator.clipboard.writeText(buildMeetingLink(token))
    toastMessage.value = 'Link copiado!'
    setTimeout(() => { toastMessage.value = '' }, 2000)
  } catch (e) {
    console.warn('[minhas-reunioes] Falha ao copiar link:', e)
  }
}

const copyParticipantLink = async (token: string) => {
  try {
    await navigator.clipboard.writeText(buildParticipantLink(token))
    toastMessage.value = 'Link individual copiado!'
    setTimeout(() => { toastMessage.value = '' }, 2000)
  } catch (e) {
    console.warn('[minhas-reunioes] Falha ao copiar link:', e)
  }
}

const shareMeetingWhatsApp = (token: string) => {
  const text = encodeURIComponent(`Confirme sua presença na reunião: ${buildMeetingLink(token)}`)
  window.open(`https://wa.me/?text=${text}`, '_blank')
}

const shareParticipantWhatsApp = (token: string, name: string) => {
  const text = encodeURIComponent(`Olá ${name}, confirme sua presença: ${buildParticipantLink(token)}`)
  window.open(`https://wa.me/?text=${text}`, '_blank')
}

const loadData = async () => {
  if (!profile.value) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    meetings.value = await meetingsApi.fetchMyMeetings(profile.value.id)
    invites.value = await meetingsApi.fetchInvites(profile.value.id)
  } finally {
    loading.value = false
  }
}

watch(() => profile.value, (val) => {
  if (val) loadData()
})

onMounted(loadData)
</script>
