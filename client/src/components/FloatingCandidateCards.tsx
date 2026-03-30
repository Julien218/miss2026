import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Crown, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Candidate {
  id: number;
  firstName: string | null;
  lastName: string | null;
  category: string | null;
  city: string | null;
  profilePhoto: string | null;
  voteCount: number | null;
}

/**
 * FloatingCandidateCards
 * Affiche les candidats approuvés sous forme de cartes flottantes
 * qui défilent horizontalement en boucle infinie (marquee-style).
 * Deux rangées : Miss en haut (gauche → droite), Mister en bas (droite → gauche).
 */
export function FloatingCandidateCards() {
  const { data: candidates, isLoading } = trpc.candidateProfile.listApproved.useQuery();

  const missCandidates = (candidates || []).filter((c) => c.category === "miss");
  const misterCandidates = (candidates || []).filter((c) => c.category === "mister");

  // Double les tableaux pour l'effet de boucle infinie
  const missLoop = [...missCandidates, ...missCandidates];
  const misterLoop = [...misterCandidates, ...misterCandidates];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Crown className="w-10 h-10 text-gold/40 animate-pulse" />
      </div>
    );
  }

  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-4 space-y-6">
      {/* Rangée Miss — défilement vers la gauche */}
      {missCandidates.length > 0 && (
        <div className="relative">
          <div className="flex gap-5 animate-marquee-left hover:[animation-play-state:paused]">
            {missLoop.map((c, i) => (
              <CandidateCard key={`miss-${c.id}-${i}`} candidate={c} />
            ))}
          </div>
        </div>
      )}

      {/* Rangée Mister — défilement vers la droite */}
      {misterCandidates.length > 0 && (
        <div className="relative">
          <div className="flex gap-5 animate-marquee-right hover:[animation-play-state:paused]">
            {misterLoop.map((c, i) => (
              <CandidateCard key={`mister-${c.id}-${i}`} candidate={c} />
            ))}
          </div>
        </div>
      )}

      {/* Dégradés latéraux pour un effet premium */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10" />
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/candidat/${candidate.id}`}
      className="flex-shrink-0 w-48 group cursor-pointer"
    >
      <div className="relative rounded-xl overflow-hidden border border-gold/20 bg-gray-900/80 shadow-lg shadow-gold/5 transition-all duration-300 group-hover:border-gold/60 group-hover:shadow-gold/20 group-hover:scale-105">
        {/* Photo */}
        <div className="aspect-[3/4] relative overflow-hidden">
          {candidate.profilePhoto && !imgError ? (
            <img
              src={candidate.profilePhoto}
              alt={`${candidate.firstName} ${candidate.lastName}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gray-800 flex items-center justify-center">
              <Crown className="w-12 h-12 text-gold/40" />
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Badge catégorie */}
          <div className="absolute top-2 left-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              candidate.category === "miss"
                ? "bg-pink-500/80 text-white"
                : "bg-blue-500/80 text-white"
            }`}>
              {candidate.category}
            </span>
          </div>

          {/* Votes */}
          {(candidate.voteCount ?? 0) > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5">
              <Heart className="w-3 h-3 text-red-400 fill-red-400" />
              <span className="text-[10px] text-white font-medium">{candidate.voteCount}</span>
            </div>
          )}

          {/* Nom en bas */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white font-bold text-sm leading-tight truncate">
              {candidate.firstName} {candidate.lastName}
            </p>
            {candidate.city && (
              <p className="text-gray-300 text-[11px] truncate">{candidate.city}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default FloatingCandidateCards;
