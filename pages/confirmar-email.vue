<template>
  <div class="w-full max-w-md">
    <div class="relative">
      <div class="glass-card rounded-3xl p-10 stagger relative">
        <div class="flex flex-col items-center gap-2 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/30">
            <span class="material-symbols-outlined text-2xl">mark_email_read</span>
          </div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-[#fafafa]">Verifique seu e-mail</h1>
          <p class="mt-4 text-sm leading-relaxed text-slate-500 dark:text-[#a1a1aa]">
            Enviamos um link de confirmação para o seu e-mail.
            Clique no link para ativar sua conta e começar a usar o Reunô.
          </p>
        </div>

        <div class="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-dark-border dark:bg-dark-card">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined mt-0.5 text-slate-400">info</span>
            <div class="text-xs text-slate-500 dark:text-[#a1a1aa] space-y-2">
              <p>Verifique também a pasta de spam ou lixo eletrônico.</p>
              <p>O link expira em 24 horas.</p>
            </div>
          </div>
        </div>

        <NuxtLink
          class="mt-8 block w-full rounded-xl bg-primary py-3.5 text-center text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:brightness-110"
          to="/login"
        >
          Ir para o login
          <span class="material-symbols-outlined text-base align-middle">arrow_forward</span>
        </NuxtLink>
      </div>
      <p class="mt-6 text-center text-xs text-slate-400">&copy; 2026 Reunô. Todos os direitos reservados.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })
</script>
