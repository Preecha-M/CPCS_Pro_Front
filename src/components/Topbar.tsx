import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../auth/AuthContext";

export default function Topbar() {
  const loc = useLocation();
  const nav = useNavigate();
  const path = loc.pathname;

  const { user, logout } = useAuth();

  const linkCls = (href: string) =>
    "px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 " +
    (path === href ? "bg-brand text-white shadow-pill hover:bg-brand" : "");

  async function onLogout() {
    await logout();
    nav("/login");
  }

  return (
    <header className="sticky top-0 z-[2000] border-b border-gray-100 dark:border-white/10 bg-white/70 dark:bg-gray-950/60 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-brand"></span>
          RiceCare
        </Link>

        <div className="flex items-center gap-3">
          <nav className="text-sm flex items-center gap-1">
            {user ? (
              <>
                <Link to="/admin" className={linkCls("/admin")}>Dashboard</Link>
                {user.role === "admin" ? (
                  <Link to="/register" className={linkCls("/register")}>Register</Link>
                ) : null}
              </>
            ) : null}

            <Link to="/guide" className={linkCls("/guide")}>Guide</Link>
            <Link to="/" className={linkCls("/")}>Home</Link>
          </nav>

          {user ? (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 dark:hover:bg-white/10"
              title={`Signed in as ${user.username} (${user.role})`}
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 dark:hover:bg-white/10">
              Login
            </Link>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
