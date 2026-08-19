import { useState, useCallback, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Crown, Camera, X, ChevronLeft, ChevronRight, Heart,
  ZoomIn, Users, ArrowLeft, Filter, Sparkles, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

type EventFilter = "all" | "portrait" | "event" | "backstage" | "performance" | "other";
type CandidateFilter = "all" | "miss" | "mister";

const EVENT_LABELS: Record<EventFilter, string> = {
  all: "Toutes",
  portrait: "Portraits",
  event: "Shooting officiel",
  backstage: "Coulisses",
  performance: "Performances",
  other: "Autres",
};

const EVENT_ICONS: Record<EventFilter, string> = {
  all: "📸",
  portrait: "👤",
  event: "🎬",
  backstage: "🎭",
  performance: "⭐",
  other: "✨",
};

export default function Gallery() {
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [candidateFilter, setCandidateFilter] = useState<CandidateFilter>("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeName, setSubscribeName] = useState("");
  const subscribeMutation = trpc.photos.subscribe.useMutation();

  // Récupérer toutes les photos approuvées
  const { data: photos, isLoading: loadingPhotos } = trpc.photos.listPublic.useQuery(
    eventFilter === "all" ? undefined : { category: eventFilter }
  );

  // Récupérer les candidats pour les compteurs
  const { data: candidates } = trpc.candidateProfile.listApproved.useQuery();

  // Filtrer par catégorie candidat (Miss/Mister)
  const filteredPhotos = useMemo(() => {
    if (!photos) return [];
    if (candidateFilter === "all") return photos;
    return photos.filter((p) => p.candidateCategory === candidateFilter);
  }, [photos, candidateFilter]);

  // Compteurs par catégorie d'événement
  const eventCounts = useMemo(() => {
    if (!photos) return { all: 0, portrait: 0, event: 0, backstage: 0, performance: 0, other: 0 };
    // Pour "all", on utilise le total non filtré par candidat
    const allPhotos = photos;
    return {
      all: allPhotos.length,
      portrait: allPhotos.filter((p) => p.category === "portrait").length,
      event: allPhotos.filter((p) => p.category === "event").length,
      backstage: allPhotos.filter((p) => p.category === "backstage").length,
      performance: allPhotos.filter((p) => p.category === "performance").length,
      other: allPhotos.filter((p) => p.category === "other").length,
    };
  }, [photos]);

  // Compteurs Miss/Mister
  const candidateCounts = useMemo(() => {
    if (!photos) return { all: 0, miss: 0, mister: 0 };
    const base = photos; // photos déjà filtrées par événement
    return {
      all: base.length,
      miss: base.filter((p) => p.candidateCategory === "miss").length,
      mister: base.filter((p) => p.candidateCategory === "mister").length,
    };
  }, [photos]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  }, []);

  const nextPhoto = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % filteredPhotos.length);
  }, [filteredPhotos.length]);

  const prevPhoto = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
  }, [filteredPhotos.length]);

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

  const currentPhoto = lightboxOpen && filteredPhotos.length > 0 ? filteredPhotos[lightboxIndex] : null;

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
        {/* Particules décoratives */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold/30 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <Camera className="w-12 h-12 mx-auto mb-4 text-gold" />
          <h1 className="text-4xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
            Galerie Photos
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-2">
            Shooting officiel Miss & Mister Dour 2026
          </p>
          <p className="text-sm text-gray-500">
            {candidates?.length ?? 0} candidats &middot; {filteredPhotos.length} photos
          </p>
        </div>
      </section>

      {/* Filtres par événement */}
      <section className="sticky top-16 z-30 bg-black/80 backdrop-blur-md border-b border-gray-800 py-4">
        <div className="container mx-auto px-4">
          {/* Ligne 1 : Filtres par catégorie d'événement */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <div className="flex items-center gap-1.5 text-gray-500 mr-1">
                <Filter className="w-4 h-4" />
                <span className="text-xs font-medium hidden sm:inline">Catégorie</span>
              </div>
              {(Object.keys(EVENT_LABELS) as EventFilter[])
                .filter((key) => key === "all" || eventCounts[key] > 0)
                .map((key) => (
                <button
                  key={key}
                  onClick={() => setEventFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                    eventFilter === key
                      ? "bg-gold text-black shadow-lg shadow-gold/20"
                      : "bg-gray-800/60 text-gray-400 hover:bg-gray-700/60 hover:text-white"
                  }`}
                >
                  <span className="text-sm">{EVENT_ICONS[key]}</span>
                  <span>{EVENT_LABELS[key]}</span>
                  <span className="opacity-70">
                    ({key === "all" ? (photos?.length ?? 0) : eventCounts[key]})
                  </span>
                </button>
              ))}
            </div>

            {/* Ligne 2 : Filtres par candidat Miss/Mister */}
            <div className="flex items-center gap-2 justify-center">
              <div className="flex items-center gap-1.5 text-gray-500 mr-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium hidden sm:inline">Candidats</span>
              </div>
              {([
                { key: "all" as CandidateFilter, label: "Tous", icon: "👑" },
                { key: "miss" as CandidateFilter, label: "Miss", icon: "👸" },
                { key: "mister" as CandidateFilter, label: "Mister", icon: "🤴" },
              ]).map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setCandidateFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
                    candidateFilter === key
                      ? key === "miss"
                        ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                        : key === "mister"
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-gold text-black shadow-lg shadow-gold/20"
                      : "bg-gray-800/60 text-gray-400 hover:bg-gray-700/60 hover:text-white"
                  }`}
                >
                  <span className="text-sm">{icon}</span>
                  <span>{label}</span>
                  <span className="opacity-70">({candidateCounts[key]})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grille de photos */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          {loadingPhotos ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl bg-gray-800/50 animate-pulse" />
              ))}
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-700" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Aucune photo dans cette catégorie</h3>
              <p className="text-gray-500 mb-6">Essayez un autre filtre pour voir plus de photos.</p>
              <button
                onClick={() => { setEventFilter("all"); setCandidateFilter("all"); }}
                className="px-6 py-2 bg-gold/20 text-gold rounded-full hover:bg-gold/30 transition-colors text-sm font-medium"
              >
                Voir toutes les photos
              </button>
            </div>
          ) : (
            <>
              {/* Compteur résultats */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">
                  <span className="text-gold font-bold">{filteredPhotos.length}</span> photo{filteredPhotos.length > 1 ? "s" : ""}
                  {eventFilter !== "all" && <span> &middot; {EVENT_LABELS[eventFilter]}</span>}
                  {candidateFilter !== "all" && <span> &middot; {candidateFilter === "miss" ? "Miss" : "Mister"}</span>}
                </p>
                {(eventFilter !== "all" || candidateFilter !== "all") && (
                  <button
                    onClick={() => { setEventFilter("all"); setCandidateFilter("all"); }}
                    className="text-xs text-gray-500 hover:text-gold transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Réinitialiser
                  </button>
                )}
              </div>

              {/* Grille masonry-like */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {filteredPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="group relative rounded-xl overflow-hidden cursor-pointer border border-gray-800/50 hover:border-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-gold/10 hover:-translate-y-1"
                    onClick={() => openLightbox(index)}
                  >
                    <div className={`relative overflow-hidden bg-gray-900 ${
                      photo.category === "portrait" ? "aspect-[3/4]" : "aspect-square"
                    }`}>
                      <img
                        src={photo.thumbnail || photo.url}
                        alt={photo.title || "Photo"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />

                      {/* Overlay au hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                      </div>

                      {/* Gradient bas */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

                      {/* Badge catégorie événement */}
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm ${
                          photo.category === "portrait"
                            ? "bg-amber-500/80 text-white"
                            : photo.category === "event"
                            ? "bg-emerald-500/80 text-white"
                            : photo.category === "backstage"
                            ? "bg-purple-500/80 text-white"
                            : photo.category === "performance"
                            ? "bg-red-500/80 text-white"
                            : "bg-gray-500/80 text-white"
                        }`}>
                          {photo.category === "portrait" ? "Portrait" :
                           photo.category === "event" ? "Shooting" :
                           photo.category === "backstage" ? "Coulisses" :
                           photo.category === "performance" ? "Performance" :
                           photo.category === "other" ? "Autre" : photo.category}
                        </span>
                      </div>

                      {/* Badge Miss/Mister */}
                      {photo.candidateCategory && (
                        <div className="absolute top-2 right-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm ${
                            photo.candidateCategory === "miss"
                              ? "bg-pink-500/80 text-white"
                              : "bg-blue-500/80 text-white"
                          }`}>
                            {photo.candidateCategory}
                          </span>
                        </div>
                      )}

                      {/* Infos en bas */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        {photo.candidateName && (
                          <p className="text-white font-bold text-sm leading-tight truncate">
                            {photo.candidateName}
                          </p>
                        )}
                        {photo.title && photo.title !== "title" && !photo.candidateName && (
                          <p className="text-white font-medium text-xs leading-tight truncate">
                            {photo.title}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-4 text-gold" />
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
      {lightboxOpen && currentPhoto && (
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
            {lightboxIndex + 1} / {filteredPhotos.length}
          </div>

          {/* Previous */}
          {filteredPhotos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              className="absolute left-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentPhoto.url}
              alt={currentPhoto.title || "Photo"}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            {/* Info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  {currentPhoto.candidateName && (
                    <p className="text-white font-bold text-lg">{currentPhoto.candidateName}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    {/* Badge catégorie événement */}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                      currentPhoto.category === "portrait"
                        ? "bg-amber-500/80 text-white"
                        : currentPhoto.category === "event"
                        ? "bg-emerald-500/80 text-white"
                        : currentPhoto.category === "backstage"
                        ? "bg-purple-500/80 text-white"
                        : "bg-red-500/80 text-white"
                    }`}>
                      {currentPhoto.category === "portrait" ? "Portrait" :
                       currentPhoto.category === "event" ? "Shooting" :
                       currentPhoto.category === "backstage" ? "Coulisses" :
                       currentPhoto.category === "performance" ? "Performance" :
                       currentPhoto.category === "other" ? "Autre" : currentPhoto.category}
                    </span>
                    {/* Badge Miss/Mister */}
                    {currentPhoto.candidateCategory && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                        currentPhoto.candidateCategory === "miss"
                          ? "bg-pink-500/80 text-white"
                          : "bg-blue-500/80 text-white"
                      }`}>
                        {currentPhoto.candidateCategory}
                      </span>
                    )}
                    {currentPhoto.title && currentPhoto.title !== "title" && (
                      <span className="text-gray-300 text-xs">{currentPhoto.title}</span>
                    )}
                  </div>
                </div>
                {currentPhoto.candidateId && (
                  <Link
                    href={`/candidat/${currentPhoto.candidateId}`}
                    className="px-4 py-2 bg-gold text-black text-sm font-bold rounded-lg hover:bg-gold/90 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Voir le profil
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Next */}
          {filteredPhotos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              className="absolute right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      )}

      {/* Section abonnement newsletter galerie */}
      <section className="py-12 border-t border-gray-800 mt-8">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: "#C87941" }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#C87941" }}>Restez informé(e)</h2>
          <p className="text-gray-400 text-sm mb-6">
            Recevez un email à chaque nouvelle publication dans la galerie
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!subscribeEmail.trim()) return;
              try {
                await subscribeMutation.mutateAsync({
                  email: subscribeEmail,
                  name: subscribeName || undefined,
                });
                setSubscribeEmail("");
                setSubscribeName("");
              } catch (err) {
                console.error("Subscribe error:", err);
              }
            }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <input
              type="text"
              placeholder="Votre nom (optionnel)"
              value={subscribeName}
              onChange={(e) => setSubscribeName(e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-600/50"
              style={{ maxWidth: "200px" }}
            />
            <input
              type="email"
              required
              placeholder="Votre email"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-gray-800/60 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-600/50 flex-1"
              style={{ maxWidth: "300px" }}
            />
            <button
              type="submit"
              disabled={subscribeMutation.isPending}
              className="px-6 py-2.5 rounded-lg text-black font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #C87941, #D4956A)" }}
            >
              {subscribeMutation.isPending ? "Inscription..." : "S'abonner"}
            </button>
          </form>
          {subscribeMutation.isSuccess && (
            <p className="text-green-400 text-sm mt-3">
              Merci ! Vous recevrez les nouveautés par email.
            </p>
          )}
          {subscribeMutation.isError && (
            <p className="text-red-400 text-sm mt-3">
              Erreur lors de l'inscription. Réessayez.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
