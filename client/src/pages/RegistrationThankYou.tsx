import { motion } from "framer-motion";
import { Link } from "wouter";
import { Check, Home, Share2, Instagram, Facebook } from "lucide-react";

export default function RegistrationThankYou() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        {/* Icône de succès */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] flex items-center justify-center"
        >
          <Check className="w-12 h-12 text-black" strokeWidth={3} />
        </motion.div>

        {/* Message principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Candidature{" "}
            <span className="bg-gradient-to-r from-[#E8C547] via-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent">
              Enregistrée !
            </span>
          </h1>
          <p className="text-xl text-[#C0C0C0]">
            Merci pour votre inscription à Miss & Mister Dour 2026
          </p>
        </motion.div>

        {/* Card d'information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-black/40 backdrop-blur-xl rounded-3xl border border-[#D4AF37]/30 p-8 mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Prochaines étapes</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center flex-shrink-0 font-bold text-black">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Vérification de votre candidature</h3>
                <p className="text-sm text-[#C0C0C0]">
                  Notre équipe va examiner votre dossier dans les prochains jours. Vous recevrez un email de confirmation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center flex-shrink-0 font-bold text-black">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Approbation et publication</h3>
                <p className="text-sm text-[#C0C0C0]">
                  Une fois approuvée, votre profil sera publié sur notre site web et nos réseaux sociaux.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center flex-shrink-0 font-bold text-black">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Début des votes</h3>
                <p className="text-sm text-[#C0C0C0]">
                  Les votes du public ouvriront prochainement. Mobilisez vos proches et partagez votre profil !
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center flex-shrink-0 font-bold text-black">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">Grande soirée - 19 avril 2026</h3>
                <p className="text-sm text-[#C0C0C0]">
                  Rejoignez-nous à la Salle des Fêtes de Dour pour la soirée de gala et l'élection des gagnants !
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Conseils */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-[#D4AF37]/10 to-[#E8C547]/10 rounded-2xl border border-[#D4AF37]/30 p-6 mb-8"
        >
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#D4AF37]" />
            Maximisez vos chances !
          </h3>
          <ul className="space-y-2 text-sm text-[#C0C0C0]">
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37] mt-1">•</span>
              <span>Partagez votre candidature sur vos réseaux sociaux dès maintenant</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37] mt-1">•</span>
              <span>Mobilisez votre famille, vos amis et vos followers pour voter</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37] mt-1">•</span>
              <span>Suivez-nous sur Instagram et Facebook pour ne rien manquer</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4AF37] mt-1">•</span>
              <span>Utilisez le hashtag #MissMisterDour2026 dans vos publications</span>
            </li>
          </ul>
        </motion.div>

        {/* Boutons d'action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/miss-mister-dour-2026">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] text-black font-bold hover:shadow-lg hover:shadow-[#D4AF37]/50 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "Miss & Mister Dour 2026",
                  text: "Je participe à Miss & Mister Dour 2026 ! Votez pour moi 🎭✨",
                  url: window.location.origin + "/miss-mister-dour-2026",
                });
              } else {
                alert("Partagez ce lien : " + window.location.origin + "/miss-mister-dour-2026");
              }
            }}
            className="flex-1 px-6 py-4 rounded-xl bg-black/60 border border-[#D4AF37]/30 text-white hover:border-[#D4AF37] transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Partager
          </motion.button>
        </motion.div>

        {/* Réseaux sociaux */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-[#C0C0C0] mb-4">Suivez-nous sur les réseaux sociaux</p>
          <div className="flex justify-center gap-4">
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href="https://instagram.com/missmisterdour"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E4405F] to-[#F77737] flex items-center justify-center hover:shadow-lg hover:shadow-[#E4405F]/50 transition-all"
            >
              <Instagram className="w-6 h-6 text-white" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href="https://facebook.com/missmisterdour"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-[#3B82F6] flex items-center justify-center hover:shadow-lg hover:shadow-[#3B82F6]/50 transition-all"
            >
              <Facebook className="w-6 h-6 text-white" />
            </motion.a>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-sm text-[#C0C0C0]"
        >
          <p>Des questions ? Contactez-nous à <a href="mailto:contact@miss-mister-dour.be" className="text-[#D4AF37] hover:underline">contact@miss-mister-dour.be</a></p>
          <p className="mt-2">© 2026 Miss & Mister Dour - Créé par JS-Innov.IA</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
