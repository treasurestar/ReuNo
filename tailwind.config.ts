import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  darkMode: "class",
  content: [
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#135BEC",
        accent: "#4F46E5",
        ink: "#0F172A",
        surface: "#FEFEFF",
        muted: "#94A3B8",
        border: "#E2E8F0",
        slate: {
          950: "#0A0C10",
        },
        dark: {
          bg: "#09090b",
          card: "#18181b",
          border: "#27272a",
          sidebar: "#09090b",
          hover: "#27272a",
          input: "#09090b",
          active: "#3f3f46",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        display: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 6px rgba(15, 23, 42, 0.04)",
        panel: "0 10px 15px rgba(15, 23, 42, 0.08), 0 20px 25px rgba(15, 23, 42, 0.06)",
        "dark-sm": "0 1px 2px rgba(0, 0, 0, 0.3)",
        "dark-md": "0 4px 6px rgba(0, 0, 0, 0.4)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.9" },
        },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        glow: "glow 3.5s ease-in-out infinite",
        slideUp: "slideUp 0.6s ease-out",
      },
    },
  },
  plugins: [],
};
