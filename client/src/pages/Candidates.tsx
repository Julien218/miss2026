/**
 * Candidates.tsx
 * Galerie premium des candidats Miss & Mister Dour 2026
 * Design noir et doré avec vraies photos de profil
 */

import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Search, Crown, Check, X, Trophy, MapPin, Heart, ExternalLink, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

// ─── Constantes ───────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  miss: "Miss",
  mister: "Mister",
  teen_miss: "Teen Miss",
  teen_mister: "Teen Mister",
};

const CATEGORY_COLORS: Record<string, string> = {
  miss: "from-pink-500 to-rose-600",
  mister: "from-blue-500 to-indigo-600",
  teen_miss: "from-purple-500 to-pink-500",
  teen_mister: "from-cyan-500 to-blue-500",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
  finalist: "Finaliste",
  winner: "Gagnant",
};

// ─── Composant Card Candidat ──────────────────────────────────────────────────
interface CandidateCardProps {
  candidate: any;
  isAdmin: boolean;
  onStatusClick: (candidate: any) => void;
  onViewProfile: (id: number) => void;
}

function CandidateCard({ candidate, isAdmin, onStatusClick, onViewProfile }: CandidateCardProps) {
  const [imgError, setImgError] = useState(false);
  const categoryGradient = CATEGORY_COLORS[candidate.category] || "from-gold to-yellow-600";
  const initials = `${candidate.firstName?.[0] || ""}${candidate.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gray-900 border border-gold/20 hover:border-gold/60 transition-all duration-300 hover:shadow-xl hover:shadow-gold/10 hover:-translate-y-1">
      {/* Photo / Fallback */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-800">
        {candidate.profilePhoto && !imgError ? (
          <img
            src={candidate.profilePhoto}
            alt={`${candidate.firstName} ${candidate.lastName}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`flex h-full items-center justify-center bg-gradient-to-br ${categoryGradient} opacity-20`}>
            <div className="flex flex-col items-center gap-3">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${categoryGradient} flex items-center justify-center shadow-2xl`}>
                {initials ? (
                  <span className="text-3xl font-bold text-white">{initials}</span>
                ) : (
                  <Crown className="w-10 h-10 text-white" />
                )}
              </div>
              <span className="text-gray-400 text-sm">Photo à venir</span>
            </div>
          </div>
        )}

        {/* Overlay dégradé bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {/* Badge statut (coin haut droit) */}
        {candidate.status === "finalist" && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-gold text-black text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            <Star className="w-3 h-3" />
            Finaliste
          </div>
        )}
        {candidate.status === "winner" && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-400 text-black text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            <Crown className="w-3 h-3" />
            Gagnant
          </div>
        )}

        {/* Badge catégorie (coin haut gauche) */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 bg-gradient-to-r ${categoryGradient} rounded-full text-white text-xs font-bold shadow-lg`}>
          {CATEGORY_LABELS[candidate.category] || candidate.category}
        </div>

        {/* Votes (bas gauche) */}
        {(candidate.voteCount ?? 0) > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm border border-gold/30 rounded-full px-3 py-1">
            <Heart className="w-3.5 h-3.5 text-gold fill-gold" />
            <span className="text-gold text-xs font-bold">{candidate.voteCount}</span>
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="p-4">
        <h3 className="font-bold text-white text-lg leading-tight mb-1">
          {candidate.firstName} <span className="text-gold">{candidate.lastName}</span>
        </h3>

        {candidate.city && (
          <p className="flex items-center gap-1.5 text-gray-400 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5 text-gold/60 flex-shrink-0" />
            {candidate.city}
          </p>
        )}

        {candidate.bio && (
          <p className="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed">
            {candidate.bio}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onViewProfile(candidate.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gold text-black text-sm font-bold rounded-lg hover:bg-gold/90 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Voir le profil
          </button>

          {isAdmin && (
            <button
              onClick={() => onStatusClick(candidate)}
              className="px-3 py-2 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
              title="Modifier le statut"
            >
              <Trophy className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Candidates() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContest, setSelectedContest] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const { data: contests } = trpc.contests.list.useQuery();
  const activeContest = selectedContest === "all"
    ? contests?.find(c => c.status !== "completed")
    : contests?.find(c => c.id === parseInt(selectedContest));

  const { data: allCandidates, refetch } = trpc.candidates.search.useQuery({
    contestId: activeContest?.id || 0,
    search: searchTerm || undefined,
  }, { enabled: !!activeContest });

  // Filtrage par catégorie côté client
  const candidates = selectedCategory === "all"
    ? allCandidates
    : allCandidates?.filter(c => c.category === selectedCategory);

  const updateStatusMutation = trpc.candidates.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Statut mis à jour");
      setIsStatusDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erreur : " + error.message);
    },
  });

  const handleStatusChange = (candidateId: number, status: string) => {
    updateStatusMutation.mutate({ id: candidateId, status: status as any });
  };

  const handleViewProfile = (id: number) => {
    setLocation(`/candidat/${id}`);
  };

  const isAdmin = user?.role === "admin";

  // Compteurs par catégorie
  const counts = {
    all: allCandidates?.length || 0,
    miss: allCandidates?.filter(c => c.category === "miss").length || 0,
    mister: allCandidates?.filter(c => c.category === "mister").length || 0,
    teen_miss: allCandidates?.filter(c => c.category === "teen_miss").length || 0,
    teen_mister: allCandidates?.filter(c => c.category === "teen_mister").length || 0,
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8 text-gold" />
            <h1 className="text-3xl font-bold text-white">Candidats 2026</h1>
          </div>
          <p className="text-gray-400">
            {isAdmin
              ? `${counts.all} candidat${counts.all > 1 ? "s" : ""} inscrit${counts.all > 1 ? "s" : ""} — gérez et évaluez les profils`
              : `Découvrez les ${counts.all} candidat${counts.all > 1 ? "s" : ""} en lice pour Miss & Mister Dour 2026`}
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-gray-900 border border-gold/20 rounded-xl p-5 mb-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Recherche */}
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher un candidat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-gold"
              />
            </div>

            {/* Concours */}
            <Select value={selectedContest} onValueChange={setSelectedContest}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Sélectionner un concours" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">Concours actif</SelectItem>
                {contests?.map((contest) => (
                  <SelectItem key={contest.id} value={contest.id.toString()} className="text-white">
                    {contest.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Catégorie */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">Toutes ({counts.all})</SelectItem>
                <SelectItem value="miss" className="text-white">Miss ({counts.miss})</SelectItem>
                <SelectItem value="mister" className="text-white">Mister ({counts.mister})</SelectItem>
                <SelectItem value="teen_miss" className="text-white">Teen Miss ({counts.teen_miss})</SelectItem>
                <SelectItem value="teen_mister" className="text-white">Teen Mister ({counts.teen_mister})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtres rapides catégorie */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "Tous", count: counts.all },
              { key: "miss", label: "Miss", count: counts.miss, gradient: "from-pink-500 to-rose-600" },
              { key: "mister", label: "Mister", count: counts.mister, gradient: "from-blue-500 to-indigo-600" },
              { key: "teen_miss", label: "Teen Miss", count: counts.teen_miss, gradient: "from-purple-500 to-pink-500" },
              { key: "teen_mister", label: "Teen Mister", count: counts.teen_mister, gradient: "from-cyan-500 to-blue-500" },
            ].map(({ key, label, count, gradient }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === key
                    ? gradient
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                      : "bg-gold text-black shadow-lg"
                    : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
                }`}
              >
                {label} {count > 0 && <span className="opacity-70">({count})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Galerie */}
        {candidates && candidates.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isAdmin={isAdmin}
                onStatusClick={(c) => { setSelectedCandidate(c); setIsStatusDialogOpen(true); }}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center mb-6">
              <Crown className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Aucun candidat trouvé</h3>
            <p className="text-gray-500 max-w-sm">
              {searchTerm
                ? "Essayez de modifier vos critères de recherche"
                : "Les candidatures seront bientôt disponibles"}
            </p>
          </div>
        )}

        {/* Dialog modification statut (admin) */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="bg-gray-900 border border-gold/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-gold">Modifier le statut</DialogTitle>
              <DialogDescription className="text-gray-400">
                Changez le statut de {selectedCandidate?.firstName} {selectedCandidate?.lastName}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4">
              <Button
                variant="outline"
                className="justify-start border-gray-700 text-white hover:bg-gray-800"
                onClick={() => handleStatusChange(selectedCandidate?.id, "approved")}
              >
                <Check className="mr-2 h-4 w-4 text-green-400" />
                Approuver
              </Button>
              <Button
                variant="outline"
                className="justify-start border-gray-700 text-white hover:bg-gray-800"
                onClick={() => handleStatusChange(selectedCandidate?.id, "rejected")}
              >
                <X className="mr-2 h-4 w-4 text-red-400" />
                Rejeter
              </Button>
              <Button
                variant="outline"
                className="justify-start border-gray-700 text-white hover:bg-gray-800"
                onClick={() => handleStatusChange(selectedCandidate?.id, "finalist")}
              >
                <Star className="mr-2 h-4 w-4 text-gold" />
                Marquer comme Finaliste
              </Button>
              <Button
                variant="outline"
                className="justify-start border-gray-700 text-white hover:bg-gray-800"
                onClick={() => handleStatusChange(selectedCandidate?.id, "winner")}
              >
                <Crown className="mr-2 h-4 w-4 text-yellow-400" />
                Marquer comme Gagnant
              </Button>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
                onClick={() => setIsStatusDialogOpen(false)}
              >
                Annuler
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
