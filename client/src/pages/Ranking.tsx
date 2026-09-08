import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, TrendingUp, Eye, Share2, Crown, Medal, Award, Sparkles } from "lucide-react";
import { trpc } from "../lib/trpc";
import { Link } from "wouter";
import { BarometerOrb } from "../components/BarometerOrb";

interface RankedCandidate {
  id: number;
  firstName: string;
  lastName: string;
  category: string;
  profilePhoto: string | null;
  city: string;
  voteCount: number;
  shareCount: number;
  shareClicksToday: number;
  profileViewsToday: number;
  previousRank?: number;
}

export function Ranking() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "miss" | "mister">("all");
  const [rankedCandidates, setRankedCandidates] = useState<RankedCandidate[]>([]);

  // Fetch candidates
  const { data: candidates, refetch } = trpc.candidates.listByContest.useQuery({ contestId: 1 });
  const { data: analyticsData } = trpc.analytics.getBulkAnalytics.useQuery(
    { candidateIds: candidates?.map(c => c.id) || [] },
    { enabled: !!candidates && candidates.length > 0 }
  );

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Merge candidates with analytics
  useEffect(() => {
    if (!candidates || !analyticsData) return;

    const merged = candidates.map(candidate => {
      const analytics = analyticsData.find(a => a.candidateId === candidate.id);
      return {
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        category: candidate.category,
        profilePhoto: candidate.profilePhoto,
        city: candidate.city || "Dour",
        voteCount: candidate.voteCount,
        shareCount: candidate.shareCount,
        shareClicksToday: analytics?.shareClicksToday || 0,
        profileViewsToday: analytics?.profileViewsToday || 0,
      };
    });

    // Filter by category
    const filtered = selectedCategory === "all" 
      ? merged 
      : merged.filter(c => c.category === selectedCategory);

    // Sort by vote count (descending)
    const sorted = filtered.sort((a, b) => b.voteCount - a.voteCount).slice(0, 10);

    setRankedCandidates(sorted);
  }, [candidates, analyticsData, selectedCategory]);

  const getPodiumBadge = (rank: number) => {
    if (rank === 1) return { icon: Crown, color: "text-yellow-400", bg: "from-yellow-400/20 to-yellow-600/20", border: "border-yellow-400/50", label: "1er" };
    if (rank === 2) return { icon: Medal, color: "text-gray-300", bg: "from-gray-300/20 to-gray-500/20", border: "border-gray-300/50", label: "2ème" };
    if (rank === 3) return { icon: Award, color: "text-orange-400", bg: "from-orange-400/20 to-orange-600/20", border: "border-orange-400/50", label: "3ème" };
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0A0A0A] to-black text-white">
      {/* Header */}
      <div className="relative pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Trophy className="w-12 h-12 text-[#C8A45C]" />
              <h1
                className="text-5xl md:text-7xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                <span className="text-white">Classement</span>{" "}
                <span className="bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] bg-clip-text text-transparent">
                  Live
                </span>
              </h1>
              <Sparkles className="w-12 h-12 text-[#C8A45C]" />
            </div>
            <p className="text-[#B0B0B0] text-lg mb-8">
              Top 10 des candidats • Mise à jour en temps réel
            </p>
            
            {/* Baromètre Social Global */}
            <div className="mb-8 flex justify-center">
              <BarometerOrb size="md" />
            </div>

            {/* Category filter */}
            <div className="flex items-center justify-center gap-4 mb-12">
              {["all", "miss", "mister"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat as typeof selectedCategory)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] text-black"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {cat === "all" ? "Tous" : cat === "miss" ? "Miss" : "Mister"}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Ranking list */}
      <div className="container mx-auto px-4 pb-32">
        <div className="max-w-5xl mx-auto space-y-4">
          <AnimatePresence mode="popLayout">
            {rankedCandidates.map((candidate, index) => {
              const rank = index + 1;
              const podiumBadge = getPodiumBadge(rank);

              return (
                <motion.div
                  key={candidate.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group relative"
                >
                  <Link href={`/candidate/${candidate.id}`}>
                    <div
                      className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                        podiumBadge
                          ? `bg-gradient-to-r ${podiumBadge.bg} border-2 ${podiumBadge.border}`
                          : "bg-black/40 border border-white/10 hover:border-[#C8A45C]/50"
                      } backdrop-blur-xl hover:scale-[1.02] hover:shadow-2xl`}
                    >
                      <div className="flex items-center gap-6">
                        {/* Rank */}
                        <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                          {podiumBadge ? (
                            <div className="relative">
                              <podiumBadge.icon className={`w-12 h-12 ${podiumBadge.color}`} />
                              <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${podiumBadge.color}`}>
                                {rank}
                              </span>
                            </div>
                          ) : (
                            <span className="text-4xl font-bold text-[#C8A45C]">#{rank}</span>
                          )}
                        </div>

                        {/* Photo */}
                        <div className="flex-shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 border-[#C8A45C]/50">
                          <img
                            src={candidate.profilePhoto || "https://via.placeholder.com/150"}
                            alt={`${candidate.firstName} ${candidate.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-bold text-white mb-1 truncate">
                            {candidate.firstName} {candidate.lastName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-[#B0B0B0]">
                            <span className="capitalize">{candidate.category}</span>
                            <span>•</span>
                            <span>{candidate.city}</span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex-shrink-0 grid grid-cols-2 gap-4 text-center">
                          {/* Votes */}
                          <div className="px-4 py-2 rounded-lg bg-white/5">
                            <div className="text-2xl font-bold text-[#C8A45C]">{candidate.voteCount}</div>
                            <div className="text-xs text-[#B0B0B0]">Votes</div>
                          </div>

                          {/* Partages */}
                          <div className="px-4 py-2 rounded-lg bg-white/5">
                            <div className="text-2xl font-bold text-[#EC4899]">{candidate.shareCount}</div>
                            <div className="text-xs text-[#B0B0B0]">Partages</div>
                          </div>
                        </div>

                        {/* Delta today */}
                        <div className="flex-shrink-0 flex flex-col gap-2">
                          {candidate.shareClicksToday > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C8A45C]/20 border border-[#C8A45C]/30">
                              <TrendingUp className="w-4 h-4 text-[#C8A45C]" />
                              <span className="text-[#C8A45C] text-sm font-semibold">
                                +{candidate.shareClicksToday}
                              </span>
                            </div>
                          )}
                          {candidate.profileViewsToday > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30">
                              <Eye className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-400 text-sm font-semibold">
                                +{candidate.profileViewsToday}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hover effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C8A45C]/0 via-[#C8A45C]/5 to-[#C8A45C]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {rankedCandidates.length === 0 && (
            <div className="text-center py-20 text-[#B0B0B0]">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl">Aucun candidat trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
