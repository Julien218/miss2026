import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Camera, ChevronLeft, ChevronRight, Crown, Image as ImageIcon, Search, Sparkles, Users, X, ZoomIn } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { SEOHead } from "@/components/SEOHead";

type EventFilter = "all" | "portrait" | "event" | "backstage" | "performance" | "other";
type CandidateFilter = "all" | "miss" | "mister";

const EVENT_LABELS: Record<EventFilter, string> = {
  all: "Tout",
  portrait: "Portraits",
  event: "Shooting",
  backstage: "Backstage",
  performance: "Scène",
  other: "Autres",
};

export default function Gallery() {
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [candidateFilter, setCandidateFilter] = useState<CandidateFilter>("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(40);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeName, setSubscribeName] = useState("");

  const subscribeMutation = trpc.photos.subscribe.useMutation();
  const { data: photos, isLoading } = trpc.photos.listPublic.useQuery(
    eventFilter === "all" ? undefined : { category: eventFilter }
  );
  const { data: candidates } = trpc.candidateProfile.listApproved.useQuery();

  const filteredPhotos = useMemo(() => {
    const rows = photos || [];
    if (candidateFilter === "all") return rows;
    return rows.filter((photo) => photo.candidateCategory === candidateFilter);
  }, [photos, candidateFilter]);

  const candidateCounts = useMemo(() => {
    const rows = photos || [];
    return {
      all: rows.length,
      miss: rows.filter((photo) => photo.candidateCategory === "miss").length,
      mister: rows.filter((photo) => photo.candidateCategory === "mister").length,
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
    if (!filteredPhotos.length) return;
    setLightboxIndex((index) => (index + 1) % filteredPhotos.length);
  }, [filteredPhotos.length]);

  const previousPhoto = useCallback(() => {
    if (!filteredPhotos.length) return;
    setLightboxIndex((index) => (index - 1 + filteredPhotos.length) % filteredPhotos.length);
  }, [filteredPhotos.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") nextPhoto();
      if (event.key === "ArrowLeft") previousPhoto();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, closeLightbox, nextPhoto, previousPhoto]);

  const currentPhoto = lightboxOpen ? filteredPhotos[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <SEOHead
        title="Galerie — Miss & Mister Dour 2027"
        description="Portraits, shootings, coulisses et moments forts de Miss & Mister Dour."
        url="https://missetmisterdour.be/gallery"
        tags={["galerie Miss Mister Dour", "backstage", "photos Dour", "édition 2027"]}
      />

      <header className="hidden" aria-hidden="true" />

      <main>
        <section className="relative overflow-hidden px-4 py-20 md:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(217,185,120,.11),transparent_34%),radial-gradient(circle_at_85%_72%,rgba(103,67,46,.11),transparent_32%)]" />
          <div className="relative mx-auto max-w-6xl">
            <span className="mmd-page-kicker">09 · Galerie</span>
            <div className="mt-7 grid gap-9 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
              <div>
                <h1 className="max-w-4xl text-5xl font-semibold leading-[.94] tracking-[-.055em] md:text-7xl lg:text-8xl">
                  Les images qui prolongent <em className="font-light text-[#d9b978]">l’émotion.</em>
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-8 text-white/52">
                  Portraits officiels, backstage, scène et moments partagés : la mémoire visuelle de l’événement reste accessible d’une édition à l’autre.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:justify-self-end">
                <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5 text-center">
                  <strong className="block text-3xl text-[#d9b978]">{filteredPhotos.length}</strong>
                  <span className="mt-1 block text-[9px] uppercase tracking-[.16em] text-white/35">Images</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5 text-center">
                  <strong className="block text-3xl text-[#d9b978]">{candidates?.length || 0}</strong>
                  <span className="mt-1 block text-[9px] uppercase tracking-[.16em] text-white/35">Profils</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sticky top-[68px] z-30 border-y border-white/8 bg-black/88 px-4 py-4 backdrop-blur-xl md:top-[78px]">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
              {(Object.keys(EVENT_LABELS) as EventFilter[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setEventFilter(key);
                    setVisibleCount(40);
                  }}
                  className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.1em] ${
                    eventFilter === key
                      ? "border-[#d9b978] bg-[#d9b978] text-black"
                      : "border-white/10 bg-white/[.02] text-white/48 hover:border-[#d9b978]/35 hover:text-white"
                  }`}
                >
                  {EVENT_LABELS[key]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-white/30" />
              {(["all", "miss", "mister"] as CandidateFilter[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCandidateFilter(key)}
                  className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[.08em] ${
                    candidateFilter === key
                      ? "border-[#d9b978]/70 bg-[#d9b978]/12 text-[#d9b978]"
                      : "border-white/10 text-white/42 hover:text-white"
                  }`}
                >
                  {key === "all" ? "Tous" : key === "miss" ? "Miss" : "Mister"} · {candidateCounts[key]}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 md:py-18">
          <div className="mx-auto max-w-7xl">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="aspect-[3/4] animate-pulse rounded-[22px] border border-white/5 bg-white/[.035]" />
                ))}
              </div>
            ) : filteredPhotos.length === 0 ? (
              <div className="mx-auto max-w-xl rounded-[28px] border border-white/10 bg-white/[.025] px-8 py-16 text-center">
                <ImageIcon className="mx-auto h-9 w-9 text-[#d9b978]/45" />
                <h2 className="mt-5 text-2xl font-semibold">Aucune image dans ce filtre</h2>
                <p className="mt-3 text-sm leading-7 text-white/42">Les contenus apparaissent ici dès leur validation.</p>
                <button
                  type="button"
                  onClick={() => {
                    setEventFilter("all");
                    setCandidateFilter("all");
                  }}
                  className="mt-6 rounded-full border border-[#d9b978]/30 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[.1em] text-[#d9b978]"
                >
                  Réinitialiser
                </button>
              </div>
            ) : (
              <>
                <div className="mb-7 flex items-center justify-between gap-4">
                  <p className="text-xs text-white/35">
                    <strong className="text-[#d9b978]">{filteredPhotos.length}</strong> contenu{filteredPhotos.length > 1 ? "s" : ""}
                  </p>
                  {(eventFilter !== "all" || candidateFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setEventFilter("all");
                        setCandidateFilter("all");
                      }}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.1em] text-white/35 hover:text-[#d9b978]"
                    >
                      <X className="h-3.5 w-3.5" /> Réinitialiser
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                  {filteredPhotos.slice(0, visibleCount).map((photo, index) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => openLightbox(index)}
                      className="group relative overflow-hidden rounded-[22px] border border-white/8 bg-[#111] text-left hover:border-[#d9b978]/32"
                    >
                      <div className={photo.category === "portrait" ? "aspect-[3/4]" : "aspect-square"}>
                        <img
                          src={photo.thumbnail || photo.url}
                          alt={photo.title || photo.candidateName || "Miss & Mister Dour"}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />
                      <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.13em] text-white/72 backdrop-blur-md">
                        {EVENT_LABELS[(photo.category as EventFilter) || "other"] || "Galerie"}
                      </div>
                      <ZoomIn className="absolute right-3 top-3 h-4 w-4 text-white/0 transition group-hover:text-white/70" />
                      <div className="absolute bottom-3 left-3 right-3">
                        {photo.candidateName && <strong className="block truncate text-sm text-white">{photo.candidateName}</strong>}
                        {photo.candidateCategory && (
                          <span className="mt-1 block text-[8px] font-bold uppercase tracking-[.15em] text-[#d9b978]">{photo.candidateCategory}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {filteredPhotos.length > visibleCount && (
                  <div className="mt-10 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((value) => value + 40)}
                      className="rounded-full border border-[#d9b978]/30 px-6 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-[#d9b978] hover:bg-[#d9b978] hover:text-black"
                    >
                      Voir plus · {filteredPhotos.length - visibleCount}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <section className="border-t border-white/10 px-4 py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 rounded-[30px] border border-[#d9b978]/18 bg-white/[.025] p-7 md:grid-cols-[1fr_auto] md:items-end md:p-10">
            <div>
              <Sparkles className="h-6 w-6 text-[#d9b978]" />
              <h2 className="mt-5 text-3xl font-semibold md:text-4xl">Recevoir les nouvelles publications</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/45">Inscrivez-vous aux nouveautés de la galerie Miss & Mister Dour.</p>
            </div>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                if (!subscribeEmail.trim()) return;
                try {
                  await subscribeMutation.mutateAsync({ email: subscribeEmail, name: subscribeName || undefined });
                  setSubscribeEmail("");
                  setSubscribeName("");
                } catch (error) {
                  console.error("Subscribe error:", error);
                }
              }}
              className="grid gap-2 sm:grid-cols-[150px_220px_auto]"
            >
              <input
                value={subscribeName}
                onChange={(event) => setSubscribeName(event.target.value)}
                placeholder="Nom (optionnel)"
                className="h-11 rounded-full border border-white/10 bg-black/35 px-4 text-sm text-white placeholder:text-white/28"
              />
              <input
                type="email"
                required
                value={subscribeEmail}
                onChange={(event) => setSubscribeEmail(event.target.value)}
                placeholder="Votre email"
                className="h-11 rounded-full border border-white/10 bg-black/35 px-4 text-sm text-white placeholder:text-white/28"
              />
              <button
                type="submit"
                disabled={subscribeMutation.isPending}
                className="h-11 rounded-full bg-[#d9b978] px-5 text-[10px] font-bold uppercase tracking-[.1em] text-black disabled:opacity-50"
              >
                {subscribeMutation.isPending ? "Inscription…" : "S’abonner"}
              </button>
              {subscribeMutation.isSuccess && <p className="sm:col-span-3 text-xs text-[#d9b978]">Inscription enregistrée.</p>}
              {subscribeMutation.isError && <p className="sm:col-span-3 text-xs text-red-300">Impossible de vous inscrire pour le moment.</p>}
            </form>
          </div>
        </section>

        <section className="px-4 pb-20 md:pb-28">
          <div className="mx-auto max-w-6xl text-center">
            <Crown className="mx-auto h-7 w-7 text-[#d9b978]" />
            <h2 className="mt-5 text-3xl font-semibold md:text-5xl">Votre histoire pourrait rejoindre la prochaine galerie.</h2>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/inscription-candidat" className="rounded-full bg-[#d9b978] px-6 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-black">Candidater 2027</Link>
              <Link href="/candidates" className="rounded-full border border-white/12 px-6 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-white/65 hover:border-[#d9b978]/35 hover:text-[#d9b978]">Voir les candidats</Link>
            </div>
          </div>
        </section>
      </main>

      {lightboxOpen && currentPhoto && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/96 p-4" onClick={closeLightbox}>
          <button type="button" onClick={closeLightbox} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-black/55 text-white/75">
            <X className="h-5 w-5" />
          </button>
          <span className="absolute left-5 top-7 text-xs text-white/38">{lightboxIndex + 1} / {filteredPhotos.length}</span>
          {filteredPhotos.length > 1 && (
            <button type="button" onClick={(event) => { event.stopPropagation(); previousPhoto(); }} className="absolute left-4 grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-black/55 text-white/75">
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="relative max-h-[86vh] max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <img src={currentPhoto.url} alt={currentPhoto.title || currentPhoto.candidateName || "Galerie"} className="max-h-[86vh] max-w-full rounded-2xl object-contain" />
            {(currentPhoto.candidateName || currentPhoto.title) && (
              <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl bg-gradient-to-t from-black/90 to-transparent p-5 pt-16">
                {currentPhoto.candidateName && <strong className="block text-lg text-white">{currentPhoto.candidateName}</strong>}
                {currentPhoto.title && currentPhoto.title !== "title" && <span className="mt-1 block text-xs text-white/50">{currentPhoto.title}</span>}
              </div>
            )}
          </div>
          {filteredPhotos.length > 1 && (
            <button type="button" onClick={(event) => { event.stopPropagation(); nextPhoto(); }} className="absolute right-4 grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-black/55 text-white/75">
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
