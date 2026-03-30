/**
 * AdminCandidates.tsx
 * Page d'administration des candidats avec génération de liens de profil partageable,
 * envoi d'email automatique et colonne "Profil complété" avec indicateurs visuels.
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Users, Search, Filter, Link2, Copy, Check, Crown,
  Loader2, RefreshCw, Eye, ExternalLink, Mail, X, AlertCircle,
  CheckCircle2, Camera, FileText, Phone, Instagram, Facebook,
  BarChart3, TrendingUp, Download, Shield, ShieldCheck, ShieldAlert
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const CATEGORY_LABELS: Record<string, string> = {
  miss: "Miss",
  mister: "Mister",
  teen_miss: "Teen Miss",
  teen_mister: "Teen Mister",
};

const CATEGORY_COLORS: Record<string, string> = {
  miss: "text-pink-400 bg-pink-400/10 border-pink-400/30",
  mister: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  teen_miss: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  teen_mister: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
};

type CandidateRow = {
  id: number;
  firstName: string;
  lastName: string;
  category: string;
  status: string;
  profilePhoto: string | null;
  bio: string | null;
  phone: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  contestId: number;
  token: string | null;
  tokenUsedCount: number | null;
  // Consentements RGPD
  acceptCGU: number | null;
  acceptCGUAt: Date | null;
  acceptRules: number | null;
  acceptMedia: number | null;
  acceptNewsletter: number | null;
  consentVersion: string | null;
};

type EmailModalState = {
  open: boolean;
  candidate: CandidateRow | null;
  overrideEmail: string;
  result: { emailSent: boolean; recipientEmail: string; mailtoFallback: string | null } | null;
};

/** Calcule le score de complétion d'un profil (0–100) */
function getProfileCompletion(c: CandidateRow): {
  score: number;
  checks: { label: string; done: boolean; icon: React.ReactNode }[];
} {
  const checks = [
    { label: "Photo",     done: !!c.profilePhoto, icon: <Camera className="w-3.5 h-3.5" /> },
    { label: "Bio",       done: !!c.bio && c.bio.length > 10, icon: <FileText className="w-3.5 h-3.5" /> },
    { label: "Téléphone", done: !!c.phone, icon: <Phone className="w-3.5 h-3.5" /> },
    { label: "Instagram", done: !!c.instagram, icon: <Instagram className="w-3.5 h-3.5" /> },
    { label: "Facebook",  done: !!c.facebook, icon: <Facebook className="w-3.5 h-3.5" /> },
    { label: "TikTok",    done: !!c.tiktok, icon: <span className="text-[10px] font-bold">TT</span> },
  ];
  const doneCount = checks.filter((ch) => ch.done).length;
  return { score: Math.round((doneCount / checks.length) * 100), checks };
}

// ─── Types RGPD ──────────────────────────────────────────────────────────────────────
type RgpdRow = {
  id: number;
  firstName: string;
  lastName: string;
  category: string;
  status: string;
  phone: string | null;
  registrationDate: string | null;
  acceptCGU: boolean;
  acceptCGUAt: string | null;
  acceptRules: boolean;
  acceptMedia: boolean;
  acceptNewsletter: boolean;
  consentVersion: string;
  isCompliant: boolean;
  complianceStatus: string;
};

type RgpdExportData = {
  exportedAt: string;
  totalCandidates: number;
  compliantCount: number;
  nonCompliantCount: number;
  legalBasis: string;
  dataController: string;
  rgpdVersion: string;
  candidates: RgpdRow[];
};

/**
 * Génère et télécharge un fichier CSV de conformité RGPD
 * Conforme RGPD Art. 7 (preuve de consentement) & Art. 30 (registre des traitements)
 */
function exportRgpdCsv(data: RgpdExportData) {
  const { candidates, ...meta } = data;

  // En-tête de conformité RGPD
  const header = [
    `# REGISTRE DES CONSENTEMENTS — MISS & MISTER DOUR 2026`,
    `# Généré le : ${new Date(meta.exportedAt).toLocaleString("fr-BE", { timeZone: "Europe/Brussels" })}`,
    `# Responsable du traitement : ${meta.dataController}`,
    `# Base légale : ${meta.legalBasis}`,
    `# Référence réglementaire : ${meta.rgpdVersion}`,
    `# Total candidats : ${meta.totalCandidates} | Conformes : ${meta.compliantCount} | Non conformes : ${meta.nonCompliantCount}`,
    `# Signature : JS-Innov.IA — Pagin Julien — paginjulien@gmail.com`,
    ``,
  ];

  const cols = [
    "ID", "Prénom", "Nom", "Catégorie", "Statut candidature",
    "Téléphone", "Date inscription",
    "CGU acceptées", "Date consentement CGU", "Version CGU",
    "Règlement accepté", "Droits médias acceptés", "Newsletter acceptée",
    "Statut conformité RGPD",
  ];

  const rows = candidates.map((c) => [
    c.id, c.firstName, c.lastName, c.category, c.status,
    c.phone ?? "", c.registrationDate ?? "",
    c.acceptCGU ? "OUI" : "NON",
    c.acceptCGUAt ?? "NON RENSEIGNÉ",
    c.consentVersion,
    c.acceptRules ? "OUI" : "NON",
    c.acceptMedia ? "OUI" : "NON",
    c.acceptNewsletter ? "OUI" : "NON",
    c.complianceStatus,
  ]);

  const esc = (v: string | number) => {
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const csv = [
    ...header,
    cols.map(esc).join(","),
    ...rows.map((r) => r.map(esc).join(",")),
  ].join("\n");

  const bom = "\uFEFF"; // BOM UTF-8 pour compatibilité Excel
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `RGPD-Consentements-Miss-Mister-Dour-2026-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Génère et télécharge un fichier Excel avec les données des candidats */
function exportToExcel(candidates: CandidateRow[], origin: string) {
  const CATEGORY_LABELS_LOCAL: Record<string, string> = {
    miss: "Miss", mister: "Mister", teen_miss: "Teen Miss", teen_mister: "Teen Mister",
  };

  const rows = candidates.map((c, idx) => {
    const { score, checks } = getProfileCompletion(c);
    const profileLink = c.token ? `${origin}/profile/edit/${c.token}` : "";
    const publicLink = `${origin}/candidat/${c.id}`;
    const checkMap = Object.fromEntries(checks.map((ch) => [ch.label, ch.done ? "✓" : "✗"]));
    return {
      "N°": idx + 1,
      "Catégorie": CATEGORY_LABELS_LOCAL[c.category] || c.category,
      "Prénom": c.firstName,
      "Nom": c.lastName,
      "Score Complétion": `${score}%`,
      "Photo": checkMap["Photo"] || "✗",
      "Bio": checkMap["Bio"] || "✗",
      "Téléphone": checkMap["Téléphone"] || "✗",
      "Instagram": checkMap["Instagram"] || "✗",
      "Facebook": checkMap["Facebook"] || "✗",
      "TikTok": checkMap["TikTok"] || "✗",
      "Lien Profil (à envoyer)": profileLink,
      "Page Publique": publicLink,
      "Token actif": c.token ? "Oui" : "Non",
      "Nb utilisations": c.tokenUsedCount ?? 0,
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Largeurs de colonnes
  ws["!cols"] = [
    { wch: 5 },  // N°
    { wch: 12 }, // Catégorie
    { wch: 15 }, // Prénom
    { wch: 18 }, // Nom
    { wch: 18 }, // Score
    { wch: 8 },  // Photo
    { wch: 8 },  // Bio
    { wch: 12 }, // Téléphone
    { wch: 12 }, // Instagram
    { wch: 12 }, // Facebook
    { wch: 10 }, // TikTok
    { wch: 70 }, // Lien Profil
    { wch: 45 }, // Page Publique
    { wch: 12 }, // Token actif
    { wch: 15 }, // Nb utilisations
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Candidats 2026");

  // Feuille de résumé
  const total = candidates.length;
  const completedCount = candidates.filter((c) => getProfileCompletion(c).score === 100).length;
  const avgScore = total > 0
    ? Math.round(candidates.reduce((s, c) => s + getProfileCompletion(c).score, 0) / total)
    : 0;

  const summaryData = [
    { "Indicateur": "Total candidats", "Valeur": total },
    { "Indicateur": "Miss", "Valeur": candidates.filter((c) => c.category === "miss").length },
    { "Indicateur": "Mister", "Valeur": candidates.filter((c) => c.category === "mister").length },
    { "Indicateur": "Profils complets (100%)", "Valeur": completedCount },
    { "Indicateur": "Profils incomplets", "Valeur": total - completedCount },
    { "Indicateur": "Score moyen de complétion", "Valeur": `${avgScore}%` },
    { "Indicateur": "Liens de profil actifs", "Valeur": candidates.filter((c) => c.token).length },
    { "Indicateur": "Date d'export", "Valeur": new Date().toLocaleDateString("fr-BE") },
    { "Indicateur": "Événement", "Valeur": "Miss & Mister Dour 2026" },
    { "Indicateur": "Lieu", "Valeur": "Centre Sportif d'Elouges, 7370 Elouges" },
    { "Indicateur": "Date", "Valeur": "19 Avril 2026" },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary["!cols"] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Résumé");

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Miss-Mister-Dour-2026-Candidats-${date}.xlsx`);
}

export default function AdminCandidates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCompletion, setFilterCompletion] = useState("all");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [rgpdLoading, setRgpdLoading] = useState(false);
  const [showRgpdModal, setShowRgpdModal] = useState(false);
  const [rgpdData, setRgpdData] = useState<RgpdExportData | null>(null);
  const [emailModal, setEmailModal] = useState<EmailModalState>({
    open: false,
    candidate: null,
    overrideEmail: "",
    result: null,
  });

  const { data: candidates, isLoading, refetch } = trpc.candidateProfile.listCandidatesWithTokenStatus.useQuery(
    { contestId: 1 }
  );

  const generateLinkMutation = trpc.candidateProfile.generateProfileLink.useMutation({
    onSuccess: (data) => {
      const link = `${window.location.origin}/profile/edit/${data.token}`;
      navigator.clipboard.writeText(link);
      toast.success("✅ Lien généré et copié !", {
        description: "Le lien de remplissage de profil a été copié dans le presse-papiers.",
      });
      refetch();
    },
    onError: (err) => toast.error("Erreur", { description: err.message }),
  });

  const rgpdExportQuery = trpc.candidateProfile.exportRgpd.useQuery(
    { contestId: 1 },
    { enabled: false }
  );

  const handleRgpdExport = async (mode: "csv" | "preview") => {
    setRgpdLoading(true);
    try {
      const result = await rgpdExportQuery.refetch();
      if (result.data) {
        setRgpdData(result.data as RgpdExportData);
        if (mode === "csv") {
          exportRgpdCsv(result.data as RgpdExportData);
          toast.success("🛡️ Export RGPD téléchargé !", {
            description: `${result.data.totalCandidates} candidats — ${result.data.compliantCount} conformes, ${result.data.nonCompliantCount} non conformes`,
          });
        } else {
          setShowRgpdModal(true);
        }
      }
    } catch (err: any) {
      toast.error("Erreur export RGPD", { description: err.message });
    } finally {
      setRgpdLoading(false);
    }
  };

  const sendEmailMutation = trpc.candidateProfile.sendProfileLinkEmail.useMutation({
    onSuccess: (data) => {
      setEmailModal((prev) => ({
        ...prev,
        result: {
          emailSent: data.emailSent,
          recipientEmail: data.recipientEmail,
          mailtoFallback: data.mailtoFallback ?? null,
        },
      }));
      refetch();
      if (data.emailSent) {
        toast.success("📧 Email envoyé !", { description: `Lien envoyé à ${data.recipientEmail}` });
      }
    },
    onError: (err) => toast.error("Erreur d'envoi", { description: err.message }),
  });

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/profile/edit/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 3000);
    toast.success("Lien copié !");
  };

  const openEmailModal = (candidate: CandidateRow) => {
    setEmailModal({ open: true, candidate, overrideEmail: "", result: null });
  };

  const closeEmailModal = () => {
    setEmailModal({ open: false, candidate: null, overrideEmail: "", result: null });
  };

  const handleSendEmail = () => {
    if (!emailModal.candidate) return;
    sendEmailMutation.mutate({
      candidateId: emailModal.candidate.id,
      origin: window.location.origin,
      overrideEmail: emailModal.overrideEmail || undefined,
    });
  };

  // Filtrage
  const filtered = (candidates || []).filter((c) => {
    const matchSearch =
      !searchTerm ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === "all" || c.category === filterCategory;
    const { score } = getProfileCompletion(c as CandidateRow);
    const matchCompletion =
      filterCompletion === "all" ||
      (filterCompletion === "complete" && score === 100) ||
      (filterCompletion === "partial" && score > 0 && score < 100) ||
      (filterCompletion === "empty" && score === 0) ||
      (filterCompletion === "rgpd_ok" && (c as CandidateRow).acceptCGU === 1) ||
      (filterCompletion === "rgpd_nok" && (c as CandidateRow).acceptCGU !== 1);
    return matchSearch && matchCategory && matchCompletion;
  });

  // Stats globales
  const total = candidates?.length || 0;
  const withToken = candidates?.filter((c) => c.token)?.length || 0;
  const misses = candidates?.filter((c) => c.category === "miss")?.length || 0;
  const misters = candidates?.filter((c) => c.category === "mister")?.length || 0;
  const completedProfiles = candidates?.filter((c) => getProfileCompletion(c as CandidateRow).score === 100)?.length || 0;
  const avgCompletion = total > 0
    ? Math.round((candidates || []).reduce((sum, c) => sum + getProfileCompletion(c as CandidateRow).score, 0) / total)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-10 h-10 text-gold" />
              <h1 className="text-4xl font-bold text-gold">Gestion des Candidats</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!candidates || candidates.length === 0) {
                    toast.error("Aucun candidat à exporter");
                    return;
                  }
                  exportToExcel(candidates as CandidateRow[], window.location.origin);
                  toast.success("📊 Export Excel téléchargé !", {
                    description: `${candidates.length} candidats exportés avec score de complétion et liens`,
                  });
                }}
                disabled={!candidates || candidates.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-500/40 rounded-lg hover:bg-emerald-600/30 hover:border-emerald-400 transition-colors text-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Exporter Excel
              </button>
              {/* Bouton Export RGPD */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleRgpdExport("csv")}
                  disabled={rgpdLoading || !candidates || candidates.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/40 rounded-l-lg hover:bg-blue-600/30 hover:border-blue-400 transition-colors text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Télécharger le registre des consentements RGPD (CSV)"
                >
                  {rgpdLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  Export RGPD
                </button>
                <button
                  onClick={() => handleRgpdExport("preview")}
                  disabled={rgpdLoading || !candidates || candidates.length === 0}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 border border-l-0 border-blue-500/40 rounded-r-lg hover:bg-blue-600/30 hover:border-blue-400 transition-colors text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Prévisualiser le rapport de conformité RGPD"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg hover:border-gold/50 transition-colors text-gray-300 hover:text-gold"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>
          <p className="text-gray-400 text-lg">
            Gérez les candidats, suivez la complétion des profils et envoyez les liens par email
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-gold/20 to-transparent border-gold/30 p-5 col-span-1">
            <div className="text-3xl font-bold text-gold mb-1">{total}</div>
            <div className="text-gray-300 text-xs">Total</div>
          </Card>
          <Card className="bg-gradient-to-br from-pink-500/20 to-transparent border-pink-500/30 p-5 col-span-1">
            <div className="text-3xl font-bold text-pink-400 mb-1">{misses}</div>
            <div className="text-gray-300 text-xs">Miss</div>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/20 to-transparent border-blue-500/30 p-5 col-span-1">
            <div className="text-3xl font-bold text-blue-400 mb-1">{misters}</div>
            <div className="text-gray-300 text-xs">Mister</div>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/20 to-transparent border-green-500/30 p-5 col-span-1">
            <div className="text-3xl font-bold text-green-400 mb-1">{withToken}</div>
            <div className="text-gray-300 text-xs">Liens actifs</div>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/20 to-transparent border-emerald-500/30 p-5 col-span-1">
            <div className="text-3xl font-bold text-emerald-400 mb-1">{completedProfiles}</div>
            <div className="text-gray-300 text-xs">Profils complets</div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/20 to-transparent border-purple-500/30 p-5 col-span-1">
            <div className="text-3xl font-bold text-purple-400 mb-1">{avgCompletion}%</div>
            <div className="text-gray-300 text-xs">Complétion moy.</div>
          </Card>
        </div>

        {/* Barre de progression globale */}
        <Card className="bg-gray-800/50 border-gold/20 p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-5 h-5 text-gold" />
            <span className="font-semibold text-white">Progression globale des profils</span>
            <span className="ml-auto text-gold font-bold">{completedProfiles}/{total} complets</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-gold to-yellow-400 transition-all duration-700"
              style={{ width: `${total > 0 ? (completedProfiles / total) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0%</span>
            <span className="text-gold">{total > 0 ? Math.round((completedProfiles / total) * 100) : 0}% des profils complétés</span>
            <span>100%</span>
          </div>
        </Card>

        {/* Filtres */}
        <Card className="bg-gray-800/50 border-gold/20 p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un candidat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-gold focus:outline-none text-white"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-gold focus:outline-none text-white appearance-none"
              >
                <option value="all">Toutes les catégories</option>
                <option value="miss">Miss</option>
                <option value="mister">Mister</option>
                <option value="teen_miss">Teen Miss</option>
                <option value="teen_mister">Teen Mister</option>
              </select>
            </div>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterCompletion}
                onChange={(e) => setFilterCompletion(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-gold focus:outline-none text-white appearance-none"
              >
                <option value="all">Tous les profils</option>
                <option value="complete">Profils complets (100%)</option>
                <option value="partial">En cours (&gt;0%)</option>
                <option value="empty">Vides (0%)</option>
                <option value="rgpd_ok">✅ RGPD conformés</option>
                <option value="rgpd_nok">⚠️ RGPD non conformés</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Explication */}
        <div className="bg-gold/10 border border-gold/30 rounded-xl p-5 mb-8 flex items-start gap-4">
          <Mail className="w-6 h-6 text-gold flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gold mb-1">Workflow recommandé</h3>
            <p className="text-gray-300 text-sm">
              1. Cliquez <strong>"Générer lien"</strong> pour créer un lien unique par candidat.
              2. Cliquez <strong>"Email"</strong> pour envoyer automatiquement le lien au candidat.
              3. Suivez la colonne <strong>"Profil"</strong> pour voir qui a complété ses informations.
            </p>
          </div>
        </div>

        {/* Liste des candidats */}
        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Chargement des candidats...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Crown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">Aucun candidat trouvé</p>
            <p className="text-gray-500 text-sm mt-2">
              {total === 0
                ? "Aucun candidat n'est encore inscrit pour le concours 2026."
                : "Modifiez vos filtres pour voir plus de candidats."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((candidate) => {
              const c = candidate as CandidateRow;
              const profileLink = c.token
                ? `${window.location.origin}/profile/edit/${c.token}`
                : null;
              const { score, checks } = getProfileCompletion(c);

              // Couleur de la barre selon le score
              const barColor =
                score === 100 ? "from-emerald-500 to-green-400" :
                score >= 50  ? "from-gold to-yellow-400" :
                score > 0    ? "from-orange-500 to-amber-400" :
                               "from-red-600 to-red-500";

              const scoreTextColor =
                score === 100 ? "text-emerald-400" :
                score >= 50  ? "text-gold" :
                score > 0    ? "text-orange-400" :
                               "text-red-400";

              return (
                <Card
                  key={c.id}
                  className="bg-gray-800/50 border-gold/20 p-6 hover:border-gold/40 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">

                    {/* Photo & Identité */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {c.profilePhoto ? (
                        <img
                          src={c.profilePhoto}
                          alt={`${c.firstName} ${c.lastName}`}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gold/30 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600 flex-shrink-0">
                          <Crown className="w-7 h-7 text-gray-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-lg truncate">
                          {c.firstName} {c.lastName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[c.category] || "text-gray-400 bg-gray-700 border-gray-600"}`}>
                            {CATEGORY_LABELS[c.category] || c.category}
                          </span>
                          {c.token && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
                              ✓ Lien actif ({c.tokenUsedCount || 0} utilisation{(c.tokenUsedCount || 0) > 1 ? "s" : ""})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ─── Colonne Profil Complété ─── */}
                    <div className="flex-shrink-0 w-full lg:w-64">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Profil</span>
                        <span className={`text-sm font-bold ${scoreTextColor}`}>
                          {score === 100 ? "✓ Complet" : `${score}%`}
                        </span>
                      </div>
                      {/* Barre de progression */}
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      {/* Indicateurs par champ */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {checks.map((ch) => (
                          <div
                            key={ch.label}
                            title={ch.label}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                              ch.done
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-gray-700/50 border-gray-600 text-gray-500"
                            }`}
                          >
                            {ch.icon}
                            <span className="hidden sm:inline">{ch.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ─── Colonne Consentement RGPD ─── */}
                    <div className="flex-shrink-0 w-full lg:w-52">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">RGPD</span>
                        {c.acceptCGU === 1 ? (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" /> Non conforme
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        {/* Cases de consentement */}
                        {[
                          { label: "CGU", value: c.acceptCGU },
                          { label: "Règlement", value: c.acceptRules },
                          { label: "Médias", value: c.acceptMedia },
                          { label: "Newsletter", value: c.acceptNewsletter },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center gap-1.5">
                            <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold ${
                              value === 1 ? "bg-emerald-500 text-white" : "bg-gray-600 text-gray-400"
                            }`}>
                              {value === 1 ? "✓" : "×"}
                            </span>
                            <span className={`text-xs ${
                              value === 1 ? "text-gray-300" : "text-gray-500"
                            }`}>{label}</span>
                          </div>
                        ))}
                        {/* Date et version */}
                        {c.acceptCGUAt && (
                          <div className="mt-1 text-[10px] text-gray-500 border-t border-gray-700 pt-1">
                            <span className="text-[#D4AF37]">{c.consentVersion || "v1.0"}</span>
                            {" — "}
                            {new Date(c.acceptCGUAt).toLocaleDateString("fr-BE", {
                              day: "2-digit", month: "2-digit", year: "numeric"
                            })}
                          </div>
                        )}
                        {!c.acceptCGUAt && c.acceptCGU !== 1 && (
                          <div className="mt-1 text-[10px] text-gray-600 italic">
                            Consentement non encore recueilli
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => window.open(`/candidat/${c.id}`, "_blank")}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors text-sm"
                        title="Voir la page publique"
                      >
                        <Eye className="w-4 h-4" />
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      {profileLink && (
                        <button
                          onClick={() => handleCopyLink(c.token!)}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors text-sm"
                          title="Copier le lien de profil"
                        >
                          {copiedToken === c.token ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          <span className="hidden sm:inline">{copiedToken === c.token ? "Copié !" : "Copier"}</span>
                        </button>
                      )}

                      <button
                        onClick={() => openEmailModal(c)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/40 rounded-lg text-blue-400 hover:bg-blue-600/30 hover:border-blue-400 transition-colors text-sm"
                        title="Envoyer le lien par email"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="hidden sm:inline">Email</span>
                      </button>

                      <button
                        onClick={() => generateLinkMutation.mutate({ candidateId: c.id })}
                        disabled={generateLinkMutation.isPending}
                        className="flex items-center gap-2 px-3 py-2 bg-gold text-black font-bold rounded-lg hover:bg-gold/90 transition-colors text-sm disabled:opacity-50"
                        title={c.token ? "Régénérer le lien" : "Générer un lien"}
                      >
                        {generateLinkMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Link2 className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">{c.token ? "Régénérer" : "Générer lien"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Lien affiché */}
                  {profileLink && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-xs text-gray-500 mb-1">Lien de remplissage de profil :</p>
                      <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg px-3 py-2">
                        <code className="text-xs text-gold flex-1 truncate">{profileLink}</code>
                        <button
                          onClick={() => handleCopyLink(c.token!)}
                          className="flex-shrink-0 text-gray-400 hover:text-gold transition-colors"
                        >
                          {copiedToken === c.token ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Modal Envoi Email ─────────────────────────────────────────────────── */}
      {emailModal.open && emailModal.candidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gold/30 rounded-2xl w-full max-w-lg shadow-2xl shadow-gold/10">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="font-bold text-white">Envoyer le lien par email</h2>
                  <p className="text-gray-400 text-sm">
                    {emailModal.candidate.firstName} {emailModal.candidate.lastName}
                  </p>
                </div>
              </div>
              <button onClick={closeEmailModal} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {!emailModal.result ? (
                <>
                  <p className="text-gray-300 text-sm mb-5 leading-relaxed">
                    Un email HTML premium sera envoyé au candidat avec son lien de remplissage de profil.
                    Si le candidat n'a pas d'email dans le système, renseignez-le manuellement ci-dessous.
                  </p>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email du candidat <span className="text-gray-500">(optionnel si déjà enregistré)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="candidat@exemple.com"
                      value={emailModal.overrideEmail}
                      onChange={(e) => setEmailModal((prev) => ({ ...prev, overrideEmail: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Aperçu de l'email</p>
                    <p className="text-sm text-white font-medium mb-1">
                      Objet : 👑 Miss & Mister Dour 2026 - Complétez votre profil, {emailModal.candidate.firstName} !
                    </p>
                    <p className="text-xs text-gray-400">
                      Contenu : Email HTML premium avec bouton doré, lien de profil sécurisé, et informations STARLIGHT ASBL.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={closeEmailModal}
                      className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSendEmail}
                      disabled={sendEmailMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50"
                    >
                      {sendEmailMutation.isPending ? (
                        <><Loader2 className="w-5 h-5 animate-spin" />Envoi en cours...</>
                      ) : (
                        <><Mail className="w-5 h-5" />Envoyer l'email</>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  {emailModal.result.emailSent ? (
                    <>
                      <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Email envoyé !</h3>
                      <p className="text-gray-400 mb-2">Le lien de profil a été envoyé à :</p>
                      <p className="text-gold font-medium mb-6">{emailModal.result.recipientEmail}</p>
                      <button
                        onClick={closeEmailModal}
                        className="px-8 py-3 bg-gold text-black font-bold rounded-xl hover:bg-gold/90 transition-colors"
                      >
                        Fermer
                      </button>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Envoi automatique indisponible</h3>
                      <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                        Utilisez le lien mailto ci-dessous pour envoyer l'email manuellement.
                      </p>
                      {emailModal.result.mailtoFallback && (
                        <a
                          href={emailModal.result.mailtoFallback}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors mb-4"
                        >
                          <Mail className="w-5 h-5" />
                          Ouvrir dans mon client email
                        </a>
                      )}
                      <br />
                      <button
                        onClick={closeEmailModal}
                        className="px-6 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        Fermer
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
       )}

      {/* ─── Modal RGPD ────────────────────────────────────────────────────────────────────────────── */}
      {showRgpdModal && rgpdData && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowRgpdModal(false)}
        >
          <div
            className="bg-gray-950 border border-blue-500/30 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Rapport de conformité RGPD</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Généré le {new Date(rgpdData.exportedAt).toLocaleString("fr-BE", { timeZone: "Europe/Brussels" })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRgpdModal(false)}
                className="text-gray-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Statistiques de conformité */}
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-800">
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white">{rgpdData.totalCandidates}</div>
                <div className="text-xs text-gray-400 mt-1">Total candidats</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{rgpdData.compliantCount}</div>
                <div className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-green-400" />
                  Conformes
                </div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-red-400">{rgpdData.nonCompliantCount}</div>
                <div className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-red-400" />
                  Non conformes
                </div>
              </div>
            </div>

            {/* Informations légales */}
            <div className="px-6 py-3 bg-blue-500/5 border-b border-gray-800">
              <p className="text-xs text-blue-300">
                <span className="font-medium">Base légale :</span> {rgpdData.legalBasis}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                <span className="font-medium">Responsable :</span> {rgpdData.dataController} — {rgpdData.rgpdVersion}
              </p>
            </div>

            {/* Tableau des candidats */}
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-800">
                    <th className="text-left pb-3 pr-4">Candidat</th>
                    <th className="text-center pb-3 px-2">CGU</th>
                    <th className="text-center pb-3 px-2">Règlement</th>
                    <th className="text-center pb-3 px-2">Médias</th>
                    <th className="text-center pb-3 px-2">Newsletter</th>
                    <th className="text-left pb-3 px-2">Date consentement</th>
                    <th className="text-center pb-3 pl-2">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {rgpdData.candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-900/40 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-white">{c.firstName} {c.lastName}</div>
                        <div className="text-xs text-gray-500 capitalize">{c.category} — {c.status}</div>
                      </td>
                      <td className="text-center py-3 px-2">
                        {c.acceptCGU
                          ? <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                          : <AlertCircle className="w-4 h-4 text-red-400 mx-auto" />}
                      </td>
                      <td className="text-center py-3 px-2">
                        {c.acceptRules
                          ? <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                          : <AlertCircle className="w-4 h-4 text-red-400 mx-auto" />}
                      </td>
                      <td className="text-center py-3 px-2">
                        {c.acceptMedia
                          ? <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                          : <AlertCircle className="w-4 h-4 text-amber-400 mx-auto" />}
                      </td>
                      <td className="text-center py-3 px-2">
                        {c.acceptNewsletter
                          ? <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                          : <AlertCircle className="w-4 h-4 text-gray-500 mx-auto" />}
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-xs text-gray-300">
                          {c.acceptCGUAt ?? <span className="text-red-400">Non renseigné</span>}
                        </div>
                        <div className="text-xs text-gray-600">{c.consentVersion}</div>
                      </td>
                      <td className="text-center py-3 pl-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          c.isCompliant
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}>
                          {c.isCompliant ? "Conforme" : "Non conforme"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pied de modal */}
            <div className="flex items-center justify-between p-6 border-t border-gray-800 bg-gray-950">
              <p className="text-xs text-gray-500">
                Signature : <span className="text-blue-400">JS-Innov.IA — Pagin Julien — paginjulien@gmail.com</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRgpdModal(false)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white text-sm transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    exportRgpdCsv(rgpdData);
                    toast.success("🛡️ CSV RGPD téléchargé !");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Télécharger CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
