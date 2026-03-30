import { useState, useCallback, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Crown, Camera, X, ChevronLeft, ChevronRight, Heart,
  ZoomIn, Download, Users, ArrowLeft, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";

type CategoryFilter = "all" | "miss" | "mister";

export default function Gallery() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Récupérer les candidats approuvés pour la galerie
  const { data: candidates, isLoading: loadingCandidates } = trpc.candidateProfile.listApproved.useQuery();

  // Filtrer par catégorie
  const filteredCandidates = useMemo(() => {
    if (!candidates) return [];
    if (categoryFilter === "all") return candidates;
    return candidates.filter((c) => c.category === categoryFilter);
  }, [candidates, categoryFilter]);

  // Construire la liste de photos pour le lightbox
  const allPhotos = useMemo(() => {
    return filteredCandidates
      .filter((c) => c.profilePhoto)
      .map((c) => ({
        url: c.profilePhoto!,
        name: `${c.firstName} ${c.lastName}`,
        category: c.category,
        city: c.city,
        id: c.id,
        voteCount: c.voteCount,
      }));
  }, [filteredCandidates]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const nextPhoto = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % allPhotos.length);
  }, [allPhotos.length]);

  const prevPhoto = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  }, [allPhotos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, closeLightbox, nextPhoto, prevPhoto]);

  const missCount = candidates?.filter((c) => c.category === "miss").length ?? 0;
  const misterCount = candidates?.filter((c) => c.category === "mister").length ?? 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-gold/20">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <Crown className="h-6 w-6" />
            <span className="text-lg font-bold hidden sm:inline">Miss & Mister Dour</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/candidates" className="text-sm font-medium text-gray-400 hover:text-gold transition-colors">
              Candidats
            </Link>
            <Link href="/voter" className="text-sm font-medium text-gray-400 hover:text-gold transition-colors">
              Voter
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Camera className="w-12 h-12 mx-auto mb-4 text-gold" />
          <h1 className="text-4xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
            Galerie Photos
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-2">
            Shooting officiel Miss & Mister Dour 2026
          </p>
          <p className="text-sm text-gray-500">
            {candidates?.length ?? 0} candidats &middot; {allPhotos.length} photos
          </p>
        </div>
      </section>

      {/* Filtres */}
      <section className="sticky top-16 z-30 bg-black/80 backdrop-blur-md border-b border-gray-800 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <Filter className="w-4 h-4 text-gray-500" />
            {[
              { key: "all" as CategoryFilter, label: "Tous", count: candidates?.length ?? 0 },
              { key: "miss" as CategoryFilter, label: "Miss", count: missCount },
              { key: "mister" as CategoryFilter, label: "Mister", count: misterCount },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  categoryFilter === key
                    ? "bg-gold text-black shadow-lg shadow-gold/20"
                    : "bg-gray-800/60 text-gray-400 hover:bg-gray-700/60 hover:text-white"
                }`}
              >
                {label}
                <span className="ml-1.5 text-xs opacity-70">({count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grille de photos */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          {loadingCandidates ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl bg-gray-800/50 animate-pulse" />
              ))}
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-20">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-700" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Aucune photo disponible</h3>
              <p className="text-gray-500">Les photos seront bientôt ajoutées.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredCandidates.map((candidate, index) => {
                const photoIndex = allPhotos.findIndex((p) => p.id === candidate.id);
                return (
                  <div
                    key={candidate.id}
                    className="group relative rounded-xl overflow-hidden cursor-pointer border border-gray-800 hover:border-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-gold/10"
                    onClick={() => candidate.profilePhoto && photoIndex >= 0 && openLightbox(photoIndex)}
                  >
                    <div className="aspect-[3/4] relative overflow-hidden bg-gray-900">
                      {candidate.profilePhoto ? (
                        <img
                          src={candidate.profilePhoto}
                          alt={`${candidate.firstName} ${candidate.lastName}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold/10 to-gray-900">
                          <Crown className="w-12 h-12 text-gold/30" />
                        </div>
                      )}

                      {/* Overlay au hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Gradient bas */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

                      {/* Badge catégorie */}
                      <div className="absolute top-2 left-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          candidate.category === "miss"
                            ? "bg-pink-500/80 text-white"
                            : "bg-blue-500/80 text-white"
                        }`}>
                          {candidate.category}
                        </span>
                      </div>

                      {/* Votes */}
                      {(candidate.voteCount ?? 0) > 0 && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5">
                          <Heart className="w-3 h-3 text-red-400 fill-red-400" />
                          <span className="text-[10px] text-white font-medium">{candidate.voteCount}</span>
                        </div>
                      )}

                      {/* Infos en bas */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-bold text-sm leading-tight truncate">
                          {candidate.firstName} {candidate.lastName}
                        </p>
                        {candidate.city && (
                          <p className="text-gray-300 text-[11px] truncate">{candidate.city}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gold mb-4">Soutenez vos candidats favoris</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Votez pour élire Miss & Mister Dour 2026 et partagez les profils de vos favoris sur les réseaux sociaux.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/voter">
              <Button className="bg-gold text-black hover:bg-gold/90 font-bold px-8 py-3">
                <Heart className="w-5 h-5 mr-2" />
                Voter maintenant
              </Button>
            </Link>
            <Link href="/candidates">
              <Button variant="outline" className="border-gold/40 text-gold hover:bg-gold/10 px-8 py-3">
                <Users className="w-5 h-5 mr-2" />
                Voir les profils
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Miss & Mister Dour. Tous droits réservés.</p>
        </div>
      </footer>

      {/* Lightbox */}
      {lightboxOpen && allPhotos.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-50 text-white/60 text-sm">
            {lightboxIndex + 1} / {allPhotos.length}
          </div>

          {/* Previous */}
          <button
            onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
            className="absolute left-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={allPhotos[lightboxIndex].url}
              alt={allPhotos[lightboxIndex].name}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            {/* Info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-lg">{allPhotos[lightboxIndex].name}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                      allPhotos[lightboxIndex].category === "miss"
                        ? "bg-pink-500/80 text-white"
                        : "bg-blue-500/80 text-white"
                    }`}>
                      {allPhotos[lightboxIndex].category}
                    </span>
                    {allPhotos[lightboxIndex].city && (
                      <span className="text-gray-300">{allPhotos[lightboxIndex].city}</span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/candidat/${allPhotos[lightboxIndex].id}`}
                  className="px-4 py-2 bg-gold text-black text-sm font-bold rounded-lg hover:bg-gold/90 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Voir le profil
                </Link>
              </div>
            </div>
          </div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
            className="absolute right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
