/**
 * CandidatePublicProfile.tsx
 * Page publique de profil candidat - partageable sur les réseaux sociaux pour les votes
 * URL : /candidat/:id
 */

import { useState } from "react";
import { useParams } from "wouter";
import CommentsSection from "@/components/CommentsSection";
import {
  Crown, Heart, Share2, Instagram, Facebook, MapPin,
  Loader2, AlertCircle, ExternalLink, Copy, Check,
  Star, Trophy, ChevronLeft
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { BRANDING } from "@/config/branding";
import { SEOHead } from "@/components/SEOHead";

// Icônes SVG
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  miss: "Miss",
  mister: "Mister",
  teen_miss: "Teen Miss",
  teen_mister: "Teen Mister",
};

const CATEGORY_COLORS: Record<string, string> = {
  miss: "from-pink-500 to-rose-500",
  mister: "from-blue-500 to-indigo-500",
  teen_miss: "from-purple-500 to-pink-400",
  teen_mister: "from-cyan-500 to-blue-400",
};

function normalizeUrl(value: string | null | undefined, platform: string): string | null {
  if (!value) return null;
  if (value.startsWith("http")) return value;
  const pseudo = value.replace(/^@/, "");
  const bases: Record<string, string> = {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/@",
    linkedin: "https://linkedin.com/in/",
  };
  return (bases[platform] || "") + pseudo;
}

export default function CandidatePublicProfile() {
  const params = useParams<{ id: string }>();
  const candidateId = parseInt(params.id || "0", 10);

  const [copied, setCopied] = useState(false);
  const [voted, setVoted] = useState(false);

  const { data: candidate, isLoading, error } = trpc.candidateProfile.getPublicProfile.useQuery(
    { candidateId },
    { enabled: !!candidateId && !isNaN(candidateId) }
  );

  const voteMutation = trpc.votes.cast.useMutation({
    onSuccess: () => setVoted(true),
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      `Votez pour ${candidate?.firstName} ${candidate?.lastName} - ${CATEGORY_LABELS[candidate?.category || ""] || ""} Miss & Mister Dour 2026 ! 👑✨`
    );
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
    };
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  // ─── États ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Profil introuvable</h1>
          <p className="text-gray-400 mb-6">Ce profil candidat n'existe pas ou n'est pas encore disponible.</p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-black font-bold rounded-lg hover:bg-gold/90 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  const categoryGradient = CATEGORY_COLORS[candidate.category] || "from-gold to-yellow-400";
  const instagramUrl = normalizeUrl(candidate.instagram, "instagram");
  const facebookUrl = normalizeUrl(candidate.facebook, "facebook");
  const tiktokUrl = normalizeUrl(candidate.tiktok, "tiktok");
  const linkedinUrl = normalizeUrl(candidate.linkedin, "linkedin");

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <SEOHead
        title={`${candidate.firstName} ${candidate.lastName} — Miss & Mister Dour 2026`}
        description={`Votez pour ${candidate.firstName} ${candidate.lastName}, candidat${candidate.category === 'miss' || candidate.category === 'teen_miss' ? 'e' : ''} ${CATEGORY_LABELS[candidate.category] || candidate.category} au concours Miss & Mister Dour 2026 à Dour, Belgique.`}
        url={`https://missetmisterdour.be/candidat/${candidate.id}`}
        image={candidate.profilePhoto || undefined}
        type="website"
        tags={[`${candidate.firstName} ${candidate.lastName}`, "vote Miss Dour 2026", "concours beauté Belgique", CATEGORY_LABELS[candidate.category] || ""]}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/80 border-b border-gold/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src={BRANDING.logoIdentity}
              alt="Miss & Mister Dour 2026"
              className="h-12 object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
            />
          </a>
          <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" />
            Retour aux candidats
          </a>
        </div>
      </header>

      {/* Hero - Photo & Identité */}
      <section className="relative overflow-hidden">
        {/* Fond dégradé */}
        <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradient} opacity-20`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          {/* Photo de profil */}
          <div className="relative inline-block mb-6">
            {candidate.profilePhoto ? (
              <img
                src={candidate.profilePhoto}
                alt={`${candidate.firstName} ${candidate.lastName}`}
                className="w-40 h-40 md:w-56 md:h-56 rounded-full object-cover border-4 border-gold shadow-2xl shadow-gold/30"
              />
            ) : (
              <div className={`w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-br ${categoryGradient} flex items-center justify-center border-4 border-gold shadow-2xl shadow-gold/30`}>
                <Crown className="w-20 h-20 text-white/80" />
              </div>
            )}
            {/* Badge catégorie */}
            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r ${categoryGradient} rounded-full text-white text-sm font-bold shadow-lg whitespace-nowrap`}>
              {CATEGORY_LABELS[candidate.category] || candidate.category}
            </div>
          </div>

          {/* Nom */}
          <h1 className="text-4xl md:text-6xl font-bold mt-6 mb-2">
            <span className="bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
              {candidate.firstName}
            </span>
            <br />
            <span className="text-white">{candidate.lastName}</span>
          </h1>

          {/* Ville */}
          {candidate.city && (
            <p className="flex items-center justify-center gap-2 text-gray-400 mt-2 mb-6">
              <MapPin className="w-4 h-4 text-gold" />
              {candidate.city}
            </p>
          )}

          {/* Compteur de votes */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gold">{candidate.voteCount || 0}</div>
              <div className="text-gray-400 text-sm">votes</div>
            </div>
            <div className="w-px h-10 bg-gray-600" />
            <div className="text-center">
              <div className="text-3xl font-bold text-gold">{candidate.shareCount || 0}</div>
              <div className="text-gray-400 text-sm">partages</div>
            </div>
          </div>

          {/* Bouton VOTER */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {voted ? (
              <div className="flex items-center gap-3 px-8 py-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 font-bold text-lg">
                <Check className="w-6 h-6" />
                Merci pour votre vote !
              </div>
            ) : (
              <button
                onClick={() => voteMutation.mutate({ contestId: candidate.contestId || 1, candidateId: candidate.id, fingerprint: `fp_${Date.now()}_${Math.random().toString(36).slice(2)}` })}
                disabled={voteMutation.isPending}
                className="group flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-gold to-yellow-400 text-black font-bold text-xl rounded-xl hover:shadow-2xl hover:shadow-gold/40 transition-all duration-300 hover:scale-105 disabled:opacity-50"
              >
                {voteMutation.isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                )}
                Voter pour {candidate.firstName}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Bio & Présentation */}
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        {candidate.bio && (
          <div className="bg-gray-800/50 border border-gold/20 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-5 h-5 text-gold" />
              <h2 className="text-xl font-bold text-gold">À propos de {candidate.firstName}</h2>
            </div>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{candidate.bio}</p>
          </div>
        )}

        {/* Réseaux sociaux */}
        {(instagramUrl || facebookUrl || tiktokUrl || linkedinUrl) && (
          <div className="bg-gray-800/50 border border-gold/20 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Share2 className="w-5 h-5 text-gold" />
              <h2 className="text-xl font-bold text-gold">Suivez {candidate.firstName}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-pink-500/30 transition-all hover:scale-105"
                >
                  <Instagram className="w-5 h-5" />
                  Instagram
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-blue-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}
              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white font-medium hover:border-white/50 transition-all hover:scale-105"
                >
                  <TikTokIcon className="w-5 h-5" />
                  TikTok
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-blue-700 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-blue-700/30 transition-all hover:scale-105"
                >
                  <LinkedInIcon className="w-5 h-5" />
                  LinkedIn
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Partager cette page */}
        <div className="bg-gradient-to-r from-gold/10 to-yellow-400/10 border border-gold/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-gold" />
            <h2 className="text-xl font-bold text-gold">Aidez {candidate.firstName} à gagner !</h2>
          </div>
          <p className="text-gray-300 mb-5">
            Partagez cette page sur vos réseaux sociaux pour augmenter ses chances de victoire.
            Chaque partage compte !
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleShare("facebook")}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 rounded-xl text-white font-medium hover:bg-blue-700 transition-colors"
            >
              <Facebook className="w-5 h-5" />
              Partager sur Facebook
            </button>
            <button
              onClick={() => handleShare("whatsapp")}
              className="flex items-center gap-2 px-5 py-3 bg-green-600 rounded-xl text-white font-medium hover:bg-green-700 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              WhatsApp
            </button>
            <button
              onClick={() => handleShare("twitter")}
              className="flex items-center gap-2 px-5 py-3 bg-sky-500 rounded-xl text-white font-medium hover:bg-sky-600 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Twitter / X
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-5 py-3 bg-gray-700 rounded-xl text-white font-medium hover:bg-gray-600 transition-colors"
            >
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              {copied ? "Lien copié !" : "Copier le lien"}
            </button>
          </div>
        </div>
      </section>

      {/* Section Commentaires */}
      <section className="container mx-auto px-4 pb-12 max-w-3xl">
        <CommentsSection
          candidateId={candidate.id}
          candidateName={`${candidate.firstName} ${candidate.lastName}`}
        />
      </section>

      {/* Footer */}
      <footer className="border-t border-gold/20 py-8 text-center text-gray-500 text-sm">
        <p>
          <a href="/" className="text-gold hover:underline">Miss & Mister Dour 2026</a>
          {" · "} STARLIGHT ASBL {" · "} Centre Sportif d'Elouges, 19 Avril 2026
        </p>
      </footer>
    </div>
  );
}
