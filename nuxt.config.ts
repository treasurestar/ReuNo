export default defineNuxtConfig({
  compatibilityDate: "2026-02-18",
  ssr: false,
  devtools: { enabled: false },
  modules: ["@nuxtjs/tailwindcss"],
  css: ["~/assets/css/tailwind.css"],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      title: "Reunô",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Sistema de agendamento da sala de reunião com disponibilidade em tempo real.",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href:
            "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800&family=Manrope:wght@300;400;500;600;700;800&display=swap",
        },
        {
          rel: "stylesheet",
          href:
            "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap",
        },
      ],
    },
  },
  runtimeConfig: {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    adminEmails: process.env.ADMIN_EMAILS ?? "",
    microsoftClientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
    microsoftTenantId: process.env.MICROSOFT_TENANT_ID ?? "common",
    public: {
      supabaseUrl: process.env.SUPABASE_URL ?? "",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
      microsoftClientId: process.env.MICROSOFT_CLIENT_ID ?? "",
    },
  },
});
