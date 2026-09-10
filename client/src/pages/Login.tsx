import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, LogIn, Mail, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { BRANDING } from "@/config/branding";
import { SEOHead } from "@/components/SEOHead";

function safeReturnPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (value.startsWith("/login")) return null;
  return value;
}

function defaultPathForRole(role?: string) {
  switch (role) {
    case "super_admin":
    case "admin":
      return "/admin";
    case "staff":
    case "organizer":
      return "/choreographer";
    case "photographer":
      return "/photographer";
    case "candidate":
      return "/dashboard";
    case "press":
      return "/press";
    default:
      return "/";
  }
}

export default function Login() {
  const returnPath = useMemo(() => {
    if (typeof window === "undefined") return null;
    return safeReturnPath(new URLSearchParams(window.location.search).get("returnTo"));
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Connexion impossible.");

      const destination = returnPath || defaultPathForRole(data.role);
      window.location.assign(destination);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mmd-login-page">
      <SEOHead
        title="Connexion — Miss & Mister Dour"
        description="Accès sécurisé aux espaces Miss & Mister Dour."
        url="https://missetmisterdour.be/login"
        noindex
      />

      <div className="mmd-login-glow" aria-hidden="true" />
      <Link href="/" className="mmd-login-back"><ArrowLeft /> Retour au site</Link>

      <main className="mmd-login-layout">
        <section className="mmd-login-brand-panel">
          <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" />
          <span>ESPACE SÉCURISÉ · ÉDITION 2027</span>
          <h1>Votre espace.<br /><em>Votre aventure.</em></h1>
          <p>Administration, équipe, photographes et candidats accèdent ici à leur environnement selon leurs droits.</p>
          <div className="mmd-login-security"><ShieldCheck /><div><strong>Connexion sécurisée</strong><small>Session protégée et accès contrôlé par rôle.</small></div></div>
        </section>

        <section className="mmd-login-form-panel">
          <form onSubmit={submit} className="mmd-login-card">
            <div className="mmd-login-card-head"><LogIn /><div><small>CONNEXION</small><h2>Accéder à mon espace</h2></div></div>

            <label>
              <span>Adresse email</span>
              <div className="mmd-login-field"><Mail /><input type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} placeholder="vous@exemple.be" required autoFocus /></div>
            </label>

            <label>
              <span>Mot de passe</span>
              <div className="mmd-login-field"><LockKeyhole /><input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{showPassword ? <EyeOff /> : <Eye />}</button></div>
            </label>

            {error && <div className="mmd-login-error" role="alert">{error}</div>}

            <button type="submit" className="mmd-login-submit" disabled={busy}>{busy ? "Connexion…" : <>Se connecter <LogIn /></>}</button>
            <p className="mmd-login-help">Vous n’avez plus accès à votre mot de passe ? <Link href="/contact">Contactez l’organisation</Link>.</p>
          </form>
        </section>
      </main>
    </div>
  );
}
