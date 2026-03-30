import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, PlayCircle, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VideoFactory2026() {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [format, setFormat] = useState<"vertical_9_16" | "square_1_1" | "horizontal_16_9">("vertical_9_16");
  const [duration, setDuration] = useState(30);

  const { data: candidates } = trpc.candidates.listByContest.useQuery({ contestId: 1 });
  const createMission = trpc.flowithos.createMission.useMutation();
  const { data: jobs, refetch: refetchJobs } = trpc.flowithos.getJobsByCandidate.useQuery(
    { candidateId: selectedCandidate! },
    { enabled: !!selectedCandidate }
  );

  const handleCreateMission = async (candidateId: number) => {
    try {
      const result = await createMission.mutateAsync({
        candidateId,
        format,
        durationSeconds: duration,
        videoType: "profile",
      });

      toast.success("Mission créée avec succès !");
      
      // Copy mission pack to clipboard
      await navigator.clipboard.writeText(JSON.stringify(result.missionPack, null, 2));
      toast.info("Mission Pack copié dans le presse-papier");

      setSelectedCandidate(candidateId);
      refetchJobs();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création de la mission");
    }
  };

  const copyMissionPack = async (missionPackJson: string) => {
    try {
      await navigator.clipboard.writeText(missionPackJson);
      toast.success("Mission Pack copié !");
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] bg-clip-text text-transparent">
            Video Factory 2026
          </h1>
          <p className="text-gray-400 text-lg">
            Génération automatique de vidéos avec FlowithOS Agentic Execution
          </p>
        </div>

        {/* Configuration */}
        <Card className="bg-gray-900/50 border-gray-800 p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-[#C8A45C]">Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              >
                <option value="vertical_9_16">Vertical 9:16 (Stories)</option>
                <option value="square_1_1">Carré 1:1 (Feed)</option>
                <option value="horizontal_16_9">Horizontal 16:9 (YouTube)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Durée (secondes)</label>
              <input
                type="number"
                min={15}
                max={60}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
              />
            </div>
          </div>
        </Card>

        {/* Candidates List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {candidates?.map((candidate) => (
            <Card key={candidate.id} className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-start gap-4 mb-4">
                {candidate.profilePhoto && (
                  <img
                    src={candidate.profilePhoto}
                    alt={`${candidate.firstName} ${candidate.lastName}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {candidate.firstName} {candidate.lastName}
                  </h3>
                  <p className="text-sm text-gray-400">{candidate.category}</p>
                </div>
              </div>
              <Button
                onClick={() => handleCreateMission(candidate.id)}
                disabled={createMission.isPending}
                className="w-full bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] hover:opacity-90"
              >
                {createMission.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Run in FlowithOS
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>

        {/* Jobs List */}
        {selectedCandidate && jobs && jobs.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-[#C8A45C]">Jobs</h2>
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="bg-gray-900/50 border-gray-800 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Job #{job.id}</h3>
                      <p className="text-sm text-gray-400">
                        {job.format} • {job.durationSeconds}s • {job.videoType}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyMissionPack(job.missionPackJson || "")}
                      className="border-gray-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Mission Pack
                    </Button>

                    {job.outputUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(job.outputUrl!, "_blank")}
                        className="border-gray-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Video
                      </Button>
                    )}
                  </div>

                  {job.logsJson && (
                    <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                        {job.logsJson}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
