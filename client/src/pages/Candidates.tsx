import { useState } from "react";
import { useLocation } from "wouter";
import { Crown, Check, X, Trophy, MapPin, Star, Search, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { SEOHead } from "@/components/SEOHead";

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
  const category = CATEGORY_LABELS[candidate.category] || "Candidat";

  return (
    <article className="group relative overflow-hidden rounded-[26px] border border-[#d9b978]/16 bg-[#111214] transition duration-500 hover:-translate-y-1 hover:border-[#d9b978]/38">
      <button
        type="button"
        onClick={() => onViewProfile(candidate.id)}
        className="relative block w-full text-left"
        aria-label={`Voir le profil de ${candidate.firstName} ${candidate.lastName}`}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-[#151515]">
          {candidate.profilePhoto && !imgError ? (
            <img
              src={candidate.profilePhoto}
              alt={`${candidate.firstName} ${candidate.lastName}`}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
              onError={() => setImgError(true)}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_28%,rgba(217,185,120,.16),transparent_38%),linear-gradient(145deg,#17130f,#080808)]">
              <div className="text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#d9b978]/28 bg-black/40 text-xl font-semibold tracking-[.08em] text-[#d9b978]">
                  {initials || <Crown className="h-7 w-7" />}
                </div>
                <span className="mt-4 block text-[10px] uppercase tracking-[.16em] text-white/35">Photo à venir</span>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
          <div className="absolute left-4 top-4 rounded-full border border-[#d9b978]/25 bg-black/55 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.16em] text-[#e3c986] backdrop-blur-md">
            {category}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <span className="text-[9px] font-bold uppercase tracking-[.18em] text-[#d9b978]/80">Édition 2027</span>
            <h3 className="mt-2 text-2xl font-semibold leading-none tracking-[-.04em] text-white">
              {candidate.firstName} {candidate.lastName}
            </h3>
            {candidate.city && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-white/55">
                <MapPin className="h-3.5 w-3.5 text-[#d9b978]" /> {candidate.city}
              </p>
            )}
          </div>
        </div>
      </button>

      <div className="flex items-center gap-3 border-t border-white/8 p-4">
        <button
          type="button"
          onClick={() => onViewProfile(candidate.id)}
          className="inline-flex flex-1 items-center justify-between rounded-full border border-white/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.1em] text-white/70 hover:border-[#d9b978]/40 hover:text-[#d9b978]"
        >
          Découvrir <ArrowRight className="h-3.5 w-3.5" />
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => onStatusClick(candidate)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/45 hover:border-[#d9b978]/40 hover:text-[#d9b978]"
            title="Modifier le statut"
          >
            <Trophy className="h-4 w-4" />
          </button>
        )}
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

  const { data: allCandidates, refetch, isLoading } = trpc.candidateProfile.listApproved.useQuery();

  const candidates = (allCandidates || []).filter((candidate) => {
    const matchCategory = selectedCategory === "all" || candidate.category === selectedCategory;
    const needle = searchTerm.trim().toLowerCase();
    const matchSearch = !needle ||
      `${candidate.firstName || ""} ${candidate.lastName || ""}`.toLowerCase().includes(needle) ||
      (candidate.city || "").toLowerCase().includes(needle);
    return matchCategory && matchSearch;
  });

  const counts = {
    all: allCandidates?.length || 0,
    miss: allCandidates?.filter((candidate) => candidate.category === "miss").length || 0,
    mister: allCandidates?.filter((candidate) => candidate.category === "mister").length || 0,
  };

  const updateStatusMutation = trpc.candidates.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Statut mis à jour");
      setIsStatusDialogOpen(false);
      refetch();
    },
    onError: (error: any) => toast.error(`Erreur : ${error.message}`),
  });

  const handleStatusChange = (candidateId: number, status: string) => {
    updateStatusMutation.mutate({ id: candidateId, status: status as any });
  };

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <div className="min-h-screen bg-black text-white">
      <SEOHead
        title="Candidats 2027 — Miss & Mister Dour"
        description="Découvrez les profils officiels de l’édition 2027 de Miss & Mister Dour."
        url="https://missetmisterdour.be/candidates"
        tags={["Miss Dour", "Mister Dour", "candidats 2027", "Dour"]}
      />

      <header className="hidden" aria-hidden="true" />

      <main>
        <section className="relative overflow-hidden px-4 py-20 md:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(217,185,120,.11),transparent_34%),radial-gradient(circle_at_82%_56%,rgba(117,74,47,.09),transparent_32%)]" />
          <div className="relative mx-auto max-w-6xl">
            <span className="mmd-page-kicker">03 · Candidats</span>
            <div className="mt-7 grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
              <div>
                <h1 className="max-w-4xl text-5xl font-semibold leading-[.94] tracking-[-.055em] md:text-7xl lg:text-8xl">
                  Les visages de <em className="font-light text-[#d9b978]">2027.</em>
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-8 text-white/52">
                  Découvrez les personnalités qui composent la nouvelle édition. Chaque profil possède son propre espace public.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 lg:justify-self-end">
                {[
                  ["Tous", counts.all],
                  ["Miss", counts.miss],
                  ["Mister", counts.mister],
                ].map(([label, value]) => (
                  <div key={String(label)} className="min-w-24 rounded-2xl border border-white/10 bg-white/[.025] p-4 text-center">
                    <strong className="block text-2xl text-[#d9b978]">{value}</strong>
                    <span className="mt-1 block text-[9px] uppercase tracking-[.14em] text-white/35">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="sticky top-[68px] z-30 border-y border-white/8 bg-black/85 px-4 py-4 backdrop-blur-xl md:top-[78px]">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <Input
                placeholder="Rechercher un nom ou une ville"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-11 rounded-full border-white/10 bg-white/[.035] pl-11 text-sm text-white placeholder:text-white/30"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {[
                { key: "all", label: `Tous · ${counts.all}` },
                { key: "miss", label: `Miss · ${counts.miss}` },
                { key: "mister", label: `Mister · ${counts.mister}` },
              ].map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setSelectedCategory(filter.key)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.1em] ${
                    selectedCategory === filter.key
                      ? "border-[#d9b978] bg-[#d9b978] text-black"
                      : "border-white/10 bg-white/[.02] text-white/50 hover:border-[#d9b978]/35 hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 md:py-20">
          <div className="mx-auto max-w-7xl">
            {isLoading ? (
              <div className="grid min-h-72 place-items-center">
                <Crown className="h-8 w-8 animate-pulse text-[#d9b978]" />
              </div>
            ) : candidates.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {candidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    isAdmin={isAdmin}
                    onStatusClick={(value) => {
                      setSelectedCandidate(value);
                      setIsStatusDialogOpen(true);
                    }}
                    onViewProfile={(id) => setLocation(`/candidat/${id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-xl rounded-[28px] border border-white/10 bg-white/[.025] px-8 py-16 text-center">
                <Crown className="mx-auto h-8 w-8 text-[#d9b978]/50" />
                <h2 className="mt-5 text-2xl font-semibold">Aucun profil ne correspond</h2>
                <p className="mt-3 text-sm leading-7 text-white/42">
                  {searchTerm ? "Modifiez votre recherche ou revenez à l’ensemble des candidats." : "Les nouveaux profils seront publiés après validation."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {isAdmin && (
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="border border-[#d9b978]/25 bg-[#111214] text-white">
            <DialogHeader>
              <DialogTitle className="text-[#d9b978]">Modifier le statut</DialogTitle>
              <DialogDescription className="text-white/45">
                {selectedCandidate?.firstName} {selectedCandidate?.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <Button variant="outline" className="justify-start border-white/10 bg-transparent text-white hover:bg-white/5" onClick={() => handleStatusChange(selectedCandidate?.id, "approved")}>
                <Check className="mr-2 h-4 w-4" /> Approuver
              </Button>
              <Button variant="outline" className="justify-start border-white/10 bg-transparent text-white hover:bg-white/5" onClick={() => handleStatusChange(selectedCandidate?.id, "rejected")}>
                <X className="mr-2 h-4 w-4" /> Rejeter
              </Button>
              <Button variant="outline" className="justify-start border-white/10 bg-transparent text-white hover:bg-white/5" onClick={() => handleStatusChange(selectedCandidate?.id, "finalist")}>
                <Star className="mr-2 h-4 w-4" /> Finaliste
              </Button>
              <Button variant="outline" className="justify-start border-[#d9b978]/25 bg-transparent text-[#d9b978] hover:bg-[#d9b978]/10" onClick={() => handleStatusChange(selectedCandidate?.id, "winner")}>
                <Crown className="mr-2 h-4 w-4" /> Gagnant
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" className="border-white/10 bg-transparent text-white" onClick={() => setIsStatusDialogOpen(false)}>Annuler</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
