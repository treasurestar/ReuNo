<template>
  <button
    class="flex h-11 min-w-[96px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[#E2E8F0] bg-[#FEFEFF] px-4 text-[11px] font-bold text-[#475569] transition-all hover:bg-[#F8FAFC] dark:border-dark-border dark:bg-dark-card dark:text-[#e4e4e7] dark:hover:bg-dark-hover"
    type="button"
    @click="toggleTheme"
  >
    <span class="material-symbols-outlined text-base">
      {{ theme === "dark" ? "dark_mode" : "light_mode" }}
    </span>
    {{ theme === "dark" ? "Escuro" : "Claro" }}
  </button>
</template>

<script setup lang="ts">
const { theme, toggleTheme } = useTheme();
</script>
