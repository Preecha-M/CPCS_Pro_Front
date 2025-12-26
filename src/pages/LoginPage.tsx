import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import SiteLayout from "../components/layouts/SiteLayout";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      await login(username, password);
      nav(loc.state?.from || "/admin", { replace: true });
    } catch (ex: any) {
      setErr(ex?.message || "Login failed");
    }
  }

  return (
    <SiteLayout showTopbar={false} footerVariant="minimal">

    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Login</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-950"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-950"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err ? <div className="text-sm text-red-600">{err}</div> : null}
        <button className="w-full rounded-lg px-3 py-2 bg-brand text-white">Sign in</button>
      </form>

      <div className="text-sm mt-4 opacity-80">
        <Link to="/">Back to Home</Link>
      </div>
    </div>
    </SiteLayout>

  );
}
