import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Award, Star, User, MessageSquare, TrendingUp, Lightbulb } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function JuryEvaluation() {
  const { user } = useAuth();
  const [selectedContestId, setSelectedContestId] = useState<string>("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [phase, setPhase] = useState<"preliminary" | "semifinal" | "final">("preliminary");
  
  const [presentationScore, setPresentationScore] = useState([5]);
  const [talentScore, setTalentScore] = useState([5]);
  const [charismaScore, setCharismaScore] = useState([5]);
  const [communicationScore, setCommunicationScore] = useState([5]);
  const [overallScore, setOverallScore] = useState([5]);
  
  const [comments, setComments] = useState("");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");

  const { data: contests } = trpc.contests.list.useQuery();
  const { data: candidates } = trpc.candidates.search.useQuery({
    contestId: selectedContestId ? parseInt(selectedContestId) : 0,
  }, {
    enabled: !!selectedContestId,
  });

  const createEvaluationMutation = trpc.evaluations.create.useMutation({
    onSuccess: () => {
      toast.success("Évaluation enregistrée avec succès !");
      // Reset form
      setPresentationScore([5]);
      setTalentScore([5]);
      setCharismaScore([5]);
      setCommunicationScore([5]);
      setOverallScore([5]);
      setComments("");
      setStrengths("");
      setImprovements("");
      setSelectedCandidateId("");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'enregistrement de l'évaluation");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedContestId || !selectedCandidateId) {
      toast.error("Veuillez sélectionner un concours et un candidat");
      return;
    }

    createEvaluationMutation.mutate({
      candidateId: parseInt(selectedCandidateId),
      contestId: parseInt(selectedContestId),
      phase,
      presentationScore: presentationScore[0],
      talentScore: talentScore[0],
      charismaScore: charismaScore[0],
      communicationScore: communicationScore[0],
      overallScore: overallScore[0],
      comments: comments || undefined,
      strengths: strengths || undefined,
      improvements: improvements || undefined,
    });
  };

  const totalScore = presentationScore[0] + talentScore[0] + charismaScore[0] + communicationScore[0] + overallScore[0];
  const averageScore = (totalScore / 5).toFixed(1);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="mb-2 text-3xl font-bold">Évaluation des candidats</h1>
          <p className="text-muted-foreground">
            Notez les candidats selon les critères établis et ajoutez vos commentaires détaillés
          </p>
        </div>

        {/* Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Sélection du candidat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Concours</Label>
                <Select value={selectedContestId} onValueChange={setSelectedContestId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un concours" />
                  </SelectTrigger>
                  <SelectContent>
                    {contests?.map((contest) => (
                      <SelectItem key={contest.id} value={contest.id.toString()}>
                        {contest.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Phase</Label>
                <Select value={phase} onValueChange={(v) => setPhase(v as typeof phase)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preliminary">Préliminaire</SelectItem>
                    <SelectItem value="semifinal">Demi-finale</SelectItem>
                    <SelectItem value="final">Finale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Candidat</Label>
                <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId} disabled={!selectedContestId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un candidat" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates?.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id.toString()}>
                        {candidate.firstName} {candidate.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Form */}
        {selectedCandidateId && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Grille de notation
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Chaque critère est noté de 0 à 10 points
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Presentation */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Présentation</Label>
                    <span className="text-2xl font-bold text-primary">{presentationScore[0]}/10</span>
                  </div>
                  <Slider
                    value={presentationScore}
                    onValueChange={setPresentationScore}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Apparence, tenue, posture, élégance générale
                  </p>
                </div>

                {/* Talent */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Talent</Label>
                    <span className="text-2xl font-bold text-primary">{talentScore[0]}/10</span>
                  </div>
                  <Slider
                    value={talentScore}
                    onValueChange={setTalentScore}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Performance artistique, créativité, originalité
                  </p>
                </div>

                {/* Charisma */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Charisme</Label>
                    <span className="text-2xl font-bold text-primary">{charismaScore[0]}/10</span>
                  </div>
                  <Slider
                    value={charismaScore}
                    onValueChange={setCharismaScore}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Présence scénique, confiance, capacité à captiver
                  </p>
                </div>

                {/* Communication */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Communication</Label>
                    <span className="text-2xl font-bold text-primary">{communicationScore[0]}/10</span>
                  </div>
                  <Slider
                    value={communicationScore}
                    onValueChange={setCommunicationScore}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Éloquence, clarté d'expression, capacité à répondre
                  </p>
                </div>

                {/* Overall */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Impression générale</Label>
                    <span className="text-2xl font-bold text-primary">{overallScore[0]}/10</span>
                  </div>
                  <Slider
                    value={overallScore}
                    onValueChange={setOverallScore}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Évaluation globale, potentiel, adéquation au titre
                  </p>
                </div>

                {/* Total Score */}
                <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Score total</p>
                      <p className="text-xs text-muted-foreground">Moyenne des 5 critères</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-primary">{averageScore}</p>
                      <p className="text-sm text-muted-foreground">{totalScore}/50 points</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Commentaires détaillés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Commentaires généraux
                  </Label>
                  <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Vos observations générales sur la performance du candidat..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Points forts
                  </Label>
                  <Textarea
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="Les qualités remarquables du candidat..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Axes d'amélioration
                  </Label>
                  <Textarea
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="Les aspects à travailler pour progresser..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedCandidateId("");
                  setPresentationScore([5]);
                  setTalentScore([5]);
                  setCharismaScore([5]);
                  setCommunicationScore([5]);
                  setOverallScore([5]);
                  setComments("");
                  setStrengths("");
                  setImprovements("");
                }}
              >
                Réinitialiser
              </Button>
              <Button
                type="submit"
                disabled={createEvaluationMutation.isPending}
                className="gap-2"
              >
                <Award className="h-4 w-4" />
                {createEvaluationMutation.isPending ? "Enregistrement..." : "Enregistrer l'évaluation"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
