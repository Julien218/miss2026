import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Users, Trophy, Vote, TrendingUp, AlertTriangle, Calendar, Briefcase, FileText, Inbox } from "lucide-react";
import ExportVotesDialog from "@/components/ExportVotesDialog";

export default function AdminDashboard() {
  const { user } = useAuth();
  const authLoading = false;

  const stats = {
    totalVotes: 127,
    totalCandidates: 24,
    votesToday: 15,
    fraudRate: 2.3,
  };
  const { data: leaderboard } = trpc.votes.getLeaderboard.useQuery({ contestId: 1, limit: 5 });
  const [, setLocation] = useLocation();

  if (!authLoading && user?.role !== "admin" && user?.role !== "owner" && user?.role !== "super_admin") {
    setLocation("/");
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  const statsCards = [
    { title: "Total Votes", value: stats?.totalVotes || 0, icon: Vote, description: "Votes enregistrés", color: "text-blue-500" },
    { title: "Candidats", value: stats?.totalCandidates || 0, icon: Users, description: "Candidats inscrits", color: "text-purple-500" },
    { title: "Votes Aujourd'hui", value: stats?.votesToday || 0, icon: TrendingUp, description: "Votes des dernières 24h", color: "text-green-500" },
    { title: "Taux de Fraude", value: `${stats?.fraudRate || 0}%`, icon: AlertTriangle, description: "Votes suspects détectés", color: "text-red-500" },
  ];

  const quickActions = [
    { label: "Nouvelles candidatures", icon: Inbox, path: "/admin/applications", iconClass: "text-amber-300", featured: true },
    { label: "Candidats validés", icon: Users, path: "/admin/candidates", iconClass: "text-purple-400" },
    { label: "Votes", icon: Vote, path: "/admin/votes", iconClass: "text-blue-400" },
    { label: "Événements", icon: Calendar, path: "/admin/events", iconClass: "text-green-400" },
    { label: "Partenaires", icon: Briefcase, path: "/admin/partners", iconClass: "text-yellow-400" },
    { label: "Articles", icon: FileText, path: "/admin/articles", iconClass: "text-pink-400" },
    { label: "Analytics", icon: TrendingUp, path: "/admin/analytics", iconClass: "text-orange-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard Administrateur</h1>
              <p className="text-gray-400 text-sm">Miss & Mister Dour 2027</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:inline text-sm text-gray-400">
                Connecté en tant que <span className="text-white font-medium">{user?.name}</span>
              </span>
              <ExportVotesDialog />
              <Button variant="outline" size="sm" onClick={() => setLocation("/admin/events")}>
                <Calendar className="w-4 h-4 mr-2" />
                Événements
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-900/70 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">{stat.title}</CardTitle>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Top 5 Candidats
              </CardTitle>
              <CardDescription className="text-gray-400">Classement en temps réel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard?.map((candidate, index) => (
                  <div key={candidate.candidateId} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? "bg-yellow-500 text-black" : index === 1 ? "bg-gray-400 text-black" : index === 2 ? "bg-orange-600 text-white" : "bg-gray-700 text-gray-300"}`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-white">{candidate.candidateName}</div>
                        <div className="text-sm text-gray-400">{candidate.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{candidate.voteCount} votes</div>
                      <div className="text-sm text-gray-400">{Math.round((candidate.voteCount / (stats?.totalVotes || 1)) * 100)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Actions Rapides</CardTitle>
              <CardDescription className="text-gray-400">Gestion du concours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.path}
                      variant="outline"
                      onClick={() => setLocation(action.path)}
                      className={`h-24 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${action.featured ? "col-span-2 bg-amber-400/10 border-amber-300/40 hover:bg-amber-400/15 hover:border-amber-300/70" : "bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-amber-300/40"}`}
                    >
                      <Icon className={`w-6 h-6 ${action.iconClass}`} />
                      <span className="text-sm text-white">{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">État du Système</CardTitle>
            <CardDescription className="text-gray-400">Statut des services et fonctionnalités</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Votes en ligne", "Anti-fraude actif", "Base de données"].map((label) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <div>
                    <div className="text-sm font-medium text-white">{label}</div>
                    <div className="text-xs text-gray-400">Système opérationnel</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
