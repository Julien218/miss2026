/**
 * AdminVotes.tsx — Gestion des votes
 * Tableau de bord des votes avec filtres, statistiques et export
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Vote, TrendingUp, AlertTriangle, Search, Download,
  BarChart3, Shield, Clock, Users
} from "lucide-react";
import { toast } from "sonner";

export default function AdminVotes() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: leaderboard, isLoading } = trpc.votes.getLeaderboard.useQuery({
    contestId: 1,
    limit: 20,
  });

  const filtered = (leaderboard ?? []).filter((c) =>
    c.candidateName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalVotes = (leaderboard ?? []).reduce((sum, c) => sum + c.voteCount, 0);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Vote className="w-6 h-6 text-blue-400" />
              Gestion des Votes
            </h1>
            <p className="text-gray-400 text-sm mt-1">Suivi en temps réel des votes du concours</p>
          </div>
          <Button
            onClick={() => toast.info("Export CSV en cours de développement")}
            className="gap-2"
            style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)", color: "#0A0A0F" }}
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/60 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Vote className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total votes</p>
                  <p className="text-2xl font-bold text-white">{totalVotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/60 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Candidats actifs</p>
                  <p className="text-2xl font-bold text-white">{leaderboard?.length ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/60 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Votes aujourd'hui</p>
                  <p className="text-2xl font-bold text-white">—</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/60 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Shield className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Anti-fraude</p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Actif</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classement */}
        <Card className="bg-gray-900/60 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-yellow-400" />
                  Classement des candidats
                </CardTitle>
                <CardDescription className="text-gray-400">Votes par candidat en temps réel</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un candidat…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-gray-800 border-gray-600 text-white w-56"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Chargement…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Aucun vote enregistré</div>
            ) : (
              <div className="space-y-3">
                {filtered.map((candidate, index) => {
                  const pct = totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0;
                  return (
                    <div
                      key={candidate.candidateId}
                      className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                    >
                      {/* Rang */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          index === 0 ? "bg-yellow-500 text-black" :
                          index === 1 ? "bg-gray-400 text-black" :
                          index === 2 ? "bg-orange-600 text-white" :
                          "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {index + 1}
                      </div>
                      {/* Nom + catégorie */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{candidate.candidateName}</p>
                        <p className="text-xs text-gray-400">{candidate.category}</p>
                      </div>
                      {/* Barre de progression */}
                      <div className="w-32 hidden sm:block">
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: "linear-gradient(90deg, #C87941, #D4AF37)",
                            }}
                          />
                        </div>
                      </div>
                      {/* Votes + % */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-white">{candidate.voteCount}</p>
                        <p className="text-xs text-gray-400">{pct}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerte anti-fraude */}
        <Card className="bg-gray-900/60 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Surveillance Anti-Fraude
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-white">Détection IP</p>
                  <p className="text-xs text-gray-400">Opérationnelle</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-white">Limite par session</p>
                  <p className="text-xs text-gray-400">1 vote / candidat</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-white">Logs en temps réel</p>
                  <p className="text-xs text-gray-400">Actifs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
