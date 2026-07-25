import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Eye, QrCode, MousePointerClick, TrendingUp, Award } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function CandidateAnalytics() {
  const params = useParams<{ id: string }>();
  const candidateId = parseInt(params.id || "0");
  const isMobile = useIsMobile();

  // Fetch candidate data
  const { data: candidate, isLoading: candidateLoading } = trpc.candidates.getById.useQuery({ id: candidateId });
  
  // Fetch detailed analytics
  const { data: analytics, isLoading: analyticsLoading } = trpc.sharing.getDetailedAnalytics.useQuery({
    candidateId,
    contestId: candidate?.contestId || 1,
  }, {
    enabled: !!candidate,
  });

  const isLoading = candidateLoading || analyticsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#D4AF37] text-xl">Chargement des statistiques...</div>
      </div>
    );
  }

  if (!candidate || !analytics) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white text-xl">Données non disponibles</div>
      </div>
    );
  }

  // Préparer les données pour le graphique par plateforme
  const platformData = Object.entries(analytics.sharesByPlatform).map(([platform, count]) => ({
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    partages: count,
  }));

  // Préparer les données pour le graphique temporel
  const timelineData = analytics.sharesTimeline.map((item) => ({
    date: new Date(item.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    partages: item.count,
  }));

  // Calculer le trend (comparaison avec moyenne)
  const trendVsAverage = analytics.averageShares > 0
    ? Math.round(((analytics.totalShares - analytics.averageShares) / analytics.averageShares) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-[#D4AF37]/10 bg-[#0A0A0A]/70 md:backdrop-blur-2xl backdrop-blur-md"
      >
        <div className="container flex h-20 items-center justify-between">
          <Link href={`/candidate/${candidateId}`}>
            <Button variant="ghost" className="text-[#C0C0C0] hover:text-[#D4AF37]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au profil
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-white hidden md:block">
            Statistiques - {candidate.firstName} {candidate.lastName}
          </h1>
        </div>
      </motion.header>

      {/* Contenu principal */}
      <div className="container pt-32 pb-16 px-4">
        {/* Titre mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:hidden"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-br from-[#E8C547] via-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent">
            Statistiques
          </h1>
          <p className="text-[#C0C0C0]">{candidate.firstName} {candidate.lastName}</p>
        </motion.div>

        {/* Statistiques clés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Partages Totaux"
            value={analytics.totalShares}
            icon={Share2}
            trend={{
              value: trendVsAverage,
              label: "vs moyenne",
            }}
            delay={0}
          />
          <StatsCard
            title="Vues du Profil"
            value={analytics.totalViews}
            icon={Eye}
            delay={0.1}
          />
          <StatsCard
            title="Scans QR Code"
            value={analytics.totalQRScans}
            icon={QrCode}
            delay={0.2}
          />
          <StatsCard
            title="Clics"
            value={analytics.totalClicks}
            icon={MousePointerClick}
            delay={0.3}
          />
        </div>

        {/* Classement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="border-[#D4AF37]/20 bg-gradient-to-br from-[#1A1A1A]/80 to-[#0A0A0A]/80 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#B8941E]/20">
                    <Award className="h-8 w-8 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#C0C0C0] mb-1">Classement</p>
                    <p className="text-3xl font-bold bg-gradient-to-br from-[#E8C547] via-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent">
                      #{analytics.ranking}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#C0C0C0] mb-1">Sur</p>
                  <p className="text-2xl font-semibold text-white">{analytics.totalCandidates} candidats</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Graphique par plateforme */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-[#D4AF37]/20 bg-gradient-to-br from-[#1A1A1A]/80 to-[#0A0A0A]/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
                  Partages par Plateforme
                </CardTitle>
              </CardHeader>
              <CardContent>
                {platformData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={platformData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D4AF37" opacity={0.1} />
                      <XAxis 
                        dataKey="platform" 
                        stroke="#C0C0C0"
                        tick={{ fill: '#C0C0C0' }}
                      />
                      <YAxis 
                        stroke="#C0C0C0"
                        tick={{ fill: '#C0C0C0' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1A1A1A',
                          border: '1px solid #D4AF37',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                        }}
                      />
                      <Bar 
                        dataKey="partages" 
                        fill="url(#colorGradient)"
                        radius={[8, 8, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E8C547" />
                          <stop offset="50%" stopColor="#D4AF37" />
                          <stop offset="100%" stopColor="#B8941E" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-[#C0C0C0]">
                    Aucune donnée disponible
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Graphique temporel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-[#D4AF37]/20 bg-gradient-to-br from-[#1A1A1A]/80 to-[#0A0A0A]/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
                  Évolution des Partages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timelineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D4AF37" opacity={0.1} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#C0C0C0"
                        tick={{ fill: '#C0C0C0' }}
                      />
                      <YAxis 
                        stroke="#C0C0C0"
                        tick={{ fill: '#C0C0C0' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1A1A1A',
                          border: '1px solid #D4AF37',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="partages" 
                        stroke="#D4AF37"
                        strokeWidth={3}
                        dot={{ fill: '#D4AF37', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-[#C0C0C0]">
                    Aucune donnée disponible
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Comparaison avec la moyenne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Card className="border-[#D4AF37]/20 bg-gradient-to-br from-[#1A1A1A]/80 to-[#0A0A0A]/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Comparaison avec les Autres Candidats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-[#C0C0C0] mb-2">Vos Partages</p>
                  <p className="text-4xl font-bold bg-gradient-to-br from-[#E8C547] via-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent">
                    {analytics.totalShares}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#C0C0C0] mb-2">Moyenne</p>
                  <p className="text-4xl font-bold text-white">
                    {analytics.averageShares}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#C0C0C0] mb-2">Différence</p>
                  <p className={`text-4xl font-bold ${trendVsAverage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trendVsAverage >= 0 ? '+' : ''}{trendVsAverage}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
