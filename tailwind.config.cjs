/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      colors: {
        brand: { DEFAULT: "#2563eb", 50: "#eff6ff", 100: "#dbeafe", 600: "#2563eb", 700: "#1d4ed8" },
        leaf: "#16a34a",
        amber: "#f59e0b"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(2,6,23,0.08)",
        pill: "0 6px 18px rgba(37,99,235,0.18)"
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(60% 60% at 20% 10%, rgba(37,99,235,.20) 0%, rgba(16,185,129,.18) 35%, rgba(255,255,255,0) 70%), radial-gradient(40% 40% at 90% 20%, rgba(245,158,11,.18) 0%, rgba(255,255,255,0) 70%)"
      }
    }
  },
  plugins: []
};
