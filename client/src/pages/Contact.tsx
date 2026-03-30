import { Link } from "wouter";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { BRANDING } from "@/config/branding";
import { SEOHead } from "@/components/SEOHead";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter l'envoi du formulaire via tRPC
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = {
    email: "Olivier.trevis@outlook.be",
    phone: "+32 475 42 69 42",
    address: "Centre Sportif d'Elouges, Rue de la Tournelle 10, 7370 Elouges, Belgique"
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/80 border-b border-gold/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img
                src={BRANDING.logoIdentity}
                alt="Logo officiel Miss & Mister Dour 2026"
                className="h-14 max-[640px]:h-10 object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                loading="eager"
              />
            </Link>
          <Link href="/" className="text-gold hover:text-gold/80 transition-colors font-medium">
              Retour à l'accueil
            </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <MessageCircle className="w-16 h-16 mx-auto mb-6 text-gold animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
            Contactez-nous
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Une question ? Une demande de partenariat ? Nous sommes à votre écoute
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Formulaire */}
          <div>
            <h2 className="text-3xl font-bold text-gold mb-6">Envoyez-nous un message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 text-white"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 text-white"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Sujet *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 text-white"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="candidature">Candidature</option>
                  <option value="partenariat">Partenariat / Sponsoring</option>
                  <option value="presse">Demande presse</option>
                  <option value="technique">Question technique</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 text-white resize-none"
                  placeholder="Votre message..."
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gold text-black font-bold rounded-lg hover:bg-gold/90 transition-colors"
              >
                <Send className="w-5 h-5" />
                Envoyer le message
              </button>

              {submitted && (
                <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-center">
                  ✓ Message envoyé avec succès !
                </div>
              )}
            </form>
          </div>

          {/* Informations de contact */}
          <div>
            <h2 className="text-3xl font-bold text-gold mb-6">Informations de contact</h2>
            <div className="space-y-6">
              <div className="bg-gray-800/50 border border-gold/20 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white mb-2">Email</h3>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-gold hover:text-gold/80 transition-colors"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gold/20 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white mb-2">Téléphone</h3>
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="text-gold hover:text-gold/80 transition-colors"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gold/20 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-white mb-2">Adresse</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-lg p-6">
              <h3 className="font-bold text-gold mb-3">Horaires</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Notre équipe répond à vos messages du lundi au vendredi, de 9h à 18h. 
                Les demandes reçues en dehors de ces horaires seront traitées le jour ouvrable suivant.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Rapide */}
      <section className="py-16 bg-gradient-to-b from-transparent to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gold mb-8 text-center">Questions Fréquentes</h2>
            <div className="space-y-4">
              <details className="bg-gray-800/50 border border-gold/20 rounded-lg p-6 group">
                <summary className="font-bold text-white cursor-pointer hover:text-gold transition-colors">
                  Comment devenir candidat(e) ?
                </summary>
                <p className="text-gray-300 mt-4 leading-relaxed">
                  Rendez-vous sur notre <Link href="/inscription-candidat" className="text-gold hover:text-gold/80">page d'inscription</Link> 
                  pour soumettre votre candidature. Les inscriptions sont ouvertes jusqu'au 1er mars 2026.
                </p>
              </details>
              <details className="bg-gray-800/50 border border-gold/20 rounded-lg p-6 group">
                <summary className="font-bold text-white cursor-pointer hover:text-gold transition-colors">
                  Comment devenir sponsor ?
                </summary>
                <p className="text-gray-300 mt-4 leading-relaxed">
                  Consultez notre <Link href="/sponsors" className="text-gold hover:text-gold/80">page sponsors</Link> 
                  pour découvrir les différents packages disponibles, puis contactez-nous via ce formulaire.
                </p>
              </details>
              <details className="bg-gray-800/50 border border-gold/20 rounded-lg p-6 group">
                <summary className="font-bold text-white cursor-pointer hover:text-gold transition-colors">
                  Où se déroule l'événement ?
                </summary>
                <p className="text-gray-300 mt-4 leading-relaxed">
                  La soirée de couronnement aura lieu le 19 avril 2026 au Centre Sportif d'Elouges, 
                  Rue de la Tournelle 10, 7370 Elouges, Belgique.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
