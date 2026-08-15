import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Cloud, CheckCircle2, AlertCircle, FolderSync, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Status = {
  configured: boolean;
  connected: boolean;
  accountName?: string | null;
  accountEmail?: string | null;
  sourceFolder?: string;
  lastSyncAt?: string | null;
  lastSyncStatus?: string;
  lastSyncMessage?: string | null;
  redirectUri?: string;
};

export default function AdminDropbox() {
  const [status, setStatus] = useState<Status | null>(null);
  const [folder, setFolder] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch("/api/integrations/dropbox/status", { credentials: "include" });
    const data = await response.json();
    setStatus(data);
    setFolder(data.sourceFolder || "");
  }

  useEffect(() => { load().catch(() => setMessage("Impossible de lire l’état Dropbox")); }, []);

  async function saveFolder() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/integrations/dropbox/folder", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Enregistrement impossible");
      setMessage("Dossier source enregistré. La synchronisation média pourra utiliser ce chemin.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Enregistrement impossible");
    } finally { setBusy(false); }
  }

  return <DashboardLayout>
    <div className="container max-w-5xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3"><Cloud className="text-blue-500" /> Dropbox officiel</h1>
        <p className="text-muted-foreground mt-2">Connectez le Dropbox contenant les photos et vidéos officielles de Miss & Mister Dour.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status?.connected ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-amber-500" />}
            Connexion
          </CardTitle>
          <CardDescription>Accessible uniquement aux administrateurs et super administrateurs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status ? <p>Vérification…</p> : !status.configured ? <>
            <p className="text-amber-600">L’application Dropbox doit encore être configurée dans Railway.</p>
            <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
              <p><strong>URI de redirection à déclarer dans Dropbox :</strong></p>
              <code className="block break-all">{status.redirectUri}</code>
              <p>Variables requises : DROPBOX_APP_KEY, DROPBOX_APP_SECRET et DROPBOX_TOKEN_ENCRYPTION_KEY.</p>
            </div>
          </> : status.connected ? <>
            <div className="rounded-lg border p-4">
              <p className="font-semibold">{status.accountName || "Compte Dropbox connecté"}</p>
              <p className="text-sm text-muted-foreground">{status.accountEmail}</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="dropbox-folder" className="font-medium">Dossier média officiel</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input id="dropbox-folder" value={folder} onChange={e => setFolder(e.target.value)}
                  placeholder="/Miss Mister Dour/2026/Officiel"
                  className="flex-1 rounded-md border bg-background px-3 py-2" />
                <Button onClick={saveFolder} disabled={busy || !folder.startsWith("/")}>
                  <FolderSync className="w-4 h-4 mr-2" /> Enregistrer
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Le chemin doit commencer par /. Les originaux resteront dans Dropbox.</p>
            </div>
          </> : <Button onClick={() => { window.location.href = "/api/integrations/dropbox/start"; }}>
            <Cloud className="w-4 h-4 mr-2" /> Connecter Dropbox
          </Button>}
          {message && <p className="text-sm">{message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="text-green-500" /> Protection prévue</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 text-sm">
          <p>✓ Jetons OAuth chiffrés côté serveur</p><p>✓ Originaux Dropbox non exposés</p>
          <p>✓ Accès admin et super-admin uniquement</p><p>✓ Dossier source configurable</p>
          <p>✓ Base prête pour le curseur de synchronisation</p><p>✓ Journal du dernier import</p>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>;
}
