import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Facebook, Twitter, MessageCircle, Link as LinkIcon, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface SocialShareButtonsProps {
  candidateName: string;
  candidateId: number;
  contestId?: number;
  className?: string;
}

/**
 * Composant de partage social pour les profils candidats
 * Supporte Facebook, Twitter, WhatsApp, et copie de lien
 */
export function SocialShareButtons({
  candidateName,
  candidateId,
  contestId = 1,
  className = "",
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Générer l'URL du profil candidat
  const getCandidateUrl = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/candidate/${candidateId}`;
  };

  // Texte de partage personnalisé
  const getShareText = () => {
    return `Votez pour ${candidateName} au concours Miss & Mister Dour 2026 ! 🏆✨`;
  };

  // URLs de partage pour chaque réseau social
  const getShareUrls = () => {
    const url = encodeURIComponent(getCandidateUrl());
    const text = encodeURIComponent(getShareText());

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      tiktok: `https://www.tiktok.com/share?url=${url}&title=${text}`,
    };
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getCandidateUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const incrementShareMutation = trpc.candidates.incrementShareCount.useMutation();

  const handleShare = (platform: "facebook" | "twitter" | "whatsapp" | "tiktok") => {
    const urls = getShareUrls();
    window.open(urls[platform], "_blank", "width=600,height=400");
    
    // Incrémenter le compteur de partages
    incrementShareMutation.mutate({ candidateId });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bouton principal de partage */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] text-black font-semibold rounded-full hover:shadow-lg transition-all duration-300"
        aria-label="Partager sur les réseaux sociaux"
      >
        <Share2 className="w-4 h-4" />
        <span className="text-sm">Partager</span>
      </motion.button>

      {/* Menu de partage (dropdown) */}
      {isOpen && (
        <>
          {/* Overlay pour fermer le menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu des options de partage */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 right-0 z-50 bg-black/95 backdrop-blur-xl border border-[#C8A45C]/30 rounded-xl p-3 shadow-2xl min-w-[200px]"
          >
            {/* Facebook */}
            <motion.button
              onClick={() => handleShare("facebook")}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#C8A45C]/10 rounded-lg transition-all duration-200 group"
            >
              <Facebook className="w-5 h-5 text-[#1877F2] group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Facebook</span>
            </motion.button>

            {/* Twitter */}
            <motion.button
              onClick={() => handleShare("twitter")}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#C8A45C]/10 rounded-lg transition-all duration-200 group"
            >
              <Twitter className="w-5 h-5 text-[#1DA1F2] group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Twitter</span>
            </motion.button>

            {/* WhatsApp */}
            <motion.button
              onClick={() => handleShare("whatsapp")}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#C8A45C]/10 rounded-lg transition-all duration-200 group"
            >
              <MessageCircle className="w-5 h-5 text-[#25D366] group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">WhatsApp</span>
            </motion.button>

            {/* TikTok */}
            <motion.button
              onClick={() => handleShare("tiktok")}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#C8A45C]/10 rounded-lg transition-all duration-200 group"
            >
              <svg className="w-5 h-5 text-white group-hover:text-[#C8A45C] group-hover:scale-110 transition-all" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span className="text-sm font-medium">TikTok</span>
            </motion.button>

            {/* Divider */}
            <div className="my-2 border-t border-[#C8A45C]/20" />

            {/* Copier le lien */}
            <motion.button
              onClick={handleCopyLink}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#C8A45C]/10 rounded-lg transition-all duration-200 group"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-green-500">Copié !</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-5 h-5 text-[#C8A45C] group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Copier le lien</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </>
      )}
    </div>
  );
}

/**
 * Version compacte avec icônes seulement (pour cards candidats)
 */
export function SocialShareButtonsCompact({
  candidateName,
  candidateId,
  contestId = 1,
  className = "",
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getCandidateUrl = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/candidate/${candidateId}`;
  };

  const getShareText = () => {
    return `Votez pour ${candidateName} au concours Miss & Mister Dour 2026 ! 🏆✨`;
  };

  const getShareUrls = () => {
    const url = encodeURIComponent(getCandidateUrl());
    const text = encodeURIComponent(getShareText());

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      tiktok: `https://www.tiktok.com/share?url=${url}&title=${text}`,
    };
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getCandidateUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const incrementShareMutation = trpc.candidates.incrementShareCount.useMutation();

  const handleShare = (platform: "facebook" | "twitter" | "whatsapp" | "tiktok") => {
    const urls = getShareUrls();
    window.open(urls[platform], "_blank", "width=600,height=400");
    
    // Incrémenter le compteur de partages
    incrementShareMutation.mutate({ candidateId });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Facebook */}
      <motion.button
        onClick={() => handleShare("facebook")}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-8 h-8 flex items-center justify-center bg-[#1877F2]/10 hover:bg-[#1877F2]/20 rounded-full transition-all duration-200"
        aria-label="Partager sur Facebook"
      >
        <Facebook className="w-4 h-4 text-[#1877F2]" />
      </motion.button>

      {/* Twitter */}
      <motion.button
        onClick={() => handleShare("twitter")}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-8 h-8 flex items-center justify-center bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 rounded-full transition-all duration-200"
        aria-label="Partager sur Twitter"
      >
        <Twitter className="w-4 h-4 text-[#1DA1F2]" />
      </motion.button>

      {/* WhatsApp */}
      <motion.button
        onClick={() => handleShare("whatsapp")}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-8 h-8 flex items-center justify-center bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-full transition-all duration-200"
        aria-label="Partager sur WhatsApp"
      >
        <MessageCircle className="w-4 h-4 text-[#25D366]" />
      </motion.button>

      {/* TikTok */}
      <motion.button
        onClick={() => handleShare("tiktok")}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/30 rounded-full transition-all duration-200"
        aria-label="Partager sur TikTok"
      >
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      </motion.button>

      {/* Copier le lien */}
      <motion.button
        onClick={handleCopyLink}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-8 h-8 flex items-center justify-center bg-[#C8A45C]/10 hover:bg-[#C8A45C]/20 rounded-full transition-all duration-200"
        aria-label="Copier le lien"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <LinkIcon className="w-4 h-4 text-[#C8A45C]" />
        )}
      </motion.button>
    </div>
  );
}
