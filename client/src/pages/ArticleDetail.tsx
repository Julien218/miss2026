import { useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Calendar, Check, Eye, Heart, Loader2, Share2, User } from "lucide-react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData, createArticleSchema } from "@/components/StructuredData";

const CATEGORY_LABELS: Record<string, string> = {
  event: "Événement",
  good_action: "Bonne action",
  candidate: "Candidat",
  news_dour: "Actualité Dour",
  announcement: "Annonce",
};

export default function ArticleDetail() {
  const [, params] = useRoute("/article/:slug");
  const slug = params?.slug;
  const [copied, setCopied] = useState(false);
  const { data: article, isLoading } = trpc.articles.getById.useQuery({ slug }, { enabled: !!slug });
  const incrementShare = trpc.articles.incrementShareCount.useMutation();
  const toggleLike = trpc.articles.toggleLike.useMutation();

  if (isLoading) return <div className="mmd-public-page mmd-article-state"><Loader2 className="animate-spin"/><span>Chargement de l’article…</span></div>;
  if (!article) return <div className="mmd-public-page mmd-article-state"><h1>Article introuvable</h1><p>Ce contenu n’est plus disponible ou n’a pas encore été publié.</p><Link href="/public" className="mmd-primary-button">Retour aux actualités</Link></div>;

  const canonical = `https://missetmisterdour.be/article/${article.slug || article.id}`;
  const category = CATEGORY_LABELS[article.category] || article.category?.replace(/[_-]+/g, " ") || "Actualité";

  const share = async () => {
    const payload = { title: article.title, text: article.excerpt || article.title, url: canonical };
    let completed = false;
    if (navigator.share) {
      try { await navigator.share(payload); completed = true; } catch { completed = false; }
    } else {
      try { await navigator.clipboard.writeText(canonical); setCopied(true); setTimeout(() => setCopied(false), 2200); completed = true; } catch { completed = false; }
    }
    if (completed) incrementShare.mutate({ id: article.id });
  };

  return <div className="mmd-public-page mmd-article-page">
    <SEOHead
      title={`${article.title} — Miss & Mister Dour`}
      description={article.excerpt || `Actualité Miss & Mister Dour : ${article.title}`}
      image={article.imageUrl || undefined}
      url={canonical}
      type="article"
      publishedTime={new Date(article.createdAt).toISOString()}
      author={article.authorName || "Miss & Mister Dour"}
    />
    <StructuredData data={createArticleSchema("https://missetmisterdour.be", article.title, article.imageUrl || "https://missetmisterdour.be/logo/miss-mister-dour-logo-transparent.webp", article.excerpt || "", new Date(article.createdAt).toISOString(), new Date(article.updatedAt || article.createdAt).toISOString())} />

    <article>
      <header className={`mmd-article-hero ${article.imageUrl ? "has-image" : ""}`}>
        {article.imageUrl && <img src={article.imageUrl} alt={article.title} className="mmd-article-cover" fetchPriority="high" />}
        <div className="mmd-article-shade" />
        <div className="mmd-container mmd-article-header-content">
          <Link href="/public" className="mmd-article-back"><ArrowLeft/>Actualités</Link>
          <span className="mmd-article-category">{category}</span>
          <h1>{article.title}</h1>
          {article.excerpt && <p>{article.excerpt}</p>}
          <div className="mmd-article-meta">
            {article.authorName && <span><User/>{article.authorName}</span>}
            <span><Calendar/>{new Date(article.createdAt).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span><Eye/>{article.viewCount || 0} vues</span>
          </div>
        </div>
      </header>

      <div className="mmd-container mmd-article-layout">
        <div className="mmd-article-content"><Streamdown>{article.content}</Streamdown></div>
        <aside className="mmd-article-actions">
          <span>PARTAGER</span>
          <button type="button" onClick={share}>{copied ? <Check/> : <Share2/>}{copied ? "Lien copié" : "Partager"}</button>
          <button type="button" onClick={() => toggleLike.mutate({ id: article.id })} disabled={toggleLike.isPending}><Heart/>{article.likeCount || 0} j’aime</button>
          <small>{article.shareCount || 0} partage{(article.shareCount || 0) > 1 ? "s" : ""}</small>
        </aside>
      </div>

      {article.isAiGenerated === 1 && <div className="mmd-container"><div className="mmd-article-ai-note">Contenu préparé avec assistance numérique et publié sous la responsabilité éditoriale de l’équipe Miss & Mister Dour.</div></div>}
    </article>

    <section className="mmd-final-cta mmd-final-cta--compact"><div className="mmd-container mmd-final-content"><span className="mmd-final-eyebrow">CONTINUER</span><h2>Découvrez <em>l’édition 2027.</em></h2><div className="mmd-final-actions"><Link href="/candidates" className="mmd-final-dark-button">Les candidats</Link><Link href="/gallery" className="mmd-final-outline-button">La galerie</Link></div></div></section>
  </div>;
}
