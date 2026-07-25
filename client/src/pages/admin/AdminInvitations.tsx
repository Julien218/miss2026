/**
 * AdminInvitations.tsx
 * Système d'invitation hiérarchique Miss & Mister Dour 2026
 *
 * Hiérarchie :
 *   super_admin → peut inviter admin + tous les rôles
 *   admin       → peut inviter tous les rôles SAUF admin
 */
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  UserPlus, Mail, Clock, Shield, Camera, Music, Star,
  Eye, Copy, Trash2, CheckCircle2, XCircle, Crown, Users,
  Sparkles, AlertTriangle, Send
} from "lucide-react";

// ── Palette Lady Gaga × Miss & Mister Dour ──────────────────────────────────
const COPPER = "#C87941";
const COPPER_LIGHT = "#D4956A";
const CHAMPAGNE = "#E8D5B7";
const GOLD = "#D4AF37";
const OBSIDIAN = "#0A0A0F";
const GAGA_ROSE = "#C45E6A";

// ── Définition des rôles invitables ─────────────────────────────────────────
const ALL_ROLES = [
  { value: "admin",      label: "Administrateur",    icon: Shield,  color: GAGA_ROSE,    superAdminOnly: true },
  { value: "directeur",  label: "Directeur",         icon: Crown,   color: GOLD,         superAdminOnly: false },
  { value: "manager",    label: "Manager",           icon: Users,   color: COPPER,       superAdminOnly: false },
  { value: "jury",       label: "Jury",              icon: Star,    color: COPPER_LIGHT, superAdminOnly: false },
  { value: "photographe",label: "Photographe",       icon: Camera,  color: CHAMPAGNE,    superAdminOnly: false },
  { value: "viewer",     label: "Chorégraphe/Staff", icon: Music,   color: CHAMPAGNE,    superAdminOnly: false },
  { value: "candidat",   label: "Candidat",          icon: Sparkles,color: COPPER_LIGHT, superAdminOnly: false },
];

const EXPIRY_OPTIONS = [
  { value: "24h",   label: "24 heures" },
  { value: "7d",    label: "7 jours" },
  { value: "30d",   label: "30 jours" },
  { value: "never", label: "Sans expiration" },
];

function RoleBadge({ role }: { role: string }) {
  const def = ALL_ROLES.find(r => r.value === role);
  if (!def) return <span className="text-xs text-gray-400">{role}</span>;
  const Icon = def.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: `${def.color}20`, border: `1px solid ${def.color}50`, color: def.color }}
    >
      <Icon className="w-3 h-3" />
      {def.label}
    </span>
  );
}

function StatusBadge({ isActive, expiresAt, usedCount, maxUses }: {
  isActive: number; expiresAt: Date | null; usedCount: number | null; maxUses: number | null;
}) {
  const expired = expiresAt && new Date(expiresAt) < new Date();
  const exhausted = maxUses && (usedCount || 0) >= maxUses;

  if (!isActive || expired || exhausted) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: "#C45E6A20", color: "#C45E6A", border: "1px solid #C45E6A40" }}>
        <XCircle className="w-3 h-3" />
        {expired ? "Expirée" : exhausted ? "Épuisée" : "Inactive"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: "#22c55e20", color: "#22c55e", border: "1px solid #22c55e40" }}>
      <CheckCircle2 className="w-3 h-3" />
      Active
    </span>
  );
}

export default function AdminInvitations() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  // Formulaire
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [expiresIn, setExpiresIn] = useState("7d");
  const [sendEmailOpt, setSendEmailOpt] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // tRPC
  const utils = trpc.useUtils();
  const { data: invitations, isLoading } = trpc.invitations.list.useQuery();
  const createMutation = trpc.invitations.create.useMutation({
    onSuccess: (data) => {
      toast.success(sendEmailOpt
        ? `Invitation créée · Email envoyé à ${email}`
        : `Invitation créée · Lien : ${data.inviteUrl}`);
      utils.invitations.list.invalidate();
      setEmail("");
      setRole("");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const deactivateMutation = trpc.invitations.deactivate.useMutation({
    onSuccess: () => {
      toast.success("Invitation désactivée");
      utils.invitations.list.invalidate();
    },
  });

  // Rôles disponibles selon le niveau de l'utilisateur
  const availableRoles = isSuperAdmin
    ? ALL_ROLES
    : ALL_ROLES.filter(r => !r.superAdminOnly);

  const handleCreate = () => {
    if (!email || !role) {
      toast.error("Email et rôle sont obligatoires");
      return;
    }
    createMutation.mutate({
      email,
      role: role as any,
      expiresIn: expiresIn as any,
      sendEmail: sendEmailOpt,
      origin: window.location.origin,
    });
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/invitation/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
      toast.success("Lien copié !");
    });
  };

  return (
    <div className="min-h-screen p-6" style={{ background: OBSIDIAN }}>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── En-tête ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${COPPER}, ${COPPER_LIGHT})` }}
              >
                <UserPlus className="w-5 h-5" style={{ color: OBSIDIAN }} />
              </div>
              <h1 className="text-2xl font-bold font-playfair" style={{ color: CHAMPAGNE }}>
                Gestion des Invitations
              </h1>
            </div>
            <p className="text-sm" style={{ color: `${CHAMPAGNE}60` }}>
              {isSuperAdmin
                ? "Super Admin · Vous pouvez inviter des administrateurs et tous les autres rôles"
                : "Admin · Vous pouvez inviter photographes, jury, staff et candidats"}
            </p>
          </div>

          {/* Badge hiérarchie */}
          <div
            className="px-4 py-2 rounded-xl text-xs font-semibold tracking-wide"
            style={{
              background: isSuperAdmin ? `${GAGA_ROSE}20` : `${COPPER}20`,
              border: `1px solid ${isSuperAdmin ? GAGA_ROSE : COPPER}40`,
              color: isSuperAdmin ? GAGA_ROSE : COPPER,
            }}
          >
            {isSuperAdmin ? "👑 Super Admin" : "🛡️ Admin"}
          </div>
        </div>

        {/* ── Schéma hiérarchique ── */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "#111118", border: `1px solid ${COPPER}30` }}
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: CHAMPAGNE }}>
            <Shield className="w-4 h-4" style={{ color: COPPER }} />
            Hiérarchie des invitations
          </h3>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: `${GAGA_ROSE}20`, border: `1px solid ${GAGA_ROSE}50`, color: GAGA_ROSE }}>
              👑 Super Admin
            </div>
            <span style={{ color: `${CHAMPAGNE}40` }}>→ peut inviter →</span>
            <div className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}50`, color: GOLD }}>
              🛡️ Admin
            </div>
            <span style={{ color: `${CHAMPAGNE}40` }}>+ tous les rôles</span>
            <div className="h-px flex-1" style={{ background: `${COPPER}30` }} />
            <div className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: `${COPPER}20`, border: `1px solid ${COPPER}50`, color: COPPER }}>
              🛡️ Admin
            </div>
            <span style={{ color: `${CHAMPAGNE}40` }}>→ peut inviter →</span>
            <div className="flex flex-wrap gap-2">
              {ALL_ROLES.filter(r => !r.superAdminOnly).map(r => (
                <span key={r.value} className="px-2 py-0.5 rounded text-xs" style={{ background: `${r.color}15`, color: r.color }}>
                  {r.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Formulaire de création ── */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "#111118", border: `1px solid ${COPPER}30` }}
        >
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2" style={{ color: CHAMPAGNE }}>
            <Mail className="w-5 h-5" style={{ color: COPPER }} />
            Créer une invitation
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm font-medium" style={{ color: `${CHAMPAGNE}80` }}>
                Email de la personne invitée *
              </Label>
              <Input
                type="email"
                placeholder="prenom.nom@exemple.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="border text-sm"
                style={{
                  background: "#1a1a22",
                  borderColor: `${COPPER}40`,
                  color: CHAMPAGNE,
                }}
              />
            </div>

            {/* Rôle */}
            <div className="space-y-2">
              <Label className="text-sm font-medium" style={{ color: `${CHAMPAGNE}80` }}>
                Rôle à attribuer *
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger
                  className="border text-sm"
                  style={{ background: "#1a1a22", borderColor: `${COPPER}40`, color: CHAMPAGNE }}
                >
                  <SelectValue placeholder="Choisir un rôle..." />
                </SelectTrigger>
                <SelectContent style={{ background: "#1a1a22", border: `1px solid ${COPPER}40` }}>
                  {availableRoles.map(r => {
                    const Icon = r.icon;
                    return (
                      <SelectItem key={r.value} value={r.value} style={{ color: CHAMPAGNE }}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" style={{ color: r.color }} />
                          <span>{r.label}</span>
                          {r.superAdminOnly && (
                            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${GAGA_ROSE}20`, color: GAGA_ROSE }}>
                              Super Admin
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <Label className="text-sm font-medium" style={{ color: `${CHAMPAGNE}80` }}>
                Expiration du lien
              </Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger
                  className="border text-sm"
                  style={{ background: "#1a1a22", borderColor: `${COPPER}40`, color: CHAMPAGNE }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: "#1a1a22", border: `1px solid ${COPPER}40` }}>
                  {EXPIRY_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value} style={{ color: CHAMPAGNE }}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Option email */}
            <div className="space-y-2">
              <Label className="text-sm font-medium" style={{ color: `${CHAMPAGNE}80` }}>
                Envoi automatique
              </Label>
              <div className="flex items-center gap-3 h-10">
                <button
                  onClick={() => setSendEmailOpt(!sendEmailOpt)}
                  className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: sendEmailOpt ? COPPER : `${CHAMPAGNE}50` }}
                >
                  <div
                    className="w-10 h-5 rounded-full relative transition-all"
                    style={{
                      background: sendEmailOpt ? `linear-gradient(135deg, ${COPPER}, ${COPPER_LIGHT})` : "#333",
                    }}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: sendEmailOpt ? "calc(100% - 18px)" : "2px" }}
                    />
                  </div>
                  {sendEmailOpt ? "Email envoyé automatiquement" : "Lien uniquement (copier manuellement)"}
                </button>
              </div>
            </div>
          </div>

          {/* Avertissement admin */}
          {role === "admin" && (
            <div
              className="mt-4 flex items-start gap-3 p-3 rounded-xl"
              style={{ background: `${GAGA_ROSE}15`, border: `1px solid ${GAGA_ROSE}40` }}
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GAGA_ROSE }} />
              <p className="text-xs" style={{ color: `${CHAMPAGNE}80` }}>
                Vous invitez un <strong style={{ color: GAGA_ROSE }}>Administrateur</strong>.
                Cette personne aura accès à la gestion complète des candidats, commentaires et invitations.
                Réservé aux membres de confiance de STARLIGHT ASBL.
              </p>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !email || !role}
              className="flex items-center gap-2 font-semibold"
              style={{
                background: `linear-gradient(135deg, ${COPPER}, ${COPPER_LIGHT})`,
                color: OBSIDIAN,
                opacity: createMutation.isPending || !email || !role ? 0.6 : 1,
              }}
            >
              {createMutation.isPending ? (
                <>Création en cours...</>
              ) : (
                <>
                  {sendEmailOpt ? <Send className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {sendEmailOpt ? "Créer & Envoyer l'email" : "Créer le lien"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ── Liste des invitations ── */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "#111118", border: `1px solid ${COPPER}30` }}
        >
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2" style={{ color: CHAMPAGNE }}>
            <Clock className="w-5 h-5" style={{ color: COPPER }} />
            Invitations créées
            {invitations && (
              <span
                className="ml-2 text-xs px-2 py-0.5 rounded-full"
                style={{ background: `${COPPER}20`, color: COPPER }}
              >
                {invitations.length}
              </span>
            )}
          </h2>

          {isLoading ? (
            <div className="text-center py-8" style={{ color: `${CHAMPAGNE}40` }}>
              Chargement...
            </div>
          ) : !invitations || invitations.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: COPPER }} />
              <p style={{ color: `${CHAMPAGNE}40` }}>Aucune invitation créée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((inv: any) => (
                <div
                  key={inv.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
                  style={{ background: "#0f0f18", border: `1px solid ${COPPER}20` }}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm" style={{ color: CHAMPAGNE }}>
                        {inv.email}
                      </span>
                      <RoleBadge role={inv.role} />
                      <StatusBadge
                        isActive={inv.isActive}
                        expiresAt={inv.expiresAt}
                        usedCount={inv.usedCount}
                        maxUses={inv.maxUses}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: `${CHAMPAGNE}50` }}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {inv.expiresAt
                          ? `Expire le ${new Date(inv.expiresAt).toLocaleDateString("fr-BE")}`
                          : "Sans expiration"}
                      </span>
                      <span>
                        Utilisé : {inv.usedCount || 0}/{inv.maxUses || 1}
                      </span>
                      <span>
                        Créé le {new Date(inv.createdAt).toLocaleDateString("fr-BE")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Copier le lien */}
                    <button
                      onClick={() => copyLink(inv.token)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: copiedToken === inv.token ? `${COPPER}30` : "#1a1a22",
                        border: `1px solid ${COPPER}40`,
                        color: copiedToken === inv.token ? COPPER : `${CHAMPAGNE}70`,
                      }}
                      title="Copier le lien d'invitation"
                    >
                      {copiedToken === inv.token ? (
                        <><CheckCircle2 className="w-3 h-3" /> Copié</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copier</>
                      )}
                    </button>

                    {/* Désactiver */}
                    {inv.isActive === 1 && (
                      <button
                        onClick={() => deactivateMutation.mutate({ id: inv.id })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: "#1a1a22",
                          border: `1px solid ${GAGA_ROSE}40`,
                          color: GAGA_ROSE,
                        }}
                        title="Désactiver cette invitation"
                      >
                        <Trash2 className="w-3 h-3" />
                        Désactiver
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
