/**
 * CookieBanner.tsx — Bannière de consentement aux cookies
 * Conforme à la directive ePrivacy (2002/58/CE) et au RGPD (UE 2016/679)
 * Mémorise le choix via localStorage — JS-Innov.IA / Miss & Mister Dour 2026
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Cookie, X, ChevronDown, ChevronUp, Shield, BarChart2, Settings } from "lucide-react";

const STORAGE_KEY = "mmd_cookie_consent";
const STORAGE_VERSION = "1"; // Incrémenter si les catégories changent

export interface CookieConsent {
  version: string;
  timestamp: number;
  necessary: true;        // Toujours true — cookies techniques obligatoires
  analytics: boolean;     // Cookies d'analyse (si activés à l'avenir)
  marketing: boolean;     // Cookies marketing (si activés à l'avenir)
  decided: boolean;       // L'utilisateur a fait un choix explicite
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
    const parsed: CookieConsent = JSON.parse(raw);
    if (parsed.version !== STORAGE_VERSION) return DEFAULT_CONSENT;
    return parsed;
  } catch {
    return DEFAULT_CONSENT;
  }
}

function saveConsent(consent: Omit<CookieConsent, "timestamp" | "version">): void {
  const full: CookieConsent = {
    ...consent,
    version: STORAGE_VERSION,
    timestamp: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = useCookieConsent();
    if (!consent.decided) {
      // Petit délai pour ne pas bloquer le rendu initial
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true, decided: true });
    setVisible(false);
  };

  const handleRejectAll = () => {
    saveConsent({ necessary: true, analytics: false, marketing: false, decided: true });
    setVisible(false);
  };

  const handleSavePreferences = () => {
    saveConsent({ necessary: true, analytics, marketing, decided: true });
    setVisible(false);
  };

  return (
    <>
      {/* Overlay semi-transparent */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
      />

      {/* Bannière */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
        style={{ animation: "slideUp 0.4s ease-out" }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .cookie-toggle {
            position: relative;
            display: inline-flex;
            align-items: center;
            cursor: pointer;
          }
          .cookie-toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
          .cookie-slider {
            width: 44px; height: 24px; border-radius: 12px;
            transition: background .2s;
            display: flex; align-items: center; padding: 2px;
          }
          .cookie-slider::after {
            content: '';
            width: 20px; height: 20px; border-radius: 50%;
            background: white;
            transition: transform .2s;
            box-shadow: 0 1px 3px rgba(0,0,0,.3);
          }
          .cookie-toggle input:checked + .cookie-slider { background: #C87941; }
          .cookie-toggle input:checked + .cookie-slider::after { transform: translateX(20px); }
          .cookie-toggle input:not(:checked) + .cookie-slider { background: rgba(255,255,255,.2); }
          .cookie-toggle input:disabled + .cookie-slider { opacity: .5; cursor: not-allowed; }
        `}</style>

        <div
          className="max-w-4xl mx-auto rounded-2xl border overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0D0D14 0%, #12101A 100%)",
            borderColor: "rgba(200,121,65,0.35)",
            boxShadow: "0 -4px 40px rgba(200,121,65,0.12), 0 0 0 1px rgba(200,121,65,0.08)",
          }}
        >
          {/* En-tête */}
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(200,121,65,0.15)", border: "1px solid rgba(200,121,65,0.3)" }}
              >
                <Cookie className="w-5 h-5" style={{ color: "#C87941" }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h2 className="text-white font-semibold text-base" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Gestion des cookies
                  </h2>
                  <button
                    onClick={handleRejectAll}
                    className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
                    aria-label="Refuser et fermer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  La plateforme <strong className="text-white">Miss & Mister Dour</strong> utilise uniquement des cookies
                  techniques nécessaires au fonctionnement du site (authentification, session, préférences d'affichage).
                  Ces cookies ne collectent aucune donnée à des fins publicitaires ou de traçage commercial.
                  Conformément à la directive ePrivacy et au RGPD, votre choix est mémorisé.{" "}
                  <Link href="/legal/privacy" className="underline" style={{ color: "#C87941", textUnderlineOffset: "2px" }}>
                      Politique de confidentialité
                    </Link>
                </p>
              </div>
            </div>

            {/* Bouton personnaliser */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Personnaliser les préférences
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Panneau de personnalisation */}
          {expanded && (
            <div
              className="px-5 sm:px-6 pb-4 border-t"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}
            >
              <div className="pt-4 space-y-3">

                {/* Cookies nécessaires — toujours actifs */}
                <div className="flex items-start justify-between gap-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(200,121,65,0.12)" }}>
                      <Shield className="w-4 h-4" style={{ color: "#C87941" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Cookies nécessaires</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        Authentification, session utilisateur, préférences d'affichage, sécurité CSRF.
                        Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés.
                      </p>
                    </div>
                  </div>
                  <label className="cookie-toggle flex-shrink-0 mt-1">
                    <input type="checkbox" checked disabled readOnly />
                    <span className="cookie-slider" />
                  </label>
                </div>

                {/* Cookies analytiques */}
                <div className="flex items-start justify-between gap-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(100,100,200,0.12)" }}>
                      <BarChart2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Cookies analytiques</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        Mesure d'audience anonymisée (pages visitées, durée de session). Ces données nous aident
                        à améliorer la plateforme. Aucune donnée personnelle identifiable n'est collectée.
                      </p>
                    </div>
                  </div>
                  <label className="cookie-toggle flex-shrink-0 mt-1">
                    <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
                    <span className="cookie-slider" />
                  </label>
                </div>

                {/* Cookies marketing */}
                <div className="flex items-start justify-between gap-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(196,94,106,0.12)" }}>
                      <Cookie className="w-4 h-4" style={{ color: "#C45E6A" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Cookies marketing</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        Personnalisation de contenu et suivi des campagnes de communication de l'événement.
                        Ces cookies ne sont actuellement pas utilisés sur cette plateforme.
                      </p>
                    </div>
                  </div>
                  <label className="cookie-toggle flex-shrink-0 mt-1">
                    <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
                    <span className="cookie-slider" />
                  </label>
                </div>
              </div>

              <button
                onClick={handleSavePreferences}
                className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium text-white border transition-all"
                style={{ borderColor: "rgba(200,121,65,0.4)", background: "rgba(200,121,65,0.08)" }}
              >
                Enregistrer mes préférences
              </button>
            </div>
          )}

          {/* Boutons principaux */}
          <div
            className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 border-t"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <button
              onClick={handleRejectAll}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-300 border border-gray-700 hover:border-gray-500 hover:text-white transition-all"
            >
              Refuser les cookies optionnels
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #C87941 0%, #D4AF37 100%)",
                boxShadow: "0 2px 12px rgba(200,121,65,0.35)",
              }}
            >
              Tout accepter
            </button>
          </div>

          {/* Pied de bannière */}
          <div className="px-5 sm:px-6 py-3 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            <p className="text-xs text-gray-600">
              JS-Innov.IA · BE0877926214 · Dour, Belgique
            </p>
            <div className="flex gap-3">
              <Link href="/legal/privacy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Confidentialité</Link>
              <Link href="/legal/cookies" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Cookies</Link>
              <Link href="/mentions-legales" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Mentions légales</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
