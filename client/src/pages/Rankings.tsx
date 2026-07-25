import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Trophy, Star, Users, Award, Medal, Crown } from "lucide-react";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function Rankings() {
  const [selectedContestId, setSelectedContestId] = useState<string>("");

  const { data: contests } = trpc.contests.list.useQuery();
  const { data: candidates } = trpc.candidates.search.useQuery({
    contestId: selectedContestId ? parseInt(selectedContestId) : 0,
  }, {
    enabled: !!selectedContestId,
  });

  const { data: leaderboard } = trpc.votes.getLeaderboard.useQuery(
    { contestId: parseInt(selectedContestId), limit: 100 },
    { enabled: !!selectedContestId }
  );
  
  const totalVotes = leaderboard?.reduce((sum: number, r: { voteCount: number }) => sum + r.voteCount, 0) || 0;
  const uniqueVoters = leaderboard?.length || 0;

  // Calculate rankings combining jury scores (70%) and public votes (30%)
  const rankings = candidates?.map((candidate) => {
    // Mock jury average (in real app, fetch from evaluations)
    const juryAverage = Math.random() * 10; // 0-10
    const publicVotes = Math.floor(Math.random() * 1000); // Mock votes
    
    // Normalize public votes to 0-10 scale
    const maxVotes = 1000;
    const publicScore = (publicVotes / maxVotes) * 10;
    
    // Combined score: 70% jury + 30% public
    const combinedScore = (juryAverage * 0.7) + (publicScore * 0.3);
    
    return {
      ...candidate,
      juryAverage,
      publicVotes,
      publicScore,
      combinedScore,
    };
  }).sort((a, b) => b.combinedScore - a.combinedScore) || [];

  const getPodiumIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <Medal className="h-7 w-7 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getPodiumColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/30";
      case 2:
        return "bg-gradient-to-br from-gray-400/20 to-gray-500/10 border-gray-400/30";
      case 3:
        return "bg-gradient-to-br from-amber-600/20 to-amber-700/10 border-amber-600/30";
      default:
        return "bg-card border-border/50";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="mb-2 text-3xl font-bold flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            Classement des candidats
          </h1>
          <p className="text-muted-foreground">
            Résultats combinés : 70% évaluations jury + 30% votes du public
          </p>
        </div>

        {/* Contest Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Sélectionner un concours</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedContestId} onValueChange={setSelectedContestId}>
              <SelectTrigger className="w-full md:w-[400px]">
                <SelectValue placeholder="Choisir un concours" />
              </SelectTrigger>
              <SelectContent>
                {contests?.map((contest) => (
                  <SelectItem key={contest.id} value={contest.id.toString()}>
                    {contest.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Statistics */}
        {selectedContestId && leaderboard && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalVotes}</p>
                    <p className="text-sm text-muted-foreground">Votes totaux</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{candidates?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Candidats</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{uniqueVoters}</p>
                    <p className="text-sm text-muted-foreground">Votants uniques</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Podium - Top 3 */}
        {selectedContestId && rankings.length > 0 && (
          <div>
            <h2 className="mb-6 text-2xl font-bold">Podium</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {rankings.slice(0, 3).map((candidate, index) => {
                const rank = index + 1;
                return (
                  <Card key={candidate.id} className={`${getPodiumColor(rank)} border-2`}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        {/* Rank Icon */}
                        <div className="mb-4">
                          {getPodiumIcon(rank)}
                        </div>

                        {/* Photo */}
                        <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-background">
                          {candidate.profilePhoto ? (
                            <img
                              src={candidate.profilePhoto}
                              alt={`${candidate.firstName} ${candidate.lastName}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-muted">
                              <Users className="h-12 w-12 text-muted-foreground/20" />
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <h3 className="mb-1 text-xl font-bold">
                          {candidate.firstName} {candidate.lastName}
                        </h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                          {candidate.category === 'miss' ? 'Miss' :
                           candidate.category === 'mister' ? 'Mister' :
                           candidate.category === 'teen_miss' ? 'Teen Miss' :
                           'Teen Mister'}
                        </p>

                        {/* Scores */}
                        <div className="w-full space-y-2">
                          <div className="flex items-center justify-between rounded-lg bg-background/50 px-3 py-2">
                            <span className="text-sm">Score jury</span>
                            <span className="font-bold text-primary">{candidate.juryAverage.toFixed(1)}/10</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-background/50 px-3 py-2">
                            <span className="text-sm">Votes public</span>
                            <span className="font-bold text-primary">{candidate.publicVotes}</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-primary/20 px-3 py-2 border border-primary/30">
                            <span className="text-sm font-semibold">Score final</span>
                            <span className="text-lg font-bold text-primary">{candidate.combinedScore.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Full Rankings */}
        {selectedContestId && rankings.length > 3 && (
          <div>
            <h2 className="mb-6 text-2xl font-bold">Classement complet</h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {rankings.map((candidate, index) => {
                    const rank = index + 1;
                    if (rank <= 3) return null; // Skip top 3, already shown in podium

                    return (
                      <div key={candidate.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                        {/* Rank */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold">
                          {rank}
                        </div>

                        {/* Photo */}
                        <div className="h-12 w-12 overflow-hidden rounded-full">
                          {candidate.profilePhoto ? (
                            <img
                              src={candidate.profilePhoto}
                              alt={`${candidate.firstName} ${candidate.lastName}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-muted">
                              <Users className="h-6 w-6 text-muted-foreground/20" />
                            </div>
                          )}
                        </div>

                        {/* Name & Category */}
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {candidate.firstName} {candidate.lastName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {candidate.category === 'miss' ? 'Miss' :
                             candidate.category === 'mister' ? 'Mister' :
                             candidate.category === 'teen_miss' ? 'Teen Miss' :
                             'Teen Mister'}
                          </p>
                        </div>

                        {/* Scores */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Jury</p>
                            <p className="font-bold">{candidate.juryAverage.toFixed(1)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Public</p>
                            <p className="font-bold">{candidate.publicVotes}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Final</p>
                            <p className="text-lg font-bold text-primary">{candidate.combinedScore.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {selectedContestId && rankings.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Trophy className="mb-4 h-16 w-16 text-muted-foreground/20" />
              <h3 className="mb-2 text-lg font-semibold">Aucun résultat disponible</h3>
              <p className="text-sm text-muted-foreground">
                Les candidats n'ont pas encore été évalués pour ce concours
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
