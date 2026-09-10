import { useState } from "react";
import { Calendar, Eye, Heart, Newspaper, Share2, User } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { SEOHead } from "@/components/SEOHead";
import { BRANDING } from "@/config/branding";

const CATEGORIES = {
  event: "Événement",
  good_action: "Bonne action",
  candidate: "Candidat",
  news_dour: "Actualité Dour",
  announcement: "Annonce",
} as const;

function categoryLabel(value: string) {
  return CATEGORIES[value as keyof typeof CATEGORIES] || value.replace(/[_-]+/g, " ");
}

export default function HomeArticles() {
  const [category, setCategory] = useState<string | undefined>();
  const { data: articles, isLoading } = trpc.articles.list.useQuery({ category: category as any, status: "published", limit: 30, offset: 0 });

  return <div className="mmd-public-page mmd-news-page">
    <SEOHead
      title="Actualités — Miss & Mister Dour 2027"
      description="Actualités, rencontres, coulisses et temps forts de Miss & Mister Dour 2027."
      url="https://missetmisterdour.be/public"
      image={BRANDING.logoIdentity}
      tags={["actualités Miss Mister Dour", "Miss Dour 2027", "Mister Dour 2027", "Dour Hainaut"]}
    />

    <section className="mmd-public-hero mmd-news-hero"><div className="mmd-container">
      <div className="mmd-public-kicker"><span>JOURNAL</span><i/>ACTUALITÉS</div>
      <img src={BRANDING.logoIdentity} alt="Miss & Mister Dour" className="mmd-public-logo-mark" />
      <h1>Les histoires qui font <em>l’édition.</em></h1>
      <p>Rencontres, coulisses, événements et actualités : suivez Miss & Mister Dour comme un magazine digital.</p>
    </div></section>

    <section className="mmd-section"><div className="mmd-container">
      <div className="mmd-news-filters" role="group" aria-label="Filtrer les actualités">
        <button type="button" className={!category ? "is-active" : ""} onClick={() => setCategory(undefined)}>Tout</button>
        {Object.entries(CATEGORIES).map(([key, label]) => <button type="button" key={key} className={category === key ? "is-active" : ""} onClick={() => setCategory(key)}>{label}</button>)}
      </div>

      {isLoading ? <div className="mmd-news-grid">{Array.from({ length: 6 }).map((_, index) => <div className="mmd-news-skeleton" key={index} />)}</div> : articles && articles.length ? <div className="mmd-news-grid">
        {articles.map((article, index) => <article className={`mmd-news-card ${index === 0 ? "is-featured" : ""}`} key={article.id}>
          <Link href={`/article/${article.slug || article.id}`} className="mmd-news-image">
            {article.imageUrl ? <img src={article.imageUrl} alt={article.title} loading={index < 2 ? "eager" : "lazy"} /> : <div className="mmd-news-image-fallback"><Newspaper /></div>}
            <span>{categoryLabel(article.category)}</span>
          </Link>
          <div className="mmd-news-body">
            <div className="mmd-news-meta">
              <span><Calendar />{new Date(article.createdAt).toLocaleDateString("fr-BE", { day: "2-digit", month: "short", year: "numeric" })}</span>
              {article.authorName && <span><User />{article.authorName}</span>}
            </div>
            <h2><Link href={`/article/${article.slug || article.id}`}>{article.title}</Link></h2>
            {article.excerpt && <p>{article.excerpt}</p>}
            <div className="mmd-news-footer"><div>{(article.viewCount || 0) > 0 && <span><Eye />{article.viewCount}</span>}{(article.likeCount || 0) > 0 && <span><Heart />{article.likeCount}</span>}{(article.shareCount || 0) > 0 && <span><Share2 />{article.shareCount}</span>}</div><Link href={`/article/${article.slug || article.id}`}>Lire l’article →</Link></div>
          </div>
        </article>)}
      </div> : <div className="mmd-empty-editorial"><Newspaper/><h2>Le journal se prépare</h2><p>Les prochaines actualités de l’édition 2027 apparaîtront ici.</p></div>}
    </div></section>

    <section className="mmd-final-cta mmd-final-cta--compact"><div className="mmd-container mmd-final-content"><span className="mmd-final-eyebrow">ÉDITION 2027</span><h2>Suivez les <em>visages.</em></h2><p>Découvrez les profils déjà publiés et les coulisses de leur parcours.</p><div className="mmd-final-actions"><Link href="/candidates" className="mmd-final-dark-button">Voir les candidats</Link><Link href="/gallery" className="mmd-final-outline-button">Ouvrir la galerie</Link></div></div></section>
  </div>;
}
