import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Eye, UserCheck, UserX, Mail, Phone, MapPin, Calendar } from "lucide-react";
// Toast hook not available - using alert for now

type ApplicationStatus = "pending" | "approved" | "rejected";

export default function CandidateOnboarding() {
  const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
    if (variant === "destructive") {
      alert(`❌ ${title}\n${description}`);
    } else {
      alert(`✅ ${title}\n${description}`);
    }
  };
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | "all">("pending");
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Récupérer les candidatures
  const { data: applications, isLoading, refetch } = trpc.candidateOnboarding.listApplications.useQuery({
    status: selectedStatus === "all" ? undefined : selectedStatus,
  });

  // Mutations
  const approveMutation = trpc.candidateOnboarding.approveApplication.useMutation({
    onSuccess: () => {
      toast({
        title: "Candidature approuvée",
        description: "Le profil candidat a été créé avec succès",
      });
      refetch();
      setIsViewDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = trpc.candidateOnboarding.rejectApplication.useMutation({
    onSuccess: () => {
      toast({
        title: "Candidature rejetée",
        description: "Le candidat sera notifié par email",
      });
      refetch();
      setIsRejectDialogOpen(false);
      setRejectionReason("");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (applicationId: number) => {
    if (confirm("Êtes-vous sûr de vouloir approuver cette candidature ? Un profil candidat sera créé.")) {
      approveMutation.mutate({ applicationId });
    }
  };

  const handleReject = () => {
    if (!selectedApplication) return;
    if (rejectionReason.length < 10) {
      toast({
        title: "Erreur",
        description: "La raison du rejet doit contenir au moins 10 caractères",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({
      applicationId: selectedApplication.id,
      reason: rejectionReason,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-600">En attente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-600">Approuvée</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-600">Rejetée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredApplications = applications || [];
  const pendingCount = applications?.filter(app => app.status === "pending").length || 0;
  const approvedCount = applications?.filter(app => app.status === "approved").length || 0;
  const rejectedCount = applications?.filter(app => app.status === "rejected").length || 0;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gold-500 mb-2">Gestion des Candidatures</h1>
        <p className="text-muted-foreground">
          Réviser et approuver les candidatures soumises via onboarding
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approuvées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejetées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs par statut */}
      <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ApplicationStatus | "all")}>
        <TabsList>
          <TabsTrigger value="all">Toutes ({filteredApplications.length})</TabsTrigger>
          <TabsTrigger value="pending">En attente ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved">Approuvées ({approvedCount})</TabsTrigger>
          <TabsTrigger value="rejected">Rejetées ({rejectedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Aucune candidature trouvée</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredApplications.map((application: any) => (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">
                          {application.firstName} {application.lastName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {application.email}
                          </span>
                          {application.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {application.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {application.city}, {application.region}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(application.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </CardDescription>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Photo de profil */}
                      {application.profilePhoto && (
                        <div>
                          <img 
                            src={application.profilePhoto} 
                            alt={`${application.firstName} ${application.lastName}`}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* Bio */}
                      {application.bio && (
                        <div>
                          <h4 className="font-semibold mb-1">Bio</h4>
                          <p className="text-sm text-muted-foreground line-clamp-3">{application.bio}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </Button>

                        {application.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleApprove(application.id)}
                              disabled={approveMutation.isPending}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Approuver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedApplication(application);
                                setIsRejectDialogOpen(true);
                              }}
                              disabled={rejectMutation.isPending}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Rejeter
                            </Button>
                          </>
                        )}

                        {application.status === "approved" && application.candidateId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/candidate/${application.candidateId}`, '_blank')}
                          >
                            Voir profil public
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Voir détails */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedApplication?.firstName} {selectedApplication?.lastName}
            </DialogTitle>
            <DialogDescription>
              Candidature soumise le {selectedApplication && new Date(selectedApplication.createdAt).toLocaleDateString('fr-FR')}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Photo */}
              {selectedApplication.profilePhoto && (
                <div>
                  <img 
                    src={selectedApplication.profilePhoto} 
                    alt={`${selectedApplication.firstName} ${selectedApplication.lastName}`}
                    className="w-full max-w-md mx-auto rounded-lg"
                  />
                </div>
              )}

              {/* Informations personnelles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p>{selectedApplication.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Téléphone</Label>
                  <p>{selectedApplication.phone || "Non renseigné"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ville</Label>
                  <p>{selectedApplication.city}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Région</Label>
                  <p className="capitalize">{selectedApplication.region}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Catégorie</Label>
                  <p className="capitalize">{selectedApplication.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Statut</Label>
                  <div>{getStatusBadge(selectedApplication.status)}</div>
                </div>
              </div>

              {/* Bio */}
              {selectedApplication.bio && (
                <div>
                  <Label className="text-muted-foreground">Bio</Label>
                  <p className="mt-1">{selectedApplication.bio}</p>
                </div>
              )}

              {/* Motivation */}
              {selectedApplication.motivation && (
                <div>
                  <Label className="text-muted-foreground">Motivation</Label>
                  <p className="mt-1">{selectedApplication.motivation}</p>
                </div>
              )}

              {/* Réseaux sociaux */}
              {(selectedApplication.instagram || selectedApplication.facebook || selectedApplication.tiktok || selectedApplication.linkedin) && (
                <div>
                  <Label className="text-muted-foreground">Réseaux sociaux</Label>
                  <div className="mt-1 space-y-1">
                    {selectedApplication.instagram && <p>Instagram: {selectedApplication.instagram}</p>}
                    {selectedApplication.facebook && <p>Facebook: {selectedApplication.facebook}</p>}
                    {selectedApplication.tiktok && <p>TikTok: {selectedApplication.tiktok}</p>}
                    {selectedApplication.linkedin && <p>LinkedIn: {selectedApplication.linkedin}</p>}
                  </div>
                </div>
              )}

              {/* Raison de rejet */}
              {selectedApplication.status === "rejected" && selectedApplication.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <Label className="text-red-900">Raison du rejet</Label>
                  <p className="mt-1 text-red-800">{selectedApplication.rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedApplication?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsRejectDialogOpen(true);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
                <Button
                  onClick={() => handleApprove(selectedApplication.id)}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approuver
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rejeter */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la candidature</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet. Le candidat sera notifié par email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Raison du rejet *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Expliquez pourquoi cette candidature est rejetée..."
                rows={4}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Minimum 10 caractères
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectionReason("");
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending || rejectionReason.length < 10}
            >
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
