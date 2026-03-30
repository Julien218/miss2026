/**
 * Footer Component - Professional Footer with Starlight ASBL
 * 
 * Créé par JS-Innov.IA® (Pagin Julien) - Dour, Belgique
 * Partenaire technologique : JS-Innov.IA (jsinnovia.com)
 * © Tous droits réservés - Copie strictement interdite
 */

import { Link } from "wouter";
import { motion } from "framer-motion";
import { Facebook, Instagram, Twitter, Linkedin, Mail, MapPin, Phone } from "lucide-react";

// URLs CDN des logos
const LOGO_STARLIGHT = "https://files.manuscdn.com/user_upload_by_module/session_file/87304619/DcbUrojPWmqkTPJZ.png";
const LOGO_JS_INNOV = "https://d2xsxph8kpxj0f.cloudfront.net/87304619/fqSYuBaSqJ2z2N7q3F6MzD/Logo_JS-Innov.IA_EvoluTion_Autonome_02-26_85ca048d.png";
const LOGO_JY_TRIX = "https://d2xsxph8kpxj0f.cloudfront.net/87304619/fqSYuBaSqJ2z2N7q3F6MzD/LOGO_JY-Trix.IA_0f097003.jpeg";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black/95 text-white mt-auto">
      {/* Ligne dorée supérieure */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Colonne 1: Logo Starlight + À propos ASBL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <img 
              src={LOGO_STARLIGHT}
              alt="STARLIGHT ASBL" 
              className="h-16 w-auto mb-4"
            />
            <h3 className="text-lg font-bold mb-2 text-[#D4AF37]">STARLIGHT ASBL</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-2">
              Organisation de l'événement Miss & Mister Dour
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Grand'Place 9, 7370 Dour</p>
              <p>BCE: BE 1012.267.056</p>
            </div>
            <div className="flex gap-3 mt-4">
              <a
                href="https://www.facebook.com/people/Miss-et-Mister-Dour/61561536167250/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D4AF37] flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Page Facebook officielle Miss & Mister Dour"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D4AF37] flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Instagram Miss & Mister Dour"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D4AF37] flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Twitter Miss & Mister Dour"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D4AF37] flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="LinkedIn Miss & Mister Dour"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Colonne 2: Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-bold mb-4 text-[#D4AF37]">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/candidates" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  Candidats
                </Link>
              </li>
              <li>
                <Link href="/ranking" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  Classement
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  Presse
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Colonne 3: Mentions Légales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-bold mb-4 text-[#D4AF37]">Mentions Légales</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/mentions-legales" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/legal/cgu" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-gray-300 hover:text-[#D4AF37] transition-colors text-sm">
                  Cookies
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Colonne 4: Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-4 text-[#D4AF37]">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span>Grand'Place 9<br />7370 Dour, Belgique</span>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <Mail className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <a href="mailto:Olivier.trevis@outlook.be" className="hover:text-[#D4AF37] transition-colors">
                  Olivier.trevis@outlook.be
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <Phone className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <a href="tel:+32475426942" className="hover:text-[#D4AF37] transition-colors">
                  +32 475 42 69 42
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Section Partenaires & Sponsors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
          <h3 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-6">
            Partenaires Technologiques
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-10">
            {/* JS-Innov.IA - Partenaire technologique */}
            <motion.a
              href="https://jsinnovia.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2 group"
              aria-label="JS-Innov.IA - Partenaire technologique"
            >
              <div className="bg-black rounded-xl p-2 border border-white/10 group-hover:border-[#D4AF37]/50 transition-all duration-300">
                <img
                  src={LOGO_JS_INNOV}
                  alt="JS-Innov.IA"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <span className="text-xs text-gray-500 group-hover:text-[#D4AF37] transition-colors">Partenaire</span>
            </motion.a>

            {/* JS-Innov.IA - Créateur */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="bg-black rounded-xl p-2 border border-white/10 group-hover:border-[#D4AF37]/50 transition-all duration-300">
                <img
                  src={LOGO_JS_INNOV}
                  alt="JS-Innov.IA® - Julien Pagin"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <span className="text-xs text-gray-500 group-hover:text-[#D4AF37] transition-colors">Créateur</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Ligne de séparation */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-8" />

        {/* Copyright et signature */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>
            © {currentYear} STARLIGHT ASBL - Tous droits réservés
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2">
              <img
                src={LOGO_JS_INNOV}
                alt="JS-Innov.IA®"
                className="h-6 w-6 object-contain rounded-full"
              />
              <span className="text-gray-500">Conception & Développement</span>
              <span className="text-[#D4AF37] font-semibold">JS-Innov.IA®</span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">Pagin Julien - Dour, Belgique</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
