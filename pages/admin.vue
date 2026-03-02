<template>
  <section class="space-y-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Admin</p>
        <h2 class="mt-2 text-3xl font-extrabold text-slate-900 dark:text-[#fafafa]">Painel administrativo</h2>
      </div>
      <NuxtLink class="button-primary" to="/agendar">
        <span class="material-symbols-outlined">add</span>
        Criar reunião
      </NuxtLink>
    </div>

    <div v-if="!isAdmin" class="card p-8 text-center">
      <span class="material-symbols-outlined text-4xl text-red-400">lock</span>
      <p class="mt-3 text-sm font-semibold text-slate-500 dark:text-[#a1a1aa]">Acesso restrito a administradores.</p>
      <p v-if="bootstrapMessage" class="mt-3 text-xs font-semibold text-slate-500 dark:text-[#a1a1aa]">
        {{ bootstrapMessage }}
      </p>
      <button class="button-primary mt-5" :disabled="bootstrapLoading" @click="handleBootstrapAdmin">
        <span v-if="bootstrapLoading">Validando...</span>
        <span v-else>Verificar acesso admin</span>
      </button>
    </div>

    <template v-else>
      <!-- Tabs -->
      <div class="flex flex-wrap gap-3">
        <button
          v-for="tab in adminTabs"
          :key="tab.key"
          class="chip transition-all"
          :class="activeTab === tab.key ? 'bg-slate-900 text-white dark:bg-[#fafafa] dark:text-[#18181b]' : 'border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-dark-border dark:text-[#a1a1aa] dark:hover:bg-dark-hover'"
          @click="activeTab = tab.key"
        >
          <span class="material-symbols-outlined text-sm">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <div v-if="loadingData" class="flex items-center gap-3 text-sm text-slate-500">
        <span class="material-symbols-outlined animate-spin">progress_activity</span>
        Carregando dados...
      </div>

      <template v-else>
        <!-- Tab: Estatísticas -->
        <template v-if="activeTab === 'stats'">
          <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4 stagger">
            <div class="card p-6">
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Uso semanal</p>
              <p class="mt-4 text-3xl font-extrabold text-slate-900 dark:text-[#fafafa]">{{ stats.totalHours }}h</p>
              <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">Horas de reunião esta semana</p>
            </div>
            <div class="card p-6">
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Cancelamentos</p>
              <p class="mt-4 text-3xl font-extrabold text-slate-900 dark:text-[#fafafa]">{{ stats.cancellations }}</p>
              <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">Nesta semana</p>
            </div>
            <div class="card p-6">
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Taxa de ocupação</p>
              <p class="mt-4 text-3xl font-extrabold text-slate-900 dark:text-[#fafafa]">{{ stats.occupancy }}%</p>
              <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">Hoje</p>
            </div>
            <div class="card p-6">
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Usuários</p>
              <p class="mt-4 text-3xl font-extrabold text-slate-900 dark:text-[#fafafa]">{{ monthlyStats.totalUsers }}</p>
              <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">Cadastrados</p>
            </div>
          </div>

          <div class="grid gap-6 md:grid-cols-2 stagger">
            <div class="card p-6">
              <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Reuniões do mês</p>
              <p class="mt-4 text-3xl font-extrabold text-slate-900 dark:text-[#fafafa]">{{ monthlyStats.totalMeetings }}</p>
              <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">{{ monthlyStats.totalCancelled }} canceladas</p>
            </div>
            <div class="card p-6">
              <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Reuniões de hoje</h3>
              <div v-if="todayMeetings.length === 0" class="mt-4 text-sm text-slate-500 dark:text-[#a1a1aa]">
                Nenhuma reunião hoje.
              </div>
              <div v-else class="mt-4 space-y-3">
                <div v-for="m in todayMeetings" :key="m.id" class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-dark-border dark:bg-dark-bg">
                  <div>
                    <p class="text-sm font-semibold text-slate-900 dark:text-[#fafafa]">{{ m.title }}</p>
                    <p class="text-xs text-slate-500 dark:text-[#a1a1aa]">{{ formatTime(m.start_time) }} – {{ formatTime(m.end_time) }}</p>
                  </div>
                  <button
                    class="rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                    @click="handleCancelMeeting(m.id)"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Tab: Sala -->
        <template v-if="activeTab === 'room'">
          <div class="card p-6 max-w-2xl">
            <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Configuração da sala</h3>
            <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">Altere os parâmetros da sala de reuniões.</p>

            <div v-if="roomSaved" class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              Configurações salvas com sucesso!
            </div>

            <div class="mt-6 grid gap-5 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Nome da sala</label>
                <input v-model="roomForm.name" class="input-soft mt-2" />
              </div>
              <div>
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Horário de abertura</label>
                <input v-model="roomForm.open_time" type="time" class="input-soft mt-2" />
              </div>
              <div>
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Horário de fechamento</label>
                <input v-model="roomForm.close_time" type="time" class="input-soft mt-2" />
              </div>
              <div>
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Capacidade mínima</label>
                <input v-model.number="roomForm.min_participants" type="number" min="1" class="input-soft mt-2" />
              </div>
              <div>
                <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Capacidade máxima</label>
                <input v-model.number="roomForm.max_capacity" type="number" min="1" class="input-soft mt-2" />
              </div>
              <div class="sm:col-span-2">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input v-model="roomForm.allow_weekends" type="checkbox" class="h-5 w-5 rounded border-slate-300 text-primary" />
                  <span class="text-sm font-semibold text-slate-700 dark:text-[#a1a1aa]">Permitir reservas nos fins de semana</span>
                </label>
              </div>
            </div>

            <button class="button-primary mt-6" :disabled="savingRoom" @click="saveRoomConfig">
              <span v-if="savingRoom">Salvando...</span>
              <span v-else>Salvar configurações</span>
            </button>
          </div>
        </template>

        <!-- Tab: Usuários -->
        <template v-if="activeTab === 'users'">
          <div class="card p-6">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Usuários ({{ users.length }})</h3>
            </div>
            <div class="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-dark-border dark:bg-dark-card">
              <h4 class="text-sm font-bold text-slate-900 dark:text-[#fafafa]">Adicionar usuário</h4>
              <p class="mt-1 text-xs text-slate-500 dark:text-[#a1a1aa]">Cria um usuário no Supabase Auth e no perfil do sistema.</p>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Nome completo</label>
                  <input v-model="newUser.full_name" class="input-soft mt-2" placeholder="Nome do usuário" />
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">E-mail</label>
                  <input v-model="newUser.email" class="input-soft mt-2" type="email" placeholder="nome@empresa.com" />
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Senha</label>
                  <input v-model="newUser.password" class="input-soft mt-2" type="password" placeholder="Senha temporária" />
                </div>
                <div class="sm:col-span-2">
                  <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Perfil</label>
                  <select v-model="newUser.role" class="input-soft mt-2">
                    <option value="user">Usuário</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div v-if="createUserMessage" class="mt-3 text-xs font-semibold text-slate-500 dark:text-[#a1a1aa]">
                {{ createUserMessage }}
              </div>
              <button class="button-primary mt-4" :disabled="creatingUser" @click="handleCreateUser">
                <span v-if="creatingUser">Criando...</span>
                <span v-else>Adicionar usuário</span>
              </button>
            </div>
            <div v-if="users.length === 0" class="mt-4 text-sm text-slate-500 dark:text-[#a1a1aa]">
              Nenhum usuário cadastrado.
            </div>
            <div v-else class="mt-4 space-y-3">
              <div v-for="u in users" :key="u.id" class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-dark-border dark:bg-dark-bg">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 dark:bg-dark-hover dark:text-[#a1a1aa]">
                    {{ userInitials(u.full_name) }}
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-900 dark:text-[#fafafa]">{{ u.full_name || 'Sem nome' }}</p>
                    <p class="text-xs text-slate-500 dark:text-[#a1a1aa]">{{ u.email }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <select
                    :value="u.sector_id || ''"
                    class="input-soft max-w-[140px] py-1 text-xs"
                    @change="handleAssignSector(u.id, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="">Sem setor</option>
                    <option v-for="s in sectorsList" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </select>
                  <select
                    v-if="u.sector_id"
                    :value="u.position_id || ''"
                    class="input-soft max-w-[140px] py-1 text-xs"
                    @change="handleAssignPosition(u.id, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="">Sem cargo</option>
                    <option v-for="p in positionsForSector(u.sector_id)" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                  <span class="chip text-[10px]" :class="u.role === 'admin' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-dark-border dark:text-[#a1a1aa]'">
                    {{ u.role }}
                  </span>
                  <button
                    v-if="u.id !== profile?.id"
                    class="rounded-xl border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 transition-all hover:bg-slate-100 dark:border-dark-border dark:hover:bg-dark-hover"
                    @click="toggleRole(u)"
                  >
                    {{ u.role === 'admin' ? 'Rebaixar' : 'Promover' }}
                  </button>
                  <button
                    v-if="u.id !== profile?.id"
                    class="rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                    @click="handleDeleteUser(u)"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Tab: Setores -->
        <template v-if="activeTab === 'sectors'">
          <div class="card p-6 max-w-2xl">
            <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Setores</h3>
            <p class="mt-2 text-sm text-slate-500 dark:text-[#a1a1aa]">Organize os usuários por departamento ou setor.</p>

            <div v-if="sectorMessage" class="mt-4 rounded-xl border px-4 py-3 text-sm" :class="sectorMessage.includes('sucesso') || sectorMessage.includes('atualizado') || sectorMessage.includes('removido') ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400'">
              {{ sectorMessage }}
            </div>

            <div class="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-dark-border dark:bg-dark-card">
              <h4 class="text-sm font-bold text-slate-900 dark:text-[#fafafa]">Adicionar setor</h4>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Nome</label>
                  <input v-model="sectorForm.name" class="input-soft mt-2" placeholder="Ex: Tecnologia" @keydown.enter.prevent="handleCreateSector" />
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Descrição (opcional)</label>
                  <input v-model="sectorForm.description" class="input-soft mt-2" placeholder="Breve descrição" />
                </div>
              </div>
              <button class="button-primary mt-4" :disabled="savingSector" @click="handleCreateSector">
                <span v-if="savingSector">Criando...</span>
                <span v-else>
                  <span class="material-symbols-outlined text-sm align-middle">add</span>
                  Adicionar setor
                </span>
              </button>
            </div>

            <div v-if="sectorsList.length === 0" class="mt-6 text-sm text-slate-500 dark:text-[#a1a1aa]">
              Nenhum setor cadastrado.
            </div>
            <div v-else class="mt-6 space-y-3">
              <div
                v-for="sector in sectorsList"
                :key="sector.id"
                class="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-dark-border dark:bg-dark-bg"
              >
                <template v-if="editingSectorId === sector.id">
                  <div class="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Nome</label>
                      <input v-model="editSectorForm.name" class="input-soft mt-1" @keydown.enter.prevent="handleUpdateSector" />
                    </div>
                    <div>
                      <label class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-[#a1a1aa]">Descrição</label>
                      <input v-model="editSectorForm.description" class="input-soft mt-1" />
                    </div>
                  </div>
                  <div class="mt-3 flex gap-2">
                    <button class="button-primary py-1.5 px-4 text-xs" @click="handleUpdateSector">Salvar</button>
                    <button class="rounded-xl border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-500 transition-all hover:bg-slate-100 dark:border-dark-border dark:hover:bg-dark-hover" @click="cancelEditSector">Cancelar</button>
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-semibold text-slate-900 dark:text-[#fafafa]">{{ sector.name }}</p>
                      <p v-if="sector.description" class="mt-1 text-xs text-slate-500 dark:text-[#a1a1aa]">{{ sector.description }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="chip bg-slate-100 text-[10px] text-slate-500 dark:bg-dark-border dark:text-[#a1a1aa]">
                        {{ sector.user_count }} usuário{{ sector.user_count !== 1 ? 's' : '' }}
                      </span>
                      <button
                        class="rounded-xl border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 transition-all hover:bg-slate-100 dark:border-dark-border dark:hover:bg-dark-hover"
                        @click="startEditSector(sector)"
                      >
                        Editar
                      </button>
                      <button
                        class="rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                        @click="handleDeleteSector(sector)"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                  <!-- Cargos do setor -->
                  <div class="mt-3 border-t border-slate-100 pt-3 dark:border-dark-border">
                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cargos</p>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span
                        v-for="pos in positionsForSector(sector.id)"
                        :key="pos.id"
                        class="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-dark-border dark:bg-dark-card dark:text-[#a1a1aa]"
                      >
                        {{ pos.name }}
                        <button class="ml-0.5 text-slate-400 transition-colors hover:text-red-500 dark:text-[#52525b] dark:hover:text-red-400" @click="handleRemovePosition(pos.id)">
                          <span class="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </span>
                      <span v-if="positionsForSector(sector.id).length === 0" class="text-xs text-slate-400 dark:text-[#52525b]">Nenhum cargo</span>
                    </div>
                    <div class="mt-2 flex items-center gap-2">
                      <input
                        v-model="newPositionName[sector.id]"
                        class="input-soft flex-1 py-1.5 text-xs"
                        placeholder="Nome do cargo"
                        @keydown.enter.prevent="handleCreatePosition(sector.id)"
                      />
                      <button
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-all hover:bg-slate-100 dark:border-dark-border dark:hover:bg-dark-hover"
                        @click="handleCreatePosition(sector.id)"
                      >
                        <span class="material-symbols-outlined text-base">add</span>
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </template>

        <!-- Tab: Reuniões -->
        <template v-if="activeTab === 'meetings'">
          <div v-if="meetingsMessage" class="rounded-xl border px-4 py-3 text-sm" :class="meetingsMessage.includes('cancelad') || meetingsMessage.includes('reagendad') || meetingsMessage.includes('sucesso') ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400'">
            {{ meetingsMessage }}
          </div>

          <!-- Series detail modal -->
          <div v-if="viewingSeriesId" class="card p-6">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">
                <span class="material-symbols-outlined mr-1 align-middle text-primary">repeat</span>
                Reuniões da série
              </h3>
              <button class="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 transition-all hover:bg-slate-100 dark:border-dark-border dark:hover:bg-dark-hover" @click="viewingSeriesId = null">
                Fechar
              </button>
            </div>
            <div v-if="seriesMeetings.length === 0" class="mt-4 text-sm text-slate-500 dark:text-[#a1a1aa]">
              Nenhuma reunião nesta série.
            </div>
            <div v-else class="mt-4 space-y-2">
              <div v-for="sm in seriesMeetings" :key="sm.id" class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-dark-border dark:bg-dark-bg">
                <div>
                  <p class="text-sm font-semibold text-slate-900 dark:text-[#fafafa]">{{ formatDate(sm.date) }}</p>
                  <p class="text-xs text-slate-500 dark:text-[#a1a1aa]">{{ formatTime(sm.start_time) }} – {{ formatTime(sm.end_time) }}</p>
                </div>
                <span class="chip text-[10px]" :class="meetingStatusClass(sm)">{{ meetingStatusLabel(sm) }}</span>
              </div>
            </div>
          </div>

          <div class="card p-6">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <h3 class="text-lg font-bold text-slate-900 dark:text-[#fafafa]">Todas as reuniões</h3>
              <div class="flex items-center gap-2">
                <select v-model="meetingFilter" class="input-soft max-w-[160px] py-2 text-xs" @change="loadAllMeetings">
                  <option value="all">Todos os status</option>
                  <option value="scheduled">Agendadas</option>
                  <option value="completed">Finalizadas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
              </div>
            </div>
            <div v-if="allMeetings.length === 0" class="mt-4 text-sm text-slate-500 dark:text-[#a1a1aa]">
              Nenhuma reunião encontrada.
            </div>
            <div v-else class="mt-4 space-y-3">
              <div v-for="m in allMeetings" :key="m.id" class="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-dark-border dark:bg-dark-bg">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-sm font-semibold text-slate-900 dark:text-[#fafafa]">{{ m.title }}</p>
                    <p class="text-xs text-slate-500 dark:text-[#a1a1aa]">
                      {{ formatDate(m.date) }} • {{ formatTime(m.start_time) }} – {{ formatTime(m.end_time) }}
                      <span v-if="m.creator"> • {{ m.creator.full_name }}</span>
                    </p>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span class="chip text-[10px]" :class="meetingStatusClass(m)">{{ meetingStatusLabel(m) }}</span>
                      <span v-if="m.series_id" class="chip text-[10px] bg-primary/10 text-primary border border-primary/30">
                        <span class="material-symbols-outlined text-[11px] mr-0.5">repeat</span>
                        Série
                      </span>
                    </div>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <button
                      v-if="m.series_id"
                      class="rounded-xl border border-slate-200 px-3 py-1 text-xs font-bold text-slate-500 transition-all hover:bg-slate-100 dark:border-dark-border dark:hover:bg-dark-hover"
                      @click="handleViewSeries(m.series_id!)"
                    >
                      Ver série
                    </button>
                    <button
                      v-if="m.status === 'scheduled'"
                      class="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 transition-all hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
                      @click="startReschedule(m)"
                    >
                      Reagendar
                    </button>
                    <button
                      v-if="m.status === 'scheduled' && m.series_id"
                      class="rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                      @click="handleCancelSeries(m.series_id!)"
                    >
                      Cancelar série
                    </button>
                    <button
                      v-if="m.status === 'scheduled'"
                      class="rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                      @click="handleCancelMeeting(m.id)"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>

                <!-- Reschedule inline form -->
                <div v-if="rescheduleTarget?.id === m.id" class="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                  <p class="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Reagendar reunião</p>
                  <div class="mt-3 flex flex-wrap items-end gap-3">
                    <div>
                      <label class="text-xs font-bold text-blue-600 dark:text-blue-400">Nova data</label>
                      <input v-model="rescheduleDate" type="date" :min="todayStr" class="input-soft mt-1" />
                    </div>
                    <button
                      class="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-blue-700"
                      :disabled="!rescheduleDate || rescheduling"
                      @click="handleReschedule"
                    >
                      {{ rescheduling ? 'Salvando...' : 'Salvar' }}
                    </button>
                    <button
                      class="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 transition-all hover:bg-slate-100 dark:border-dark-border dark:hover:bg-dark-hover"
                      @click="rescheduleTarget = null"
                    >
                      Cancelar
                    </button>
                  </div>
                  <p v-if="rescheduleError" class="mt-2 text-xs font-semibold text-red-500">{{ rescheduleError }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { Meeting, Profile, Sector, Position } from '~/types/database'

const { profile, isAdmin, bootstrapAdmin, adminBootstrapState, adminBootstrapReason } = useAuth()
const bootstrapLoading = ref(false)
const bootstrapMessage = ref('')
const creatingUser = ref(false)
const createUserMessage = ref('')
const newUser = ref({
  full_name: '',
  email: '',
  password: '',
  role: 'user' as 'user' | 'admin',
})
const meetingsApi = useMeetings()
const { config: roomConfig, fetch: fetchConfig, updateConfig } = useRoomConfig()
const sectorsApi = useSectors()

const loadingData = ref(true)
const activeTab = ref<'stats' | 'room' | 'users' | 'meetings' | 'sectors'>('stats')
const stats = ref({ totalHours: 0, cancellations: 0, occupancy: 0 })
const monthlyStats = ref({ totalMeetings: 0, totalCancelled: 0, totalUsers: 0 })
const todayMeetings = ref<Meeting[]>([])
const users = ref<Profile[]>([])
const allMeetings = ref<Meeting[]>([])
const meetingFilter = ref('all')
const savingRoom = ref(false)
const roomSaved = ref(false)

const sectorsList = ref<(Sector & { user_count: number })[]>([])
const sectorForm = ref({ name: '', description: '' })
const savingSector = ref(false)
const sectorMessage = ref('')
const editingSectorId = ref<string | null>(null)
const editSectorForm = ref({ name: '', description: '' })
const newPositionName = ref<Record<string, string>>({})

const roomForm = ref({
  name: '',
  open_time: '08:00',
  close_time: '19:00',
  min_participants: 3,
  max_capacity: 12,
  allow_weekends: false,
})

const adminTabs = [
  { key: 'stats' as const, label: 'Estatísticas', icon: 'insights' },
  { key: 'room' as const, label: 'Sala', icon: 'meeting_room' },
  { key: 'users' as const, label: 'Usuários', icon: 'group' },
  { key: 'sectors' as const, label: 'Setores', icon: 'corporate_fare' },
  { key: 'meetings' as const, label: 'Reuniões', icon: 'event' },
]

const formatTime = (t: string) => t?.slice(0, 5) ?? ''

const formatDate = (d: string) => {
  const date = new Date(d + 'T12:00:00')
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

const userInitials = (name?: string) => {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

const todayStr = new Date().toLocaleDateString('en-CA')
const meetingsMessage = ref('')
const viewingSeriesId = ref<string | null>(null)
const seriesMeetings = ref<Meeting[]>([])
const rescheduleTarget = ref<Meeting | null>(null)
const rescheduleDate = ref('')
const rescheduleError = ref('')
const rescheduling = ref(false)

const handleViewSeries = async (seriesId: string) => {
  viewingSeriesId.value = seriesId
  seriesMeetings.value = await meetingsApi.fetchSeriesMeetings(seriesId)
}

const handleCancelSeries = async (seriesId: string) => {
  if (!profile.value) return
  const ok = window.confirm('Cancelar todas as reuniões futuras desta série?')
  if (!ok) return
  const { cancelled, error } = await meetingsApi.cancelSeries(seriesId, profile.value.id)
  if (error) {
    meetingsMessage.value = `Erro ao cancelar série: ${error.message}`
  } else {
    meetingsMessage.value = `${cancelled} reunião(ões) da série cancelada(s).`
    setTimeout(() => { meetingsMessage.value = '' }, 4000)
  }
  await loadData()
}

const startReschedule = (meeting: Meeting) => {
  rescheduleTarget.value = meeting
  rescheduleDate.value = ''
  rescheduleError.value = ''
}

const handleReschedule = async () => {
  if (!rescheduleTarget.value || !rescheduleDate.value) return
  rescheduling.value = true
  rescheduleError.value = ''
  const { error } = await meetingsApi.rescheduleMeeting(
    rescheduleTarget.value.id,
    rescheduleDate.value,
    rescheduleTarget.value.start_time,
    rescheduleTarget.value.end_time,
  )
  if (error) {
    rescheduleError.value = error.message || 'Erro ao reagendar.'
  } else {
    meetingsMessage.value = `Reunião reagendada para ${formatDate(rescheduleDate.value)}.`
    rescheduleTarget.value = null
    setTimeout(() => { meetingsMessage.value = '' }, 4000)
    await loadData()
  }
  rescheduling.value = false
}

const meetingStatusLabel = (m: Meeting) => {
  if (m.status === 'cancelled') return 'Cancelada'
  if (m.status === 'completed') return 'Finalizada'
  return 'Agendada'
}

const meetingStatusClass = (m: Meeting) => {
  if (m.status === 'cancelled') return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  if (m.status === 'completed') return 'bg-slate-100 text-slate-500 dark:bg-dark-border dark:text-[#a1a1aa]'
  return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
}

const handleCancelMeeting = async (meetingId: string) => {
  if (!profile.value) return
  await meetingsApi.cancel(meetingId, profile.value.id)
  await loadData()
}

const toggleRole = async (user: Profile) => {
  const newRole = user.role === 'admin' ? 'user' : 'admin'
  await meetingsApi.updateUserRole(user.id, newRole)
  users.value = await meetingsApi.fetchAllUsers()
}

const handleDeleteUser = async (user: Profile) => {
  if (user.id === profile.value?.id) return
  try {
    const supabase = useSupabase()
    const { data: { user: validated }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !validated) return
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) return
    await $fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { userId: user.id },
    })
    users.value = await meetingsApi.fetchAllUsers()
  } catch (e) {
    console.warn('[admin] Erro ao remover usuário:', e)
  }
}

const handleCreateUser = async () => {
  createUserMessage.value = ''
  if (!newUser.value.full_name.trim() || !newUser.value.email.trim() || !newUser.value.password.trim()) {
    createUserMessage.value = 'Preencha nome, e-mail e senha.'
    return
  }
  creatingUser.value = true
  try {
    const supabase = useSupabase()
    const { data: { user: validated }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !validated) {
      createUserMessage.value = 'Sessão inválida. Faça login novamente.'
      return
    }
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) {
      createUserMessage.value = 'Sessão inválida. Faça login novamente.'
      return
    }
    await $fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        full_name: newUser.value.full_name.trim(),
        email: newUser.value.email.trim(),
        password: newUser.value.password,
        role: newUser.value.role,
      },
    })
    createUserMessage.value = 'Usuário criado com sucesso.'
    newUser.value = { full_name: '', email: '', password: '', role: 'user' }
    users.value = await meetingsApi.fetchAllUsers()
  } catch (e: any) {
    createUserMessage.value = e?.statusMessage || 'Erro ao criar usuário.'
  } finally {
    creatingUser.value = false
  }
}

const loadSectors = async () => {
  sectorsList.value = await sectorsApi.fetchWithUserCount()
}

const handleCreateSector = async () => {
  sectorMessage.value = ''
  if (!sectorForm.value.name.trim()) {
    sectorMessage.value = 'Informe o nome do setor.'
    return
  }
  savingSector.value = true
  const { error } = await sectorsApi.create(sectorForm.value.name, sectorForm.value.description)
  if (error) {
    sectorMessage.value = error
  } else {
    sectorForm.value = { name: '', description: '' }
    sectorMessage.value = 'Setor criado com sucesso.'
    await loadSectors()
    setTimeout(() => { sectorMessage.value = '' }, 3000)
  }
  savingSector.value = false
}

const startEditSector = (sector: Sector & { user_count: number }) => {
  editingSectorId.value = sector.id
  editSectorForm.value = { name: sector.name, description: sector.description || '' }
}

const cancelEditSector = () => {
  editingSectorId.value = null
  editSectorForm.value = { name: '', description: '' }
}

const handleUpdateSector = async () => {
  if (!editingSectorId.value) return
  sectorMessage.value = ''
  const { error } = await sectorsApi.update(editingSectorId.value, {
    name: editSectorForm.value.name,
    description: editSectorForm.value.description,
  })
  if (error) {
    sectorMessage.value = error
  } else {
    editingSectorId.value = null
    editSectorForm.value = { name: '', description: '' }
    sectorMessage.value = 'Setor atualizado.'
    await loadSectors()
    setTimeout(() => { sectorMessage.value = '' }, 3000)
  }
}

const handleDeleteSector = async (sector: Sector & { user_count: number }) => {
  sectorMessage.value = ''
  if (sector.user_count > 0) {
    sectorMessage.value = `Não é possível remover "${sector.name}" — ${sector.user_count} usuário(s) vinculado(s). Reatribua-os antes.`
    return
  }
  const { error } = await sectorsApi.remove(sector.id)
  if (error) {
    sectorMessage.value = error
  } else {
    sectorMessage.value = 'Setor removido.'
    await loadSectors()
    setTimeout(() => { sectorMessage.value = '' }, 3000)
  }
}

const handleAssignSector = async (userId: string, sectorId: string) => {
  await sectorsApi.assignUserToSector(userId, sectorId || null)
  await loadSectors()
  await loadPositions()
  users.value = await meetingsApi.fetchAllUsers()
}

const loadPositions = async () => {
  await sectorsApi.fetchPositions()
}

const positionsForSector = (sectorId: string): Position[] => {
  return sectorsApi.positionsForSector(sectorId)
}

const handleCreatePosition = async (sectorId: string) => {
  const name = newPositionName.value[sectorId]?.trim()
  if (!name) return
  sectorMessage.value = ''
  const { error } = await sectorsApi.createPosition(sectorId, name)
  if (error) {
    sectorMessage.value = error
  } else {
    newPositionName.value[sectorId] = ''
    await loadPositions()
  }
}

const handleRemovePosition = async (positionId: string) => {
  sectorMessage.value = ''
  const { error } = await sectorsApi.removePosition(positionId)
  if (error) {
    sectorMessage.value = error
  } else {
    await loadPositions()
    users.value = await meetingsApi.fetchAllUsers()
  }
}

const handleAssignPosition = async (userId: string, positionId: string) => {
  await sectorsApi.assignUserPosition(userId, positionId || null)
  users.value = await meetingsApi.fetchAllUsers()
}

const saveRoomConfig = async () => {
  savingRoom.value = true
  roomSaved.value = false
  await updateConfig({
    name: roomForm.value.name,
    open_time: roomForm.value.open_time,
    close_time: roomForm.value.close_time,
    min_participants: roomForm.value.min_participants,
    max_capacity: roomForm.value.max_capacity,
    allow_weekends: roomForm.value.allow_weekends,
  })
  savingRoom.value = false
  roomSaved.value = true
  setTimeout(() => { roomSaved.value = false }, 3000)
}

const loadAllMeetings = async () => {
  allMeetings.value = await meetingsApi.fetchAllMeetings({ status: meetingFilter.value })
}

const loadData = async () => {
  loadingData.value = true
  try {
    stats.value = await meetingsApi.fetchStats()
    monthlyStats.value = await meetingsApi.fetchMonthlyStats()
    const { data } = await meetingsApi.fetchToday()
    todayMeetings.value = data
    users.value = await meetingsApi.fetchAllUsers()
    allMeetings.value = await meetingsApi.fetchAllMeetings({ status: meetingFilter.value })
    await loadSectors()
    await loadPositions()

    await fetchConfig()
    if (roomConfig.value) {
      roomForm.value = {
        name: roomConfig.value.name ?? 'Sala de Reuniões',
        open_time: roomConfig.value.open_time ?? '08:00',
        close_time: roomConfig.value.close_time ?? '19:00',
        min_participants: roomConfig.value.min_participants ?? 3,
        max_capacity: roomConfig.value.max_capacity ?? 12,
        allow_weekends: roomConfig.value.allow_weekends ?? false,
      }
    }
  } finally {
    loadingData.value = false
  }
}

const handleBootstrapAdmin = async () => {
  bootstrapLoading.value = true
  bootstrapMessage.value = ''
  const result = await bootstrapAdmin()
  if (result.state === 'ok') {
    bootstrapMessage.value = 'Acesso administrativo liberado. Atualizando...'
    await loadData()
  } else if (result.state === 'denied') {
    bootstrapMessage.value = result.reason === 'no_admin_allowlist'
      ? 'Allowlist de admins não configurada no servidor.'
      : 'Seu e-mail não está autorizado como admin.'
  } else {
    bootstrapMessage.value = 'Não foi possível validar o acesso agora.'
  }
  bootstrapLoading.value = false
}

onMounted(() => {
  if (isAdmin.value) loadData()
  else loadingData.value = false
})

watch(() => isAdmin.value, (val) => {
  if (val) loadData()
})
</script>
