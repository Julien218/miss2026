import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Crown, Plus, Edit, Trash2, Calendar, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Contests() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    year: new Date().getFullYear(),
    description: "",
    status: "draft" as const,
    location: "",
    rules: "",
    prizes: "",
  });

  const { data: contests, refetch } = trpc.contests.list.useQuery();
  const createMutation = trpc.contests.create.useMutation({
    onSuccess: () => {
      toast.success("Concours créé avec succès");
      setIsCreateOpen(false);
      refetch();
      setFormData({
        title: "",
        year: new Date().getFullYear(),
        description: "",
        status: "draft",
        location: "",
        rules: "",
        prizes: "",
      });
    },
    onError: (error) => {
      toast.error("Erreur lors de la création: " + error.message);
    },
  });

  const deleteMutation = trpc.contests.delete.useMutation({
    onSuccess: () => {
      toast.success("Concours supprimé");
      refetch();
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="container py-8">
          <p>Accès réservé aux administrateurs</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Gestion des Concours</h1>
            <p className="text-muted-foreground">
              Créez et gérez les éditions du concours Miss & Mister Dour
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Concours
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un Nouveau Concours</DialogTitle>
                <DialogDescription>
                  Remplissez les informations pour créer une nouvelle édition
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Miss & Mister Dour 2026"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="year">Année *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="registration">Inscriptions ouvertes</SelectItem>
                        <SelectItem value="selection">Sélection</SelectItem>
                        <SelectItem value="ongoing">En cours</SelectItem>
                        <SelectItem value="completed">Terminé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Dour, Belgique"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du concours..."
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="rules">Règlement</Label>
                  <Textarea
                    id="rules"
                    value={formData.rules}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                    placeholder="Règles du concours..."
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="prizes">Prix et Récompenses</Label>
                  <Textarea
                    id="prizes"
                    value={formData.prizes}
                    onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
                    placeholder="Liste des prix..."
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreate} disabled={!formData.title || createMutation.isPending}>
                  {createMutation.isPending ? "Création..." : "Créer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {contests && contests.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contests.map((contest) => (
              <Card key={contest.id} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex items-start justify-between">
                    <Crown className="h-8 w-8 text-primary" />
                    <div className={`rounded-full px-3 py-1 text-xs font-medium ${
                      contest.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                      contest.status === 'registration' ? 'bg-blue-100 text-blue-700' :
                      contest.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {contest.status === 'draft' ? 'Brouillon' :
                       contest.status === 'registration' ? 'Inscriptions' :
                       contest.status === 'selection' ? 'Sélection' :
                       contest.status === 'ongoing' ? 'En cours' :
                       'Terminé'}
                    </div>
                  </div>
                  <CardTitle>{contest.title}</CardTitle>
                  <CardDescription>Année {contest.year}</CardDescription>
                </CardHeader>
                <CardContent>
                  {contest.description && (
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                      {contest.description}
                    </p>
                  )}
                  
                  {contest.location && (
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{contest.location}</span>
                    </div>
                  )}
                  
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setLocation(`/contests/${contest.id}`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Gérer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Êtes-vous sûr de vouloir supprimer ce concours ?")) {
                          deleteMutation.mutate({ id: contest.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Crown className="mb-4 h-16 w-16 text-muted-foreground/20" />
              <h3 className="mb-2 text-lg font-semibold">Aucun concours</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Commencez par créer votre premier concours
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un Concours
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
