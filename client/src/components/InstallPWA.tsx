import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallPWA() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    if (standalone) { setInstalled(true); return; }
    const onPrompt = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPromptEvent); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (installed) return null;
  const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  const install = async () => {
    if (prompt) { await prompt.prompt(); const choice = await prompt.userChoice; if (choice.outcome === 'accepted') setInstalled(true); setPrompt(null); return; }
    if (isiOS) setShowIOS(true);
  };

  return <>
    <button className="mmd-install-app" type="button" onClick={install} aria-label="Installer Miss & Mister Dour sur ce téléphone"><Download/> <span>Installer l’app</span></button>
    {showIOS && <div className="mmd-ios-install" role="dialog" aria-modal="true" aria-label="Installer sur iPhone">
      <button className="mmd-ios-close" onClick={()=>setShowIOS(false)} aria-label="Fermer"><X/></button>
      <div className="mmd-ios-icon"><Download/></div><strong>Installer sur votre iPhone</strong>
      <p>Dans Safari, touchez <Share/> <b>Partager</b>, puis choisissez <b>Sur l’écran d’accueil</b> et confirmez avec <b>Ajouter</b>.</p>
    </div>}
  </>;
}
