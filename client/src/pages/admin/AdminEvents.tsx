/**
 * AdminEvents.tsx — Gestion des événements
 * Calendrier et gestion des événements du concours Miss & Mister Dour
 */
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, Plus, MapPin, Clock, Edit2, Trash2, Star, Lightbulb, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { BRANDING } from "@/config/branding";

interface EventItem {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: "selection" | "finale" | "gala" | "rehearsal" | "other";
  highlight?: boolean;
}

const TYPE_LABELS: Record<EventItem["type"], string> = {
  selection: "Sélection",
  finale: "Finale",
  gala: "Gala",
  rehearsal: "Répétition",
  other: "Autre",
};

const TYPE_COLORS: Record<EventItem["type"], string> = {
  selection: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  finale: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  gala: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  rehearsal: "bg-green-500/20 text-green-400 border-green-500/30",
  other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 1,
    title: "Séance de sélection — Candidats",
    date: "",
    time: "14:00",
    location: "Centre Sportif d'Elouges",
    description: "Première séance de sélection officielle pour les candidats Miss & Mister Dour 2027. Date à confirmer.",
    type: "selection",
  },
  {
    id: 2,
    title: "Répétition générale",
    date: "",
    time: "10:00",
    location: "Centre Sportif d'Elouges",
    description: "Répétition générale avant la soirée de clôture.",
    type: "rehearsal",
  },
  {
    id: 3,
    title: `${BRANDING.closingNight.label} — Soirée de Clôture`,
    date: BRANDING.closingNight.dateISO || "",
    time: BRANDING.closingNight.timeDisplay,
    location: BRANDING.closingNight.venue,
    description: `Grande finale Miss & Mister Dour sur le thème ${BRANDING.closingNight.label}.`,
    type: "finale",
    highlight: true,
  },
];

export default function AdminEvents() {
  const [events, setEvents] = useState<EventItem[]>(DEFAULT_EVENTS);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<EventItem | null>(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    type: "other" as EventItem["type"],
    highlight: false,
  });

  const openNew = () => {
    setEditItem(null);
    setForm({ title: "", date: "", time: "", location: "", description: "", type: "other", highlight: false });
    setOpen(true);
  };

  const openEdit = (ev: EventItem) => {
    setEditItem(ev);
    setForm({ title: ev.title, date: ev.date, time: ev.time, location: ev.location, description: ev.description, type: ev.type, highlight: !!ev.highlight });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.date) {
      toast.error("Le titre et la date sont obligatoires.");
      return;
    }
    if (editItem) {
      setEvents((prev) => prev.map((e) => e.id === editItem.id ? { ...editItem, ...form } : e));
      toast.success("Événement mis à jour !");
    } else {
      setEvents((prev) => [...prev, { id: Date.now(), ...form }]);
      toast.success("Événement créé !");
    }
    setOpen(false);
  };

  const handleDelete = (id: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    toast.success("Événement supprimé.");
  };

  const sorted = [...events].sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-400" />
              Gestion des Événements
            </h1>
            <p className="text-gray-400 text-sm mt-1">Calendrier et planning du concours</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="gap-2" style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)", color: "#0A0A0F" }}>
                <Plus className="w-4 h-4" />
                Nouvel événement
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
              <DialogHeader>
                <DialogTitle>{editItem ? "Modifier l'événement" : "Créer un événement"}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Remplissez les informations de l'événement.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1">
                  <Label>Titre *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nom de l'événement" className="bg-gray-800 border-gray-600" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Date *</Label>
                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-gray-800 border-gray-600" />
                  </div>
                  <div className="space-y-1">
                    <Label>Heure</Label>
                    <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="bg-gray-800 border-gray-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Lieu</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Adresse ou salle" className="bg-gray-800 border-gray-600" />
                </div>
                <div className="space-y-1">
                  <Label>Type</Label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as EventItem["type"] })}
                    className="w-full rounded-md bg-gray-800 border border-gray-600 text-white px-3 py-2 text-sm"
                  >
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Détails de l'événement…" className="bg-gray-800 border-gray-600 resize-none" rows={3} />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="highlight"
                    checked={form.highlight}
                    onChange={(e) => setForm({ ...form, highlight: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="highlight" className="cursor-pointer">Événement mis en avant (★)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} className="border-gray-600">Annuler</Button>
                <Button onClick={handleSave} style={{ background: "linear-gradient(135deg, #C87941, #D4AF37)", color: "#0A0A0F" }}>
                  {editItem ? "Enregistrer" : "Créer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["selection", "rehearsal", "finale", "gala"] as EventItem["type"][]).map((type) => (
            <Card key={type} className="bg-gray-900/60 border-gray-700">
              <CardContent className="pt-4">
                <p className="text-xs text-gray-400 mb-1">{TYPE_LABELS[type]}</p>
                <p className="text-2xl font-bold text-white">{events.filter((e) => e.type === type).length}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Liste des événements */}
        <Card className="bg-gray-900/60 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Calendrier des événements</CardTitle>
            <CardDescription className="text-gray-400">{sorted.length} événement(s) planifié(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sorted.map((ev) => (
                <div
                  key={ev.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    ev.highlight
                      ? "bg-yellow-500/5 border-yellow-500/30 hover:bg-yellow-500/10"
                      : "bg-gray-800/50 border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  {/* Date */}
                  <div className="flex-shrink-0 text-center w-12">
                    {ev.date ? (
                      <>
                        <p className="text-xs text-gray-400">{new Date(ev.date + "T00:00:00").toLocaleDateString("fr-BE", { month: "short" }).toUpperCase()}</p>
                        <p className="text-2xl font-bold text-white leading-none">{new Date(ev.date + "T00:00:00").getDate()}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-gray-400">À</p>
                        <p className="text-sm font-bold text-gray-400 leading-none">DÉF.</p>
                      </>
                    )}
                  </div>
                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {ev.highlight && <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                      <p className="font-semibold text-white truncate">{ev.title}</p>
                      <Badge className={`text-xs border ${TYPE_COLORS[ev.type]} flex-shrink-0`}>{TYPE_LABELS[ev.type]}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {ev.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{ev.time}
                        </span>
                      )}
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{ev.location}
                        </span>
                      )}
                    </div>
                    {ev.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ev.description}</p>}
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button size="icon" variant="ghost" className="w-8 h-8 text-gray-400 hover:text-white" onClick={() => openEdit(ev)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="w-8 h-8 text-gray-400 hover:text-red-400" onClick={() => handleDelete(ev.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {sorted.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  Aucun événement planifié. Cliquez sur "Nouvel événement" pour commencer.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <ProposalsValidationPanel />
      </div>
    </DashboardLayout>
  );
}

/**
 * Panneau de validation des propositions de sorties (Olivier / admin).
 * Approuver -> la sortie entre au calendrier officiel avec priorité.
 * Refuser -> motif transmis au membre.
 */
function ProposalsValidationPanel() {
  const { data: pending = [], refetch } = trpc.proposals.listPending.useQuery(undefined);

  const approveMutation = trpc.proposals.approve.useMutation({
    onSuccess: () => {
      toast.success("Proposition validée — la sortie entre au calendrier officiel.");
      refetch();
    },
    onError: (error) => toast.error(error.message || "Erreur lors de la validation"),
  });

  const rejectMutation = trpc.proposals.reject.useMutation({
    onSuccess: () => {
      toast.success("Proposition refusée — le membre a été notifié.");
      refetch();
    },
    onError: (error) => toast.error(error.message || "Erreur lors du refus"),
  });

  const handleReject = (id: number, title: string) => {
    const note = window.prompt(
      `Motif du refus pour « ${title} » (transmis au membre) :`,
      ""
    );
    if (note === null) return; // annulé
    rejectMutation.mutate({ id, note: note || undefined });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Propositions de sorties des membres
        </CardTitle>
        <CardDescription>
          Sorties proposées par les candidats et bénévoles. La validation les ajoute
          au calendrier officiel — une date déjà occupée ne peut pas être proposée,
          et les points officiels du calendrier gardent la priorité d'affichage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <p className="text-gray-400 italic">Aucune proposition en attente de validation.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((p: {
              id: number;
              title: string;
              description: string | null;
              proposedDate: Date;
              endDate: Date | null;
              location: string | null;
              proposerId: number;
            }) => {
              const dateStr = new Date(p.proposedDate).toLocaleDateString("fr-BE", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              });
              return (
                <div
                  key={p.id}
                  className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-lg bg-gray-800/60 border border-yellow-500/20"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{p.title}</p>
                    <p className="text-xs text-gray-400">
                      {dateStr}
                      {p.location ? ` · ${p.location}` : ""} · proposée par le membre #{p.proposerId}
                    </p>
                    {p.description && (
                      <p className="text-sm text-gray-300 mt-1">{p.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      onClick={() => approveMutation.mutate({ id: p.id })}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Valider
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      onClick={() => handleReject(p.id, p.title)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Refuser
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
