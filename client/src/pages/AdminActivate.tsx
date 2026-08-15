import { useState } from "react";
import { useLocation } from "wouter";

export default function AdminActivate() {
  const [, setLocation] = useLocation();
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/bootstrap-admin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, email: "info@jsinnovia.store", password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Activation impossible");
      setLocation("/admin"); window.location.reload();
    } catch (e) { setError(e instanceof Error ? e.message : "Activation impossible"); }
    finally { setBusy(false); }
  }

  return <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-yellow-500/40 bg-gray-950 p-8 space-y-5">
      <h1 className="text-3xl font-bold text-yellow-400">Activer votre cockpit</h1>
      <p className="text-gray-400">Compte propriétaire : info@jsinnovia.store</p>
      <label className="block">Nouveau mot de passe
        <input type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} minLength={12} required className="mt-2 w-full rounded-lg bg-gray-900 border border-gray-700 p-3" />
      </label>
      <label className="block">Confirmer le mot de passe
        <input type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} minLength={12} required className="mt-2 w-full rounded-lg bg-gray-900 border border-gray-700 p-3" />
      </label>
      <p className="text-xs text-gray-500">12 caractères minimum, avec majuscule, minuscule et chiffre.</p>
      {error && <p className="text-red-400">{error}</p>}
      <button disabled={busy || !token} className="w-full rounded-lg bg-yellow-500 text-black font-bold p-3 disabled:opacity-50">{busy ? "Activation…" : "Activer et ouvrir le dashboard"}</button>
    </form>
  </div>;
}
