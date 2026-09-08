import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "../lib/trpc";
import { Upload, Sparkles, Eye, Trash2, Edit, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AdminArticles() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedArticle, setGeneratedArticle] = useState<any>(null);

  // Fetch articles
  const { data: articles, refetch } = trpc.articles.list.useQuery({
    status: undefined, // Show all statuses for admin
    limit: 50,
    offset: 0,
  });

  // Mutations
  const analyzePhoto = trpc.articles.analyzePhoto.useMutation();
  const createArticle = trpc.articles.create.useMutation();
  const deleteArticle = trpc.articles.delete.useMutation();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle analyze photo
  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Veuillez sélectionner une photo");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        
        const result = await analyzePhoto.mutateAsync({
          imageData: base64,
          fileName: selectedFile.name,
          mimeType: selectedFile.type,
        });

        setGeneratedArticle(result);
        toast.success("Article généré avec succès !");
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Erreur lors de l'analyse de la photo");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle publish article
  const handlePublish = async () => {
    if (!generatedArticle) return;

    try {
      await createArticle.mutateAsync({
        title: generatedArticle.title,
        content: generatedArticle.content,
        excerpt: generatedArticle.excerpt,
        imageUrl: generatedArticle.imageUrl,
        imageKey: generatedArticle.imageKey,
        category: generatedArticle.category,
        tags: generatedArticle.tags,
        status: "published",
        isAiGenerated: true,
        aiModel: generatedArticle.aiModel,
      });

      toast.success("Article publié !");
      setGeneratedArticle(null);
      setSelectedFile(null);
      setPreview(null);
      refetch();
    } catch (error) {
      console.error("Publish error:", error);
      toast.error("Erreur lors de la publication");
    }
  };

  // Handle delete article
  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

    try {
      await deleteArticle.mutateAsync({ id });
      toast.success("Article supprimé");
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="container mx-auto max-w-7xl">
        <h1 className="font-['Playfair_Display'] text-5xl font-bold mb-8">
          Gestion des Articles
        </h1>

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Upload Photo */}
          <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Upload className="w-6 h-6 text-[#C8A45C]" />
              Uploader une photo
            </h2>

            <div className="mb-6">
              <label className="block w-full p-8 border-2 border-dashed border-white/30 rounded-lg cursor-pointer hover:border-[#C8A45C] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-300">Cliquez pour sélectionner une photo</p>
                  <p className="text-sm text-gray-500 mt-2">JPG, PNG (max 5MB)</p>
                </div>
              </label>
            </div>

            {preview && (
              <div className="mb-6">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#C8A45C] via-[#D4AF37] to-[#C8A45C] text-black font-bold rounded-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyser avec IA
                </>
              )}
            </button>
          </div>

          {/* Generated Article Preview */}
          {generatedArticle && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#C8A45C]" />
                Article généré
              </h2>

              <div className="mb-4">
                <span className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {generatedArticle.category}
                </span>
              </div>

              <h3 className="font-['Playfair_Display'] text-2xl font-bold mb-3">
                {generatedArticle.title}
              </h3>

              <p className="text-gray-400 mb-4">
                {generatedArticle.excerpt}
              </p>

              <div className="mb-4 p-4 bg-black/30 rounded-lg max-h-64 overflow-y-auto">
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {generatedArticle.content}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Tags: {generatedArticle.tags?.join(", ")}
                </p>
              </div>

              <button
                onClick={handlePublish}
                className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
              >
                Publier l'article
              </button>
            </motion.div>
          )}
        </div>

        {/* Articles List */}
        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
          <h2 className="text-2xl font-bold mb-6">Articles existants</h2>

          {articles && articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="p-6 rounded-lg bg-white/5 border border-white/10 flex items-center gap-4"
                >
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {article.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        article.status === "published" 
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      }`}>
                        {article.status}
                      </span>
                      {article.isAiGenerated === 1 && (
                        <span className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          ✨ IA
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-lg mb-1">{article.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{article.excerpt}</p>

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.viewCount || 0}
                      </span>
                      <span>{new Date(article.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(`/article/${article.slug}`, "_blank")}
                      className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">Aucun article pour le moment</p>
          )}
        </div>
      </div>
    </div>
  );
}
