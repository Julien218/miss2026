/**
 * AdminAssistant.tsx — Interface de l'assistant IA "Miss & Mister Dour IA"
 *
 * Fonctionnalités :
 * - Chat libre avec l'assistant IA
 * - Tableau de bord des candidats avec taux de complétion
 * - Génération de messages personnalisés (WhatsApp, email)
 * - Liens WhatsApp directs
 * - Envoi de messages depuis l'administration
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Bot, Send, Users, MessageSquare, Phone, ExternalLink, Copy,
  CheckCircle, AlertTriangle, XCircle, Sparkles, Crown, RefreshCw,
  MessageCircle, Search, ChevronRight, Zap, Brain, Megaphone, X
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type MessageType = "profile_completion" | "vote_encouragement" | "event_reminder" | "congratulations" | "custom";
type Channel = "whatsapp" | "email" | "sms";

const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
  profile_completion: "📋 Rappel complétion profil",
  vote_encouragement: "🗳️ Encouragement votes",
  event_reminder: "📅 Rappel événement",
  congratulations: "🏆 Félicitations",
  custom: "✍️ Message personnalisé",
};

const COMPLETION_STATUS_CONFIG = {
  excellent: { label: "Excellent", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle, bar: "bg-green-500" },
  good:      { label: "Bon",       color: "bg-blue-500/20 text-blue-400 border-blue-500/30",   icon: CheckCircle, bar: "bg-blue-500" },
  incomplete:{ label: "Incomplet", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: AlertTriangle, bar: "bg-yellow-500" },
  critical:  { label: "Critique",  color: "bg-red-500/20 text-red-400 border-red-500/30",      icon: XCircle, bar: "bg-red-500" },
};

// ─── Composant principal ──────────────────────────────────────────────────────

export default function AdminAssistant() {
  const { user } = useAuth();

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Bonjour ! Je suis **Miss & Mister Dour IA**, votre assistant officiel.\n\nJe peux vous aider à :\n- 📊 Analyser les profils candidats\n- ✉️ Générer des messages personnalisés\n- 📱 Préparer vos communications WhatsApp\n- 🔍 Identifier les candidats nécessitant un suivi\n\nComment puis-je vous assister aujourd'hui ?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Candidats state
  const [contestId] = useState(1);
  const [filterStatus, setFilterStatus] = useState<"all" | "critical" | "incomplete" | "good" | "excellent">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);

  // Message generation state
  const [msgDialogOpen, setMsgDialogOpen] = useState(false);
  const [msgType, setMsgType] = useState<MessageType>("profile_completion");
  const [msgChannel, setMsgChannel] = useState<Channel>("whatsapp");
  const [msgCustomContext, setMsgCustomContext] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

  // Admin send state
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [adminMessageText, setAdminMessageText] = useState("");

  // Bulk campaign state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkThreshold, setBulkThreshold] = useState(50);
  const [bulkMsgType, setBulkMsgType] = useState<"profile_reminder" | "vote_call" | "event_info" | "welcome">("profile_reminder");
  const [bulkResults, setBulkResults] = useState<null | {
    total: number;
    threshold: number;
    withPhone?: number;
    withoutPhone?: number;
    results: Array<{
      candidateId: number;
      name: string;
      firstName: string;
      phone: string | null;
      percentage: number;
      status: string;
      profileUrl: string;
      message: string;
      whatsappLink: string | null;
      criticalMissingCount: number;
      hasPhone: boolean;
    }>;
    summary: string;
  }>(null);
  const [bulkStep, setBulkStep] = useState<"config" | "results">("config");

  // ─── Queries ──────────────────────────────────────────────────────────────

  const { data: candidatesData, isLoading: candidatesLoading, refetch: refetchCandidates } = trpc.assistant.listCandidatesStatus.useQuery(
    { contestId, filter: filterStatus },
    { enabled: !!user && (user.role === "admin" || user.role === "super_admin") }
  );

  const { data: selectedAnalysis, isLoading: analysisLoading } = trpc.assistant.analyzeCandidate.useQuery(
    { candidateId: selectedCandidateId! },
    { enabled: selectedCandidateId !== null }
  );

  // ─── Mutations ────────────────────────────────────────────────────────────

  const chatMutation = trpc.assistant.chat.useMutation({
    onSuccess: (data) => {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant" as const, content: typeof data.reply === "string" ? data.reply : String(data.reply), timestamp: data.timestamp },
      ]);
    },
    onError: (err) => {
      toast.error("Erreur assistant : " + err.message);
    },
  });

  const generateMsgMutation = trpc.assistant.generateMessage.useMutation({
    onSuccess: (data) => {
      setGeneratedMessage(data.message);
      setWhatsappLink(data.whatsappLink);
      toast.success("Message généré avec succès !");
    },
    onError: (err) => toast.error("Erreur génération : " + err.message),
  });

  const bulkCampaignMutation = trpc.assistant.bulkCampaign.useMutation({
    onSuccess: (data) => {
      setBulkResults(data);
      setBulkStep("results");
      toast.success(`Campagne générée : ${data.total} candidat(s) ciblé(s)`);
    },
    onError: (err) => toast.error("Erreur campagne : " + err.message),
  });

  const sendAdminMsgMutation = trpc.assistant.sendAdminMessage.useMutation({
    onSuccess: (data) => {
      toast.success(`Message envoyé à ${data.candidateName} !`);
      setSendDialogOpen(false);
      setAdminMessageText("");
    },
    onError: (err) => toast.error("Erreur envoi : " + err.message),
  });

  // ─── Effets ───────────────────────────────────────────────────────────────

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: chatInput, timestamp: new Date().toISOString() };
    setChatHistory((prev) => [...prev, userMsg]);
    chatMutation.mutate({
      message: chatInput,
      history: chatHistory.map((m) => ({ role: m.role, content: m.content })),
      contestId,
    });
    setChatInput("");
  };

  const handleGenerateMessage = () => {
    if (!selectedCandidateId) return;
    generateMsgMutation.mutate({
      candidateId: selectedCandidateId,
      messageType: msgType,
      channel: msgChannel,
      customContext: msgCustomContext || undefined,
    });
  };

  const handleSendAdminMessage = () => {
    if (!selectedCandidateId || !adminMessageText.trim()) return;
    sendAdminMsgMutation.mutate({
      candidateId: selectedCandidateId,
      message: adminMessageText,
      channel: "notification",
    });
  };

  const handleLaunchCampaign = () => {
    setBulkResults(null);
    setBulkStep("config");
    bulkCampaignMutation.mutate({
      contestId,
      threshold: bulkThreshold,
      messageType: bulkMsgType,
      baseUrl: window.location.origin,
    });
  };

  const handleResetCampaign = () => {
    setBulkResults(null);
    setBulkStep("config");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papiers !");
  };

  // ─── Filtrage candidats ───────────────────────────────────────────────────

  const filteredCandidates = useMemo(() => {
    if (!candidatesData?.candidates) return [];
    if (!searchQuery.trim()) return candidatesData.candidates;
    const q = searchQuery.toLowerCase();
    return candidatesData.candidates.filter((c) =>
      c.fullName.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }, [candidatesData, searchQuery]);

  // ─── Accès admin ──────────────────────────────────────────────────────────

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-64 gap-4 p-6">
          <Bot className="w-12 h-12 text-gray-600" />
          <p className="text-white">Accès réservé aux administrateurs</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = candidatesData?.stats;
  const selectedCandidate = filteredCandidates.find((c) => c.id === selectedCandidateId);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">

        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)" }}>
                <Brain className="w-7 h-7 text-black" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Miss & Mister Dour IA
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </h1>
              <p className="text-gray-400 text-sm">Assistant officiel · Powered by Js-Innov.IA</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => { setBulkDialogOpen(true); handleResetCampaign(); }}
              className="gap-2 font-semibold"
              style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)", color: "#0A0A0F" }}
            >
              <Megaphone className="w-4 h-4" />
              Campagne de rappel
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetchCandidates()} className="border-gray-600 text-gray-300 gap-2">
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Statistiques globales */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Total", value: stats.total, color: "text-white", bg: "bg-gray-800/60" },
              { label: "Excellent", value: stats.excellent, color: "text-green-400", bg: "bg-green-500/10" },
              { label: "Bon", value: stats.good, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Incomplet", value: stats.incomplete, color: "text-yellow-400", bg: "bg-yellow-500/10" },
              { label: "Critique", value: stats.critical, color: "text-red-400", bg: "bg-red-500/10" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center border border-gray-700/50`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        )}
        {stats && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/40 border border-gray-700/50">
            <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-gray-300">
              Taux de complétion moyen : <span className="font-bold text-white">{stats.avgCompletion}%</span>
              {stats.critical > 0 && (
                <span className="ml-3 text-red-400">⚠️ {stats.critical} candidat{stats.critical > 1 ? "s" : ""} en état critique</span>
              )}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ─── Colonne gauche : Liste candidats ─────────────────────────── */}
          <div className="xl:col-span-1 space-y-4">
            <Card className="bg-gray-900/60 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Users className="w-4 h-4 text-yellow-400" />
                  Candidats
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 text-sm bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                    <SelectTrigger className="h-8 w-28 text-xs bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="all" className="text-white text-xs">Tous</SelectItem>
                      <SelectItem value="critical" className="text-red-400 text-xs">Critique</SelectItem>
                      <SelectItem value="incomplete" className="text-yellow-400 text-xs">Incomplet</SelectItem>
                      <SelectItem value="good" className="text-blue-400 text-xs">Bon</SelectItem>
                      <SelectItem value="excellent" className="text-green-400 text-xs">Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {candidatesLoading ? (
                  <div className="p-4 text-center text-gray-400 text-sm">Chargement…</div>
                ) : filteredCandidates.length === 0 ? (
                  <div className="p-6 text-center">
                    <Crown className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="text-gray-400 text-sm">Aucun candidat trouvé</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto">
                    {filteredCandidates.map((c) => {
                      const cfg = COMPLETION_STATUS_CONFIG[c.completion.status as keyof typeof COMPLETION_STATUS_CONFIG];
                      const isSelected = c.id === selectedCandidateId;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCandidateId(c.id)}
                          className={`w-full text-left p-3 hover:bg-gray-800/60 transition-colors flex items-center gap-3 ${isSelected ? "bg-gray-800/80 border-l-2 border-yellow-500" : ""}`}
                        >
                          <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {c.profilePhoto ? (
                              <img src={c.profilePhoto} alt={c.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <Crown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{c.fullName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${c.completion.percentage}%` }} />
                              </div>
                              <span className="text-xs text-gray-400 flex-shrink-0">{c.completion.percentage}%</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ─── Colonne centrale : Détail candidat + actions ─────────────── */}
          <div className="xl:col-span-1 space-y-4">
            {selectedCandidateId && selectedAnalysis ? (
              <>
                {/* Fiche candidat */}
                <Card className="bg-gray-900/60 border-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white text-base">{selectedAnalysis.candidate.fullName}</CardTitle>
                        <CardDescription className="text-gray-400 text-xs mt-0.5">
                          {selectedAnalysis.candidate.category} · {selectedAnalysis.candidate.voteCount} votes
                        </CardDescription>
                      </div>
                      <Badge className={`border text-xs ${COMPLETION_STATUS_CONFIG[selectedAnalysis.completion.status as keyof typeof COMPLETION_STATUS_CONFIG]?.color}`}>
                        {COMPLETION_STATUS_CONFIG[selectedAnalysis.completion.status as keyof typeof COMPLETION_STATUS_CONFIG]?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Barre de complétion */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Complétion du profil</span>
                        <span className="font-bold text-white">{selectedAnalysis.completion.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${COMPLETION_STATUS_CONFIG[selectedAnalysis.completion.status as keyof typeof COMPLETION_STATUS_CONFIG]?.bar}`}
                          style={{ width: `${selectedAnalysis.completion.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{selectedAnalysis.completion.filledCount}/{selectedAnalysis.completion.totalFields} champs remplis</p>
                    </div>

                    {/* Champs manquants critiques */}
                    {selectedAnalysis.completion.criticalMissing.length > 0 && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-xs font-medium text-red-400 mb-1.5 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Champs critiques manquants
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {selectedAnalysis.completion.criticalMissing.map((f) => (
                            <span key={f.key} className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">{f.label}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Champs importants manquants */}
                    {selectedAnalysis.completion.importantMissing.length > 0 && (
                      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-xs font-medium text-yellow-400 mb-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Champs importants manquants
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {selectedAnalysis.completion.importantMissing.map((f) => (
                            <span key={f.key} className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">{f.label}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lien profil */}
                    <div className="flex items-center gap-2">
                      <Input value={selectedAnalysis.profileUrl} readOnly className="text-xs bg-gray-800 border-gray-600 text-gray-300 h-8" />
                      <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={() => copyToClipboard(selectedAnalysis.profileUrl)}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <a href={selectedAnalysis.profileUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs"
                        style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", color: "white" }}
                        onClick={() => setMsgDialogOpen(true)}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Générer message
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs border-gray-600"
                        onClick={() => setSendDialogOpen(true)}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Envoyer notif
                      </Button>
                    </div>

                    {/* Téléphone */}
                    {selectedAnalysis.candidate.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{selectedAnalysis.candidate.phone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-gray-900/60 border-gray-700">
                <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                  <Crown className="w-10 h-10 text-gray-600" />
                  <p className="text-gray-400 text-sm text-center">
                    Sélectionnez un candidat<br />pour voir son analyse
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ─── Colonne droite : Chat IA ──────────────────────────────────── */}
          <div className="xl:col-span-1">
            <Card className="bg-gray-900/60 border-gray-700 flex flex-col h-full" style={{ minHeight: "500px" }}>
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Bot className="w-4 h-4 text-yellow-400" />
                  Chat Assistant IA
                </CardTitle>
                <CardDescription className="text-gray-400 text-xs">Posez vos questions sur les candidats</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 p-3 gap-3">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ maxHeight: "350px" }}>
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5" style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)" }}>
                          <Brain className="w-3.5 h-3.5 text-black" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "text-white rounded-br-sm"
                            : "bg-gray-800 text-gray-200 rounded-bl-sm"
                        }`}
                        style={msg.role === "user" ? { background: "linear-gradient(135deg, #C87941, #D4AF37)", color: "#0A0A0F" } : {}}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2" style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)" }}>
                        <Brain className="w-3.5 h-3.5 text-black" />
                      </div>
                      <div className="bg-gray-800 px-3 py-2 rounded-2xl rounded-bl-sm">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2 flex-shrink-0">
                  <Input
                    placeholder="Votre question…"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                    className="bg-gray-800 border-gray-600 text-white text-sm"
                    disabled={chatMutation.isPending}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendChat}
                    disabled={chatMutation.isPending || !chatInput.trim()}
                    style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)" }}
                  >
                    <Send className="w-4 h-4 text-black" />
                  </Button>
                </div>

                {/* Suggestions rapides */}
                <div className="flex flex-wrap gap-1.5 flex-shrink-0">
                  {[
                    "Qui a le profil le plus incomplet ?",
                    "Combien de candidats sont en état critique ?",
                    "Quel candidat a le plus de votes ?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => { setChatInput(suggestion); }}
                      className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors border border-gray-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ─── Dialog : Génération de message ─────────────────────────────────── */}
      <Dialog open={msgDialogOpen} onOpenChange={setMsgDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Générer un message pour {selectedCandidate?.fullName}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              L'IA génère un message personnalisé avec signature officielle.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">Type de message</label>
                <Select value={msgType} onValueChange={(v) => setMsgType(v as MessageType)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {Object.entries(MESSAGE_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k} className="text-white">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">Canal</label>
                <Select value={msgChannel} onValueChange={(v) => setMsgChannel(v as Channel)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="whatsapp" className="text-white">📱 WhatsApp</SelectItem>
                    <SelectItem value="email" className="text-white">📧 Email</SelectItem>
                    <SelectItem value="sms" className="text-white">💬 SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(msgType === "custom" || msgType === "event_reminder") && (
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">Contexte personnalisé</label>
                <Textarea
                  value={msgCustomContext}
                  onChange={(e) => setMsgCustomContext(e.target.value)}
                  placeholder="Précisez le contexte du message…"
                  className="bg-gray-800 border-gray-600 text-white resize-none"
                  rows={2}
                />
              </div>
            )}

            <Button
              onClick={handleGenerateMessage}
              disabled={generateMsgMutation.isPending}
              className="w-full gap-2"
              style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)", color: "#0A0A0F" }}
            >
              <Sparkles className="w-4 h-4" />
              {generateMsgMutation.isPending ? "Génération en cours…" : "Générer le message"}
            </Button>

            {generatedMessage && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">{generatedMessage}</pre>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 border-gray-600 gap-1.5" onClick={() => copyToClipboard(generatedMessage)}>
                    <Copy className="w-3.5 h-3.5" /> Copier le message
                  </Button>
                  {whatsappLink && (
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button size="sm" className="w-full gap-1.5" style={{ background: "#25D366", color: "white" }}>
                        <MessageCircle className="w-3.5 h-3.5" /> Ouvrir WhatsApp
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Dialog : Envoi message admin ───────────────────────────────────── */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Envoyer une notification à {selectedCandidate?.fullName}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Le message sera envoyé via le système de notifications interne. La signature officielle sera ajoutée automatiquement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              value={adminMessageText}
              onChange={(e) => setAdminMessageText(e.target.value)}
              placeholder="Rédigez votre message officiel…"
              className="bg-gray-800 border-gray-600 text-white resize-none"
              rows={5}
            />
            <div className="p-3 rounded-lg bg-gray-800/60 border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Signature automatique :</p>
              <p className="text-xs text-gray-300 font-medium">Julien P.<br />By Js-Innov.IA</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-gray-600" onClick={() => setSendDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleSendAdminMessage}
                disabled={sendAdminMsgMutation.isPending || !adminMessageText.trim()}
                style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)", color: "#0A0A0F" }}
              >
                <Send className="w-4 h-4" />
                {sendAdminMsgMutation.isPending ? "Envoi…" : "Envoyer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* ─── Dialog : Campagne de rappel groupée ───────────────────────────── */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5" style={{ color: "#C87941" }} />
              Campagne de rappel groupée
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Génère des messages personnalisés et des liens WhatsApp pour tous les candidats dont le profil est incomplet.
            </DialogDescription>
          </DialogHeader>

          {bulkStep === "config" && (
            <div className="space-y-5">
              {/* Seuil */}
              <div className="space-y-2">
                <label className="text-sm text-gray-300 font-medium">Seuil de complétion (%)</label>
                <p className="text-xs text-gray-500">Cibler les candidats dont le profil est complété à moins de ce pourcentage.</p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={10}
                    max={90}
                    step={5}
                    value={bulkThreshold}
                    onChange={(e) => setBulkThreshold(Number(e.target.value))}
                    className="flex-1 accent-yellow-500"
                  />
                  <span className="text-2xl font-bold text-yellow-400 w-16 text-center">{bulkThreshold}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10% (très critique)</span>
                  <span>90% (presque complet)</span>
                </div>
              </div>

              {/* Type de message */}
              <div className="space-y-2">
                <label className="text-sm text-gray-300 font-medium">Type de message</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: "profile_reminder", label: "📋 Rappel profil", desc: "Demande de complétion du profil" },
                    { value: "vote_call",         label: "🗳️ Appel aux votes", desc: "Encourager le partage pour les votes" },
                    { value: "event_info",        label: "📅 Info événement", desc: "Rappel soirée de clôture" },
                    { value: "welcome",           label: "👑 Bienvenue",      desc: "Message d'accueil officiel" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBulkMsgType(opt.value)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        bulkMsgType === opt.value
                          ? "border-yellow-500 bg-yellow-500/10"
                          : "border-gray-700 bg-gray-800/40 hover:border-gray-600"
                      }`}
                    >
                      <p className="text-sm font-medium text-white">{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prévisualisation stats */}
              {stats && (
                <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700 space-y-2">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Estimation des candidats ciblés</p>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold" style={{ color: "#C87941" }}>
                      {(candidatesData?.candidates ?? []).filter((c) => c.completion.percentage < bulkThreshold).length}
                    </div>
                    <div>
                      <p className="text-sm text-white">candidat(s) concerné(s)</p>
                      <p className="text-xs text-gray-400">sur {stats.total} au total</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-gray-600 text-gray-300" onClick={() => setBulkDialogOpen(false)}>
                  Annuler
                </Button>
                <Button
                  className="flex-1 gap-2 font-semibold"
                  onClick={handleLaunchCampaign}
                  disabled={bulkCampaignMutation.isPending}
                  style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)", color: "#0A0A0F" }}
                >
                  <Megaphone className="w-4 h-4" />
                  {bulkCampaignMutation.isPending ? "Génération en cours…" : "Lancer la campagne"}
                </Button>
              </div>
            </div>
          )}

          {bulkStep === "results" && bulkResults && (
            <div className="space-y-4">
              {/* Résumé */}
              <div className="p-4 rounded-xl border" style={{ background: "rgba(200,121,65,0.1)", borderColor: "rgba(200,121,65,0.3)" }}>
                <p className="text-sm font-medium" style={{ color: "#D4AF37" }}>{bulkResults.summary}</p>
              </div>

              {bulkResults.total === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                  <p className="text-white font-medium">Tous les profils sont au-dessus du seuil !</p>
                  <p className="text-gray-400 text-sm mt-1">Aucun candidat à contacter pour ce critère.</p>
                </div>
              ) : (
                <>
                  {/* Liste des candidats */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {bulkResults.results.map((r) => (
                      <div key={r.candidateId} className="p-3 rounded-xl bg-gray-800/60 border border-gray-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4" style={{ color: "#C87941" }} />
                            <span className="text-white font-medium text-sm">{r.name}</span>
                            <Badge
                              className={`text-xs ${
                                r.status === "critical" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                                r.status === "incomplete" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                                "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              }`}
                            >
                              {r.percentage}%
                            </Badge>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => copyToClipboard(r.message)}
                              className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                              title="Copier le message"
                            >
                              <Copy className="w-3.5 h-3.5 text-gray-300" />
                            </button>
                            {r.whatsappLink ? (
                              <a href={r.whatsappLink} target="_blank" rel="noopener noreferrer">
                                <button
                                  className="p-1.5 rounded-lg transition-colors"
                                  style={{ background: "#25D366" }}
                                  title="Ouvrir WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                                </button>
                              </a>
                            ) : (
                              <button
                                className="p-1.5 rounded-lg bg-gray-700 opacity-40 cursor-not-allowed"
                                title="Pas de numéro de téléphone"
                                disabled
                              >
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Aperçu message */}
                        <details className="group">
                          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300 select-none">
                            Voir le message généré
                          </summary>
                          <pre className="mt-2 text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed p-2 rounded bg-gray-900/60">{r.message}</pre>
                        </details>
                      </div>
                    ))}
                  </div>

                  {/* Actions globales */}
                  <div className="flex gap-2 pt-2 border-t border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-600 text-gray-300 gap-1.5"
                      onClick={handleResetCampaign}
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Nouvelle campagne
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => {
                        const allMessages = bulkResults.results
                          .map((r) => `=== ${r.name} (${r.percentage}%) ===\n${r.message}`)
                          .join("\n\n");
                        copyToClipboard(allMessages);
                      }}
                      style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)", color: "#0A0A0F" }}
                    >
                      <Copy className="w-3.5 h-3.5" /> Copier tous les messages
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
