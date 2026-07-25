import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "../lib/trpc";
import { Calendar, User, Eye, Share2, Heart, ArrowLeft, Facebook, Twitter } from "lucide-react";
import { Streamdown } from "streamdown";
import { SEOHead } from "../components/SEOHead";
import { StructuredData, createArticleSchema } from "../components/StructuredData";

// Category badges
const categoryConfig = {
  event: { label: "Événement", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  good_action: { label: "Bonne Action", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  candidate: { label: "Candidat", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  news_dour: { label: "Actualité Dour", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  announcement: { label: "Annonce", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

export default function ArticleDetail() {
  const [, params] = useRoute("/article/:slug");
  const slug = params?.slug;

  // Fetch article
  const { data: article, isLoading } = trpc.articles.getById.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Mutations
  const incrementShare = trpc.articles.incrementShareCount.useMutation();
  const toggleLike = trpc.articles.toggleLike.useMutation();

  // Handle share
  const handleShare = async (platform: string) => {
    if (!article) return;

    const url = window.location.href;
    const text = article.title;

    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
        break;
      case "copy":
        await navigator.clipboard.writeText(url);
        alert("Lien copié !");
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }

    // Increment share count
    incrementShare.mutate({ id: article.id });
  };

  // Handle like
  const handleLike = () => {
    if (!article) return;
    toggleLike.mutate({ id: article.id });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#C8A45C]"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article non trouvé</h1>
          <Link href="/">
            <button className="text-[#C8A45C] hover:underline">
              ← Retour à l'accueil
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const category = categoryConfig[article.category as keyof typeof categoryConfig];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">      {/* SEO Meta Tags */}
      <SEOHead
        title={article.title}
        description={article.excerpt || ''}
        image={article.imageUrl || ''}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
        type="article"
        publishedTime={new Date(article.createdAt).toISOString()}
        author="Miss & Mister Dour"
      />
      
      {/* Schema.org Structured Data */}
      <StructuredData
        data={createArticleSchema(
          typeof window !== 'undefined' ? window.location.origin : 'https://missdourweb.manus.space',
          article.title,
          article.imageUrl || '',
          article.excerpt || '',
          new Date(article.createdAt).toISOString(),
          new Date(article.updatedAt || article.createdAt).toISOString()
        )}
      />
      {/* Hero Image */}
      {article.imageUrl && (
        <div className="relative h-[60vh] overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />
          
          {/* Back Button */}
          <Link href="/">
            <button className="absolute top-8 left-8 px-4 py-2 bg-black/50 backdrop-blur-md text-white rounded-lg hover:bg-black/70 transition-colors flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
          </Link>
        </div>
      )}

      {/* Article Content */}
      <article className="container mx-auto max-w-4xl px-4 py-12">
        {/* Category Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${category.color}`}>
            {category.label}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-['Playfair_Display'] text-5xl md:text-6xl font-bold mb-6"
        >
          {article.title}
        </motion.h1>

        {/* Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-6 text-gray-400 mb-8 pb-8 border-b border-white/10"
        >
          {article.authorName && (
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>{article.authorName}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>{new Date(article.createdAt).toLocaleDateString("fr-FR", { 
              day: "numeric", 
              month: "long", 
              year: "numeric" 
            })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            <span>{article.viewCount || 0} vues</span>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="prose prose-invert prose-lg max-w-none mb-12"
        >
          <Streamdown>{article.content}</Streamdown>
        </motion.div>

        {/* Share Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
        >
          <span className="font-semibold text-lg">Partager :</span>
          
          <button
            onClick={() => handleShare("facebook")}
            className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors"
          >
            <Facebook className="w-5 h-5" />
            Facebook
          </button>
          
          <button
            onClick={() => handleShare("twitter")}
            className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1A8CD8] transition-colors"
          >
            <Twitter className="w-5 h-5" />
            Twitter
          </button>
          
          <button
            onClick={() => handleShare("whatsapp")}
            className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] transition-colors"
          >
            <Share2 className="w-5 h-5" />
            WhatsApp
          </button>
          
          <button
            onClick={() => handleShare("copy")}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Copier le lien
          </button>

          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 text-pink-400 rounded-lg hover:bg-pink-500/30 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span>{article.likeCount || 0}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-400">
              <Share2 className="w-5 h-5" />
              <span>{article.shareCount || 0} partages</span>
            </div>
          </div>
        </motion.div>

        {/* AI Generated Badge */}
        {article.isAiGenerated === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm"
          >
            ✨ Cet article a été généré automatiquement par intelligence artificielle à partir d'une analyse de photo.
          </motion.div>
        )}
      </article>
    </div>
  );
}
