import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Crown, ExternalLink, Heart, MapPin, Search, Star, Trophy, X } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { SEOHead } from "@/components/SEOHead";
import { BRANDING } from "@/config/branding";

const CATEGORY_LABELS: Record<string, string> = {
  miss: "Miss",
  mister: "Mister",
  teen_miss: "Teen Miss",
  teen_mister: "Teen Mister",
};

interface CandidateCardProps {
  candidate: any;
  isAdmin: boolean;
  onStatusClick: (candidate: any) => void;
  onViewProfile: (id: number) => void;
}

function CandidateCard({ candidate, isAdmin, onStatusClick, onViewProfile }: CandidateCardProps) {
  const [imgError, setImgError] = useState(false);
  const initials = `${candidate.firstName?.[0] || ""}${candidate.lastName?.[0] || ""}`.toUpperCase();

  return (
    <article className="mmd-candidate-editorial-card group">
      <button type="button" className="mmd-candidate-editorial-photo" onClick={() => onViewProfile(candidate.id)}>
        {candidate.profilePhoto && !imgError ? (
          <img
            src={candidate.profilePhoto}
            alt={`${candidate.firstName} ${candidate.lastName}`}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="mmd-candidate-fallback">
            <span>{initials || "MMD"}</span>
            <small>Portrait à venir</small>
          </div>
        )}
        <div className="mmd-candidate-photo-shade" />
        <span className="mmd-candidate-category">{CATEGORY_LABELS[candidate.category] || candidate.category}</span>
        {(candidate.voteCount ?? 0) > 0 && (
          <span className="mmd-candidate-votes"><Heart className="h-3.5 w-3.5" />{candidate.voteCount}</span>
        )}
      </button>

      <div className="mmd-candidate-editorial-body">
        <div>
          <small>ÉDITION 2027</small>
          <h2>{candidate.firstName} <em>{candidate.lastName}</em></h2>
          {candidate.city && <p className="mmd-candidate-city"><MapPin className="h-4 w-4" />{candidate.city}</p>}
        </div>
        {candidate.bio && <p className="mmd-candidate-bio">{candidate.bio}</p>}
        <div className="mmd-candidate-actions">
          <button type="button" onClick={() => onViewProfile(candidate.id)}>
            Voir le profil <ExternalLink className="h-4 w-4" />
          </button>
          {isAdmin && (
            <button type="button" className="mmd-admin-mini" onClick={() => onStatusClick(candidate)} title="Modifier le statut">
              <Trophy className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Candidates() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const { data: allCandidates, refetch } = trpc.candidateProfile.listApproved.useQuery();
  const candidates = allCandidates?.filter((candidate) => {
    const categoryMatch = selectedCategory === "all" || candidate.category === selectedCategory;
    const searchMatch = !searchTerm ||
      `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.city && candidate.city.toLowerCase().includes(searchTerm.toLowerCase()));
    return categoryMatch && searchMatch;
  });

  const updateStatusMutation = trpc.candidates.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Statut mis à jour");
      setIsStatusDialogOpen(false);
      refetch();
    },
    onError: (error: any) => toast.error(`Erreur : ${error.message}`),
  });

  const counts = {
    all: allCandidates?.length || 0,
    miss: allCandidates?.filter((c) => c.category === "miss").length || 0,
    mister: allCandidates?.filter((c) => c.category === "mister").length || 0,
  };
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="mmd-public-page">
      <SEOHead
        title="Candidats 2027 — Miss & Mister Dour"
        description="Découvrez les profils officiels de l'édition 2027 de Miss & Mister Dour."
        url="https://missetmisterdour.be/candidates"
        tags={["Miss Dour 2027", "Mister Dour 2027", "candidats Dour", "Hainaut"]}
      />

      <section className="mmd-public-hero mmd-public-hero--candidates">
        <div className="mmd-container">
          <div className="mmd-public-kicker"><span>03</span><i />LES VISAGES</div>
          <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" className="mmd-public-logo-mark" />
          <h1>Les personnalités de <em>l’édition 2027.</em></h1>
          <p>Découvrez chaque parcours dans une galerie pensée comme un magazine digital, fluide sur mobile comme sur grand écran.</p>
        </div>
      </section>

      <section className="mmd-section">
        <div className="mmd-container">
          <div className="mmd-candidate-filter-panel">
            <label className="mmd-search-field">
              <Search className="h-4 w-4" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher un nom ou une ville"
              />
            </label>
            <div className="mmd-category-filters" role="group" aria-label="Filtrer les candidats">
              {[
                { key: "all", label: "Tous", count: counts.all },
                { key: "miss", label: "Miss", count: counts.miss },
                { key: "mister", label: "Mister", count: counts.mister },
              ].map((filter) => (
                <button
                  type="button"
                  key={filter.key}
                  className={selectedCategory === filter.key ? "is-active" : ""}
                  onClick={() => setSelectedCategory(filter.key)}
                >
                  {filter.label}<span>{filter.count}</span>
                </button>
              ))}
            </div>
          </div>

          {candidates && candidates.length > 0 ? (
            <div className="mmd-candidate-editorial-grid">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  isAdmin={isAdmin}
                  onStatusClick={(item) => { setSelectedCandidate(item); setIsStatusDialogOpen(true); }}
                  onViewProfile={(id) => setLocation(`/candidat/${id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="mmd-empty-editorial">
              <Crown />
              <h2>Aucun profil correspondant</h2>
              <p>{searchTerm ? "Modifiez votre recherche ou vos filtres." : "Les profils officiels seront publiés ici après validation."}</p>
            </div>
          )}
        </div>
      </section>

      {isAdmin && (
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="bg-[#0d0a08] border-[#ead3a5]/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-[#ead3a5]">Modifier le statut</DialogTitle>
              <DialogDescription className="text-white/55">
                {selectedCandidate?.firstName} {selectedCandidate?.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <Button variant="outline" onClick={() => updateStatusMutation.mutate({ id: selectedCandidate?.id, status: "approved" as any })}><Check className="mr-2 h-4 w-4" />Approuver</Button>
              <Button variant="outline" onClick={() => updateStatusMutation.mutate({ id: selectedCandidate?.id, status: "rejected" as any })}><X className="mr-2 h-4 w-4" />Rejeter</Button>
              <Button variant="outline" onClick={() => updateStatusMutation.mutate({ id: selectedCandidate?.id, status: "finalist" as any })}><Star className="mr-2 h-4 w-4" />Finaliste</Button>
              <Button variant="outline" onClick={() => updateStatusMutation.mutate({ id: selectedCandidate?.id, status: "winner" as any })}><Crown className="mr-2 h-4 w-4" />Gagnant</Button>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>Annuler</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
