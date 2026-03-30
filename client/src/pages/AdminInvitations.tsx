import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { Copy, Plus, Ban, CheckCircle, XCircle, Clock, MessageCircle, Send, UserPlus } from "lucide-react";

export default function AdminInvitations() {
  // Using sonner toast
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCandidateOnboardingDialogOpen, setIsCandidateOnboardingDialogOpen] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateExpiresIn, setCandidateExpiresIn] = useState<string>("30d");
  const [role, setRole] = useState<string>("viewer");
  const [email, setEmail] = useState("");
  const [expiresIn, setExpiresIn] = useState<string>("7d");
  const [maxUses, setMaxUses] = useState("1");

  const { data: invitations, refetch } = trpc.invitations.list.useQuery();
  const createMutation = trpc.invitations.create.useMutation();
  const deactivateMutation = trpc.invitations.deactivate.useMutation();

  const handleCreate = async () => {
    try {
      if (!email || !email.includes('@')) {
        toast.error("Email valide requis");
        return;
      }
      
      const result = await createMutation.mutateAsync({
        role: role as any,
        email: email,
        expiresIn: expiresIn as any,
        maxUses: parseInt(maxUses) || 1,
      });

      const inviteUrl = `${window.location.origin}/invite/${result.token}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(inviteUrl);
      
      toast.success("Invitation créée ! Le lien a été copié dans le presse-papier");

      setIsCreateDialogOpen(false);
      setEmail("");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Impossible de créer l'invitation");
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await deactivateMutation.mutateAsync({ id });
      toast.success("L'invitation a été désactivée avec succès");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Impossible de désactiver l'invitation");
    }
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Lien d'invitation copié !");
  };

  const shareWhatsApp = (token: string, email: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    const message = `Bonjour ! Vous êtes invité(e) à rejoindre Miss & Mister Dour 2026.\n\nVotre lien d'invitation : ${inviteUrl}\n\n✨ Miss & Mister Dour 2026 - Élection 19 avril 2026`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendEmail = (token: string, email: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    const subject = "Invitation Miss & Mister Dour 2026";
    const body = `Bonjour !\n\nVous êtes invité(e) à rejoindre Miss & Mister Dour 2026.\n\nVotre lien d'invitation : ${inviteUrl}\n\n✨ Miss & Mister Dour 2026 - Élection 19 avril 2026\n\nCordialement,\nL'équipe Miss & Mister Dour`;
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const getStatusBadge = (invitation: any) => {
    const now = new Date();
    const expiresAt = invitation.expiresAt ? new Date(invitation.expiresAt) : null;
    const isExpired = expiresAt && expiresAt < now;
    const isExhausted = invitation.maxUses && invitation.usedCount >= invitation.maxUses;

    if (!invitation.isActive) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"><Ban className="w-3 h-3" /> Désactivée</span>;
    }
    if (isExpired) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700"><Clock className="w-3 h-3" /> Expirée</span>;
    }
    if (isExhausted) {
      return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700"><XCircle className="w-3 h-3" /> Épuisée</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" /> Active</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Invitations</h1>
            <p className="text-gray-400">Gérez les invitations par lien sécurisé</p>
          </div>

          <div className="flex gap-3">
            <Dialog open={isCandidateOnboardingDialogOpen} onOpenChange={setIsCandidateOnboardingDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Lien onboarding candidat
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-pink-500/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Générer lien onboarding candidat</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-4">
                    <p className="text-sm text-pink-200">
                      Ce lien permet à un candidat de remplir le formulaire d'inscription complet avec photos, vidéo, bio, réseaux sociaux, etc.
                    </p>
                  </div>

                  <div>
                    <Label className="text-white">Email du candidat</Label>
                    <Input
                      type="email"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      placeholder="candidat@example.com"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Expiration</Label>
                    <Select value={candidateExpiresIn} onValueChange={setCandidateExpiresIn}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="7d">7 jours</SelectItem>
                        <SelectItem value="30d">30 jours</SelectItem>
                        <SelectItem value="never">Jamais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={async () => {
                      try {
                        if (!candidateEmail || !candidateEmail.includes('@')) {
                          toast.error("Email valide requis");
                          return;
                        }
                        
                        const result = await createMutation.mutateAsync({
                          role: "candidat" as any,
                          email: candidateEmail,
                          expiresIn: candidateExpiresIn as any,
                          maxUses: 1,
                        });

                        const onboardingUrl = `${window.location.origin}/onboarding/candidate/${result.token}`;
                        
                        await navigator.clipboard.writeText(onboardingUrl);
                        
                        toast.success("Lien onboarding créé ! Le lien a été copié dans le presse-papier");

                        setIsCandidateOnboardingDialogOpen(false);
                        setCandidateEmail("");
                        refetch();
                      } catch (error: any) {
                        toast.error(error.message || "Impossible de créer le lien onboarding");
                      }
                    }}
                    disabled={createMutation.isPending}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold"
                  >
                    {createMutation.isPending ? "Création..." : "Créer et copier le lien"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#C8A45C] text-black font-semibold">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer invitation
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-[#C8A45C]/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Nouvelle invitation</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-white">Rôle</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="candidat">Candidat</SelectItem>
                        <SelectItem value="photographe">Photographe</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="directeur">Directeur</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Email (optionnel)</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Expiration</Label>
                    <Select value={expiresIn} onValueChange={setExpiresIn}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="1h">1 heure</SelectItem>
                        <SelectItem value="24h">24 heures</SelectItem>
                        <SelectItem value="7d">7 jours</SelectItem>
                        <SelectItem value="30d">30 jours</SelectItem>
                        <SelectItem value="never">Jamais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Nombre d'utilisations</Label>
                    <Input
                      type="number"
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value)}
                      min="1"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <Button
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                    className="w-full bg-gradient-to-r from-[#C8A45C] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#C8A45C] text-black font-semibold"
                  >
                    {createMutation.isPending ? "Création..." : "Créer et copier le lien"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4">
          {invitations?.map((invitation) => (
            <Card key={invitation.id} className="bg-gray-800/50 border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-[#C8A45C]/20 text-[#C8A45C]">
                      {invitation.role}
                    </span>
                    {getStatusBadge(invitation)}
                  </div>

                  <div className="text-sm text-gray-400 space-y-1">
                    {invitation.email && (
                      <div>Email: <span className="text-white">{invitation.email}</span></div>
                    )}
                    <div>Utilisations: <span className="text-white">{invitation.usedCount} / {invitation.maxUses || "∞"}</span></div>
                    {invitation.expiresAt && (
                      <div>Expire: <span className="text-white">{new Date(invitation.expiresAt).toLocaleString("fr-FR")}</span></div>
                    )}
                    <div className="font-mono text-xs text-gray-500 break-all">
                      Token: {invitation.token}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyInviteLink(invitation.token)}
                    className="border-gray-600 text-white hover:bg-gray-700"
                    title="Copier le lien"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => shareWhatsApp(invitation.token, invitation.email)}
                    className="border-green-600 text-green-400 hover:bg-green-900/20"
                    title="Partager sur WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendEmail(invitation.token, invitation.email)}
                    className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
                    title="Envoyer par Email"
                  >
                    <Send className="w-4 h-4" />
                  </Button>

                  {invitation.isActive && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeactivate(invitation.id)}
                      disabled={deactivateMutation.isPending}
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {!invitations || invitations.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Aucune invitation créée
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
