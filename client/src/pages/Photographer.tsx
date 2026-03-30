import { useState, useRef } from "react";
import { Camera, Upload, Trash2, Check, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { PageHeader, DataCard, StatusBadge, EmptyState, FilterBar, ViewToggle } from "@/components/shared";
import type { FilterConfig } from "@/components/shared";
import { useViewMode } from "@/hooks/useViewMode";
import { useDialog } from "@/hooks/useDialog";

interface Photo {
  id: number;
  url: string;
  thumbnail: string | null;
  title: string;
  description?: string | null;
  candidateId?: number | null;
  category: "portrait" | "event" | "backstage" | "performance" | "other";
  uploadedAt: Date;
  uploadedByName: string;
  tags: string[];
  status: "pending" | "approved" | "rejected";
}

export default function Photographer() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useViewMode({ storageKey: "photographer-view" });
  const uploadDialog = useDialog();
  
  const [categoryFilter, setCategoryFilter] = useState<"all" | "portrait" | "event" | "backstage" | "performance" | "other">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "portrait" as "portrait" | "event" | "backstage" | "performance" | "other",
    tags: "",
    files: [] as File[],
  });

  // Fetch photos with tRPC
  const { data: photos = [], isLoading, refetch } = trpc.photos.list.useQuery({
    category: categoryFilter,
    status: statusFilter,
  });

  // Mutations
  const uploadMutation = trpc.photos.upload.useMutation({
    onSuccess: () => {
      toast.success("Photos uploadées avec succès !");
      uploadDialog.close();
      setUploadForm({ title: "", description: "", category: "portrait", tags: "", files: [] });
      refetch();
    },
    onError: (error) => toast.error(`Erreur lors de l'upload : ${error.message}`),
  });

  const approveMutation = trpc.photos.approve.useMutation({
    onSuccess: () => {
      toast.success("Photo approuvée !");
      refetch();
    },
    onError: (error) => toast.error(`Erreur : ${error.message}`),
  });

  const rejectMutation = trpc.photos.reject.useMutation({
    onSuccess: () => {
      toast.success("Photo rejetée");
      refetch();
    },
    onError: (error) => toast.error(`Erreur : ${error.message}`),
  });

  const deleteMutation = trpc.photos.delete.useMutation({
    onSuccess: () => {
      toast.success("Photo supprimée");
      refetch();
    },
    onError: (error) => toast.error(`Erreur : ${error.message}`),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadForm((prev) => ({ ...prev, files }));
  };

  const handleUpload = async () => {
    if (uploadForm.files.length === 0) {
      toast.error("Veuillez sélectionner au moins une photo");
      return;
    }

    if (!uploadForm.title.trim()) {
      toast.error("Veuillez entrer un titre");
      return;
    }

    try {
      const filesData = await Promise.all(
        uploadForm.files.map(async (file) => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });

          return {
            base64,
            filename: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
          };
        })
      );

      await uploadMutation.mutateAsync({
        files: filesData,
        title: uploadForm.title,
        description: uploadForm.description || undefined,
        category: uploadForm.category,
        tags: uploadForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const getCategoryLabel = (category: Photo["category"]) => {
    const labels = {
      portrait: "Portrait",
      event: "Événement",
      backstage: "Coulisses",
      performance: "Performance",
      other: "Autre",
    };
    return labels[category];
  };

  const getStatusLabel = (status: Photo["status"]) => {
    const labels = {
      pending: "En attente",
      approved: "Approuvée",
      rejected: "Rejetée",
    };
    return labels[status];
  };

  // Filter configuration
  const filterConfigs: FilterConfig[] = [
    {
      label: "",
      value: categoryFilter,
      onChange: (value: any) => setCategoryFilter(value),
      placeholder: "Catégorie",
      options: [
        { label: "Toutes catégories", value: "all" },
        { label: "Portrait", value: "portrait" },
        { label: "Événement", value: "event" },
        { label: "Coulisses", value: "backstage" },
        { label: "Performance", value: "performance" },
        { label: "Autre", value: "other" },
      ],
    },
    {
      label: "",
      value: statusFilter,
      onChange: (value: any) => setStatusFilter(value),
      placeholder: "Statut",
      options: [
        { label: "Tous statuts", value: "all" },
        { label: "En attente", value: "pending" },
        { label: "Approuvée", value: "approved" },
        { label: "Rejetée", value: "rejected" },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FFF8E8] to-[#F5EFE0] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#D4AF37] border-t-transparent"></div>
            <p className="mt-4 text-[#8B7355]">Chargement des photos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FFF8E8] to-[#F5EFE0] py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <PageHeader
          title="Gestion Photos"
          description="Gérez toutes les photos du concours"
          variant="solid"
          action={
            <Dialog open={uploadDialog.isOpen} onOpenChange={uploadDialog.setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-white hover:opacity-90 transition-opacity shadow-lg">
                  <Upload className="w-4 h-4 mr-2" />
                  Uploader des Photos
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-[#D4AF37]/20">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-playfair text-[#8B7355]">Uploader des Photos</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="files" className="text-[#8B7355]">Photos *</Label>
                    <Input
                      id="files"
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
                    />
                    {uploadForm.files.length > 0 && (
                      <p className="text-sm text-[#8B7355]/70 mt-2">
                        {uploadForm.files.length} fichier(s) sélectionné(s)
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="title" className="text-[#8B7355]">Titre *</Label>
                    <Input
                      id="title"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Portrait Sophie Martin"
                      className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-[#8B7355]">Description</Label>
                    <Textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Description de la photo..."
                      rows={3}
                      className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-[#8B7355]">Catégorie *</Label>
                    <Select
                      value={uploadForm.category}
                      onValueChange={(value: any) => setUploadForm((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="border-[#D4AF37]/30 focus:border-[#D4AF37]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="event">Événement</SelectItem>
                        <SelectItem value="backstage">Coulisses</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tags" className="text-[#8B7355]">Tags (séparés par des virgules)</Label>
                    <Input
                      id="tags"
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm((prev) => ({ ...prev, tags: e.target.value }))}
                      placeholder="portrait, studio, professionnel"
                      className="border-[#D4AF37]/30 focus:border-[#D4AF37]"
                    />
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-white hover:opacity-90 transition-opacity"
                  >
                    {uploadMutation.isPending ? "Upload en cours..." : "Uploader"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <FilterBar filters={filterConfigs} />
          </div>
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </div>

        {/* Photos Grid/List */}
        {photos.length === 0 ? (
          <EmptyState
            icon={Camera}
            title="Aucune photo"
            description="Uploadez vos premières photos pour commencer"
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <DataCard key={photo.id}>
                <div className="relative h-64">
                  <img
                    src={photo.thumbnail || photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={getStatusLabel(photo.status)} variant={photo.status} />
                  </div>
                </div>

                <DataCard.Content>
                  <div>
                    <h3 className="font-playfair font-bold text-lg text-[#8B7355]">{photo.title}</h3>
                    <p className="text-sm text-[#8B7355]/70">{getCategoryLabel(photo.category)}</p>
                  </div>

                  {photo.description && (
                    <p className="text-sm text-[#8B7355]/80 line-clamp-2">{photo.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-[#8B7355]/60">
                    <Users className="w-3 h-3" />
                    {photo.uploadedByName}
                  </div>

                  {user?.role === "admin" && photo.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate({ id: photo.id })}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectMutation.mutate({ id: photo.id })}
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  )}

                  {user?.role === "admin" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate({ id: photo.id })}
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Supprimer
                    </Button>
                  )}
                </DataCard.Content>
              </DataCard>
            ))}
          </div>
        ) : (
          <DataCard hover={false}>
            <div className="divide-y divide-[#D4AF37]/10">
              {photos.map((photo) => (
                <div key={photo.id} className="p-6 hover:bg-[#FFF8E8]/50 transition-colors">
                  <div className="flex items-start gap-6">
                    <img
                      src={photo.thumbnail || photo.url}
                      alt={photo.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-playfair font-bold text-xl text-[#8B7355]">{photo.title}</h3>
                          <p className="text-sm text-[#8B7355]/70">{getCategoryLabel(photo.category)}</p>
                        </div>
                        <StatusBadge status={getStatusLabel(photo.status)} variant={photo.status} />
                      </div>

                      {photo.description && (
                        <p className="text-[#8B7355]/80">{photo.description}</p>
                      )}

                      <div className="flex items-center gap-2 text-sm text-[#8B7355]/60">
                        <Users className="w-4 h-4" />
                        {photo.uploadedByName}
                      </div>

                      {user?.role === "admin" && (
                        <div className="flex gap-2 pt-2">
                          {photo.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => approveMutation.mutate({ id: photo.id })}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approuver
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectMutation.mutate({ id: photo.id })}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Rejeter
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMutation.mutate({ id: photo.id })}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DataCard>
        )}
      </div>
    </div>
  );
}
