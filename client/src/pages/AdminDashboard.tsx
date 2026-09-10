import { useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Users, Trophy, Vote, TrendingUp, ShieldCheck, Calendar, Briefcase, FileText, Inbox, UserPlus, Bell } from "lucide-react";
import ExportVotesDialog from "@/components/ExportVotesDialog";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: contests, isLoading: contestsLoading } = trpc.contests.list.useQuery();
  const contest2027 = useMemo(() => contests?.find((contest) => contest.year === 2027), [contests]);
  const contestId = contest2027?.id ?? 0;
  const { data: candidates, isLoading: candidatesLoading } = trpc.candidates.listByContest.useQuery(
    { contestId },
    { enabled: contestId > 0 }
  );

  if (user?.role !== "admin" && user?.role !== "owner" && user?.role !== "super_admin") {
    setLocation("/login?returnTo=/admin");
    return null;
  }

  const realCandidates = candidates ?? [];
  const totalVotes = realCandidates.reduce((sum, candidate) => sum + Number(candidate.voteCount || 0), 0);
  const leaderboard = [...realCandidates]
    .filter((candidate) => ["approved", "finalist", "winner"].includes(candidate.status))
    .sort((a, b) => Number(b.voteCount || 0) - Number(a.voteCount || 0))
    .slice(0, 5);
  const loading = contestsLoading || (contestId > 0 && candidatesLoading);

  const statsCards = [
    { title: "Votes 2027", value: loading ? "…" : totalVotes, icon: Vote, description: "Total réel des votes publiés" },
    { title: "Candidats 2027", value: loading ? "…" : realCandidates.length, icon: Users, description: "Dossiers créés dans l’édition" },
    { title: "Édition", value: contest2027 ? "2027" : "—", icon: Calendar, description: contest2027 ? contest2027.status : "Créée au premier dossier valide" },
    { title: "Anti-double-vote", value: "Actif", icon: ShieldCheck, description: "Contrôle concours + appareil" },
  ];

  return <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white">
    <header className="border-b border-white/10 bg-black/65 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-semibold">Cockpit Miss & Mister Dour</h1><p className="text-white/45 text-sm">Édition 2027 · données réelles</p></div>
        <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-white/40">{user?.name || user?.email}</span><ExportVotesDialog/><Button variant="outline" size="sm" onClick={() => setLocation("/admin/events")}><Calendar className="w-4 h-4 mr-2"/>Événements</Button></div>
      </div>
    </header>

    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statsCards.map(({ title, value, icon: Icon, description }) => <Card key={title} className="bg-white/[.035] border-white/10"><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-xs text-white/50">{title}</CardTitle><Icon className="w-4 h-4 text-amber-200"/></div></CardHeader><CardContent><div className="text-2xl md:text-3xl font-semibold text-white">{value}</div><p className="text-[11px] text-white/35 mt-1">{description}</p></CardContent></Card>)}
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-6">
        <Button onClick={() => setLocation("/admin/applications")} className="min-h-20 justify-start gap-4 border border-amber-300/35 bg-amber-300/10 px-6 text-left text-white hover:bg-amber-300/15"><Inbox className="h-7 w-7 text-amber-300"/><span><strong className="block text-base">Nouvelles candidatures</strong><small className="block text-white/55">Voir, valider ou refuser les formulaires reçus</small></span></Button>
        <Button onClick={() => setLocation("/admin/notifications")} className="min-h-20 justify-start gap-4 border border-white/12 bg-white/[.035] px-6 text-left text-white hover:bg-white/[.07]"><Bell className="h-7 w-7 text-amber-200"/><span><strong className="block text-base">Messages & notifications</strong><small className="block text-white/55">Les formulaires Contact arrivent ici</small></span></Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white/[.035] border-white/10"><CardHeader><CardTitle className="text-white flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-300"/>Top 5 candidats 2027</CardTitle><CardDescription>{contest2027 ? "Classement calculé sur les données de l’édition 2027" : "L’édition 2027 sera créée lors de la première candidature valide"}</CardDescription></CardHeader><CardContent>
          {leaderboard.length ? <div className="space-y-3">{leaderboard.map((candidate, index) => <button type="button" key={candidate.id} onClick={() => setLocation(`/admin/candidates`)} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[.035] hover:bg-white/[.06] text-left"><div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full grid place-items-center border border-amber-200/20 text-amber-200 text-xs">{index + 1}</span><div><strong className="block text-sm">{candidate.firstName} {candidate.lastName}</strong><small className="text-white/40">{candidate.category === "miss" ? "Miss" : candidate.category === "mister" ? "Mister" : candidate.category}</small></div></div><span className="font-semibold">{candidate.voteCount || 0} votes</span></button>)}</div> : <div className="py-10 text-center text-white/40"><Trophy className="w-8 h-8 mx-auto mb-3 opacity-40"/><p>Aucun classement 2027 pour le moment.</p></div>}
        </CardContent></Card>

        <Card className="bg-white/[.035] border-white/10"><CardHeader><CardTitle className="text-white">Actions rapides</CardTitle><CardDescription>Gestion de l’édition et du site</CardDescription></CardHeader><CardContent><div className="grid grid-cols-2 gap-3">
          {[
            ["Candidats", Users, "/admin/candidates"], ["Invitations", UserPlus, "/admin/invitations"], ["Votes", Vote, "/admin/votes"], ["Événements", Calendar, "/admin/events"], ["Partenaires", Briefcase, "/admin/partners"], ["Articles", FileText, "/admin/articles"], ["Analytics", TrendingUp, "/admin/analytics"], ["Notifications", Bell, "/admin/notifications"],
          ].map(([label, Icon, path]) => <Button key={String(label)} variant="outline" onClick={() => setLocation(String(path))} className="h-20 flex flex-col gap-2 bg-white/[.025] border-white/10 hover:bg-white/[.06]"><Icon className="w-5 h-5 text-amber-200"/><span className="text-xs text-white">{String(label)}</span></Button>)}
        </div></CardContent></Card>
      </div>
    </main>
  </div>;
}
