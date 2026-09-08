import { useState } from "react";
import { Bell, Check, Trash2, Filter, Calendar, Users, Trophy, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  type: "event" | "vote" | "message" | "system" | "achievement";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export default function Notifications() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | Notification["type"]>("all");

  // Mock data - à remplacer par trpc.notifications.list.useQuery()
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "event",
      title: "Nouvelle répétition programmée",
      message: "Une répétition de chorégraphie est prévue le 15 mars 2026 à 14h00 au Centre Sportif d'Elouges",
      timestamp: new Date("2026-02-16T10:30:00"),
      read: false,
      actionUrl: "/calendar",
    },
    {
      id: 2,
      type: "vote",
      title: "Nouveau vote reçu",
      message: "Vous avez reçu 5 nouveaux votes aujourd'hui ! Continuez comme ça !",
      timestamp: new Date("2026-02-16T09:15:00"),
      read: false,
      actionUrl: "/my-profile",
    },
    {
      id: 3,
      type: "message",
      title: "Nouveau message du jury",
      message: "Le jury a laissé un commentaire sur votre profil",
      timestamp: new Date("2026-02-15T18:45:00"),
      read: true,
      actionUrl: "/chat",
    },
    {
      id: 4,
      type: "achievement",
      title: "Nouveau badge débloqué !",
      message: "Félicitations ! Vous avez débloqué le badge 'Rising Star' 🌟",
      timestamp: new Date("2026-02-15T14:20:00"),
      read: true,
    },
    {
      id: 5,
      type: "system",
      title: "Mise à jour du système",
      message: "De nouvelles fonctionnalités sont disponibles sur la plateforme",
      timestamp: new Date("2026-02-14T12:00:00"),
      read: true,
    },
  ]);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "event":
        return <Calendar className="w-5 h-5" />;
      case "vote":
        return <Trophy className="w-5 h-5" />;
      case "message":
        return <MessageCircle className="w-5 h-5" />;
      case "achievement":
        return <Star className="w-5 h-5" />;
      case "system":
        return <Bell className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "event":
        return "from-blue-500 to-blue-600";
      case "vote":
        return "from-green-500 to-green-600";
      case "message":
        return "from-purple-500 to-purple-600";
      case "achievement":
        return "from-yellow-500 to-yellow-600";
      case "system":
        return "from-gray-500 to-gray-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getTypeLabel = (type: Notification["type"]) => {
    switch (type) {
      case "event":
        return "Événement";
      case "vote":
        return "Vote";
      case "message":
        return "Message";
      case "achievement":
        return "Succès";
      case "system":
        return "Système";
      default:
        return type;
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread" && notif.read) return false;
    if (filter === "read" && !notif.read) return false;
    if (typeFilter !== "all" && notif.type !== typeFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
    toast.success("Notification marquée comme lue");
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    toast.success("Toutes les notifications ont été marquées comme lues");
  };

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    toast.success("Notification supprimée");
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FFF8E8] to-[#F5EFE0] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#D4AF37] to-[#F4E4C1] rounded-xl shadow-lg relative">
              <Bell className="w-8 h-8 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-playfair font-bold bg-gradient-to-r from-[#D4AF37] to-[#B8941E] bg-clip-text text-transparent">
                Notifications
              </h1>
              <p className="text-[#8B7355] mt-1">
                {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}` : "Aucune nouvelle notification"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"
            >
              <Check className="w-4 h-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 mb-6 border border-[#D4AF37]/20">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-sm font-semibold text-[#8B7355]">Filtres:</span>
            </div>

            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-40 border-[#D4AF37]/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="unread">Non lues</SelectItem>
                <SelectItem value="read">Lues</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
              <SelectTrigger className="w-40 border-[#D4AF37]/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="event">Événements</SelectItem>
                <SelectItem value="vote">Votes</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="achievement">Succès</SelectItem>
                <SelectItem value="system">Système</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-[#D4AF37]/20">
              <Bell className="w-16 h-16 text-[#D4AF37]/30 mx-auto mb-4" />
              <p className="text-lg text-[#8B7355]">Aucune notification à afficher</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  "bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border transition-all duration-300 hover:shadow-2xl",
                  notif.read ? "border-[#D4AF37]/10" : "border-[#D4AF37]/30 bg-[#FFF8E8]/80"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 bg-gradient-to-br ${getNotificationColor(notif.type)} rounded-xl shadow-lg flex-shrink-0`}>
                    <div className="text-white">{getNotificationIcon(notif.type)}</div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-playfair font-bold text-[#D4AF37] mb-1">
                          {notif.title}
                        </h3>
                        <p className="text-sm text-[#8B7355]">{notif.message}</p>
                      </div>
                      {!notif.read && (
                        <span className="w-3 h-3 bg-[#D4AF37] rounded-full flex-shrink-0 mt-1"></span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#8B7355]">{formatTimestamp(notif.timestamp)}</span>
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/10 text-[#B8941E]">
                          {getTypeLabel(notif.type)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!notif.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="text-[#D4AF37] hover:bg-[#D4AF37]/10"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Marquer comme lu
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(notif.id)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {notif.actionUrl && (
                      <Button
                        size="sm"
                        className="mt-3 bg-gradient-to-r from-[#D4AF37] to-[#B8941E] hover:from-[#B8941E] hover:to-[#D4AF37] text-white"
                        onClick={() => {
                          window.location.href = notif.actionUrl!;
                        }}
                      >
                        Voir plus
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
