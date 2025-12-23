import { useEffect, useState } from "react";
import { applyTheme, getInitialTheme } from "../lib/theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      className="relative w-16 h-8 rounded-full cursor-pointer transition-colors duration-500
                 bg-gradient-to-r from-sky-300 to-blue-500 dark:from-gray-700 dark:to-gray-900
                 ring-1 ring-black/5 dark:ring-white/10 shadow-soft overflow-hidden"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 hidden dark:block">
        <div className="w-full h-full bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:6px_6px] opacity-70"></div>
      </div>
      <div className="absolute inset-0 flex items-center px-2 gap-1 dark:hidden">
        <span className="block w-4 h-4 rounded-full bg-white/80 blur-[1px]"></span>
        <span className="block w-6 h-6 rounded-full bg-white/80 blur-[2px] -ml-1"></span>
        <span className="block w-5 h-5 rounded-full bg-white/80 blur-[1px] -ml-2"></span>
      </div>

      <div
        className={
          "absolute top-1 left-1 w-6 h-6 rounded-full shadow-md transition-all duration-500 flex items-center justify-center " +
          (theme === "dark" ? "translate-x-8 bg-gray-200" : "translate-x-0 bg-yellow-400")
        }
      >
        <span className="text-lg">{theme === "dark" ? "🌙" : "☀️"}</span>
      </div>
    </button>
  );
}
