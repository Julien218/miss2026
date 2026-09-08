import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Video, 
  Mic, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Download,
  Copy,
  PlayCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { BRANDING } from "@/config/branding";

export default function InternalDashboard() {
  const [selectedTab, setSelectedTab] = useState<"candidates" | "media">("candidates");
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);

  // Queries
  const { data: candidates, refetch: refetchCandidates } = trpc.candidates.listByContest.useQuery({ contestId: 1 });
  const { data: allJobs, refetch: refetchJobs } = trpc.flowithos.getJobsByCandidate.useQuery(
    { candidateId: selectedCandidates[0] || 0 },
    { enabled: selectedCandidates.length > 0 }
  );

  // Mutations
  const createVideoMutation = trpc.flowithos.createMission.useMutation();

  const handleGenerateVideo = async (candidateId: number) => {
    try {
      const result = await createVideoMutation.mutateAsync({
        candidateId,
        format: "vertical_9_16",
        durationSeconds: 30,
        videoType: "profile",
      });

      toast.success("Vidéo en cours de génération");
      await navigator.clipboard.writeText(JSON.stringify(result.missionPack, null, 2));
      toast.info("Mission Pack copié");
      refetchJobs();
    } catch (error: any) {
      toast.error(error.message || "Erreur génération vidéo");
    }
  };

  const handleBatchGenerate = async () => {
    if (selectedCandidates.length === 0) {
      toast.error("Sélectionnez au moins un candidat");
      return;
    }

    toast.info(`Génération batch de ${selectedCandidates.length} vidéos...`);
    
    for (const candidateId of selectedCandidates.slice(0, 3)) {
      await handleGenerateVideo(candidateId);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
    }

    toast.success("Batch génération lancée");
  };

  const toggleCandidateSelection = (candidateId: number) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center">
                <img
                  src={BRANDING.logoIdentity}
                  alt="Logo officiel Miss & Mister Dour 2026"
                  className="h-14 max-h-[56px] md:max-h-[56px] max-[640px]:h-10 max-[640px]:max-h-[38px] w-auto object-contain"
                  loading="eager"
                />
              </a>
              <div>
                <p className="text-sm text-gray-400">Dashboard Interne - Production Média</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedTab === "candidates" ? "default" : "outline"}
                onClick={() => setSelectedTab("candidates")}
                className="bg-gradient-to-r from-[#C8A45C] to-[#D4AF37]"
              >
                <Users className="w-4 h-4 mr-2" />
                Candidats
              </Button>
              <Button
                variant={selectedTab === "media" ? "default" : "outline"}
                onClick={() => setSelectedTab("media")}
                className="border-gray-700"
              >
                <Video className="w-4 h-4 mr-2" />
                Media Factory
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Candidates Tab */}
        {selectedTab === "candidates" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Gestion Candidats</h2>
              <div className="flex gap-2">
                {selectedCandidates.length > 0 && (
                  <>
                    <Button
                      onClick={handleBatchGenerate}
                      disabled={createVideoMutation.isPending}
                      className="bg-gradient-to-r from-[#C8A45C] to-[#D4AF37]"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Batch Génération ({selectedCandidates.length})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCandidates([])}
                      className="border-gray-700"
                    >
                      Désélectionner
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates?.map((candidate) => (
                <Card
                  key={candidate.id}
                  className={`bg-gray-900/50 border-gray-800 p-4 cursor-pointer transition-all ${
                    selectedCandidates.includes(candidate.id)
                      ? "ring-2 ring-[#C8A45C]"
                      : ""
                  }`}
                  onClick={() => toggleCandidateSelection(candidate.id)}
                >
                  <div className="flex items-start gap-3">
                    {candidate.profilePhoto && (
                      <img
                        src={candidate.profilePhoto}
                        alt={`${candidate.firstName} ${candidate.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {candidate.firstName} {candidate.lastName}
                      </h3>
                      <p className="text-sm text-gray-400">{candidate.category}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateVideo(candidate.id);
                      }}
                      disabled={createVideoMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] hover:opacity-90"
                    >
                      <Video className="w-3 h-3 mr-1" />
                      Vidéo
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info("ElevenLabs TTS en cours d'implémentation");
                      }}
                      className="flex-1 border-gray-700"
                    >
                      <Mic className="w-3 h-3 mr-1" />
                      Voix
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Media Factory Tab */}
        {selectedTab === "media" && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Jobs Média</h2>

            {allJobs && allJobs.length > 0 ? (
              <div className="space-y-4">
                {allJobs.map((job) => (
                  <Card key={job.id} className="bg-gray-900/50 border-gray-800 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Job #{job.id}</h3>
                        <p className="text-sm text-gray-400">
                          {job.kind} • {job.format} • {job.durationSeconds}s
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.status === "done" && (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        )}
                        {job.status === "failed" && (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        {job.status === "running" && (
                          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                        )}
                        {job.status === "pending" && (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            job.status === "done"
                              ? "bg-green-500/20 text-green-400"
                              : job.status === "failed"
                              ? "bg-red-500/20 text-red-400"
                              : job.status === "running"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {job.missionPackJson && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(job.missionPackJson || "");
                            toast.success("Mission Pack copié");
                          }}
                          className="border-gray-700"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Mission Pack
                        </Button>
                      )}

                      {job.outputUrl && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(job.outputUrl!, "_blank")}
                            className="border-gray-700"
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Aperçu
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(job.outputUrl!, "_blank")}
                            className="border-gray-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </Button>
                        </>
                      )}
                    </div>

                    {job.logsJson && (
                      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                        <p className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                          {job.logsJson}
                        </p>
                      </div>
                    )}

                    {job.errorMessage && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-sm text-red-400">{job.errorMessage}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun job média. Sélectionnez un candidat et générez une vidéo.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
