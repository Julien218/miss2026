import { useState } from "react";
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
 * Candidate stream — Digital Experience 2027
 * Deux lignes éditoriales continues : Miss puis Mister.
 * La logique de données reste inchangée ; seule la présentation est modernisée.
 */
export function FloatingCandidateCards() {
  const { data: candidates, isLoading } = trpc.candidateProfile.listApproved.useQuery();

  const missCandidates = (candidates || []).filter((candidate) => candidate.category === "miss");
  const misterCandidates = (candidates || []).filter((candidate) => candidate.category === "mister");

  const missLoop = [...missCandidates, ...missCandidates];
  const misterLoop = [...misterCandidates, ...misterCandidates];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16" aria-label="Chargement des candidats">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/20 bg-black/40 backdrop-blur-xl">
          <Crown className="h-7 w-7 animate-pulse text-gold/70" />
        </div>
      </div>
    );
  }

  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="mmd-candidate-stream space-y-5 md:space-y-7">
      {missCandidates.length > 0 && (
        <div className="relative" aria-label="Candidates Miss">
          <div className="mmd-candidate-row animate-marquee-left hover:[animation-play-state:paused]">
            {missLoop.map((candidate, index) => (
              <CandidateCard
                key={`miss-${candidate.id}-${index}`}
                candidate={candidate}
                index={(index % missCandidates.length) + 1}
              />
            ))}
          </div>
        </div>
      )}

      {misterCandidates.length > 0 && (
        <div className="relative" aria-label="Candidats Mister">
          <div className="mmd-candidate-row animate-marquee-right hover:[animation-play-state:paused]">
            {misterLoop.map((candidate, index) => (
              <CandidateCard
                key={`mister-${candidate.id}-${index}`}
                candidate={candidate}
                index={(index % misterCandidates.length) + 1}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mmd-stream-fade-left" aria-hidden="true" />
      <div className="mmd-stream-fade-right" aria-hidden="true" />
    </div>
  );
}

function CandidateCard({ candidate, index }: { candidate: Candidate; index: number }) {
  const [imgError, setImgError] = useState(false);
  const fullName = [candidate.firstName, candidate.lastName].filter(Boolean).join(" ") || "Candidat";
  const category = candidate.category === "miss" ? "Miss" : "Mister";

  return (
    <Link
      href={`/candidat/${candidate.id}`}
      className="mmd-candidate-card group cursor-pointer"
      aria-label={`Découvrir le profil de ${fullName}`}
      data-category={candidate.category || "candidate"}
    >
      <div className="mmd-candidate-image">
        {candidate.profilePhoto && !imgError ? (
          <img
            src={candidate.profilePhoto}
            alt={fullName}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_25%,rgba(217,182,111,0.2),transparent_38%),linear-gradient(145deg,#17120d,#070605)]">
            <Crown className="h-12 w-12 text-gold/45" />
          </div>
        )}

        <div className="mmd-candidate-topline">
          <span className="mmd-candidate-badge">{category}</span>
          {(candidate.voteCount ?? 0) > 0 && (
            <span className="mmd-vote-badge" aria-label={`${candidate.voteCount} votes`}>
              <Heart className="h-3 w-3 text-gold" />
              {candidate.voteCount}
            </span>
          )}
        </div>

        <div className="mmd-candidate-meta">
          <span className="mmd-candidate-index">
            {String(index).padStart(2, "0")} · ÉDITION 2027
          </span>
          <span className="mmd-candidate-name">{fullName}</span>
          {candidate.city && <span className="mmd-candidate-city">{candidate.city}</span>}
        </div>
      </div>
    </Link>
  );
}

export default FloatingCandidateCards;
