import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";

import { Download, Image, Mail, FileText, Copyright, Newspaper } from "lucide-react";
import { BRANDING } from "@/config/branding";

export default function Press() {
  const pressContact = {
    email: "presse@miss-mister-dour.be",
    phone: "+32 123 456 789",
    name: "Service Communication - Miss & Mister Dour"
  };

  const pressKit = [
    {
      title: "Logo Officiel (PNG)",
      description: "Logo haute résolution avec transparence",
      size: "1.8 MB",
      icon: Image,
      downloadUrl: BRANDING.logoIdentity
    },
    {
      title: "Dossier de Presse 2026",
      description: "Présentation complète de l'événement",
      size: "2.5 MB",
      icon: FileText,
      downloadUrl: "#" // À remplacer par URL réelle
    },
    {
      title: "Photos Officielles",
      description: "Galerie haute résolution (couronnement 2025)",
      size: "15 MB",
      icon: Image,
      downloadUrl: "/galleries" // Lien vers galeries
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <SEOHead
        title="Espace Presse — Miss & Mister Dour 2026"
        description="Espace presse officiel de Miss & Mister Dour 2026. Communiqués, photos HD, accréditations et contacts presse pour les journalistes."
        url="https://missetmisterdour.be/press"
        tags={["presse Miss Dour", "communiqué presse", "accréditation journaliste Dour"]}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/80 border-b border-gold/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img
                src={BRANDING.logoIdentity}
                alt="Logo officiel Miss & Mister Dour 2026"
                className="h-14 max-[640px]:h-10 object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                loading="eager"
              />
            </a>
          </Link>
          <Link href="/">
            <a className="text-gold hover:text-gold/80 transition-colors font-medium">
              Retour à l'accueil
            </a>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Newspaper className="w-16 h-16 mx-auto mb-6 text-gold animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
            Espace Presse
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Ressources officielles pour les médias et journalistes
          </p>
        </div>
      </section>

      {/* Press Kit */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gold mb-8 flex items-center gap-3">
              <Download className="w-8 h-8" />
              Kit Presse
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {pressKit.map((item, index) => (
                <a
                  key={index}
                  href={item.downloadUrl}
                  download
                  className="bg-gray-800/50 border border-gold/20 rounded-lg p-6 hover:border-gold/40 hover:bg-gray-800/70 transition-all group"
                >
                  <item.icon className="w-12 h-12 text-gold mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{item.size}</span>
                    <Download className="w-5 h-5 text-gold group-hover:translate-y-1 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Logos Officiels */}
      <section className="py-16 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gold mb-8 flex items-center gap-3">
              <Image className="w-8 h-8" />
              Logos Officiels
            </h2>
            <div className="bg-gray-800/50 border border-gold/20 rounded-lg p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="bg-black/50 rounded-lg p-8 mb-4">
                    <img
                      src={BRANDING.logoIdentity}
                      alt="Logo Miss & Mister Dour - Fond noir"
                      className="h-32 mx-auto object-contain"
                    />
                  </div>
                  <p className="text-gray-400 text-sm">Logo sur fond noir</p>
                  <a
                    href={BRANDING.logoIdentity}
                    download
                    className="inline-flex items-center gap-2 mt-2 text-gold hover:text-gold/80 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger PNG
                  </a>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-lg p-8 mb-4">
                    <img
                      src={BRANDING.logoIdentity}
                      alt="Logo Miss & Mister Dour - Fond blanc"
                      className="h-32 mx-auto object-contain"
                    />
                  </div>
                  <p className="text-gray-400 text-sm">Logo sur fond blanc</p>
                  <a
                    href={BRANDING.logoIdentity}
                    download
                    className="inline-flex items-center gap-2 mt-2 text-gold hover:text-gold/80 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger PNG
                  </a>
                </div>
              </div>
              <div className="mt-8 p-4 bg-gold/10 border border-gold/30 rounded-lg">
                <p className="text-sm text-gray-300">
                  <Copyright className="w-4 h-4 inline mr-2 text-gold" />
                  Les logos sont la propriété exclusive de Miss & Mister Dour. 
                  Toute utilisation commerciale non autorisée est strictement interdite.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Presse */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gold mb-8 flex items-center gap-3">
              <Mail className="w-8 h-8" />
              Contact Presse
            </h2>
            <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-lg p-8">
              <p className="text-gray-300 mb-6">
                Pour toute demande d'interview, accréditation presse, ou information complémentaire, 
                contactez notre service communication :
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gold" />
                  <a
                    href={`mailto:${pressContact.email}`}
                    className="text-gold hover:text-gold/80 transition-colors font-medium"
                  >
                    {pressContact.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">📞</span>
                  <a
                    href={`tel:${pressContact.phone}`}
                    className="text-gold hover:text-gold/80 transition-colors font-medium"
                  >
                    {pressContact.phone}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-400">👤</span>
                  <span className="text-gray-300">{pressContact.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Copyright */}
      <section className="py-16 bg-gradient-to-b from-transparent to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gold mb-8 flex items-center gap-3">
              <Copyright className="w-8 h-8" />
              Mentions Copyright
            </h2>
            <div className="bg-gray-800/50 border border-gold/20 rounded-lg p-8">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed mb-4">
                  <strong className="text-gold">© 2026 Miss & Mister Dour</strong> - Tous droits réservés.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Les contenus (textes, images, vidéos, logos) présents sur ce site sont la propriété 
                  exclusive de Miss & Mister Dour et de ses partenaires. Toute reproduction, 
                  distribution ou utilisation commerciale sans autorisation préalable est strictement interdite.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  <strong className="text-gold">Usage autorisé pour la presse :</strong>
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
                  <li>Utilisation des logos et photos officiels dans le cadre d'articles de presse</li>
                  <li>Citation des textes avec mention de la source "Miss & Mister Dour"</li>
                  <li>Partage sur réseaux sociaux avec crédit visible</li>
                </ul>
                <p className="text-gray-300 leading-relaxed">
                  <strong className="text-gold">Plateforme développée par :</strong> 
                  <a href="https://jsinnovia.com" className="text-gold hover:text-gold/80 ml-2">
                    JS-Innov.IA
                  </a> - Pagin Julien
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gold mb-6">Besoin d'informations supplémentaires ?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Notre équipe est à votre disposition pour répondre à toutes vos questions.
          </p>
          <a
            href={`mailto:${pressContact.email}`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-black font-bold rounded-lg hover:bg-gold/90 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Contacter la Presse
          </a>
        </div>
      </section>
    </div>
  );
}
