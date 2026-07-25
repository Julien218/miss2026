import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Bell, BellOff, Mail, MailOpen, Monitor, MonitorOff,
  Settings, Send, Clock, CheckCircle, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, RefreshCw, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────
type Priority = "low" | "normal" | "high" | "urgent";
type Category = "admin" | "candidate" | "both";
type Status = "pending" | "sent" | "failed" | "read";

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "text-gray-400 bg-gray-400/10 border-gray-400/30",
  normal: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  high: "text-orange-400 bg-orange-400/10 border-orange-400/30",
  urgent: "text-red-400 bg-red-400/10 border-red-400/30",
};

const CATEGORY_LABELS: Record<Category, string> = {
  admin: "Admin",
  candidate: "Candidat",
  both: "Admin + Candidat",
};

const CATEGORY_COLORS: Record<Category, string> = {
  admin: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  candidate: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  both: "bg-green-500/20 text-green-300 border-green-500/30",
};

const STATUS_ICONS: Record<Status, React.ReactNode> = {
  pending: <Clock className="w-3 h-3 text-yellow-400" />,
  sent: <CheckCircle className="w-3 h-3 text-green-400" />,
  failed: <XCircle className="w-3 h-3 text-red-400" />,
  read: <Eye className="w-3 h-3 text-gray-400" />,
};

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-amber-500" : "bg-gray-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── Composant principal ───────────────────────────────────────────────────────
export default function AdminNotifications() {
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualBody, setManualBody] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualPriority, setManualPriority] = useState<Priority>("normal");
  const [manualRecipient, setManualRecipient] = useState<"admin" | "candidate" | "super_admin">("admin");

  // ─── Queries ───────────────────────────────────────────────────────────────
  const { data: settings, refetch: refetchSettings, isLoading: loadingSettings } =
    trpc.notificationsAdmin.getSettings.useQuery();

  const { data: logData, refetch: refetchLog, isLoading: loadingLog } =
    trpc.notificationsAdmin.getLog.useQuery({ limit: 50, status: "all" });

  const { data: unread, refetch: refetchUnread } =
    trpc.notificationsAdmin.getUnreadCount.useQuery();

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const updateSetting = trpc.notificationsAdmin.updateSetting.useMutation({
    onSuccess: () => { refetchSettings(); toast.success("Paramètre mis à jour"); },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const markAllRead = trpc.notificationsAdmin.markAllAsRead.useMutation({
    onSuccess: () => { refetchLog(); refetchUnread(); toast.success("Toutes les notifications marquées comme lues"); },
  });

  const markOneRead = trpc.notificationsAdmin.markAsRead.useMutation({
    onSuccess: () => { refetchLog(); refetchUnread(); },
  });

  const sendManual = trpc.notificationsAdmin.sendManual.useMutation({
    onSuccess: (data) => {
      setSendModalOpen(false);
      setManualTitle(""); setManualBody(""); setManualEmail("");
      refetchLog(); refetchUnread();
      toast.success(data.emailSent ? "Notification envoyée (email + dashboard)" : "Notification ajoutée au dashboard");
    },
    onError: () => toast.error("Erreur lors de l'envoi"),
  });

  // ─── Grouper les settings par catégorie ───────────────────────────────────
  type SettingItem = NonNullable<typeof settings>[0];
  const grouped = (settings ?? []).reduce((acc: Record<Category, SettingItem[]>, s: SettingItem) => {
    const cat = s.category as Category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {} as Record<Category, SettingItem[]>);

  const activeCount = (settings ?? []).filter((s: SettingItem) => s.isActive).length;
  const totalCount = (settings ?? []).length;
  const unreadCount = unread?.count ?? 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-400 flex items-center gap-3">
            <Bell className="w-8 h-8" />
            Gestion des Notifications
          </h1>
          <p className="text-gray-400 mt-1">
            Configuration et journal des notifications — Miss & Mister Dour 2026
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => { refetchSettings(); refetchLog(); refetchUnread(); }}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
                <Send className="w-4 h-4 mr-2" />
                Envoyer une notification
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#111] border-amber-500/30 text-white max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-amber-400 flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Notification manuelle
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label className="text-gray-300">Titre *</Label>
                  <Input
                    value={manualTitle}
                    onChange={e => setManualTitle(e.target.value)}
                    placeholder="Ex: Ouverture des votes"
                    className="bg-[#1a1a1a] border-gray-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Message *</Label>
                  <Textarea
                    value={manualBody}
                    onChange={e => setManualBody(e.target.value)}
                    placeholder="Contenu de la notification..."
                    className="bg-[#1a1a1a] border-gray-700 text-white mt-1 min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Destinataire</Label>
                    <Select value={manualRecipient} onValueChange={(v) => setManualRecipient(v as typeof manualRecipient)}>
                      <SelectTrigger className="bg-[#1a1a1a] border-gray-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-gray-700">
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="candidate">Candidat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Priorité</Label>
                    <Select value={manualPriority} onValueChange={(v) => setManualPriority(v as Priority)}>
                      <SelectTrigger className="bg-[#1a1a1a] border-gray-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-gray-700">
                        <SelectItem value="low">Faible</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Email destinataire (optionnel)</Label>
                  <Input
                    value={manualEmail}
                    onChange={e => setManualEmail(e.target.value)}
                    placeholder="email@exemple.com"
                    type="email"
                    className="bg-[#1a1a1a] border-gray-700 text-white mt-1"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => sendManual.mutate({
                      title: manualTitle,
                      body: manualBody,
                      recipientType: manualRecipient,
                      recipientEmail: manualEmail || undefined,
                      priority: manualPriority,
                    })}
                    disabled={!manualTitle || !manualBody || sendManual.isPending}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold"
                  >
                    {sendManual.isPending ? "Envoi..." : "Envoyer"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSendModalOpen(false)}
                    className="border-gray-700 text-gray-300"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ─── Stats ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Types actifs", value: `${activeCount}/${totalCount}`, icon: <Bell className="w-5 h-5 text-amber-400" />, color: "border-amber-500/30" },
          { label: "Non lues", value: unreadCount, icon: <BellOff className="w-5 h-5 text-red-400" />, color: "border-red-500/30" },
          { label: "Total journal", value: logData?.length ?? 0, icon: <Clock className="w-5 h-5 text-blue-400" />, color: "border-blue-500/30" },
          { label: "Envoyées", value: (logData ?? []).filter((l: { status: string }) => l.status === "sent" || l.status === "read").length, icon: <CheckCircle className="w-5 h-5 text-green-400" />, color: "border-green-500/30" },
        ].map((stat: { label: string; value: string | number; icon: React.ReactNode; color: string }, i: number) => (
          <Card key={i} className={`bg-[#111] ${stat.color} border`}>
            <CardContent className="p-4 flex items-center gap-3">
              {stat.icon}
              <div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Tabs ───────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="settings">
        <TabsList className="bg-[#1a1a1a] border border-gray-800 mb-6">
          <TabsTrigger value="settings" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Settings className="w-4 h-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="log" className="data-[state=active]:bg-amber-500 data-[state=active]:text-black">
            <Clock className="w-4 h-4 mr-2" />
            Journal
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── Onglet Configuration ──────────────────────────────────────────── */}
        <TabsContent value="settings">
          {loadingSettings ? (
            <div className="text-center py-12 text-gray-400">Chargement des paramètres...</div>
          ) : (
            <div className="space-y-6">
              {(["both", "admin", "candidate"] as Category[]).map(cat => {
                const items = grouped[cat] ?? [];
                if (items.length === 0) return null;
                return (
                  <Card key={cat} className="bg-[#111] border-gray-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${CATEGORY_COLORS[cat]}`}>
                          {CATEGORY_LABELS[cat]}
                        </span>
                        <span className="text-gray-400 text-sm font-normal">
                          {items.filter((i: SettingItem) => i?.isActive).length}/{items.length} actifs
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {items?.map((setting: SettingItem) => {
                        if (!setting) return null;
                        const priority = setting.priority as Priority;
                        return (
                          <div
                            key={setting.eventType}
                            className={`p-4 rounded-lg border transition-all ${
                              setting.isActive
                                ? "bg-[#1a1a1a] border-gray-700"
                                : "bg-[#0f0f0f] border-gray-800 opacity-60"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-semibold text-white text-sm">{setting.label}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[priority]}`}>
                                    {priority}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mb-3">{setting.description}</p>
                                <div className="flex items-center gap-6 flex-wrap">
                                  {/* Toggle Email */}
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs text-gray-400">Email</span>
                                    <Toggle
                                      enabled={!!setting.emailEnabled && !!setting.isActive}
                                      disabled={!setting.isActive}
                                      onChange={(v) => updateSetting.mutate({
                                        eventType: setting.eventType,
                                        emailEnabled: v,
                                      })}
                                    />
                                  </div>
                                  {/* Toggle Dashboard */}
                                  <div className="flex items-center gap-2">
                                    <Monitor className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs text-gray-400">Dashboard</span>
                                    <Toggle
                                      enabled={!!setting.dashboardEnabled && !!setting.isActive}
                                      disabled={!setting.isActive}
                                      onChange={(v) => updateSetting.mutate({
                                        eventType: setting.eventType,
                                        dashboardEnabled: v,
                                      })}
                                    />
                                  </div>
                                  {/* Priorité */}
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-3.5 h-3.5 text-gray-400" />
                                    <select
                                      value={priority}
                                      onChange={(e) => updateSetting.mutate({
                                        eventType: setting.eventType,
                                        priority: e.target.value as Priority,
                                      })}
                                      disabled={!setting.isActive}
                                      className="text-xs bg-[#222] border border-gray-700 rounded px-2 py-1 text-gray-300 disabled:opacity-50"
                                    >
                                      <option value="low">Faible</option>
                                      <option value="normal">Normal</option>
                                      <option value="high">Haute</option>
                                      <option value="urgent">Urgente</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                              {/* Toggle global actif/inactif */}
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                <Toggle
                                  enabled={!!setting.isActive}
                                  onChange={(v) => updateSetting.mutate({
                                    eventType: setting.eventType,
                                    isActive: v,
                                  })}
                                />
                                <span className="text-xs text-gray-500">
                                  {setting.isActive ? "Actif" : "Inactif"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── Onglet Journal ────────────────────────────────────────────────── */}
        <TabsContent value="log">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-200">Journal des notifications</h2>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllRead.mutate()}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Tout marquer comme lu
              </Button>
            )}
          </div>
          {loadingLog ? (
            <div className="text-center py-12 text-gray-400">Chargement du journal...</div>
          ) : !logData || logData.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">Aucune notification dans le journal</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logData.map((log: typeof logData[0]) => {
                const isUnread = log.status === "sent" && !log.readAt;
                const priority = log.priority as Priority;
                const status = log.status as Status;
                return (
                  <div
                    key={log.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isUnread
                        ? "bg-amber-500/5 border-amber-500/30"
                        : "bg-[#111] border-gray-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-0.5">{STATUS_ICONS[status]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`font-semibold text-sm ${isUnread ? "text-white" : "text-gray-300"}`}>
                              {log.title}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded border ${PRIORITY_COLORS[priority]}`}>
                              {priority}
                            </span>
                            {log.emailSent ? (
                              <span className="text-xs text-green-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> Email envoyé
                              </span>
                            ) : null}
                          </div>
                          {log.body && (
                            <p className="text-xs text-gray-400 mb-1 line-clamp-2">{log.body}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{log.eventType}</span>
                            <span>•</span>
                            <span>{new Date(log.createdAt).toLocaleString("fr-BE")}</span>
                            {log.recipientEmail && (
                              <>
                                <span>•</span>
                                <span>{log.recipientEmail}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {isUnread && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markOneRead.mutate({ id: log.id })}
                          className="text-gray-500 hover:text-gray-300 shrink-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
