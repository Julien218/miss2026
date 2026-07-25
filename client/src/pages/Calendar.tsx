import { useState, useMemo, useCallback } from "react";
import { Calendar as BigCalendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Calendar as CalendarIcon, Plus, Users, MapPin, Clock } from "lucide-react";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: string;
    location?: string;
    description?: string;
    status: string;
  };
}

export default function Calendar() {
  const { user } = useAuth();
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [selectedContest, setSelectedContest] = useState<number>(1); // Default contest ID
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Fetch events
  const { data: events = [], refetch } = trpc.events.listByContest.useQuery({ contestId: selectedContest });
  const { data: userEvents = [] } = trpc.events.getUserEvents.useQuery(undefined, {
    enabled: !!user,
  });

  // Mutations
  const registerMutation = trpc.events.register.useMutation({
    onSuccess: () => {
      toast.success("Inscription réussie !");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'inscription");
    },
  });

  // Transform events for calendar
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.date),
      end: event.endDate ? new Date(event.endDate) : new Date(new Date(event.date).getTime() + (event.duration || 60) * 60000),
      resource: {
        type: event.type,
        location: event.location || undefined,
        description: event.description || undefined,
        status: event.status,
      },
    }));
  }, [events]);

  // Event style getter
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const typeColors: Record<string, string> = {
      rehearsal: "bg-blue-500",
      photo_session: "bg-purple-500",
      public_event: "bg-green-500",
      finale: "bg-red-500",
      other: "bg-gray-500",
    };

    const bgColor = typeColors[event.resource.type] || "bg-gray-500";

    return {
      className: `${bgColor} text-white rounded-md px-2 py-1 text-sm`,
    };
  }, []);

  // Handle event selection
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
  }, []);

  // Handle registration
  const handleRegister = async (eventId: number) => {
    if (!user) {
      toast.error("Vous devez être connecté pour vous inscrire");
      return;
    }

    registerMutation.mutate({ eventId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FFF8E8] to-[#F5EFE0] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#D4AF37] to-[#F4E4C1] rounded-xl shadow-lg">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-playfair font-bold bg-gradient-to-r from-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent">
                Calendrier des Événements
              </h1>
              <p className="text-[#8B7355] mt-1">Gérez et consultez tous les événements du concours</p>
            </div>
          </div>

          {user?.role === "admin" && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#D4AF37] to-[#B8941E] hover:from-[#B8941E] hover:to-[#D4AF37] text-white shadow-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Créer un événement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-playfair text-[#D4AF37]">
                    Créer un nouvel événement
                  </DialogTitle>
                </DialogHeader>
                <CreateEventForm
                  contestId={selectedContest}
                  onSuccess={() => {
                    setIsCreateDialogOpen(false);
                    refetch();
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Calendar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-[#D4AF37]/20">
          <BigCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700 }}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            messages={{
              next: "Suivant",
              previous: "Précédent",
              today: "Aujourd'hui",
              month: "Mois",
              week: "Semaine",
              day: "Jour",
              agenda: "Agenda",
              date: "Date",
              time: "Heure",
              event: "Événement",
              noEventsInRange: "Aucun événement dans cette période",
            }}
          />
        </div>

        {/* Event Details Dialog */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-playfair text-[#D4AF37]">
                  {selectedEvent.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#8B7355]">
                  <Clock className="w-5 h-5" />
                  <span>
                    {moment(selectedEvent.start).format("DD/MM/YYYY HH:mm")} -{" "}
                    {moment(selectedEvent.end).format("HH:mm")}
                  </span>
                </div>
                {selectedEvent.resource.location && (
                  <div className="flex items-center gap-2 text-[#8B7355]">
                    <MapPin className="w-5 h-5" />
                    <span>{selectedEvent.resource.location}</span>
                  </div>
                )}
                {selectedEvent.resource.description && (
                  <p className="text-[#8B7355]">{selectedEvent.resource.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#8B7355]">Type:</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/20 text-[#B8941E]">
                    {selectedEvent.resource.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#8B7355]">Statut:</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    {selectedEvent.resource.status}
                  </span>
                </div>

                {user && (
                  <Button
                    onClick={() => handleRegister(selectedEvent.id)}
                    disabled={registerMutation.isPending}
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] hover:from-[#B8941E] hover:to-[#D4AF37] text-white"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    {registerMutation.isPending ? "Inscription en cours..." : "S'inscrire à cet événement"}
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

// Create Event Form Component
function CreateEventForm({ contestId, onSuccess }: { contestId: number; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    type: "rehearsal" as "rehearsal" | "photo_session" | "public_event" | "finale" | "other",
    description: "",
    date: "",
    endDate: "",
    location: "",
    duration: 60,
    maxAttendees: 0,
    notes: "",
  });

  const createMutation = trpc.events.create.useMutation({
    onSuccess: () => {
      toast.success("Événement créé avec succès !");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      contestId,
      ...formData,
      date: new Date(formData.date),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      maxAttendees: formData.maxAttendees || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Type *</Label>
        <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rehearsal">Répétition</SelectItem>
            <SelectItem value="photo_session">Séance photo</SelectItem>
            <SelectItem value="public_event">Événement public</SelectItem>
            <SelectItem value="finale">Finale</SelectItem>
            <SelectItem value="other">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date de début *</Label>
          <Input
            id="date"
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">Date de fin</Label>
          <Input
            id="endDate"
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Lieu</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Durée (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="maxAttendees">Participants max</Label>
          <Input
            id="maxAttendees"
            type="number"
            value={formData.maxAttendees}
            onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>

      <Button
        type="submit"
        disabled={createMutation.isPending}
        className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] hover:from-[#B8941E] hover:to-[#D4AF37] text-white"
      >
        {createMutation.isPending ? "Création en cours..." : "Créer l'événement"}
      </Button>
    </form>
  );
}
