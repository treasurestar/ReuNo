<template>
  <div class="min-h-screen bg-[#F8FAFC] text-[#1E293B] dark:bg-dark-bg dark:text-[#fafafa] font-display">
    <header
      class="sticky top-0 z-40 flex items-center justify-between border-b border-[#E2E8F0] bg-[#FEFEFF]/80 px-6 py-4 backdrop-blur dark:border-dark-border dark:bg-dark-sidebar/40"
    >
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3">
          <div>
            <p class="text-xs uppercase tracking-widest text-[#94A3B8] dark:text-[#71717a]">Sala</p>
            <p class="text-sm font-bold text-[#1E293B] dark:text-[#fafafa]">Boardroom Alpha</p>
          </div>
        </div>
        <nav class="hidden items-center gap-2 text-xs text-[#94A3B8] md:flex">
          <NuxtLink class="px-3 py-1.5 hover:text-[#fafafa]" to="/">Dashboard</NuxtLink>
          <span class="opacity-30">/</span>
          <span class="rounded-md bg-[#F1F5F9] px-3 py-1.5 text-[#1E293B] dark:bg-dark-hover dark:text-[#fafafa]">Disponibilidade</span>
        </nav>
      </div>
      <div class="flex items-center gap-4">
        <div class="hidden items-center gap-2 rounded-full border border-[#E2E8F0] px-4 py-2 text-xs text-[#475569] md:flex dark:border-dark-border dark:text-[#a1a1aa]">
          <span class="material-symbols-outlined text-sm">calendar_today</span>
          Hoje
        </div>
        <ThemeToggle />
        <NuxtLink
          class="rounded-lg bg-[#1E293B] px-4 py-2 text-xs font-bold text-white shadow-xl shadow-[#1E293B]/20 transition-all hover:bg-[#0F172A] dark:bg-[#fafafa] dark:text-[#18181b] dark:shadow-dark-sm dark:hover:bg-[#e4e4e7]"
          to="/confirmar"
        >
          Confirmar reunião
        </NuxtLink>
      </div>
    </header>
    <div class="flex min-h-[calc(100vh-76px)]">
      <aside class="hidden w-64 flex-col border-r border-[#E2E8F0] bg-[#F8FAFC] px-5 py-6 md:flex dark:border-dark-border dark:bg-dark-sidebar">
        <p class="text-[10px] uppercase tracking-widest text-[#94A3B8] dark:text-[#71717a]">Navegação</p>
        <div class="mt-4 space-y-2 text-sm">
          <NuxtLink class="flex items-center gap-3 rounded-lg bg-primary/15 px-3 py-2 text-primary" to="/disponibilidade">
            <span class="material-symbols-outlined text-lg">event_available</span>
            Disponibilidade
          </NuxtLink>
          <NuxtLink class="flex items-center gap-3 rounded-lg px-3 py-2 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#1E293B] dark:text-[#a1a1aa] dark:hover:bg-dark-hover dark:hover:text-[#fafafa]" to="/agendar">
            <span class="material-symbols-outlined text-lg">edit_calendar</span>
            Nova reunião
          </NuxtLink>
          <NuxtLink class="flex items-center gap-3 rounded-lg px-3 py-2 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#1E293B] dark:text-[#a1a1aa] dark:hover:bg-dark-hover dark:hover:text-[#fafafa]" to="/minhas-reunioes">
            <span class="material-symbols-outlined text-lg">history</span>
            Minhas reuniões
          </NuxtLink>
        </div>
        <div class="mt-auto rounded-xl border border-[#E2E8F0] bg-[#FEFEFF] p-4 dark:border-dark-border dark:bg-dark-card">
          <p class="text-xs text-[#94A3B8] dark:text-[#a1a1aa]">Capacidade máxima</p>
          <p class="text-lg font-bold text-[#1E293B] dark:text-[#fafafa]">12 pessoas</p>
          <div class="mt-3 flex items-center gap-2 text-[10px] uppercase text-[#94A3B8] dark:text-[#71717a]">
            <span class="h-2 w-2 rounded-full bg-green-500"></span>
            Sala operacional
          </div>
        </div>
      </aside>
      <main class="flex-1 overflow-hidden">
        <slot />
      </main>
    </div>
  </div>
</template>
