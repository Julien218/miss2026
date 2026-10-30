import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

type Status = { enabled: boolean; connected: boolean; account: string; complete: number; pending: number; error?: string; errors?: unknown[] };
export function DropboxArchivePanel() {
  const { user } = useAuth();
  const allowed = Boolean(user && ["admin", "super_admin", "owner"].includes(user.role));
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState<{ attempt: string; url: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    if (!allowed) return;
    try {
      const response = await fetch("/api/admin/dropbox-archive", { credentials: "include" });
      if (!response.ok) throw new Error("État de l’archivage momentanément indisponible.");
      setStatus(await response.json());
    } catch (err) { setError(err instanceof Error ? err.message : "État indisponible."); }
  }, [allowed]);
  useEffect(() => { void load(); const timer = setInterval(() => void load(), 15_000); return () => clearInterval(timer); }, [load]);
  async function action(path: string, body: unknown = {}) {
    const response = await fetch(`/api/admin/dropbox-archive/${path}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error === "wrong_dropbox_account" ? "Utilisez le Dropbox d’Olivier Trevis." : "Connexion Dropbox impossible. Recommencez l’autorisation.");
    return result;
  }
  async function connect() {
    setBusy(true); setError("");
    try { setAttempt(await action("connect")); }
    catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  }
  async function finish() {
    if (!attempt) return;
    setBusy(true); setError("");
    try { await action("connect/complete", { attempt: attempt.attempt, code }); setCode(""); setAttempt(null); await load(); }
    catch (err) { setCode(""); setAttempt(null); setError((err as Error).message); }
    finally { setBusy(false); }
  }
  async function retry() {
    setBusy(true); setError("");
    try { await action("retry"); await load(); }
    catch { setError("La reprise de l’archivage a échoué. Les inscriptions restent conservées."); }
    finally { setBusy(false); }
  }
  if (!allowed) return null;
  return <section className="rounded-xl border border-white/15 bg-white/5 p-4 my-4" aria-label="Archivage Dropbox">
    <h2 className="font-semibold">Archivage automatique · Dropbox Olivier</h2>
    {status && <p className="text-sm mt-2">{status.enabled ? `${status.complete} dossier(s) confirmé(s) dans Dropbox · ${status.pending} en attente` : "L’archivage serveur est désactivé."}</p>}
    {status && !status.connected && <p className="text-sm text-amber-200 mt-2">La connexion au Dropbox d’Olivier doit être renouvelée. Les inscriptions restent enregistrées et seront reprises automatiquement.</p>}
    {status?.connected && (status.pending > 0 || Boolean(status.errors?.length)) && <p className="text-sm mt-2">Les transferts non confirmés sont repris automatiquement. Les fichiers d’origine sont conservés.</p>}
    {error && <p role="alert" className="text-sm text-amber-200 mt-2">{error}</p>}
    <div className="flex flex-wrap gap-2 mt-3">
      <Button variant="outline" disabled={busy} onClick={connect}>Reconnecter Dropbox Olivier</Button>
      <Button variant="outline" disabled={busy} onClick={retry}>Reprendre les transferts</Button>
    </div>
    {attempt && <div className="mt-4 space-y-3">
      <p className="text-sm">Ouvrez Dropbox, vérifiez le compte d’Olivier et autorisez l’archivage. Collez ensuite ici le code fourni par Dropbox.</p>
      <a href={attempt.url} target="_blank" rel="noopener noreferrer" className="underline">Ouvrir l’autorisation Dropbox</a>
      <label className="block text-sm">Code fourni par Dropbox<input type="password" autoComplete="off" value={code} onChange={event => setCode(event.target.value)} className="block w-full rounded border p-2 text-black" /></label>
      <Button disabled={busy || !code.trim()} onClick={finish}>Terminer la connexion Dropbox</Button>
    </div>}
  </section>;
}
