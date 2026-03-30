import { useParams } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { ShareButtons } from "@/components/ShareButtons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, Star, Award, MapPin, Calendar, User, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function CandidateProfile() {
  const params = useParams<{ id: string }>();
  const candidateId = parseInt(params.id || "0");
  const isMobile = useIsMobile();

  // Fetch candidate data
  const { data: candidate, isLoading } = trpc.candidates.getById.useQuery({ id: candidateId });
  
  // Fetch share stats
  const { data: shareStats } = trpc.sharing.getShareStats.useQuery({ candidateId });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#D4AF37] text-xl">Chargement...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white text-xl">Candidat non trouvé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header avec retour */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-[#D4AF37]/10 bg-[#0A0A0A]/70 md:backdrop-blur-2xl backdrop-blur-md"
      >
        <div className="container flex h-20 items-center justify-between">
          <Link href="/gallery">
            <Button variant="ghost" className="text-[#C0C0C0] hover:text-[#D4AF37]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la galerie
            </Button>
          </Link>
        </div>
      </motion.header>

      {/* Contenu principal */}
      <div className="container pt-32 pb-16 px-4">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Photo principale */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-[#D4AF37]/20 bg-gradient-to-br from-[#1A1A1A]/80 to-[#0A0A0A]/80 md:backdrop-blur-xl backdrop-blur-md overflow-hidden">
              <CardContent className="p-0">
                {candidate.profilePhoto ? (
                  <img
                    src={candidate.profilePhoto}
                    alt={`${candidate.firstName} ${candidate.lastName}`}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center">
                    <User className="h-32 w-32 text-[#D4AF37]/20" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Informations et partage */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Nom et catégorie */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-[#E8C547] via-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent mb-2">
                {candidate.firstName} {candidate.lastName}
              </h1>
              <div className="flex items-center gap-2 text-[#C0C0C0]">
                <Award className="h-5 w-5 text-[#D4AF37]" />
                <span className="text-lg capitalize">{candidate.category.replace("_", " ")}</span>
              </div>
            </div>

            {/* Statistiques */}
            <Card className="border-[#D4AF37]/20 bg-gradient-to-br from-[#1A1A1A]/80 to-[#0A0A0A]/80 md:backdrop-blur-xl backdrop-blur-md">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#D4AF37]">
                      {shareStats?.totalShares || 0}
                    </div>
                    <div className="text-sm text-[#C0C0C0]">Partages</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#D4AF37]">
                      {candidate.height || "-"}
                    </div>
                    <div className="text-sm text-[#C0C0C0]">cm</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#D4AF37]">
                      {candidate.status === "finalist" ? "Finaliste" : "Candidat"}
                    </div>
                    <div className="text-sm text-[#C0C0C0]">Statut</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations personnelles */}
            {(candidate.city || candidate.country) && (
              <Card className="border-[#D4AF37]/20 bg-gradient-to-br from-[#1A1A1A]/80 to-[#0A0A0A]/80 md:backdrop-blur-xl backdrop-blur-md">
                <CardContent className="p-6 space-y-3">
                  {candidate.city && (
                    <div className="flex items-center gap-3 text-[#C0C0C0]">
                      <MapPin className="h-5 w-5 text-[#D4AF37]" />
                      <span>{candidate.city}{candidate.country && `, ${candidate.country}`}</span>
                    </div>
                  )}
                  {candidate.dateOfBirth && (
                    <div className="flex items-center gap-3 text-[#C0C0C0]">
                      <Calendar className="h-5 w-5 text-[#D4AF37]" />
                      <span>{new Date(candidate.dateOfBirth).toLocaleDateString("fr-FR")}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Bio */}
            {candidate.bio && (
              <Card className="border-[#D4AF37]/20 bg-gradient-to-br from-[#1A1A1A]/80 to-[#0A0A0A]/80 md:backdrop-blur-xl backdrop-blur-md">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <Star className="h-5 w-5 text-[#D4AF37]" />
                    À propos
                  </h3>
                  <p className="text-[#C0C0C0] leading-relaxed">{candidate.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Motivation */}
            {candidate.motivation && (
              <Card className="border-[#D4AF37]/20 bg-gradient-to-br from-[#1A1A1A]/80 to-[#0A0A0A]/80 md:backdrop-blur-xl backdrop-blur-md">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-[#D4AF37]" />
                    Motivation
                  </h3>
                  <p className="text-[#C0C0C0] leading-relaxed">{candidate.motivation}</p>
                </CardContent>
              </Card>
            )}

            {/* Partage social */}
            <Card className="border-[#D4AF37]/20 bg-gradient-to-br from-[#1A1A1A]/80 to-[#0A0A0A]/80 md:backdrop-blur-xl backdrop-blur-md">
              <CardContent className="p-6">
                <ShareButtons
                  candidateId={candidate.id}
                  candidateName={`${candidate.firstName} ${candidate.lastName}`}
                  candidatePhoto={candidate.profilePhoto || undefined}
                  contestName="Miss & Mister Dour 2026"
                />
              </CardContent>
            </Card>

            {/* Bouton statistiques */}
            <Link href={`/candidate/${candidate.id}/analytics`}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" className="w-full border-[#D4AF37]/30 bg-[#1A1A1A]/80 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/50 text-[#C0C0C0] hover:text-[#D4AF37] font-semibold text-lg py-6">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Voir les Statistiques
                </Button>
              </motion.div>
            </Link>

            {/* Bouton de vote */}
            <Link href={`/vote?candidate=${candidate.id}`}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] hover:from-[#E8C547] hover:to-[#D4AF37] text-[#0A0A0A] font-semibold text-lg py-6">
                  <Heart className="h-5 w-5 mr-2" />
                  Voter pour {candidate.firstName}
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
