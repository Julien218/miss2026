import { Link } from "wouter";
import { Cookie } from "lucide-react";
import { BRANDING } from "@/config/branding";

export default function LegalCookies() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/80 border-b border-gold/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src={BRANDING.logoIdentity} alt="Logo officiel Miss & Mister Dour 2026" className="h-14 max-[640px]:h-10 object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" loading="eager" />
            </a>
          </Link>
          <Link href="/"><a className="text-gold hover:text-gold/80 transition-colors font-medium">Retour à l'accueil</a></Link>
        </div>
      </header>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Cookie className="w-16 h-16 mx-auto mb-6 text-gold" />
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
            Politique Cookies
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">Dernière mise à jour : 16 février 2026</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto prose prose-invert prose-lg">
          <div className="bg-gray-800/50 border border-gold/20 rounded-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gold mb-4">1. Qu'est-ce qu'un Cookie ?</h2>
            <p className="text-gray-300 leading-relaxed">
              Un cookie est un petit fichier texte déposé sur votre appareil lors de votre visite sur notre site. 
              Il permet de mémoriser vos préférences et d'améliorer votre expérience de navigation.
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gold/20 rounded-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gold mb-4">2. Cookies Utilisés</h2>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gold mb-3">2.1 Cookies Essentiels (Obligatoires)</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                Ces cookies sont nécessaires au fonctionnement de la Plateforme et ne peuvent pas être désactivés.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong className="text-gold">Session utilisateur :</strong> Maintien de votre connexion (JWT)</li>
                <li><strong className="text-gold">Sécurité :</strong> Protection contre les attaques CSRF</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gold mb-3">2.2 Cookies Analytiques</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                Ces cookies nous aident à comprendre comment vous utilisez la Plateforme.
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong className="text-gold">Manus Analytics :</strong> Statistiques de visite (pages vues, durée, origine)</li>
                <li><strong className="text-gold">Durée :</strong> 13 mois</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gold mb-3">2.3 Cookies de Préférences</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                Ces cookies mémorisent vos choix (langue, thème, etc.).
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong className="text-gold">Thème :</strong> Mémorisation du thème clair/sombre</li>
                <li><strong className="text-gold">Langue :</strong> Préférence linguistique</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gold/20 rounded-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gold mb-4">3. Gestion des Cookies</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Vous pouvez gérer vos préférences de cookies à tout moment :
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li><strong className="text-gold">Via votre navigateur :</strong> Paramètres &gt; Confidentialité &gt; Cookies</li>
              <li><strong className="text-gold">Via notre bannière :</strong> Cliquez sur "Gérer les cookies" en bas de page</li>
            </ul>
            <p className="text-gray-300 leading-relaxed">
              ⚠️ Attention : La désactivation de certains cookies peut affecter le fonctionnement de la Plateforme.
            </p>
          </div>

          <div className="bg-gray-800/50 border border-gold/20 rounded-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gold mb-4">4. Cookies Tiers</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Certains services tiers peuvent déposer des cookies :
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong className="text-gold">Manus OAuth :</strong> Authentification (cookies de session)</li>
              <li><strong className="text-gold">CDN :</strong> Livraison de contenu optimisée</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 border border-gold/20 rounded-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gold mb-4">5. Durée de Conservation</h2>
            <p className="text-gray-300 leading-relaxed">
              Les cookies sont conservés pour une durée maximale de 13 mois, conformément aux recommandations de la CNIL.
            </p>
          </div>

          <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-gold mb-4">6. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              Pour toute question sur notre utilisation des cookies : 
              <a href="mailto:privacy@miss-mister-dour.be" className="text-gold hover:text-gold/80 ml-2">
                privacy@miss-mister-dour.be
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
