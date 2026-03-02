<template>
  <div class="min-h-screen bg-[#F8FAFC] text-[#1E293B] dark:bg-dark-bg dark:text-[#fafafa]">
    <div class="relative flex min-h-screen items-center justify-center px-6 py-12">
      <div class="absolute right-6 top-6 z-20">
        <ThemeToggle />
      </div>
      <div
        class="pointer-events-none absolute left-8 top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl animate-glow"
      ></div>
      <div
        class="pointer-events-none absolute bottom-10 right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl animate-glow"
      ></div>
      <slot />
    </div>
  </div>
</template>
