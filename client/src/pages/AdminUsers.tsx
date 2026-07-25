import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import { Shield, UserCog, Check, X } from "lucide-react";

// 14 permissions définies
const ALL_PERMISSIONS = [
  { id: "can_manage_users", label: "Gérer utilisateurs", category: "Admin" },
  { id: "can_manage_invitations", label: "Gérer invitations", category: "Admin" },
  { id: "can_view_candidates", label: "Voir candidats", category: "Candidats" },
  { id: "can_create_candidates", label: "Créer candidats", category: "Candidats" },
  { id: "can_edit_candidates", label: "Modifier candidats", category: "Candidats" },
  { id: "can_upload_media", label: "Upload médias", category: "Médias" },
  { id: "can_view_media", label: "Voir médias", category: "Médias" },
  { id: "can_delete_media", label: "Supprimer médias", category: "Médias" },
  { id: "can_generate_video", label: "Générer vidéos IA", category: "IA" },
  { id: "can_generate_voice", label: "Générer voix IA", category: "IA" },
  { id: "can_view_jury_area", label: "Accès espace jury", category: "Jury" },
  { id: "can_submit_scores", label: "Soumettre scores", category: "Jury" },
  { id: "can_publish_content", label: "Publier contenu", category: "Publication" },
  { id: "can_view_audit_logs", label: "Voir logs audit", category: "Admin" },
];

export default function AdminUsers() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [permissionsToAdd, setPermissionsToAdd] = useState<string[]>([]);
  const [permissionsToRemove, setPermissionsToRemove] = useState<string[]>([]);

  // Fetch all users (admin only - route à créer)
  const { data: users, isLoading, refetch } = trpc.admin.getAllUsers.useQuery();
  
  // Fetch effective permissions for selected user
  const { data: userPermissions } = trpc.permissions.getEffective.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId }
  );

  const updatePermissionsMutation = trpc.permissions.updateUserOverrides.useMutation({
    onSuccess: () => {
      toast.success("Permissions mises à jour avec succès");
      refetch();
      setSelectedUserId(null);
      setPermissionsToAdd([]);
      setPermissionsToRemove([]);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleSavePermissions = () => {
    if (!selectedUserId) return;

    updatePermissionsMutation.mutate({
      userId: selectedUserId,
      overrides: {
        add: permissionsToAdd.length > 0 ? permissionsToAdd : undefined,
        remove: permissionsToRemove.length > 0 ? permissionsToRemove : undefined,
      },
    });
  };

  const togglePermissionAdd = (permissionId: string) => {
    setPermissionsToAdd((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
    // Si on ajoute, retirer de "remove"
    setPermissionsToRemove((prev) => prev.filter((p) => p !== permissionId));
  };

  const togglePermissionRemove = (permissionId: string) => {
    setPermissionsToRemove((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
    // Si on retire, retirer de "add"
    setPermissionsToAdd((prev) => prev.filter((p) => p !== permissionId));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <UserCog className="w-8 h-8 text-yellow-500" />
        <h1 className="text-3xl font-bold text-white">Gestion Utilisateurs & Permissions</h1>
      </div>

      <div className="grid gap-4">
        {users?.map((user: any) => (
          <Card key={user.id} className="bg-white/5 border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{user.name || "Sans nom"}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    {user.role}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{user.email || "Email non renseigné"}</p>
                <p className="text-xs text-gray-500 mt-1">ID: {user.id} | OpenID: {user.openId}</p>
              </div>

              <Button
                onClick={() => {
                  setSelectedUserId(user.id);
                  // Reset overrides
                  setPermissionsToAdd([]);
                  setPermissionsToRemove([]);
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
              >
                <Shield className="w-4 h-4 mr-2" />
                Permissions
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Permissions */}
      <Dialog open={!!selectedUserId} onOpenChange={() => setSelectedUserId(null)}>
        <DialogContent className="max-w-3xl bg-gray-900 border-white/20 text-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-yellow-500">
              Modifier Permissions
            </DialogTitle>
          </DialogHeader>

          {userPermissions && (
            <div className="space-y-6">
              {/* Rôle actuel */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Rôle actuel</h3>
                <p className="text-lg font-semibold text-yellow-400">{userPermissions.role}</p>
              </div>

              {/* Permissions par défaut du rôle */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-sm font-medium text-gray-400 mb-3">
                  Permissions par défaut du rôle ({userPermissions.permissions.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userPermissions.permissions.map((perm: string) => (
                    <span
                      key={perm}
                      className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30"
                    >
                      <Check className="w-3 h-3 inline mr-1" />
                      {ALL_PERMISSIONS.find((p) => p.id === perm)?.label || perm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Overrides actuels */}
              {userPermissions.overrides && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Overrides actuels</h3>
                  <div className="space-y-2">
                    {userPermissions.overrides.add && userPermissions.overrides.add.length > 0 && (
                      <div>
                        <p className="text-xs text-green-400 mb-1">Ajoutées:</p>
                        <div className="flex flex-wrap gap-2">
                          {userPermissions.overrides.add.map((perm: string) => (
                            <span
                              key={perm}
                              className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400"
                            >
                              +{ALL_PERMISSIONS.find((p) => p.id === perm)?.label || perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {userPermissions.overrides.remove && userPermissions.overrides.remove.length > 0 && (
                      <div>
                        <p className="text-xs text-red-400 mb-1">Retirées:</p>
                        <div className="flex flex-wrap gap-2">
                          {userPermissions.overrides.remove.map((perm: string) => (
                            <span
                              key={perm}
                              className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400"
                            >
                              -{ALL_PERMISSIONS.find((p) => p.id === perm)?.label || perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modifier overrides */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Modifier les overrides</h3>
                
                {/* Group by category */}
                {["Admin", "Candidats", "Médias", "IA", "Jury", "Publication"].map((category) => {
                  const categoryPerms = ALL_PERMISSIONS.filter((p) => p.category === category);
                  if (categoryPerms.length === 0) return null;

                  return (
                    <div key={category} className="mb-4">
                      <h4 className="text-xs font-semibold text-yellow-500 mb-2">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {categoryPerms.map((perm) => {
                          const hasDefault = (userPermissions.permissions as string[]).includes(perm.id);
                          const isAdded = permissionsToAdd.includes(perm.id);
                          const isRemoved = permissionsToRemove.includes(perm.id);

                          return (
                            <div
                              key={perm.id}
                              className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/10"
                            >
                              <span className="text-sm text-gray-300">{perm.label}</span>
                              <div className="flex gap-2">
                                {/* Checkbox Ajouter (si pas dans permissions par défaut) */}
                                {!hasDefault && (
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <Checkbox
                                      checked={isAdded}
                                      onCheckedChange={() => togglePermissionAdd(perm.id)}
                                      className="border-green-500"
                                    />
                                    <span className="text-xs text-green-400">+</span>
                                  </label>
                                )}
                                
                                {/* Checkbox Retirer (si dans permissions par défaut) */}
                                {hasDefault && (
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <Checkbox
                                      checked={isRemoved}
                                      onCheckedChange={() => togglePermissionRemove(perm.id)}
                                      className="border-red-500"
                                    />
                                    <span className="text-xs text-red-400">-</span>
                                  </label>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedUserId(null)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  onClick={handleSavePermissions}
                  disabled={updatePermissionsMutation.isPending}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {updatePermissionsMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
