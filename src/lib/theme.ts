export function getInitialTheme(): "dark" | "light" {
  return localStorage.getItem("theme") === "dark" ? "dark" : "light";
}

export function applyTheme(t: "dark" | "light") {
  const root = document.documentElement;
  if (t === "dark") {
    root.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    root.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}
