import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Download, Calendar, Filter, TrendingUp, Eye, Share2, MousePointerClick, QrCode } from "lucide-react";
import { trpc } from "../lib/trpc";
import { useLocation } from "wouter";

export function AdminAnalytics() {
  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();

  // Filters
  const [eventType, setEventType] = useState<"all" | "view" | "click" | "share" | "qr_scan">("all");
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | undefined>(undefined);
  const [period, setPeriod] = useState<7 | 14 | 30>(7);

  // Calculate date range
  const endDate = useMemo(() => new Date(), []);
  const startDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - period);
    return date;
  }, [period]);

  // Fetch data
  const { data: heatmapData, isLoading } = trpc.analytics.getHeatmapData.useQuery({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    eventType: eventType === "all" ? undefined : eventType,
    candidateId: selectedCandidateId,
  });

  const { data: summary } = trpc.analytics.getHeatmapSummary.useQuery({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    eventType: eventType === "all" ? undefined : eventType,
    candidateId: selectedCandidateId,
  });

  const { data: candidates } = trpc.candidates.listByContest.useQuery({ contestId: 1 });

  // Export handlers
  const exportCSV = trpc.analytics.exportHeatmapCSV.useQuery;
  const exportJSON = trpc.analytics.exportHeatmapJSON.useQuery;

  const handleExportCSV = async () => {
    const result = await exportCSV({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      eventType: eventType === "all" ? undefined : eventType,
      candidateId: selectedCandidateId,
    });

    if (result.data) {
      const blob = new Blob([result.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `heatmap-${eventType}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleExportJSON = async () => {
    const result = await exportJSON({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      eventType: eventType === "all" ? undefined : eventType,
      candidateId: selectedCandidateId,
    });

    if (result.data) {
      const blob = new Blob([result.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `heatmap-${eventType}-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Redirect if not admin
  if (user && user.role !== "admin") {
    setLocation("/");
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#0A0A0A] to-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C8A45C]"></div>
      </div>
    );
  }

  // Calculate max count for color scaling
  const maxCount = useMemo(() => {
    if (!heatmapData) return 1;
    return Math.max(...heatmapData.map(d => d.count), 1);
  }, [heatmapData]);

  // Get color based on intensity
  const getHeatmapColor = (count: number): string => {
    const intensity = count / maxCount;
    if (intensity === 0) return "rgba(107, 114, 128, 0.1)"; // Gray
    if (intensity < 0.2) return "rgba(16, 185, 129, 0.3)"; // Light green
    if (intensity < 0.4) return "rgba(245, 158, 11, 0.4)"; // Orange
    if (intensity < 0.6) return "rgba(200, 164, 92, 0.5)"; // Warm gold
    if (intensity < 0.8) return "rgba(212, 175, 55, 0.7)"; // Gold
    return "rgba(255, 215, 0, 0.9)"; // Bright gold
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0A0A0A] to-black text-white">
      {/* Header */}
      <div className="relative pt-32 pb-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="text-5xl md:text-7xl font-bold mb-6 text-center"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="text-white">Analytics</span>{" "}
              <span className="bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-[#B0B0B0] text-lg text-center mb-12">
              Heatmap engagement 7j×24h • Filtres avancés • Export CSV/JSON
            </p>

            {/* Summary Stats */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-[#C8A45C]/10 to-[#D4AF37]/5 border border-[#C8A45C]/30 rounded-2xl p-6 backdrop-blur-xl"
                >
                  <TrendingUp className="w-8 h-8 text-[#C8A45C] mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">{summary.totalEvents.toLocaleString()}</div>
                  <div className="text-sm text-[#B0B0B0]">Événements totaux</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-[#C8A45C]/10 to-[#D4AF37]/5 border border-[#C8A45C]/30 rounded-2xl p-6 backdrop-blur-xl"
                >
                  <Calendar className="w-8 h-8 text-[#C8A45C] mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">{summary.avgEventsPerCell}</div>
                  <div className="text-sm text-[#B0B0B0]">Moyenne par cellule</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl"
                >
                  <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
                  <div className="text-xl font-bold text-white mb-1">
                    {summary.peakHour.day} {summary.peakHour.hour}
                  </div>
                  <div className="text-sm text-[#B0B0B0]">Heure de pointe ({summary.peakHour.count} événements)</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-xl"
                >
                  <Calendar className="w-8 h-8 text-blue-400 mb-3" />
                  <div className="text-xl font-bold text-white mb-1">
                    {summary.quietestHour.day} {summary.quietestHour.hour}
                  </div>
                  <div className="text-sm text-[#B0B0B0]">Heure calme ({summary.quietestHour.count} événements)</div>
                </motion.div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-black/40 border border-[#C8A45C]/30 rounded-2xl p-6 backdrop-blur-xl mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Filter className="w-5 h-5 text-[#C8A45C]" />
                <h2 className="text-xl font-semibold text-white">Filtres</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Event Type Filter */}
                <div>
                  <label className="block text-sm text-[#B0B0B0] mb-2">Type d'événement</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "all", label: "Tous", icon: Filter },
                      { value: "view", label: "Vues", icon: Eye },
                      { value: "click", label: "Clics", icon: MousePointerClick },
                      { value: "share", label: "Partages", icon: Share2 },
                      { value: "qr_scan", label: "QR Scans", icon: QrCode },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setEventType(type.value as any)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                          eventType === type.value
                            ? "bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] text-black"
                            : "bg-black/60 text-[#B0B0B0] hover:text-white border border-[#C8A45C]/30"
                        }`}
                      >
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Candidate Filter */}
                <div>
                  <label className="block text-sm text-[#B0B0B0] mb-2">Candidat</label>
                  <select
                    value={selectedCandidateId || ""}
                    onChange={(e) => setSelectedCandidateId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-4 py-2 rounded-lg bg-black/60 border border-[#C8A45C]/30 text-white focus:outline-none focus:border-[#C8A45C]"
                  >
                    <option value="">Tous les candidats</option>
                    {candidates?.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.firstName} {candidate.lastName} ({candidate.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Period Filter */}
                <div>
                  <label className="block text-sm text-[#B0B0B0] mb-2">Période</label>
                  <div className="flex gap-2">
                    {[7, 14, 30].map((days) => (
                      <button
                        key={days}
                        onClick={() => setPeriod(days as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          period === days
                            ? "bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] text-black"
                            : "bg-black/60 text-[#B0B0B0] hover:text-white border border-[#C8A45C]/30"
                        }`}
                      >
                        {days}j
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleExportCSV}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] text-black font-semibold hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button
                  onClick={handleExportJSON}
                  className="px-6 py-2 rounded-lg bg-black/60 border border-[#C8A45C]/30 text-white font-semibold hover:bg-[#C8A45C]/10 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>
              </div>
            </div>

            {/* Heatmap */}
            <div className="bg-black/40 border border-[#C8A45C]/30 rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold text-white mb-6">Heatmap Engagement 7j×24h</h2>

              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C8A45C]"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Hour labels */}
                    <div className="flex mb-2">
                      <div className="w-24"></div>
                      {Array.from({ length: 24 }, (_, i) => (
                        <div key={i} className="flex-1 text-center text-xs text-[#B0B0B0]">
                          {i}h
                        </div>
                      ))}
                    </div>

                    {/* Heatmap grid */}
                    {["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"].map((dayName, dayIndex) => (
                      <div key={dayName} className="flex mb-1">
                        <div className="w-24 flex items-center text-sm text-[#B0B0B0]">{dayName}</div>
                        {Array.from({ length: 24 }, (_, hourIndex) => {
                          const cellData = heatmapData?.find(d => d.day === dayIndex && d.hour === hourIndex);
                          const count = cellData?.count || 0;
                          const color = getHeatmapColor(count);

                          return (
                            <motion.div
                              key={`${dayIndex}-${hourIndex}`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: (dayIndex * 24 + hourIndex) * 0.001 }}
                              className="flex-1 aspect-square mx-0.5 rounded-md cursor-pointer hover:scale-110 transition-transform relative group"
                              style={{ backgroundColor: color }}
                              title={`${dayName} ${hourIndex}h: ${count} événements`}
                            >
                              {count > 0 && (
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                  {count}
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <span className="text-sm text-[#B0B0B0]">Moins d'engagement</span>
                      <div className="flex gap-1">
                        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
                          <div
                            key={intensity}
                            className="w-8 h-8 rounded-md"
                            style={{ backgroundColor: getHeatmapColor(intensity * maxCount) }}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-[#B0B0B0]">Plus d'engagement</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
