import { FormEvent, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail, Shield, UserRound, XCircle } from "lucide-react";

const roleLabels: Record<string, string> = {
  admin: "Administrateur",
  directeur: "Directeur",
  manager: "Manager",
  photographe: "Photographe",
  candidat: "Candidat",
  jury: "Jury",
  viewer: "Observateur",
};

function destinationForRole(role?: string) {
  switch (role) {
    case "admin":
    case "super_admin": return "/admin";
    case "organizer":
    case "staff": return "/choreographer";
    case "photographer": return "/photographer";
    case "candidate": return "/dashboard";
    case "press": return "/press";
    default: return "/";
  }
}

export default function AcceptInvitation() {
  const [, inviteParams] = useRoute("/invite/:token");
  const [, invitationParams] = useRoute("/invitation/:token");
  const [, setLocation] = useLocation();
  const token = inviteParams?.token || invitationParams?.token || "";

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const validation = trpc.invitations.validateToken.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const createAccount = trpc.invitations.createAccount.useMutation();

  const invitation = validation.data?.invitation;
  const loginUrl = useMemo(
    () => `/login?returnTo=${encodeURIComponent(`/invitation/${token}`)}`,
    [token]
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    if (password.length < 10) {
      setFormError("Le mot de passe doit contenir au moins 10 caractères.");
      return;
    }
    if (password !== confirmation) {
      setFormError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    try {
      const result = await createAccount.mutateAsync({ token, name: name.trim(), password });
      window.location.assign(destinationForRole(result.role));
    } catch (error: any) {
      setFormError(error?.message || "Impossible de créer le compte.");
    }
  }

  if (!token || validation.error) {
    return (
      <InvitationShell>
        <Status icon={<XCircle className="w-10 h-10 text-red-400" />} title="Invitation invalide">
          {validation.error?.message || "Le lien d’invitation est incomplet ou invalide."}
        </Status>
      </InvitationShell>
    );
  }

  if (validation.isLoading || !invitation) {
    return (
      <InvitationShell>
        <Status icon={<Loader2 className="w-10 h-10 text-amber-300 animate-spin" />} title="Vérification de l’invitation">
          Nous vérifions votre lien sécurisé…
        </Status>
      </InvitationShell>
    );
  }

  return (
    <InvitationShell>
      <div className="text-center mb-7">
        <div className="mx-auto mb-4 w-14 h-14 rounded-full border border-amber-300/40 bg-amber-300/10 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-amber-300" />
        </div>
        <p className="text-amber-300 tracking-[0.25em] text-xs font-semibold mb-2">MISS &amp; MISTER DOUR · ÉDITION 2027</p>
        <h1 className="text-3xl font-semibold text-white">Créer mes identifiants</h1>
        <p className="text-slate-400 mt-2">Votre invitation est valide. Choisissez maintenant votre mot de passe personnel.</p>
      </div>

      <div className="grid gap-3 mb-6">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <Mail className="w-5 h-5 text-amber-300" />
          <div><div className="text-xs text-slate-500">Adresse de connexion</div><div className="text-white">{invitation.email}</div></div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <Shield className="w-5 h-5 text-amber-300" />
          <div><div className="text-xs text-slate-500">Accès attribué</div><div className="text-white">{roleLabels[invitation.role] || invitation.role}</div></div>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-slate-300">Nom affiché</span>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3">
            <UserRound className="w-5 h-5 text-slate-500" />
            <input className="w-full bg-transparent py-3 text-white outline-none" value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={120} autoComplete="name" required autoFocus />
          </div>
        </label>

        <PasswordField label="Créer mon mot de passe" value={password} setValue={setPassword} visible={showPassword} toggle={() => setShowPassword(v => !v)} autoComplete="new-password" />
        <PasswordField label="Confirmer mon mot de passe" value={confirmation} setValue={setConfirmation} visible={showPassword} toggle={() => setShowPassword(v => !v)} autoComplete="new-password" />

        <p className="text-xs text-slate-500">Minimum 10 caractères. Votre mot de passe n’est jamais envoyé par e-mail et est enregistré sous forme de hash sécurisé.</p>
        {formError && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{formError}</div>}

        <button type="submit" disabled={createAccount.isPending} className="w-full rounded-xl bg-amber-300 px-5 py-3.5 font-semibold text-slate-950 disabled:opacity-60">
          {createAccount.isPending ? "Création du compte…" : "Créer mon compte"}
        </button>
      </form>

      <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-slate-500">
        Vous avez déjà créé votre compte ?{" "}
        <button type="button" className="text-amber-300 hover:underline" onClick={() => setLocation(loginUrl)}>Se connecter</button>
      </div>
    </InvitationShell>
  );
}

function PasswordField({ label, value, setValue, visible, toggle, autoComplete }: { label: string; value: string; setValue: (v: string) => void; visible: boolean; toggle: () => void; autoComplete: string }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3">
        <LockKeyhole className="w-5 h-5 text-slate-500" />
        <input className="w-full bg-transparent py-3 text-white outline-none" type={visible ? "text" : "password"} value={value} onChange={e => setValue(e.target.value)} minLength={10} maxLength={512} autoComplete={autoComplete} required />
        <button type="button" onClick={toggle} className="text-slate-500" aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
      </div>
    </label>
  );
}

function InvitationShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080706] via-[#17100b] to-[#080706] flex items-center justify-center p-4">
      <Card className="w-full max-w-xl border-amber-300/20 bg-[#11100f]/95 p-6 sm:p-8 shadow-2xl">{children}</Card>
    </div>
  );
}

function Status({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div className="py-8 text-center"><div className="flex justify-center mb-4">{icon}</div><h1 className="text-2xl font-semibold text-white">{title}</h1><p className="mt-2 text-slate-400">{children}</p></div>;
}
