/**
 * AdminValidation.tsx — Page de validation admin
 * Workflow : profils candidats (pending → approved/rejected) + photos photographes
 *
 * Créé par JS-Innov.IA — Pagin Julien, Dour, Belgique
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle, XCircle, Clock, Eye, User, Camera,
  RotateCcw, ChevronDown, ChevronUp, AlertTriangle,
  Shield, FileText, ImageIcon, Users, Loader2
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProfileStatus = "pending" | "approved" | "rejected" | "all";
type PhotoStatus = "pending" | "approved" | "rejected" | "all";

// ─── Composant badge statut ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending:  { label: "En attente", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    approved: { label: "Approuvé",   className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    rejected: { label: "Rejeté",     className: "bg-red-500/20 text-red-400 border-red-500/30" },
  };
  const s = map[status] ?? { label: status, className: "bg-gray-500/20 text-gray-400" };
  return (
    <Badge variant="outline" className={`text-xs font-medium ${s.className}`}>
      {s.label}
    </Badge>
  );
}

// ─── Onglet Profils ───────────────────────────────────────────────────────────
function ProfilesTab() {
  const [statusFilter, setStatusFilter] = useState<ProfileStatus>("pending");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; candidateId: number; name: string }>({ open: false, candidateId: 0, name: "" });
  const [rejectNote, setRejectNote] = useState("");

  const utils = trpc.useUtils();

  const { data, isLoading, refetch } = trpc.validation.getPendingProfiles.useQuery({
    status: statusFilter,
    limit: 50,
  });

  const approveMutation = trpc.validation.approveProfile.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      utils.validation.getPendingProfiles.invalidate();
      utils.validation.getValidationStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectMutation = trpc.validation.rejectProfile.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setRejectDialog({ open: false, candidateId: 0, name: "" });
      setRejectNote("");
      utils.validation.getPendingProfiles.invalidate();
      utils.validation.getValidationStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const resetMutation = trpc.validation.resetProfileStatus.useMutation({
    onSuccess: () => {
      toast.success("Statut remis en attente");
      utils.validation.getPendingProfiles.invalidate();
      utils.validation.getValidationStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const profiles = data?.profiles ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {(["pending", "approved", "rejected", "all"] as ProfileStatus[]).map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className={statusFilter === s ? "bg-gold-500 text-black hover:bg-gold-600" : "border-white/10"}
          >
            {s === "pending" ? "En attente" : s === "approved" ? "Approuvés" : s === "rejected" ? "Rejetés" : "Tous"}
          </Button>
        ))}
        <span className="ml-auto text-sm text-gray-400 self-center">{total} résultat(s)</span>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500/50" />
          <p className="text-lg font-medium">Aucun profil {statusFilter === "pending" ? "en attente" : ""}</p>
          <p className="text-sm mt-1">Tout est à jour !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => {
            const isExpanded = expandedId === profile.id;
            const fullName = `${profile.firstName} ${profile.lastName}`;
            const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();

            return (
              <Card key={profile.id} className="bg-white/5 border-white/10 hover:border-gold-500/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="w-14 h-14 border-2 border-gold-500/30 shrink-0">
                      <AvatarImage src={profile.profilePhoto ?? undefined} alt={fullName} />
                      <AvatarFallback className="bg-gold-500/20 text-gold-400 font-bold text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">{fullName}</h3>
                        <StatusBadge status={profile.status} />
                        <Badge variant="outline" className="text-xs border-white/10 text-gray-400">
                          {profile.category === "miss" ? "Miss" : "Mister"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {profile.city ?? "Ville non renseignée"}
                        {profile.dateOfBirth && ` · ${new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()} ans`}
                      </p>
                      {profile.profileSubmittedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Soumis le {new Date(profile.profileSubmittedAt).toLocaleDateString("fr-BE", {
                            day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      )}
                      {/* Consentements */}
                      <div className="flex gap-3 mt-2">
                        <span className={`text-xs flex items-center gap-1 ${profile.acceptCGU ? "text-emerald-400" : "text-red-400"}`}>
                          <Shield className="w-3 h-3" /> CGU
                        </span>
                        <span className={`text-xs flex items-center gap-1 ${profile.acceptRules ? "text-emerald-400" : "text-red-400"}`}>
                          <FileText className="w-3 h-3" /> Règlement
                        </span>
                        <span className={`text-xs flex items-center gap-1 ${profile.acceptMedia ? "text-emerald-400" : "text-amber-400"}`}>
                          <Camera className="w-3 h-3" /> Médias
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      {profile.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            onClick={() => approveMutation.mutate({ candidateId: profile.id })}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4" /> Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10 gap-1"
                            onClick={() => setRejectDialog({ open: true, candidateId: profile.id, name: fullName })}
                          >
                            <XCircle className="w-4 h-4" /> Rejeter
                          </Button>
                        </>
                      )}
                      {(profile.status === "approved" || profile.status === "rejected") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/10 text-gray-400 hover:bg-white/5 gap-1"
                          onClick={() => resetMutation.mutate({ candidateId: profile.id })}
                          disabled={resetMutation.isPending}
                        >
                          <RotateCcw className="w-3 h-3" /> Annuler
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 gap-1"
                        onClick={() => setExpandedId(isExpanded ? null : profile.id)}
                      >
                        <Eye className="w-3 h-3" />
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>

                  {/* Détails expandus */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      {profile.bio && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bio</p>
                          <p className="text-sm text-gray-300 leading-relaxed">{profile.bio}</p>
                        </div>
                      )}
                      {profile.profileReviewNote && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                          <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">Note de révision</p>
                          <p className="text-sm text-amber-300">{profile.profileReviewNote}</p>
                        </div>
                      )}
                      {profile.validatedAt && (
                        <p className="text-xs text-gray-500">
                          Décision le {new Date(profile.validatedAt).toLocaleDateString("fr-BE", {
                            day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog rejet */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open: false, candidateId: 0, name: "" })}>
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <XCircle className="w-5 h-5" /> Rejeter le profil
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-gray-300">
              Vous êtes sur le point de rejeter le profil de <strong className="text-white">{rejectDialog.name}</strong>.
            </p>
            <div>
              <Label className="text-gray-400 mb-2 block">Raison du rejet <span className="text-red-400">*</span></Label>
              <Textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Ex : Photo de profil manquante, bio incomplète, informations incorrectes..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[100px]"
              />
              <p className="text-xs text-gray-500 mt-1">{rejectNote.length}/1000 caractères (minimum 5)</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ open: false, candidateId: 0, name: "" })}
              className="border-white/10"
            >
              Annuler
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => rejectMutation.mutate({ candidateId: rejectDialog.candidateId, note: rejectNote })}
              disabled={rejectNote.length < 5 || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Onglet Photos ────────────────────────────────────────────────────────────
function PhotosTab() {
  const [statusFilter, setStatusFilter] = useState<PhotoStatus>("pending");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; photoId: number; title: string }>({ open: false, photoId: 0, title: "" });
  const [rejectReason, setRejectReason] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.validation.getPendingPhotos.useQuery({
    status: statusFilter,
    limit: 50,
  });

  const approveMutation = trpc.validation.approvePhoto.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      utils.validation.getPendingPhotos.invalidate();
      utils.validation.getValidationStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectMutation = trpc.validation.rejectPhoto.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setRejectDialog({ open: false, photoId: 0, title: "" });
      setRejectReason("");
      utils.validation.getPendingPhotos.invalidate();
      utils.validation.getValidationStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const bulkApproveMutation = trpc.validation.bulkApprovePhotos.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setSelectedIds(new Set());
      utils.validation.getPendingPhotos.invalidate();
      utils.validation.getValidationStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const photoList = data?.photos ?? [];
  const total = data?.total ?? 0;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Filtres + actions en masse */}
      <div className="flex gap-2 flex-wrap items-center">
        {(["pending", "approved", "rejected", "all"] as PhotoStatus[]).map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className={statusFilter === s ? "bg-gold-500 text-black hover:bg-gold-600" : "border-white/10"}
          >
            {s === "pending" ? "En attente" : s === "approved" ? "Approuvées" : s === "rejected" ? "Rejetées" : "Toutes"}
          </Button>
        ))}
        {selectedIds.size > 0 && (
          <Button
            size="sm"
            className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
            onClick={() => bulkApproveMutation.mutate({ photoIds: Array.from(selectedIds) })}
            disabled={bulkApproveMutation.isPending}
          >
            {bulkApproveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Approuver {selectedIds.size} sélectionnée(s)
          </Button>
        )}
        <span className={`${selectedIds.size > 0 ? "" : "ml-auto"} text-sm text-gray-400 self-center`}>{total} photo(s)</span>
      </div>

      {/* Grille photos */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
        </div>
      ) : photoList.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-emerald-500/50" />
          <p className="text-lg font-medium">Aucune photo {statusFilter === "pending" ? "en attente" : ""}</p>
          <p className="text-sm mt-1">Tout est à jour !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photoList.map((photo) => {
            const isSelected = selectedIds.has(photo.id);
            const candidateName = photo.candidateFirstName
              ? `${photo.candidateFirstName} ${photo.candidateLastName}`
              : "Non lié";

            return (
              <Card
                key={photo.id}
                className={`bg-white/5 border transition-all cursor-pointer ${
                  isSelected ? "border-gold-500 ring-1 ring-gold-500/50" : "border-white/10 hover:border-gold-500/30"
                }`}
                onClick={() => statusFilter === "pending" && toggleSelect(photo.id)}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={photo.thumbnail ?? photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-photo.jpg"; }}
                  />
                  {/* Overlay statut */}
                  <div className="absolute top-2 left-2">
                    <StatusBadge status={photo.status} />
                  </div>
                  {/* Checkbox sélection */}
                  {statusFilter === "pending" && (
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? "bg-gold-500 border-gold-500" : "bg-black/50 border-white/50"
                    }`}>
                      {isSelected && <CheckCircle className="w-4 h-4 text-black" />}
                    </div>
                  )}
                  {/* Bouton preview */}
                  <button
                    className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 transition-all"
                    onClick={(e) => { e.stopPropagation(); setPreviewUrl(photo.url); }}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Infos */}
                <CardContent className="p-3 space-y-2">
                  <div>
                    <p className="font-medium text-white text-sm truncate">{photo.title}</p>
                    <p className="text-xs text-gray-400 truncate">
                      Candidat : <span className="text-gray-300">{candidateName}</span>
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Par : {photo.uploaderName ?? photo.uploaderEmail ?? "Inconnu"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(photo.createdAt).toLocaleDateString("fr-BE")}
                      {photo.sizeBytes && ` · ${(photo.sizeBytes / 1024 / 1024).toFixed(1)} Mo`}
                    </p>
                  </div>

                  {/* Actions */}
                  {photo.status === "pending" && (
                    <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                        onClick={() => approveMutation.mutate({ photoId: photo.id })}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="w-3 h-3" /> OK
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs gap-1"
                        onClick={() => setRejectDialog({ open: true, photoId: photo.id, title: photo.title })}
                      >
                        <XCircle className="w-3 h-3" /> Refuser
                      </Button>
                    </div>
                  )}
                  {photo.approvedAt && (
                    <p className="text-xs text-gray-500">
                      Décision : {new Date(photo.approvedAt).toLocaleDateString("fr-BE")}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog rejet photo */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open: false, photoId: 0, title: "" })}>
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <XCircle className="w-5 h-5" /> Refuser la photo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-gray-300">
              Refuser : <strong className="text-white">"{rejectDialog.title}"</strong>
            </p>
            <div>
              <Label className="text-gray-400 mb-2 block">Raison <span className="text-red-400">*</span></Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex : Photo floue, mauvaise qualité, contenu inapproprié..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, photoId: 0, title: "" })} className="border-white/10">
              Annuler
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => rejectMutation.mutate({ photoId: rejectDialog.photoId, reason: rejectReason })}
              disabled={rejectReason.length < 3 || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal preview image */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <img
            src={previewUrl}
            alt="Aperçu"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80"
            onClick={() => setPreviewUrl(null)}
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AdminValidation() {
  const { data: stats } = trpc.validation.getValidationStats.useQuery(undefined, {
    refetchInterval: 30000,
  });

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-gold-500" />
            Centre de Validation
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Approuvez ou rejetez les profils candidats et les photos uploadées par les photographes.
          </p>
        </div>
        {/* Alerte si en attente */}
        {((stats?.profiles.pending ?? 0) + (stats?.photos.pending ?? 0)) > 0 && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium">
              {(stats?.profiles.pending ?? 0) + (stats?.photos.pending ?? 0)} élément(s) en attente de validation
            </span>
          </div>
        )}
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Profils en attente", value: stats?.profiles.pending ?? 0, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Profils approuvés", value: stats?.profiles.approved ?? 0, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Photos en attente", value: stats?.photos.pending ?? 0, icon: Camera, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Photos approuvées", value: stats?.photos.approved ?? 0, icon: ImageIcon, color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-white/5 border-white/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Onglets */}
      <Tabs defaultValue="profiles" className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="profiles" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black gap-2">
            <Users className="w-4 h-4" />
            Profils candidats
            {(stats?.profiles.pending ?? 0) > 0 && (
              <Badge className="bg-amber-500 text-black text-xs ml-1">{stats?.profiles.pending}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="photos" className="data-[state=active]:bg-gold-500 data-[state=active]:text-black gap-2">
            <Camera className="w-4 h-4" />
            Photos
            {(stats?.photos.pending ?? 0) > 0 && (
              <Badge className="bg-amber-500 text-black text-xs ml-1">{stats?.photos.pending}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <ProfilesTab />
        </TabsContent>

        <TabsContent value="photos">
          <PhotosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
