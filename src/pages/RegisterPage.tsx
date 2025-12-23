import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function RegisterPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    affiliation: "",
    role: "researcher" as "admin" | "researcher",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Register failed (${res.status})`);
      }
      setMsg("Created user successfully");
      setForm({
        username: "",
        password: "",
        name: "",
        email: "",
        phone: "",
        affiliation: "",
        role: "researcher",
      });
    } catch (ex: any) {
      setErr(ex?.message || "Register failed");
    }
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-xl font-semibold">Register</h1>
        <div className="mt-2 text-sm text-red-600">Admin only.</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Register Member (Admin only)</h1>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="border rounded-lg px-3 py-2" placeholder="Username"
          value={form.username} onChange={(e)=>setForm({...form, username:e.target.value})}/>
        <input className="border rounded-lg px-3 py-2" placeholder="Password" type="password"
          value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})}/>
        <input className="border rounded-lg px-3 py-2" placeholder="Name"
          value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})}/>
        <input className="border rounded-lg px-3 py-2" placeholder="Email"
          value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})}/>
        <input className="border rounded-lg px-3 py-2" placeholder="Phone"
          value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})}/>
        <input className="border rounded-lg px-3 py-2" placeholder="Affiliation"
          value={form.affiliation} onChange={(e)=>setForm({...form, affiliation:e.target.value})}/>

        <select className="border rounded-lg px-3 py-2"
          value={form.role} onChange={(e)=>setForm({...form, role:e.target.value as any})}>
          <option value="admin">admin</option>
          <option value="researcher">researcher</option>
        </select>

        <button className="md:col-span-2 rounded-lg px-3 py-2 bg-brand text-white">Create</button>

        {err ? <div className="md:col-span-2 text-sm text-red-600">{err}</div> : null}
        {msg ? <div className="md:col-span-2 text-sm text-green-600">{msg}</div> : null}
      </form>
    </div>
  );
}
