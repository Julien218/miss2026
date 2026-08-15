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
 * Candidate showcase: animated marquee on desktop, touch-friendly horizontal
 * scrolling on mobile. This avoids rendering a desktop-sized marquee inside
 * a narrow viewport and keeps cards readable on iOS Safari.
 */
export function FloatingCandidateCards() {
  const { data: candidates, isLoading } = trpc.candidateProfile.listApproved.useQuery();

  const missCandidates = (candidates || []).filter((c) => c.category === "miss");
  const misterCandidates = (candidates || []).filter((c) => c.category === "mister");
  const missLoop = [...missCandidates, ...missCandidates];
  const misterLoop = [...misterCandidates, ...misterCandidates];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 sm:py-16">
        <Crown className="w-10 h-10 text-gold/40 animate-pulse" />
      </div>
    );
  }

  if (!candidates || candidates.length === 0) return null;

  const Row = ({ items, loop, direction }: { items: Candidate[]; loop: Candidate[]; direction: "left" | "right" }) => {
    if (items.length === 0) return null;
    return (
      <div className="relative">
        <div className="flex md:hidden gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-2 overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((c) => <CandidateCard key={`mobile-${direction}-${c.id}`} candidate={c} />)}
        </div>
        <div className={`hidden md:flex gap-5 ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"} hover:[animation-play-state:paused]`}>
          {loop.map((c, i) => <CandidateCard key={`${direction}-${c.id}-${i}`} candidate={c} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full overflow-hidden py-2 sm:py-4 space-y-4 sm:space-y-6">
      <Row items={missCandidates} loop={missLoop} direction="left" />
      <Row items={misterCandidates} loop={misterLoop} direction="right" />
      <div className="hidden md:block pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="hidden md:block pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-10" />
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/candidat/${candidate.id}`} className="flex-shrink-0 w-[42vw] min-w-[145px] max-w-[180px] md:w-48 md:min-w-0 md:max-w-none snap-start group cursor-pointer">
      <div className="relative rounded-xl overflow-hidden border border-gold/20 bg-gray-900/80 shadow-lg shadow-gold/5 transition-all duration-300 md:group-hover:border-gold/60 md:group-hover:shadow-gold/20 md:group-hover:scale-105">
        <div className="aspect-[3/4] relative overflow-hidden">
          {candidate.profilePhoto && !imgError ? (
            <img src={candidate.profilePhoto} alt={`${candidate.firstName} ${candidate.lastName}`} className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-110" loading="lazy" onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gray-800 flex items-center justify-center"><Crown className="w-10 h-10 sm:w-12 sm:h-12 text-gold/40" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute top-2 left-2"><span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${candidate.category === "miss" ? "bg-pink-500/80 text-white" : "bg-blue-500/80 text-white"}`}>{candidate.category}</span></div>
          {(candidate.voteCount ?? 0) > 0 && <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5"><Heart className="w-3 h-3 text-red-400 fill-red-400" /><span className="text-[10px] text-white font-medium">{candidate.voteCount}</span></div>}
          <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
            <p className="text-white font-bold text-xs sm:text-sm leading-tight truncate">{candidate.firstName} {candidate.lastName}</p>
            {candidate.city && <p className="text-gray-300 text-[10px] sm:text-[11px] truncate">{candidate.city}</p>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default FloatingCandidateCards;
