import { useState } from "react";
import { Music, Plus, Edit, Trash2, Play, Users, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

interface Choreography {
  id: number;
  title: string;
  description: string;
  musicUrl?: string;
  duration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "draft" | "in_progress" | "completed";
  assignedTo: string[];
  rehearsalDate?: string;
  notes?: string;
}

export default function Choreographer() {
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedChoreography, setSelectedChoreography] = useState<Choreography | null>(null);

  // Mock data - à remplacer par trpc.choreographies.list.useQuery()
  const choreographies: Choreography[] = [
    {
      id: 1,
      title: "Ouverture Gala 2026",
      description: "Chorégraphie d'ouverture spectaculaire avec effets lumineux",
      musicUrl: "https://example.com/music1.mp3",
      duration: 180,
      difficulty: "advanced",
      status: "in_progress",
      assignedTo: ["Miss Candidates", "Mister Candidates"],
      rehearsalDate: "2026-03-15",
      notes: "Répétition prévue au Centre Sportif d'Elouges",
    },
    {
      id: 2,
      title: "Défilé Tenue de Soirée",
      description: "Défilé élégant avec musique classique",
      duration: 120,
      difficulty: "intermediate",
      status: "completed",
      assignedTo: ["All Candidates"],
      rehearsalDate: "2026-03-10",
    },
    {
      id: 3,
      title: "Performance Finale",
      description: "Grande finale avec tous les candidats",
      duration: 240,
      difficulty: "advanced",
      status: "draft",
      assignedTo: ["All Candidates"],
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Brouillon";
      case "in_progress":
        return "En cours";
      case "completed":
        return "Terminé";
      default:
        return status;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "Débutant";
      case "intermediate":
        return "Intermédiaire";
      case "advanced":
        return "Avancé";
      default:
        return difficulty;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FFF8E8] to-[#F5EFE0] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#D4AF37] to-[#F4E4C1] rounded-xl shadow-lg">
              <Music className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-playfair font-bold bg-gradient-to-r from-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent">
                Gestion des Chorégraphies
              </h1>
              <p className="text-[#8B7355] mt-1">Créez et gérez les chorégraphies du concours</p>
            </div>
          </div>

          {user?.role === "admin" && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8941E] hover:from-[#B8941E] hover:to-[#D4AF37] text-white shadow-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Nouvelle chorégraphie
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-playfair text-[#D4AF37]">
                    Créer une nouvelle chorégraphie
                  </DialogTitle>
                </DialogHeader>
                <CreateChoreographyForm
                  onSuccess={() => {
                    setIsCreateDialogOpen(false);
                    toast.success("Chorégraphie créée avec succès !");
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Choreographies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {choreographies.map((choreo) => (
            <div
              key={choreo.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-[#D4AF37]/20 hover:shadow-3xl transition-all duration-300 hover:scale-105"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-playfair font-bold text-[#D4AF37] mb-2">
                    {choreo.title}
                  </h3>
                  <p className="text-sm text-[#8B7355] line-clamp-2">{choreo.description}</p>
                </div>
                {user?.role === "admin" && (
                  <div className="flex gap-2 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[#D4AF37] hover:bg-[#D4AF37]/10"
                      onClick={() => setSelectedChoreography(choreo)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => toast.error("Fonctionnalité à implémenter")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-[#8B7355]">
                  <Clock className="w-4 h-4" />
                  <span>{Math.floor(choreo.duration / 60)} min {choreo.duration % 60} sec</span>
                </div>
                {choreo.rehearsalDate && (
                  <div className="flex items-center gap-2 text-sm text-[#8B7355]">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(choreo.rehearsalDate).toLocaleDateString("fr-FR")}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-[#8B7355]">
                  <Users className="w-4 h-4" />
                  <span>{choreo.assignedTo.join(", ")}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(choreo.status)}`}>
                  {getStatusLabel(choreo.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(choreo.difficulty)}`}>
                  {getDifficultyLabel(choreo.difficulty)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {choreo.musicUrl && (
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#B8941E] hover:from-[#B8941E] hover:to-[#D4AF37] text-white"
                    onClick={() => toast.info("Lecture de la musique...")}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Écouter
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  onClick={() => setSelectedChoreography(choreo)}
                >
                  Détails
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Details Dialog */}
        {selectedChoreography && (
          <Dialog open={!!selectedChoreography} onOpenChange={() => setSelectedChoreography(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-playfair text-[#D4AF37]">
                  {selectedChoreography.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-[#8B7355]">{selectedChoreography.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#8B7355]">Durée</Label>
                    <p className="font-semibold text-[#D4AF37]">
                      {Math.floor(selectedChoreography.duration / 60)} min {selectedChoreography.duration % 60} sec
                    </p>
                  </div>
                  <div>
                    <Label className="text-[#8B7355]">Difficulté</Label>
                    <p className="font-semibold text-[#D4AF37]">
                      {getDifficultyLabel(selectedChoreography.difficulty)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-[#8B7355]">Statut</Label>
                    <p className="font-semibold text-[#D4AF37]">
                      {getStatusLabel(selectedChoreography.status)}
                    </p>
                  </div>
                  {selectedChoreography.rehearsalDate && (
                    <div>
                      <Label className="text-[#8B7355]">Répétition</Label>
                      <p className="font-semibold text-[#D4AF37]">
                        {new Date(selectedChoreography.rehearsalDate).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  )}
                </div>
                {selectedChoreography.notes && (
                  <div>
                    <Label className="text-[#8B7355]">Notes</Label>
                    <p className="text-sm text-[#8B7355] mt-1">{selectedChoreography.notes}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

// Create Choreography Form Component
function CreateChoreographyForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    musicUrl: "",
    duration: 120,
    difficulty: "intermediate" as "beginner" | "intermediate" | "advanced",
    status: "draft" as "draft" | "in_progress" | "completed",
    assignedTo: "",
    rehearsalDate: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement trpc.choreographies.create.mutate()
    console.log("Creating choreography:", formData);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={3}
          className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Durée (secondes) *</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            required
            className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
          />
        </div>

        <div>
          <Label htmlFor="difficulty">Difficulté *</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}
          >
            <SelectTrigger className="border-[#D4AF37]/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Débutant</SelectItem>
              <SelectItem value="intermediate">Intermédiaire</SelectItem>
              <SelectItem value="advanced">Avancé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="musicUrl">URL de la musique</Label>
        <Input
          id="musicUrl"
          type="url"
          value={formData.musicUrl}
          onChange={(e) => setFormData({ ...formData, musicUrl: e.target.value })}
          placeholder="https://example.com/music.mp3"
          className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
        />
      </div>

      <div>
        <Label htmlFor="rehearsalDate">Date de répétition</Label>
        <Input
          id="rehearsalDate"
          type="date"
          value={formData.rehearsalDate}
          onChange={(e) => setFormData({ ...formData, rehearsalDate: e.target.value })}
          className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] hover:from-[#B8941E] hover:to-[#D4AF37] text-white"
      >
        Créer la chorégraphie
      </Button>
    </form>
  );
}
