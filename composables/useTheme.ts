type ThemeMode = "light" | "dark";

export const useTheme = () => {
  const theme = useState<ThemeMode>("theme", () => "light");

  const setTheme = (mode: ThemeMode) => {
    theme.value = mode;
    if (process.client) {
      localStorage.setItem("theme", mode);
      document.documentElement.classList.toggle("dark", mode === "dark");
    }
  };

  const toggleTheme = () => {
    setTheme(theme.value === "dark" ? "light" : "dark");
  };

  return { theme, setTheme, toggleTheme };
};
