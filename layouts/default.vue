<template>
  <div class="min-h-screen bg-[#F8FAFC] dark:bg-dark-bg">
    <div class="flex min-h-screen">
      <Sidebar />
      <div class="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main class="flex-1 px-6 pb-16 pt-8 sm:px-10 lg:px-12">
          <div class="mx-auto w-full max-w-6xl">
            <slot />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
