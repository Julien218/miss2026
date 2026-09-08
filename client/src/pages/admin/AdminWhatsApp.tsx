import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  MessageCircle, Search, Send, Copy, ExternalLink, QrCode,
  Users, CheckCircle2, AlertCircle, Phone, ChevronDown, ChevronUp,
  Zap, Filter, RefreshCw, Download, History, BarChart3,
  Wifi, WifiOff, Clock, CheckCheck, XCircle, Eye,
} from "lucide-react";
import {
  WHATSAPP_TEMPLATES,
  buildWhatsAppLink,
  buildWhatsAppQRCode,
  generateMessage,
  normalizePhone,
  type WhatsAppTemplateType,
  type CandidateInfo,
} from "@/lib/whatsapp";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CandidateRow {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  category?: string | null;
  token?: string | null;
  completionScore?: number;
  profilePhotoUrl?: string | null;
}

type TabId = "messaging" | "history" | "stats";

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AdminWhatsApp() {
  const [activeTab, setActiveTab] = useState<TabId>("messaging");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplateType>("profil_incomplet");
  const [customText, setCustomText] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [showQR, setShowQR] = useState<number | null>(null);
  const [filterPhone, setFilterPhone] = useState<"all" | "with_phone" | "no_phone">("all");
  const [previewMessage, setPreviewMessage] = useState<string | null>(null);
  const [expandedCandidate, setExpandedCandidate] = useState<number | null>(null);
  const [sendingApiId, setSendingApiId] = useState<number | null>(null);

  // ─── Données ───────────────────────────────────────────────────────────────
  const { data: candidatesData, isLoading } = trpc.candidateProfile.listCandidatesWithTokenStatus.useQuery({});
  const candidates: CandidateRow[] = (candidatesData ?? []) as CandidateRow[];

  // Historique des envois
  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = trpc.whatsapp.getLogs.useQuery(
    { limit: 100 },
    { enabled: activeTab === "history" }
  );

  // Statistiques
  const { data: statsData, isLoading: statsLoading } = trpc.whatsapp.getStats.useQuery(
    undefined,
    { enabled: activeTab === "stats" }
  );

  // Mutation envoi API
  const sendApiMutation = trpc.whatsapp.sendMessage.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("✅ Message envoyé via WhatsApp Business API !");
      } else {
        toast.error(`❌ Échec d'envoi : ${result.error}`);
      }
      setSendingApiId(null);
    },
    onError: (err) => {
      const msg = err.message.includes("credentials") || err.message.includes("configurés")
        ? "API WhatsApp non configurée — utilisez le bouton wa.me"
        : err.message;
      toast.error(msg);
      setSendingApiId(null);
    },
  });

  // ─── Filtrage ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      const matchSearch =
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone ?? "").includes(searchTerm) ||
        (c.email ?? "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchPhone =
        filterPhone === "all" ||
        (filterPhone === "with_phone" && !!c.phone) ||
        (filterPhone === "no_phone" && !c.phone);
      return matchSearch && matchPhone;
    });
  }, [candidates, searchTerm, filterPhone]);

  const withPhone = candidates.filter((c) => !!c.phone).length;
  const withoutPhone = candidates.filter((c) => !c.phone).length;

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function toCandidateInfo(c: CandidateRow): CandidateInfo {
    return {
      firstName: c.firstName,
      lastName: c.lastName,
      phone: c.phone,
      profileUrl: c.token ? `${window.location.origin}/candidat/${c.id}` : undefined,
      completionScore: c.completionScore,
      category: c.category ?? undefined,
    };
  }

  function getGeneratedMessage(c: CandidateRow): string {
    const info = toCandidateInfo(c);
    return generateMessage(
      selectedTemplate,
      info,
      selectedTemplate === "personnalise" ? customText : undefined
    );
  }

  function openWhatsApp(c: CandidateRow) {
    if (!c.phone) {
      toast.error(`Numéro de téléphone manquant pour ${c.firstName} ${c.lastName}`);
      return;
    }
    const message = getGeneratedMessage(c);
    const link = buildWhatsAppLink(c.phone, message);
    window.open(link, "_blank");
    toast.success(`WhatsApp ouvert pour ${c.firstName} ${c.lastName}`);
  }

  function sendViaApi(c: CandidateRow) {
    if (!c.phone) {
      toast.error("Numéro de téléphone manquant");
      return;
    }
    setSendingApiId(c.id);
    const message = getGeneratedMessage(c);
    sendApiMutation.mutate({
      candidateId: c.id,
      message,
      templateType: "custom",
    });
  }

  function copyMessage(c: CandidateRow) {
    const message = getGeneratedMessage(c);
    navigator.clipboard.writeText(message);
    toast.success("Message copié dans le presse-papier");
  }

  function copyLink(c: CandidateRow) {
    if (!c.phone) {
      toast.error("Numéro de téléphone manquant");
      return;
    }
    const message = getGeneratedMessage(c);
    const link = buildWhatsAppLink(c.phone, message);
    navigator.clipboard.writeText(link);
    toast.success("Lien WhatsApp copié");
  }

  function showPreview(c: CandidateRow) {
    setPreviewMessage(getGeneratedMessage(c));
    setSelectedCandidateId(c.id);
  }

  // ─── Campagne groupée ──────────────────────────────────────────────────────
  function launchBulkCampaign() {
    const targets = filtered.filter((c) => !!c.phone);
    if (targets.length === 0) {
      toast.error("Aucun candidat avec numéro de téléphone dans la sélection");
      return;
    }
    targets.forEach((c, i) => {
      setTimeout(() => {
        const message = getGeneratedMessage(c);
        const link = buildWhatsAppLink(c.phone!, message);
        window.open(link, "_blank");
      }, i * 800);
    });
    toast.success(`Campagne lancée pour ${targets.length} candidat(s)`);
  }

  // ─── Export CSV ────────────────────────────────────────────────────────────
  function exportCSV() {
    const rows = [
      ["Prénom", "Nom", "Téléphone", "Téléphone normalisé", "Email", "Catégorie", "Lien WhatsApp"],
      ...filtered.map((c) => {
        const msg = getGeneratedMessage(c);
        const link = c.phone ? buildWhatsAppLink(c.phone, msg) : "";
        const normalized = c.phone ? normalizePhone(c.phone) : "";
        return [c.firstName, c.lastName, c.phone ?? "", normalized, c.email ?? "", c.category ?? "", link];
      }),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `whatsapp-candidats-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  }

  const currentTemplate = WHATSAPP_TEMPLATES.find((t) => t.type === selectedTemplate);

  // ─── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* ─── En-tête ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-xl">
                📱
              </span>
              Centre WhatsApp
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Plateforme de communication officielle — Miss &amp; Mister Dour 2026
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
            <button
              onClick={launchBulkCampaign}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium transition-colors text-sm"
            >
              <Zap className="w-4 h-4" />
              Campagne groupée ({filtered.filter((c) => !!c.phone).length})
            </button>
          </div>
        </div>

        {/* ─── Statistiques rapides ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total candidats", value: candidates.length, icon: <Users className="w-5 h-5" />, color: "text-blue-400" },
            { label: "Avec téléphone", value: withPhone, icon: <Phone className="w-5 h-5" />, color: "text-green-400" },
            { label: "Sans téléphone", value: withoutPhone, icon: <AlertCircle className="w-5 h-5" />, color: "text-red-400" },
            { label: "Sélectionnés", value: filtered.filter((c) => !!c.phone).length, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-[#C87941]" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
              <div className={`${stat.color} mb-2`}>{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ─── Onglets ─────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-gray-900/60 border border-gray-700 rounded-xl p-1">
          {([
            { id: "messaging" as TabId, label: "Messagerie", icon: <MessageCircle className="w-4 h-4" /> },
            { id: "history" as TabId, label: "Historique", icon: <History className="w-4 h-4" /> },
            { id: "stats" as TabId, label: "Statistiques", icon: <BarChart3 className="w-4 h-4" /> },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? "bg-green-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Onglet Messagerie ───────────────────────────────────────────── */}
        {activeTab === "messaging" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ─── Panneau gauche : Template + Filtres ─────────────────────── */}
            <div className="space-y-4">

              {/* Sélection du template */}
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 space-y-3">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#C87941]" />
                  Template de message
                </h2>
                <div className="space-y-2">
                  {WHATSAPP_TEMPLATES.map((t) => (
                    <button
                      key={t.type}
                      onClick={() => setSelectedTemplate(t.type)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm ${
                        selectedTemplate === t.type
                          ? "bg-green-500/10 border-green-500/40 text-white"
                          : "bg-gray-800/50 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
                      }`}
                    >
                      <span className="mr-2">{t.emoji}</span>
                      {t.label}
                    </button>
                  ))}
                </div>

                {selectedTemplate === "personnalise" && (
                  <div className="mt-3">
                    <label className="text-xs text-gray-400 block mb-1">Votre message personnalisé</label>
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      rows={5}
                      placeholder="Bonjour [Prénom],&#10;&#10;Votre message ici..."
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm resize-none focus:border-green-500 focus:outline-none"
                    />
                  </div>
                )}

                {currentTemplate && (
                  <p className="text-xs text-gray-500 italic mt-2">
                    {currentTemplate.description}
                  </p>
                )}
              </div>

              {/* Filtres */}
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 space-y-3">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#C87941]" />
                  Filtres
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Rechercher un candidat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-green-500 focus:outline-none"
                  />
                </div>
                <select
                  value={filterPhone}
                  onChange={(e) => setFilterPhone(e.target.value as typeof filterPhone)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-green-500 focus:outline-none"
                >
                  <option value="all">Tous les candidats</option>
                  <option value="with_phone">Avec numéro de téléphone</option>
                  <option value="no_phone">Sans numéro de téléphone</option>
                </select>
              </div>

              {/* Info API */}
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Wifi className="w-4 h-4 text-[#C87941]" />
                  Mode d'envoi
                </h2>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex items-start gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-green-400 font-medium">wa.me (actif)</span>
                      <p className="mt-0.5">Ouvre WhatsApp avec le message pré-rempli. Fonctionne sans configuration.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-gray-800/60 border border-gray-700 rounded-lg">
                    <WifiOff className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-500 font-medium">API Meta (optionnel)</span>
                      <p className="mt-0.5">Envoi automatique. Requiert META_WHATSAPP_TOKEN + META_PHONE_NUMBER_ID dans les secrets.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Panneau droit : Liste des candidats ─────────────────────── */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  {filtered.length} candidat(s)
                </h2>
                <button
                  onClick={() => { setSearchTerm(""); setFilterPhone("all"); }}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Réinitialiser
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  Chargement...
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
                  <Users className="w-8 h-8 mb-2 opacity-40" />
                  Aucun candidat trouvé
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {filtered.map((c) => {
                    const hasPhone = !!c.phone;
                    const isExpanded = expandedCandidate === c.id;
                    const isSelected = selectedCandidateId === c.id;
                    const isSendingApi = sendingApiId === c.id;

                    return (
                      <div
                        key={c.id}
                        className={`bg-gray-900/60 border rounded-xl transition-all ${
                          isSelected
                            ? "border-green-500/50 bg-green-500/5"
                            : "border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        {/* Ligne principale */}
                        <div className="flex items-center gap-3 p-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                            {c.profilePhotoUrl ? (
                              <img src={c.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-bold">
                                {c.firstName[0]}{c.lastName[0]}
                              </div>
                            )}
                          </div>

                          {/* Infos */}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-sm truncate">
                              {c.firstName} {c.lastName}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {hasPhone ? (
                                <span className="text-xs text-green-400 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {c.phone}
                                </span>
                              ) : (
                                <span className="text-xs text-red-400 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Pas de téléphone
                                </span>
                              )}
                              {c.category && (
                                <span className="text-xs text-gray-500 capitalize">{c.category}</span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                            <button
                              onClick={() => showPreview(c)}
                              title="Aperçu du message"
                              className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => copyMessage(c)}
                              title="Copier le message"
                              className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            {hasPhone && (
                              <>
                                <button
                                  onClick={() => copyLink(c)}
                                  title="Copier le lien WhatsApp"
                                  className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setShowQR(showQR === c.id ? null : c.id)}
                                  title="Afficher le QR code"
                                  className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                                >
                                  <QrCode className="w-4 h-4" />
                                </button>
                                {/* Bouton wa.me */}
                                <button
                                  onClick={() => openWhatsApp(c)}
                                  title="Ouvrir WhatsApp (wa.me)"
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-white text-xs font-medium transition-colors"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  wa.me
                                </button>
                                {/* Bouton API */}
                                <button
                                  onClick={() => sendViaApi(c)}
                                  disabled={isSendingApi}
                                  title="Envoyer via WhatsApp Business API"
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/80 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-xs font-medium transition-colors"
                                >
                                  {isSendingApi ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Wifi className="w-3.5 h-3.5" />
                                  )}
                                  API
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setExpandedCandidate(isExpanded ? null : c.id)}
                              className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* QR Code */}
                        {showQR === c.id && hasPhone && (
                          <div className="px-3 pb-3 flex items-center gap-4 border-t border-gray-700 pt-3">
                            <img
                              src={buildWhatsAppQRCode(buildWhatsAppLink(c.phone!, getGeneratedMessage(c)), 120)}
                              alt="QR Code WhatsApp"
                              className="w-28 h-28 rounded-lg bg-white p-1"
                            />
                            <div className="text-xs text-gray-400">
                              <p className="font-medium text-white mb-1">QR Code WhatsApp</p>
                              <p>Scannez ce code pour ouvrir directement la conversation avec le message pré-rempli.</p>
                              <p className="mt-2 text-gray-500">Template : <span className="text-[#C87941]">{currentTemplate?.label}</span></p>
                            </div>
                          </div>
                        )}

                        {/* Aperçu du message */}
                        {isExpanded && (
                          <div className="px-3 pb-3 border-t border-gray-700 pt-3">
                            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Aperçu du message</p>
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap bg-gray-800/60 rounded-lg p-3 font-sans leading-relaxed max-h-48 overflow-y-auto">
                              {getGeneratedMessage(c)}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Onglet Historique ───────────────────────────────────────────── */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-[#C87941]" />
                Historique des envois WhatsApp Business API
              </h2>
              <button
                onClick={() => refetchLogs()}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Actualiser
              </button>
            </div>

            {logsLoading ? (
              <div className="flex items-center justify-center h-40 text-gray-500">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                Chargement de l'historique...
              </div>
            ) : !logsData || logsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-sm bg-gray-900/40 border border-gray-700 rounded-xl">
                <History className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">Aucun message envoyé via l'API</p>
                <p className="text-xs mt-1 text-gray-600">Les envois via wa.me ne sont pas tracés ici.</p>
                <p className="text-xs mt-1 text-gray-600">Configurez META_WHATSAPP_TOKEN pour activer le traçage automatique.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {logsData.map((log) => (
                  <div key={log.id} className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 flex items-start gap-4">
                    {/* Statut */}
                    <div className="flex-shrink-0 mt-0.5">
                      {log.status === "read" ? (
                        <CheckCheck className="w-5 h-5 text-blue-400" />
                      ) : log.status === "delivered" ? (
                        <CheckCheck className="w-5 h-5 text-green-400" />
                      ) : log.status === "sent" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-medium text-white text-sm">{log.candidateName}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            log.status === "read" ? "bg-blue-500/20 text-blue-300" :
                            log.status === "delivered" ? "bg-green-500/20 text-green-300" :
                            log.status === "sent" ? "bg-green-700/20 text-green-500" :
                            "bg-red-500/20 text-red-300"
                          }`}>
                            {log.status === "read" ? "Lu" :
                             log.status === "delivered" ? "Livré" :
                             log.status === "sent" ? "Envoyé" : "Échec"}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(log.sentAt).toLocaleString("fr-BE")}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {log.phone}
                        {log.templateType && (
                          <span className="text-[#C87941]">· {log.templateType}</span>
                        )}
                      </div>
                      {log.message && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2 bg-gray-800/40 rounded p-2">
                          {log.message}
                        </p>
                      )}
                      {log.errorMessage && (
                        <p className="text-xs text-red-400 mt-1">⚠️ {log.errorMessage}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Onglet Statistiques ─────────────────────────────────────────── */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#C87941]" />
              Statistiques WhatsApp Business API
            </h2>

            {statsLoading ? (
              <div className="flex items-center justify-center h-40 text-gray-500">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                Chargement...
              </div>
            ) : !statsData || statsData.total === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-sm bg-gray-900/40 border border-gray-700 rounded-xl">
                <BarChart3 className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">Aucune donnée disponible</p>
                <p className="text-xs mt-1 text-gray-600">Les statistiques apparaîtront après les premiers envois via l'API.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: "Total envoyés", value: statsData.total, color: "text-white", bg: "bg-gray-800/60" },
                  { label: "Succès", value: statsData.sent, color: "text-green-400", bg: "bg-green-500/10" },
                  { label: "Livrés", value: statsData.delivered, color: "text-green-300", bg: "bg-green-500/10" },
                  { label: "Lus", value: statsData.read, color: "text-blue-400", bg: "bg-blue-500/10" },
                  { label: "Échecs", value: statsData.failed, color: "text-red-400", bg: "bg-red-500/10" },
                  { label: "7 derniers jours", value: statsData.recent, color: "text-[#C87941]", bg: "bg-[#C87941]/10" },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.bg} border border-gray-700 rounded-xl p-4 text-center`}>
                    <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Taux de succès */}
            {statsData && statsData.total > 0 && (
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-5">
                <h3 className="text-sm font-medium text-white mb-4">Taux de livraison</h3>
                <div className="space-y-3">
                  {[
                    { label: "Envoyés avec succès", value: statsData.sent, total: statsData.total, color: "bg-green-500" },
                    { label: "Livrés", value: statsData.delivered, total: statsData.total, color: "bg-green-400" },
                    { label: "Lus", value: statsData.read, total: statsData.total, color: "bg-blue-400" },
                    { label: "Échecs", value: statsData.failed, total: statsData.total, color: "bg-red-500" },
                  ].map((item) => {
                    const pct = statsData.total > 0 ? Math.round((item.value / statsData.total) * 100) : 0;
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{item.label}</span>
                          <span className="text-white">{item.value} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Modal aperçu message ─────────────────────────────────────────── */}
        {previewMessage && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewMessage(null)}
          >
            <div
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <span className="text-xl">{currentTemplate?.emoji}</span>
                  {currentTemplate?.label}
                </h3>
                <button onClick={() => setPreviewMessage(null)} className="text-gray-500 hover:text-white">✕</button>
              </div>
              <div className="bg-green-950/30 border border-green-800/30 rounded-xl p-4 mb-4">
                <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-relaxed max-h-72 overflow-y-auto">
                  {previewMessage}
                </pre>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { navigator.clipboard.writeText(previewMessage); toast.success("Copié !"); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copier
                </button>
                <button
                  onClick={() => {
                    const c = filtered.find((x) => x.id === selectedCandidateId);
                    if (c) openWhatsApp(c);
                    setPreviewMessage(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white text-sm font-medium transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Ouvrir WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Footer info ─────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-gray-600 pt-4 border-t border-gray-800">
          Tous les messages sont générés avec la signature officielle{" "}
          <span className="text-[#C87941]">Julien P. / By Js-Innov.IA</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
