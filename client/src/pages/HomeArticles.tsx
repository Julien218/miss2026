import { useState } from "react";
import { motion } from "framer-motion";
import Masonry from "react-masonry-css";
import { trpc } from "../lib/trpc";
import { Calendar, MapPin, User, Eye, Share2, Heart, Sparkles, Trophy, Users } from "lucide-react";
import { Link } from "wouter";
import { SEOHead } from "../components/SEOHead";

// Category badges with colors
const categoryConfig = {
  event: { label: "Événement", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  good_action: { label: "Bonne Action", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  candidate: { label: "Candidat", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  news_dour: { label: "Actualité Dour", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  announcement: { label: "Annonce", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

export default function HomeArticles() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  
  // Fetch articles
  const { data: articles, isLoading } = trpc.articles.list.useQuery({
    category: selectedCategory as any,
    status: "published",
    limit: 20,
    offset: 0,
  });

  // Masonry breakpoints
  const breakpointColumns = {
    default: 3,
    1024: 2,
    640: 1,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Actualités Miss & Mister Dour 2026"
        description="Découvrez les dernières actualités, événements et bonnes actions de nos candidats Miss & Mister Dour 2026. Suivez leur parcours vers la finale du 19 avril 2026."
        image="https://files.manuscdn.com/user_upload_by_module/session_file/87304619/eiRLiShMPFEUcfRq.png"
        url={typeof window !== 'undefined' ? window.location.href : undefined}
        type="website"
      />
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[60vh] flex items-center justify-center overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4B0082]/20 via-transparent to-[#0A0A0A]" />
        
        {/* Content */}
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-6"
          >
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-[#C8A45C]" />
          </motion.div>
          
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-['Playfair_Display'] text-6xl md:text-8xl font-bold mb-6"
          >
            Miss & Mister{" "}
            <span className="bg-gradient-to-r from-[#C8A45C] via-[#D4AF37] to-[#C8A45C] bg-clip-text text-transparent">
              Dour 2026
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Découvrez les dernières actualités, événements et bonnes actions de nos candidats
          </motion.p>
          
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link href="/miss-mister-dour-2026">
              <button className="px-8 py-4 bg-gradient-to-r from-[#C8A45C] via-[#D4AF37] to-[#C8A45C] text-black font-semibold rounded-lg hover:scale-105 transition-transform">
                <Trophy className="inline mr-2 w-5 h-5" />
                Voir les candidats
              </button>
            </Link>
            <Link href="/inscription-candidat">
              <button className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                <Users className="inline mr-2 w-5 h-5" />
                Devenir candidat(e)
              </button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Category Filters */}
      <section className="py-8 px-4 border-b border-white/10">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-6 py-2 rounded-full border transition-all ${
                selectedCategory === undefined
                  ? "bg-[#C8A45C] text-black border-[#C8A45C]"
                  : "border-white/30 text-white hover:border-white/50"
              }`}
            >
              Tous
            </button>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-6 py-2 rounded-full border transition-all ${
                  selectedCategory === key
                    ? config.color
                    : "border-white/30 text-white hover:border-white/50"
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid (Masonry) */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#C8A45C]"></div>
            </div>
          ) : articles && articles.length > 0 ? (
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex gap-6 w-auto"
              columnClassName="masonry-column"
            >
              {articles.map((article, index) => (
                <ArticleCard key={article.id} article={article} index={index} />
              ))}
            </Masonry>
          ) : (
            <div className="text-center py-20">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-2xl text-gray-400">Aucun article pour le moment</p>
              <p className="text-gray-500 mt-2">Revenez bientôt pour découvrir nos actualités !</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative p-12 rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(200, 164, 92, 0.1) 0%, rgba(75, 0, 130, 0.1) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(200, 164, 92, 0.3)",
            }}
          >
            <div className="text-center">
              <Trophy className="w-16 h-16 mx-auto mb-6 text-[#C8A45C]" />
              <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold mb-4">
                Soutenez votre candidat(e) favori(te)
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Chaque partage compte ! Aidez votre candidat(e) à gagner en partageant son profil sur les réseaux sociaux.
              </p>
              <Link href="/miss-mister-dour-2026">
                <button className="px-10 py-4 bg-gradient-to-r from-[#C8A45C] via-[#D4AF37] to-[#C8A45C] text-black font-bold text-lg rounded-lg hover:scale-105 transition-transform">
                  <Heart className="inline mr-2 w-6 h-6" />
                  Voter maintenant
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Custom CSS for Masonry */}
      <style>{`
        .masonry-column {
          background-clip: padding-box;
        }
        .masonry-column > div {
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  );
}

// Article Card Component
function ArticleCard({ article, index }: { article: any; index: number }) {
  const category = categoryConfig[article.category as keyof typeof categoryConfig];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="group relative overflow-hidden rounded-2xl"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Image */}
      {article.imageUrl && (
        <div className="relative overflow-hidden aspect-video">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${category.color}`}>
              {category.label}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="font-['Playfair_Display'] text-2xl font-bold mb-3 line-clamp-2 group-hover:text-[#C8A45C] transition-colors">
          {article.title}
        </h3>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-gray-400 mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          {article.authorName && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{article.authorName}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(article.createdAt).toLocaleDateString("fr-FR")}</span>
          </div>
          {article.viewCount > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{article.viewCount}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <Link href={`/article/${article.slug}`}>
            <button className="text-[#C8A45C] font-semibold hover:underline">
              Lire l'article →
            </button>
          </Link>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 text-gray-400 hover:text-pink-400 transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-sm">{article.likeCount || 0}</span>
            </button>
            <button className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="text-sm">{article.shareCount || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
