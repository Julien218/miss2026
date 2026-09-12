import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Image as ImageIcon,
  Orbit,
  Sparkles,
  Users,
  X,
  ZoomIn,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { SEOHead } from "@/components/SEOHead";
import { BRANDING } from "@/config/branding";
import { GalleryDepthStage } from "@/components/GalleryDepthStage";

type CandidateFilter = "all" | "miss" | "mister";

type GalleryCategory = {
  category: string;
  count: number;
};

// Chaque dossier / catégorie historique garde son intitulé public.
// Toute nouvelle catégorie non connue est automatiquement humanisée.
const CATEGORY_LABELS: Record<string, string> = {
  all: "Toutes les catégories",
  portrait: "Portraits",
  event: "Shooting officiel",
  backstage: "Coulisses",
  performance: "Performances",
  other: "Autres",
  "19-avril-2026-proclamation-des-resultats": "Proclamation des résultats",
  "19-avril-2026-interview-des-candidats-devant-le-jury": "Interview des candidats devant le jury",
  "prestations-des-laureats": "Prestations des lauréats",
  "le-show-du-19-avril-2026": "Le show du 19 avril 2026",
  "remise-des-echarpes-25-janvier-2026": "Remise des écharpes",
  "shooting-candidats": "Shooting candidats",
  "shooting-laureats": "Shooting lauréats",
  "sorties-avec-les-candidats": "Sorties avec les candidats",
  "visite-miss-hainaut-dour-08022026": "Visite Miss Hainaut à Dour",
  sponsors: "Sponsors",
};

const CATEGORY_ORDER = [
  "portrait",
  "shooting-candidats",
  "shooting-laureats",
  "backstage",
  "sorties-avec-les-candidats",
  "remise-des-echarpes-25-janvier-2026",
  "visite-miss-hainaut-dour-08022026",
  "19-avril-2026-interview-des-candidats-devant-le-jury",
  "le-show-du-19-avril-2026",
  "performance",
  "prestations-des-laureats",
  "19-avril-2026-proclamation-des-resultats",
  "event",
  "sponsors",
  "other",
];

function categoryLabel(slug: string) {
  if (CATEGORY_LABELS[slug]) return CATEGORY_LABELS[slug];
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function Gallery() {
  const [eventFilter, setEventFilter] = useState("all");
  const [candidateFilter, setCandidateFilter] = useState<CandidateFilter>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(40);
  const [galleryView, setGalleryView] = useState<"depth" | "grid">("depth");
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeName, setSubscribeName] = useState("");

  const subscribeMutation = trpc.photos.subscribe.useMutation();

  // Charger une seule fois tous les médias publics. Les catégories sont ensuite
  // construites à partir des valeurs réelles de la base : un dossier = une catégorie.
  const { data: allPhotos, isLoading } = trpc.photos.listPublic.useQuery();
  const { data: candidates } = trpc.candidateProfile.listApproved.useQuery();

  const categories = useMemo<GalleryCategory[]>(() => {
    const counts = new Map<string, number>();
    for (const photo of allPhotos ?? []) {
      const category = photo.category || "other";
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }

    const ordered = Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => {
        const aIndex = CATEGORY_ORDER.indexOf(a.category);
        const bIndex = CATEGORY_ORDER.indexOf(b.category);
        if (aIndex === -1 && bIndex === -1) {
          return categoryLabel(a.category).localeCompare(categoryLabel(b.category), "fr");
        }
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });

    return [
      { category: "all", count: allPhotos?.length ?? 0 },
      ...ordered,
    ];
  }, [allPhotos]);

  useEffect(() => {
    if (
      eventFilter !== "all" &&
      allPhotos &&
      !categories.some((item) => item.category === eventFilter)
    ) {
      setEventFilter("all");
    }
  }, [allPhotos, categories, eventFilter]);

  const eventPhotos = useMemo(() => {
    const photos = allPhotos ?? [];
    if (eventFilter === "all") return photos;
    return photos.filter((photo) => (photo.category || "other") === eventFilter);
  }, [allPhotos, eventFilter]);

  const candidateCounts = useMemo(() => {
    return {
      all: eventPhotos.length,
      miss: eventPhotos.filter((photo) => photo.candidateCategory === "miss").length,
      mister: eventPhotos.filter((photo) => photo.candidateCategory === "mister").length,
    };
  }, [eventPhotos]);

  const filtered = useMemo(() => {
    if (candidateFilter === "all") return eventPhotos;
    return eventPhotos.filter((photo) => photo.candidateCategory === candidateFilter);
  }, [eventPhotos, candidateFilter]);

  const current = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  const resetFilters = () => {
    setEventFilter("all");
    setCandidateFilter("all");
    setVisibleCount(40);
  };

  const close = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = "";
  }, []);

  const next = useCallback(
    () =>
      setLightboxIndex((index) =>
        index === null ? 0 : (index + 1) % Math.max(filtered.length, 1)
      ),
    [filtered.length]
  );

  const prev = useCallback(
    () =>
      setLightboxIndex((index) =>
        index === null
          ? 0
          : (index - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1)
      ),
    [filtered.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, close, next, prev]);

  return (
    <div className="mmd-public-page">
      <SEOHead
        title="Galerie & backstage — Miss & Mister Dour 2027"
        description="Explorez les shootings, coulisses, événements et archives de Miss & Mister Dour, organisés par catégories."
        url="https://missetmisterdour.be/gallery"
      />

      <section className="mmd-public-hero">
        <div className="mmd-container">
          <div className="mmd-public-kicker">
            <span>05</span>
            <i />
            BACKSTAGE & GALERIE
          </div>
          <img
            src={BRANDING.logoIdentity}
            alt="Miss & Mister Dour"
            className="mmd-public-logo-mark"
          />
          <h1>
            Dans la lumière. Et <em>derrière la scène.</em>
          </h1>
          <p>
            Chaque shooting, sortie et temps fort retrouve sa propre catégorie. La galerie
            conserve ainsi l'histoire de chaque édition sans mélanger tous les médias dans un
            seul bloc.
          </p>
        </div>
      </section>

      <section className="mmd-section">
        <div className="mmd-container">
          <div className="mmd-gallery-toolbar mmd-gallery-toolbar--folders">
            <div className="mmd-gallery-filter-block">
              <div className="mmd-gallery-filter-title">
                <FolderOpen className="h-4 w-4" />
                <span>Dossiers & catégories</span>
              </div>
              <div className="mmd-gallery-filter-scroll" role="tablist" aria-label="Catégories de galerie">
                {categories.map(({ category, count }) => (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={eventFilter === category}
                    className={eventFilter === category ? "is-active" : ""}
                    onClick={() => {
                      setEventFilter(category);
                      setVisibleCount(40);
                      setLightboxIndex(null);
                    }}
                  >
                    <span>{categoryLabel(category)}</span>
                    <small>{count}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="mmd-gallery-filter-block mmd-gallery-filter-block--people">
              <div className="mmd-gallery-filter-title">
                <Users className="h-4 w-4" />
                <span>Profils</span>
              </div>
              <div className="mmd-gallery-filter-scroll" role="tablist" aria-label="Filtre candidats">
                {(["all", "miss", "mister"] as CandidateFilter[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={candidateFilter === key}
                    className={candidateFilter === key ? "is-active" : ""}
                    onClick={() => {
                      setCandidateFilter(key);
                      setVisibleCount(40);
                      setLightboxIndex(null);
                    }}
                  >
                    <span>{key === "all" ? "Tous" : key === "miss" ? "Miss" : "Mister"}</span>
                    <small>{candidateCounts[key]}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mmd-gallery-count">
            <div>
              <strong>{filtered.length}</strong> média{filtered.length > 1 ? "s" : ""}
              {eventFilter !== "all" && <span> · {categoryLabel(eventFilter)}</span>}
              {candidateFilter !== "all" && (
                <span> · {candidateFilter === "miss" ? "Miss" : "Mister"}</span>
              )}
            </div>
            <span>{candidates?.length ?? 0} profils publiés</span>
            {(eventFilter !== "all" || candidateFilter !== "all") && (
              <button type="button" className="mmd-gallery-reset" onClick={resetFilters}>
                <X className="h-3.5 w-3.5" /> Réinitialiser
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="mmd-gallery-grid">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="mmd-gallery-skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mmd-empty-editorial">
              <ImageIcon />
              <h2>Aucun média dans cette catégorie</h2>
              <p>Choisissez un autre dossier ou affichez toute la galerie.</p>
              <button type="button" onClick={resetFilters} className="mmd-primary-button">
                Voir toute la galerie
              </button>
            </div>
          ) : (
            <>
              {galleryView === "depth" ? (
                <GalleryDepthStage
                  photos={filtered}
                  categoryLabel={categoryLabel}
                  onOpen={setLightboxIndex}
                  onShowGrid={() => setGalleryView("grid")}
                />
              ) : (
                <div className="mmd-gallery-view-switch">
                  <button type="button" onClick={() => setGalleryView("depth")}>
                    <Orbit /> Vue immersive
                  </button>
                </div>
              )}
              <div
                className={`mmd-gallery-grid ${
                  galleryView === "depth" ? "mmd-gallery-grid--depth-fallback" : ""
                }`}
              >
                {filtered.slice(0, visibleCount).map((photo, index) => (
                  <button
                    type="button"
                    key={photo.id}
                    className={`mmd-gallery-item ${photo.category === "portrait" ? "is-portrait" : ""}`}
                    onClick={() => setLightboxIndex(index)}
                  >
                    <img
                      src={photo.thumbnail || photo.url}
                      alt={
                        photo.title && photo.title !== "title"
                          ? photo.title
                          : photo.candidateName || "Miss & Mister Dour"
                      }
                      loading="lazy"
                    />
                    <div className="mmd-gallery-shade" />
                    <span className="mmd-gallery-tag">{categoryLabel(photo.category || "other")}</span>
                    <ZoomIn className="mmd-gallery-zoom" />
                    {(photo.candidateName || photo.title) && (
                      <div className="mmd-gallery-caption">
                        <strong>{photo.candidateName || photo.title}</strong>
                        {photo.candidateCategory && <small>{photo.candidateCategory}</small>}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {filtered.length > visibleCount && (
                <div className="mmd-load-more">
                  <button type="button" onClick={() => setVisibleCount((value) => value + 40)}>
                    Voir plus · {filtered.length - visibleCount}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="mmd-newsletter-strip">
        <div className="mmd-container">
          <div>
            <Sparkles />
            <span>Galerie vivante</span>
            <h2>Recevez les nouveaux contenus.</h2>
          </div>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (!subscribeEmail.trim()) return;
              await subscribeMutation.mutateAsync({
                email: subscribeEmail,
                name: subscribeName || undefined,
              });
              setSubscribeEmail("");
              setSubscribeName("");
            }}
          >
            <input
              type="text"
              value={subscribeName}
              onChange={(event) => setSubscribeName(event.target.value)}
              placeholder="Votre nom (optionnel)"
            />
            <input
              type="email"
              required
              value={subscribeEmail}
              onChange={(event) => setSubscribeEmail(event.target.value)}
              placeholder="Votre email"
            />
            <button disabled={subscribeMutation.isPending}>
              {subscribeMutation.isPending ? "Inscription…" : "S'abonner"}
            </button>
          </form>
          {subscribeMutation.isSuccess && (
            <p className="mmd-form-success">Merci, inscription enregistrée.</p>
          )}
        </div>
      </section>

      <section className="mmd-final-cta mmd-final-cta--compact">
        <div className="mmd-container mmd-final-content">
          <span className="mmd-final-eyebrow">ÉDITION 2027</span>
          <h2>
            Vivez l'histoire <em>de l'intérieur.</em>
          </h2>
          <p>Les candidatures sont ouvertes.</p>
          <div className="mmd-final-actions">
            <Link href="/inscription-candidat" className="mmd-final-dark-button">
              Candidater
            </Link>
            <Link href="/candidates" className="mmd-final-outline-button">
              Voir les profils
            </Link>
          </div>
        </div>
      </section>

      {current && (
        <div className="mmd-lightbox" onClick={close} role="dialog" aria-modal="true">
          <button className="mmd-lightbox-close" onClick={close} aria-label="Fermer">
            <X />
          </button>
          {filtered.length > 1 && (
            <button
              className="mmd-lightbox-prev"
              onClick={(event) => {
                event.stopPropagation();
                prev();
              }}
              aria-label="Photo précédente"
            >
              <ChevronLeft />
            </button>
          )}
          <figure onClick={(event) => event.stopPropagation()}>
            <img src={current.url} alt={current.title || current.candidateName || "Photo"} />
            <figcaption>
              <strong>{current.candidateName || current.title}</strong>
              <span>{categoryLabel(current.category || "other")}</span>
              {current.candidateId && (
                <Link href={`/candidat/${current.candidateId}`}>Voir le profil</Link>
              )}
            </figcaption>
          </figure>
          {filtered.length > 1 && (
            <button
              className="mmd-lightbox-next"
              onClick={(event) => {
                event.stopPropagation();
                next();
              }}
              aria-label="Photo suivante"
            >
              <ChevronRight />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
