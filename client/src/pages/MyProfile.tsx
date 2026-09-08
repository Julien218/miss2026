import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Crown, Edit, Upload, Image as ImageIcon, Calendar, MapPin, Phone, Mail, User, Award, Star, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function MyProfile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    type: "photo" as const,
    url: "",
  });

  const { data: contests } = trpc.contests.list.useQuery();
  const activeContest = contests?.find(c => c.status !== 'completed');
  const { data: candidate, refetch: refetchCandidate } = trpc.candidates.getMine.useQuery(
    { contestId: activeContest?.id || 0 },
    { enabled: !!activeContest }
  );
  const { data: media, refetch: refetchMedia } = trpc.media.listByCandidate.useQuery(
    { candidateId: candidate?.id || 0 },
    { enabled: !!candidate }
  );
  const { data: evaluations } = trpc.evaluations.listByCandidate.useQuery(
    { candidateId: candidate?.id || 0 },
    { enabled: !!candidate }
  );

  const uploadMutation = trpc.media.upload.useMutation({
    onSuccess: () => {
      toast.success("Média ajouté avec succès");
      setIsUploadOpen(false);
      refetchMedia();
      setUploadData({ title: "", description: "", type: "photo", url: "" });
    },
    onError: (error) => {
      toast.error("Erreur : " + error.message);
    },
  });

  const deleteMutation = trpc.media.delete.useMutation({
    onSuccess: () => {
      toast.success("Média supprimé");
      refetchMedia();
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadData({ ...uploadData, url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (!candidate || !uploadData.url) return;
    
    // Extract base64 data and metadata from data URL
    const matches = uploadData.url.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      toast.error("Format de fichier invalide");
      return;
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    const extension = mimeType.split('/')[1];
    const fileName = `${uploadData.title || 'media'}.${extension}`;
    
    uploadMutation.mutate({
      candidateId: candidate.id,
      contestId: candidate.contestId,
      type: uploadData.type,
      fileData: base64Data,
      fileName: fileName,
      mimeType: mimeType,
      title: uploadData.title || undefined,
      description: uploadData.description || undefined,
      isPublic: true,
    });
  };

  if (!candidate) {
    return (
      <DashboardLayout>
        <div className="container py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Crown className="mb-4 h-16 w-16 text-muted-foreground/20" />
              <h3 className="mb-2 text-lg font-semibold">Aucune candidature</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Vous n'avez pas encore soumis de candidature
              </p>
              <Button onClick={() => setLocation("/candidate/register")}>
                <Plus className="mr-2 h-4 w-4" />
                S'inscrire au concours
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const calculateTotalScore = (evaluation: any) => {
    return (
      (evaluation.presentationScore || 0) +
      (evaluation.talentScore || 0) +
      (evaluation.charismaScore || 0) +
      (evaluation.styleScore || 0) +
      (evaluation.communicationScore || 0)
    ) / 5;
  };
  
  const averageScore = evaluations && evaluations.length > 0
    ? evaluations.reduce((sum, e) => sum + calculateTotalScore(e), 0) / evaluations.length
    : 0;

  return (
    <DashboardLayout>
      <div className="container py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-6 md:flex-row">
                {/* Profile Photo */}
                <div className="flex-shrink-0">
                  {candidate.profilePhoto ? (
                    <img
                      src={candidate.profilePhoto}
                      alt={`${candidate.firstName} ${candidate.lastName}`}
                      className="h-48 w-48 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-muted">
                      <User className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h1 className="mb-2 text-3xl font-bold">
                        {candidate.firstName} {candidate.lastName}
                      </h1>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {candidate.category === 'miss' ? 'Miss' :
                           candidate.category === 'mister' ? 'Mister' :
                           candidate.category === 'teen_miss' ? 'Teen Miss' :
                           'Teen Mister'}
                        </Badge>
                        <Badge
                          variant={
                            candidate.status === 'approved' ? 'default' :
                            candidate.status === 'rejected' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {candidate.status === 'pending' ? 'En attente' :
                           candidate.status === 'approved' ? 'Approuvé' :
                           candidate.status === 'rejected' ? 'Rejeté' :
                           'Finaliste'}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </Button>
                  </div>

                  <div className="grid gap-3 text-sm md:grid-cols-2">
                    {candidate.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{candidate.phone}</span>
                      </div>
                    )}
                    {user?.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    {candidate.city && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{candidate.city}, {candidate.country}</span>
                      </div>
                    )}
                    {candidate.dateOfBirth && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(candidate.dateOfBirth).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                  </div>

                  {candidate.bio && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {candidate.bio}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Score Moyen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">
                  {averageScore.toFixed(1)}/10
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Évaluations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{evaluations?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">
                  {media?.filter(m => m.type === 'photo').length || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taille
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {candidate.height ? `${candidate.height} cm` : '-'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="portfolio" className="space-y-4">
          <TabsList>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
          </TabsList>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mon Portfolio</h2>
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un média
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un média</DialogTitle>
                    <DialogDescription>
                      Ajoutez une photo ou une vidéo à votre portfolio
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="mediaTitle">Titre</Label>
                      <Input
                        id="mediaTitle"
                        value={uploadData.title}
                        onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="mediaDescription">Description</Label>
                      <Input
                        id="mediaDescription"
                        value={uploadData.description}
                        onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="mediaFile">Fichier</Label>
                      <Input
                        id="mediaFile"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleUpload} disabled={!uploadData.url || uploadMutation.isPending}>
                      {uploadMutation.isPending ? "Upload..." : "Ajouter"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {media && media.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {media.map((item) => (
                  <Card key={item.id} className="group overflow-hidden">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={item.thumbnail || item.url}
                        alt={item.title || 'Media'}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => {
                          if (confirm("Supprimer ce média ?")) {
                            deleteMutation.mutate({ id: item.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {item.title && (
                      <CardContent className="p-3">
                        <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <ImageIcon className="mb-4 h-16 w-16 text-muted-foreground/20" />
                  <h3 className="mb-2 text-lg font-semibold">Aucun média</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Commencez à construire votre portfolio
                  </p>
                  <Button onClick={() => setIsUploadOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un média
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Taille</Label>
                    <p className="text-lg">{candidate.height ? `${candidate.height} cm` : '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Poids</Label>
                    <p className="text-lg">{candidate.weight ? `${candidate.weight} kg` : '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Mensurations</Label>
                    <p className="text-lg">{candidate.measurements || '-'}</p>
                  </div>
                </div>

                {candidate.experience && (
                  <div>
                    <Label className="text-muted-foreground">Expérience</Label>
                    <p className="mt-1 text-sm">{candidate.experience}</p>
                  </div>
                )}

                {candidate.motivation && (
                  <div>
                    <Label className="text-muted-foreground">Motivation</Label>
                    <p className="mt-1 text-sm">{candidate.motivation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evaluations Tab */}
          <TabsContent value="evaluations" className="space-y-4">
            {evaluations && evaluations.length > 0 ? (
              <div className="space-y-4">
                {evaluations.map((evaluation) => (
                  <Card key={evaluation.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Évaluation</CardTitle>
                        <Badge variant="secondary">
                          <Star className="mr-1 h-3 w-3" />
                          {calculateTotalScore(evaluation).toFixed(1)}/10
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {evaluation.comments && (
                        <p className="text-sm text-muted-foreground">{evaluation.comments}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Award className="mb-4 h-16 w-16 text-muted-foreground/20" />
                  <h3 className="mb-2 text-lg font-semibold">Aucune évaluation</h3>
                  <p className="text-sm text-muted-foreground">
                    Vous n'avez pas encore été évalué
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
