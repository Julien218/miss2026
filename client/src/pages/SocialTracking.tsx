import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, MousePointerClick, Share2, QrCode, Trophy, Medal, Award } from "lucide-react";

export default function SocialTracking() {
  const [selectedContestId, setSelectedContestId] = useState<number | null>(null);
  
  const { data: contests } = trpc.contests.list.useQuery();
  const { data: scores, refetch } = trpc.tracking.getScoresByContest.useQuery(
    { contestId: selectedContestId! },
    { enabled: !!selectedContestId, refetchInterval: 5000 } // Auto-refresh every 5 seconds
  );

  useEffect(() => {
    if (contests && contests.length > 0 && !selectedContestId) {
      setSelectedContestId(contests[0]?.id || null);
    }
  }, [contests, selectedContestId]);

  const missScores = scores?.filter(s => s.candidateCategory === "miss") || [];
  const misterScores = scores?.filter(s => s.candidateCategory === "mister") || [];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-700" />;
    return null;
  };

  const ScoreCard = ({ candidate, rank }: { candidate: any; rank: number }) => (
    <Card className={`${rank <= 3 ? 'border-2 border-gold' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getRankIcon(rank)}
            <div>
              <CardTitle className="text-lg">{candidate.candidateName}</CardTitle>
              <CardDescription>Rang #{rank}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-2xl font-bold text-gold">
            {candidate.totalScore}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-500" />
            <span className="text-sm">{candidate.viewCount} vues</span>
          </div>
          <div className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-green-500" />
            <span className="text-sm">{candidate.clickCount} clics</span>
          </div>
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-purple-500" />
            <span className="text-sm">{candidate.shareCount} partages</span>
          </div>
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-orange-500" />
            <span className="text-sm">{candidate.qrScanCount} scans QR</span>
          </div>
        </div>
        
        {candidate.isClosed === 1 && (
          <Badge variant="secondary" className="mt-4 w-full justify-center">
            Score figé
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-neutral-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-center mb-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
            Prix Réseaux Sociaux
          </h1>
          <p className="text-center text-neutral-600 mb-6">
            Classement en temps réel basé sur l'engagement du public
          </p>
          
          <div className="flex justify-center gap-4 items-center">
            <Select
              value={selectedContestId?.toString()}
              onValueChange={(value) => setSelectedContestId(parseInt(value))}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Sélectionner un concours" />
              </SelectTrigger>
              <SelectContent>
                {contests?.map((contest) => (
                  <SelectItem key={contest.id} value={contest.id.toString()}>
                    {contest.title} {contest.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={() => refetch()} variant="outline">
              Actualiser
            </Button>
          </div>
        </div>

        {/* Scoring Explanation */}
        <Card className="mb-8 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Comment fonctionne le scoring ?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span>Vue = <strong>1 point</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-green-500" />
                <span>Clic = <strong>3 points</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-500" />
                <span>Partage = <strong>10 points</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-orange-500" />
                <span>Scan QR = <strong>5 points</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Miss Category */}
        <div className="mb-12">
          <h2 className="text-3xl font-serif font-bold mb-6 text-center text-pink-600">
            🌟 Classement Miss
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {missScores.map((candidate, index) => (
              <ScoreCard key={candidate.candidateId} candidate={candidate} rank={index + 1} />
            ))}
            {missScores.length === 0 && (
              <p className="text-center text-neutral-500 col-span-full">
                Aucun score disponible pour le moment
              </p>
            )}
          </div>
        </div>

        {/* Mister Category */}
        <div>
          <h2 className="text-3xl font-serif font-bold mb-6 text-center text-blue-600">
            👑 Classement Mister
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {misterScores.map((candidate, index) => (
              <ScoreCard key={candidate.candidateId} candidate={candidate} rank={index + 1} />
            ))}
            {misterScores.length === 0 && (
              <p className="text-center text-neutral-500 col-span-full">
                Aucun score disponible pour le moment
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
