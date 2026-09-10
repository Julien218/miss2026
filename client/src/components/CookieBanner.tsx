import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Cookie, Settings2, ShieldCheck, X } from "lucide-react";

const STORAGE_KEY = "mmd_cookie_consent";
const STORAGE_VERSION = "2";

export interface CookieConsent {
  version: string;
  timestamp: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decided: boolean;
}

const DEFAULT_CONSENT: CookieConsent = {
  version: STORAGE_VERSION,
  timestamp: 0,
  necessary: true,
  analytics: false,
  marketing: false,
  decided: false,
};

export function useCookieConsent(): CookieConsent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONSENT;
    const parsed = JSON.parse(raw) as CookieConsent;
    return parsed.version === STORAGE_VERSION ? parsed : DEFAULT_CONSENT;
  } catch {
    return DEFAULT_CONSENT;
  }
}

function saveNecessaryOnly() {
  const consent: CookieConsent = {
    version: STORAGE_VERSION,
    timestamp: Date.now(),
    necessary: true,
    analytics: false,
    marketing: false,
    decided: true,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);

  useEffect(() => {
    if (useCookieConsent().decided) return;
    const timer = window.setTimeout(() => setVisible(true), 650);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const close = () => {
    saveNecessaryOnly();
    setVisible(false);
  };

  return <div className="mmd-cookie-sheet" role="dialog" aria-label="Confidentialité et cookies">
    <button type="button" className="mmd-cookie-close" onClick={close} aria-label="Fermer"><X/></button>
    <div className="mmd-cookie-main">
      <div className="mmd-cookie-icon"><Cookie/></div>
      <div>
        <strong>Confidentialité</strong>
        <p>Miss & Mister Dour utilise uniquement les données techniques nécessaires à la connexion, au brouillon du formulaire et au fonctionnement de la PWA.</p>
      </div>
    </div>

    {details && <div className="mmd-cookie-details">
      <div><ShieldCheck/><p><strong>Cookies techniques</strong><span>Session et sécurité des espaces connectés.</span></p></div>
      <div><Settings2/><p><strong>Stockage local</strong><span>Préférences, consentement et brouillon texte de candidature. Aucun cookie publicitaire n’est activé.</span></p></div>
      <Link href="/legal/cookies" onClick={() => setVisible(false)}>Lire la politique complète →</Link>
    </div>}

    <div className="mmd-cookie-actions">
      <button type="button" onClick={() => setDetails((value) => !value)} className="mmd-cookie-settings">{details ? "Masquer" : "Détails"}</button>
      <button type="button" onClick={close} className="mmd-cookie-continue">Continuer</button>
    </div>
  </div>;
}
