import { useState } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("info@jsinnovia.store");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Connexion impossible");
      setLocation(data.role === "admin" || data.role === "super_admin" ? "/admin" : "/dashboard");
      window.location.reload();
    } catch (e) { setError(e instanceof Error ? e.message : "Connexion impossible"); }
    finally { setBusy(false); }
  }

  return <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-yellow-500/40 bg-gray-950 p-8 space-y-5">
      <h1 className="text-3xl font-bold text-yellow-400">Cockpit administrateur</h1>
      <p className="text-gray-400">Miss & Mister Dour — JS-Innov.IA</p>
      <label className="block">Adresse email
        <input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required className="mt-2 w-full rounded-lg bg-gray-900 border border-gray-700 p-3" />
      </label>
      <label className="block">Mot de passe
        <input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required className="mt-2 w-full rounded-lg bg-gray-900 border border-gray-700 p-3" />
      </label>
      {error && <p className="text-red-400">{error}</p>}
      <button disabled={busy} className="w-full rounded-lg bg-yellow-500 text-black font-bold p-3 disabled:opacity-50">{busy ? "Connexion…" : "Se connecter"}</button>
    </form>
  </div>;
}
