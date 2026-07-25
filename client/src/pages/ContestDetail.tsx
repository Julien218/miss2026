/**
 * ContestDetail.tsx — Page de gestion d'un concours spécifique
 * Accessible via /contests/:id — réservée aux admins
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Crown, ArrowLeft, Edit2, Save, X, Users, Vote, Calendar,
  MapPin, Trophy, FileText, Settings, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  registration: "Inscriptions ouvertes",
  selection: "Sélection",
  ongoing: "En cours",
  completed: "Terminé",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  registration: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  selection: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  ongoing: "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function ContestDetail() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const contestId = parseInt(params.id ?? "0", 10);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    year: 0,
    description: "",
    status: "draft",
    location: "",
    rules: "",
    prizes: "",
  });

  const { data: contest, isLoading, refetch } = trpc.contests.getById.useQuery(
    { id: contestId },
    {
      enabled: !isNaN(contestId) && contestId > 0,
    }
  );

  // Sync form when contest loads
  const contestLoaded = !!contest;
  if (contestLoaded && !isEditing && editForm.title === "" && contest.title) {
    setEditForm({
      title: contest.title ?? "",
      year: contest.year ?? new Date().getFullYear(),
      description: contest.description ?? "",
      status: contest.status ?? "draft",
      location: contest.location ?? "",
      rules: contest.rules ?? "",
      prizes: contest.prizes ?? "",
    });
  }

  const { data: candidates } = trpc.candidates.listByContest.useQuery(
    { contestId },
    { enabled: !isNaN(contestId) && contestId > 0 }
  );

  const { data: leaderboard } = trpc.votes.getLeaderboard.useQuery(
    { contestId, limit: 5 },
    { enabled: !isNaN(contestId) && contestId > 0 }
  );

  const updateMutation = trpc.contests.update.useMutation({
    onSuccess: () => {
      toast.success("Concours mis à jour !");
      setIsEditing(false);
      refetch();
    },
    onError: (err) => toast.error("Erreur : " + err.message),
  });

  const handleSave = () => {
    updateMutation.mutate({
      id: contestId,
      title: editForm.title,
      year: Number(editForm.year),
      description: editForm.description,
      status: editForm.status as "draft" | "registration" | "selection" | "ongoing" | "completed",
      location: editForm.location,
      rules: editForm.rules,
      prizes: editForm.prizes,
    });
  };

  const handleCancelEdit = () => {
    if (contest) {
      setEditForm({
        title: contest.title ?? "",
        year: contest.year ?? new Date().getFullYear(),
        description: contest.description ?? "",
        status: contest.status ?? "draft",
        location: contest.location ?? "",
        rules: contest.rules ?? "",
        prizes: contest.prizes ?? "",
      });
    }
    setIsEditing(false);
  };

  // Accès réservé aux admins
  if (user && user.role !== "admin" && user.role !== "owner") {
    return (
      <DashboardLayout>
        <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-4">
          <AlertTriangle className="w-12 h-12 text-yellow-400" />
          <p className="text-white text-lg">Accès réservé aux administrateurs</p>
          <Button onClick={() => setLocation("/")} variant="outline">Retour à l'accueil</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-64">
          <div className="text-gray-400">Chargement du concours…</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!contest) {
    return (
      <DashboardLayout>
        <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-4">
          <Crown className="w-12 h-12 text-gray-600" />
          <p className="text-white text-lg">Concours introuvable</p>
          <p className="text-gray-400 text-sm">Le concours #{contestId} n'existe pas en base de données.</p>
          <Button onClick={() => setLocation("/contests")} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const totalVotes = (leaderboard ?? []).reduce((sum, c) => sum + c.voteCount, 0);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/contests")}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{contest.title}</h1>
                <Badge className={`border text-xs ${STATUS_COLORS[contest.status ?? "draft"]}`}>
                  {STATUS_LABELS[contest.status ?? "draft"]}
                </Badge>
              </div>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Édition {contest.year}
                {contest.location && (
                  <>
                    <span className="text-gray-600">·</span>
                    <MapPin className="w-4 h-4" /> {contest.location}
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="ghost" onClick={handleCancelEdit} className="gap-2 text-gray-400">
                  <X className="w-4 h-4" /> Annuler
                </Button>
                <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2" style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)", color: "#0A0A0F" }}>
                  <Save className="w-4 h-4" />
                  {updateMutation.isPending ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2 border-gray-600">
                <Edit2 className="w-4 h-4" /> Modifier
              </Button>
            )}
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/60 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Candidats</p>
                  <p className="text-2xl font-bold text-white">{candidates?.length ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">En tête</p>
                  <p className="text-sm font-bold text-white truncate">{leaderboard?.[0]?.candidateName ?? "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/60 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Settings className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Statut</p>
                  <p className="text-sm font-bold text-white">{STATUS_LABELS[contest.status ?? "draft"]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations du concours */}
          <Card className="bg-gray-900/60 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-1">
                    <Label>Titre</Label>
                    <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Année</Label>
                      <Input type="number" value={editForm.year} onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) })} className="bg-gray-800 border-gray-600 text-white" />
                    </div>
                    <div className="space-y-1">
                      <Label>Statut</Label>
                      <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k} className="text-white">{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Lieu</Label>
                    <Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="Dour, Belgique" className="bg-gray-800 border-gray-600 text-white" />
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="bg-gray-800 border-gray-600 text-white resize-none" rows={3} />
                  </div>
                </>
              ) : (
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs text-gray-400 mb-1">Titre</dt>
                    <dd className="text-white font-medium">{contest.title}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs text-gray-400 mb-1">Année</dt>
                      <dd className="text-white">{contest.year}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400 mb-1">Statut</dt>
                      <dd><Badge className={`border text-xs ${STATUS_COLORS[contest.status ?? "draft"]}`}>{STATUS_LABELS[contest.status ?? "draft"]}</Badge></dd>
                    </div>
                  </div>
                  {contest.location && (
                    <div>
                      <dt className="text-xs text-gray-400 mb-1">Lieu</dt>
                      <dd className="text-white flex items-center gap-1"><MapPin className="w-3 h-3" />{contest.location}</dd>
                    </div>
                  )}
                  {contest.description && (
                    <div>
                      <dt className="text-xs text-gray-400 mb-1">Description</dt>
                      <dd className="text-gray-300 text-sm">{contest.description}</dd>
                    </div>
                  )}
                </dl>
              )}
            </CardContent>
          </Card>

          {/* Top 5 candidats */}
          <Card className="bg-gray-900/60 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Top 5 Candidats
              </CardTitle>
              <CardDescription className="text-gray-400">Classement en temps réel</CardDescription>
            </CardHeader>
            <CardContent>
              {(leaderboard ?? []).length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Vote className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Aucun vote enregistré</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(leaderboard ?? []).map((c, i) => {
                    const pct = totalVotes > 0 ? Math.round((c.voteCount / totalVotes) * 100) : 0;
                    return (
                      <div key={c.candidateId} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-gray-400 text-black" : i === 2 ? "bg-orange-600 text-white" : "bg-gray-700 text-gray-300"}`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{c.candidateName}</p>
                          <div className="h-1.5 bg-gray-700 rounded-full mt-1 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #C87941, #D4AF37)" }} />
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-white">{c.voteCount}</p>
                          <p className="text-xs text-gray-400">{pct}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 border-gray-600 text-gray-300 hover:text-white"
                onClick={() => setLocation("/admin/votes")}
              >
                Voir tous les votes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Règlement & Prix */}
        {(isEditing || contest.rules || contest.prizes) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900/60 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Règlement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea value={editForm.rules} onChange={(e) => setEditForm({ ...editForm, rules: e.target.value })} placeholder="Règles du concours…" className="bg-gray-800 border-gray-600 text-white resize-none" rows={5} />
                ) : (
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{contest.rules || "Aucun règlement défini."}</p>
                )}
              </CardContent>
            </Card>
            <Card className="bg-gray-900/60 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Prix & Récompenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea value={editForm.prizes} onChange={(e) => setEditForm({ ...editForm, prizes: e.target.value })} placeholder="Liste des prix…" className="bg-gray-800 border-gray-600 text-white resize-none" rows={5} />
                ) : (
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{contest.prizes || "Aucun prix défini."}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions rapides */}
        <Card className="bg-gray-900/60 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Actions rapides</CardTitle>
            <CardDescription className="text-gray-400">Gérer les éléments liés à ce concours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-16 flex flex-col gap-1 border-gray-600 hover:border-purple-500/50" onClick={() => setLocation("/admin/candidates")}>
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-white">Candidats</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 border-gray-600 hover:border-blue-500/50" onClick={() => setLocation("/admin/votes")}>
                <Vote className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-white">Votes</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 border-gray-600 hover:border-green-500/50" onClick={() => setLocation("/admin/events")}>
                <Calendar className="w-5 h-5 text-green-400" />
                <span className="text-xs text-white">Événements</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1 border-gray-600 hover:border-orange-500/50" onClick={() => setLocation("/admin/analytics")}>
                <Trophy className="w-5 h-5 text-orange-400" />
                <span className="text-xs text-white">Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
