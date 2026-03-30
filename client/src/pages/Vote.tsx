import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { SocialShareButtonsCompact } from "@/components/SocialShareButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Check, Trophy, Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { ShareVoteButton } from "@/components/ShareVoteButton";
import { BadgeNotification } from "@/components/BadgeNotification";

// Generate browser fingerprint for vote tracking
function generateFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
}

export default function Vote() {
  const ogImageUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/87304619/BNdIOfgIEJEdcXgy.png";
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const [selectedContestId, setSelectedContestId] = useState<number | null>(null);
  const [fingerprint, setFingerprint] = useState<string>("");
  const [votedCandidateId, setVotedCandidateId] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<any | null>(null);

  // Generate fingerprint on mount
  useEffect(() => {
    const fp = generateFingerprint();
    setFingerprint(fp);
  }, []);

  // Fetch contests
  const { data: contests } = trpc.contests.list.useQuery();

  // Select first contest by default
  useEffect(() => {
    if (contests && contests.length > 0 && !selectedContestId) {
      setSelectedContestId(contests[0].id);
    }
  }, [contests, selectedContestId]);

  // Fetch approved candidates for selected contest
  const { data: candidates } = trpc.candidates.listByContest.useQuery(
    { contestId: selectedContestId! },
    { enabled: !!selectedContestId }
  );

  const approvedCandidates = candidates?.filter(c => c.status === "approved") || [];

  // Check if user can vote (replaces hasVoted)
  const { data: canVoteData } = trpc.votes.checkCanVote.useQuery(
    { contestId: selectedContestId!, fingerprint },
    { enabled: !!selectedContestId && !!fingerprint }
  );

  const hasVoted = canVoteData?.hasVoted || false;
  const canVote = canVoteData?.canVote || false;

  // Fetch vote leaderboard (replaces getResults)
  const { data: leaderboard, refetch: refetchLeaderboard } = trpc.votes.getLeaderboard.useQuery(
    { contestId: selectedContestId!, limit: 10 },
    { enabled: !!selectedContestId && showResults }
  );

  // Fetch vote statistics
  const { data: voteStats } = trpc.votes.getStats.useQuery(
    { contestId: selectedContestId! },
    { enabled: !!selectedContestId && showResults }
  );

  // Badge eligibility check mutation
  const checkBadgeEligibility = trpc.badges.checkEligibility.useMutation({
    onSuccess: (data) => {
      if (data.newBadges && data.newBadges.length > 0) {
        // Show first badge notification
        setEarnedBadge(data.newBadges[0]);
      }
    },
  });

  // Vote mutation
  const voteMutation = trpc.votes.cast.useMutation({
    onSuccess: async (data) => {
      toast.success(data.message);
      
      // Confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Check badge eligibility after vote
      try {
        await checkBadgeEligibility.mutateAsync({
          action: "vote",
          candidateId: votedCandidateId!,
        });
      } catch (error) {
        console.error("Badge check failed:", error);
      }
      
      // Show results after voting
      setTimeout(() => {
        setShowResults(true);
        refetchLeaderboard();
      }, 1500);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleVote = async (candidateId: number) => {
    if (!selectedContestId || !fingerprint) return;
    
    setVotedCandidateId(candidateId);
    
    await voteMutation.mutateAsync({
      contestId: selectedContestId,
      candidateId,
      fingerprint,
    });
  };

  // Calculate total votes from leaderboard
  const totalVotes = leaderboard?.reduce((sum, item) => sum + item.voteCount, 0) || 0;

  const getCandidateVotes = (candidateId: number) => {
    const result = leaderboard?.find(r => r.candidateId === candidateId);
    if (!result) return { voteCount: 0, percentage: 0 };
    
    const percentage = totalVotes > 0 ? (result.voteCount / totalVotes) * 100 : 0;
    return { voteCount: result.voteCount, percentage };
  };

  const getTopCandidates = () => {
    if (!leaderboard) return [];
    
    return [...leaderboard]
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, 3)
      .map(item => ({
        ...item,
        percentage: totalVotes > 0 ? (item.voteCount / totalVotes) * 100 : 0,
      }));
  };

  if (!selectedContestId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-[#D4AF37]/30">
          <CardHeader>
            <CardTitle className="text-2xl font-display text-[#D4AF37]">Aucun concours disponible</CardTitle>
            <CardDescription className="text-gray-400">
              Il n'y a actuellement aucun concours ouvert au vote public.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/miss-mister-dour-2026">
              <Button variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Votez pour votre favori(e)"
        description="Participez au vote Miss & Mister Dour 2026. Soutenez votre candidat(e) préféré(e) et découvrez le classement en temps réel sur notre plateforme officielle sécurisée."
        image={ogImageUrl}
        url={pageUrl}
        type="website"
        tags={["vote", "miss dour", "mister dour", "concours", "élection", "liligaga mirror"]}
      />
      {/* Badge Notification */}
      {earnedBadge && (
        <BadgeNotification
          badge={earnedBadge}
          onClose={() => setEarnedBadge(null)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A0A1A] to-[#0A0A0A] py-12">
      <div className="container max-w-7xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/miss-mister-dour-2026">
            <Button 
              variant="ghost" 
              className="text-[#D4AF37] hover:text-[#E8C547] hover:bg-[#D4AF37]/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 bg-gradient-to-r from-[#D4AF37] via-[#E8C547] to-[#D4AF37] bg-clip-text text-transparent">
            Votez pour votre candidat favori
          </h1>
          <p className="text-gray-400 text-lg">
            Participez au choix du public et soutenez votre candidat préféré
          </p>
        </motion.div>

        {/* Vote Status */}
        {hasVoted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="border-green-500/50 bg-green-500/10 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Check className="w-6 h-6 text-green-500" />
                  <div>
                    <CardTitle className="text-green-500">Vote enregistré ✓</CardTitle>
                    <CardDescription className="text-gray-400">
                      Vous avez déjà voté pour ce concours. Consultez les résultats ci-dessous.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            {/* Share Vote Button */}
            {votedCandidateId && (
              <ShareVoteButton
                candidateName={(() => {
                  const candidate = approvedCandidates.find(c => c.id === votedCandidateId);
                  return candidate ? `${candidate.firstName} ${candidate.lastName}` : "votre candidat(e)";
                })()}
                candidateId={votedCandidateId}
              />
            )}
          </motion.div>
        )}

        {/* Show Results Button */}
        {!showResults && hasVoted && (
          <div className="flex justify-center mb-8">
            <Button
              onClick={() => setShowResults(true)}
              variant="outline"
              size="lg"
              className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Voir les résultats
            </Button>
          </div>
        )}

        {/* Results View */}
        {showResults && leaderboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-12"
          >
            <Card className="border-[#D4AF37]/50 bg-black/40 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-display">
                  <Trophy className="w-6 h-6 text-[#D4AF37]" />
                  <span className="bg-gradient-to-r from-[#D4AF37] to-[#E8C547] bg-clip-text text-transparent">
                    Classement actuel
                  </span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Résultats en temps réel des votes du public
                  {voteStats && (
                    <span className="ml-2 text-[#D4AF37]">
                      • {voteStats.totalVotes} votes au total
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getTopCandidates().map((result, index) => {
                    const candidate = approvedCandidates.find(c => c.id === result.candidateId);
                    if (!candidate) return null;
                    
                    const medals = ["🥇", "🥈", "🥉"];
                    const colors = [
                      "from-yellow-400 to-yellow-600",
                      "from-gray-300 to-gray-500",
                      "from-orange-400 to-orange-600"
                    ];
                    
                    return (
                      <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-lg bg-black/40 border border-[#D4AF37]/20 backdrop-blur-xl"
                      >
                        <div className="text-4xl">{medals[index]}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg text-white">
                              {candidate.firstName} {candidate.lastName}
                            </h3>
                            <Badge className={`bg-gradient-to-r ${colors[index]} text-black font-semibold`}>
                              {result.voteCount} votes ({result.percentage.toFixed(1)}%)
                            </Badge>
                          </div>
                          <Progress value={result.percentage} className="h-2" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Candidates Grid */}
        {!hasVoted && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {approvedCandidates.map((candidate, index) => {
                const votes = getCandidateVotes(candidate.id);
                const isVoted = votedCandidateId === candidate.id;
                const isMiss = candidate.category === 'miss';
                
                return (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`overflow-hidden hover:shadow-2xl transition-all duration-300 bg-black/40 backdrop-blur-xl ${
                      isMiss 
                        ? 'border-pink-500/30 hover:border-pink-500/60' 
                        : 'border-blue-500/30 hover:border-blue-500/60'
                    }`}>
                      {/* Candidate Photo */}
                      <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                        {candidate.profilePhoto ? (
                          <img
                            src={candidate.profilePhoto}
                            alt={`${candidate.firstName} ${candidate.lastName}`}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-24 h-24 text-gray-600" />
                          </div>
                        )}
                        
                        {/* Badge */}
                        <div className="absolute top-4 right-4">
                          <Badge className={`${
                            isMiss 
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500' 
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                          } text-white font-semibold`}>
                            {isMiss ? 'Miss' : 'Mister'}
                          </Badge>
                        </div>

                        {/* Overlay gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <CardHeader>
                        <CardTitle className="text-xl font-display text-white">
                          {candidate.firstName} {candidate.lastName}
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          {candidate.city || 'Belgique'}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        {candidate.bio && (
                          <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                            {candidate.bio}
                          </p>
                        )}
                        
                        {/* Boutons de partage social */}
                        <div className="mb-4">
                          <SocialShareButtonsCompact
                            candidateName={`${candidate.firstName} ${candidate.lastName}`}
                            candidateId={candidate.id}
                            contestId={1}
                          />
                        </div>
                        
                        {showResults && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-400">Votes</span>
                              <span className="font-semibold text-[#D4AF37]">
                                {votes.voteCount} ({votes.percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress value={votes.percentage} className="h-2" />
                          </div>
                        )}
                      </CardContent>

                      <CardFooter>
                        <Button
                          onClick={() => handleVote(candidate.id)}
                          disabled={voteMutation.isPending || isVoted}
                          className="w-full bg-gradient-to-r from-[#D4AF37] to-[#E8C547] hover:from-[#E8C547] hover:to-[#D4AF37] text-black font-semibold transition-all duration-300"
                        >
                          {isVoted ? (
                            <>
                              <Check className="w-5 h-5 mr-2" />
                              Vote enregistré
                            </>
                          ) : (
                            <>
                              <Heart className="w-5 h-5 mr-2" />
                              Voter
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* No candidates message */}
        {approvedCandidates.length === 0 && (
          <Card className="max-w-2xl mx-auto bg-black/40 backdrop-blur-xl border-[#D4AF37]/30">
            <CardHeader>
              <CardTitle className="text-2xl font-display text-[#D4AF37]">Aucun candidat disponible</CardTitle>
              <CardDescription className="text-gray-400">
                Les candidats seront bientôt disponibles pour le vote public.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}
