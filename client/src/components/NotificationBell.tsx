import { Bell } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Récupérer les notifications de l'utilisateur
  const { data: notifications = [], refetch } = trpc.notifications.list.useQuery(
    { limit: 50 },
    {
      refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
    }
  );
  
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  
  const handleNotificationClick = (notificationId: number) => {
    markAsReadMutation.mutate({ id: notificationId });
  };
  
  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-white" />
        
        {/* Badge compteur */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>
      
      {/* Dropdown Notifications */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-50 max-h-[400px] overflow-y-auto"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-400 mt-1">
                    {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              
              {/* Notifications List */}
              <div className="divide-y divide-white/10">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  notifications.map((notification: any) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={`w-full text-left p-4 hover:bg-white/5 transition-colors ${
                        !notification.isRead ? "bg-white/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm">
                            {notification.title}
                          </p>
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                            {notification.content}
                          </p>
                          <p className="text-gray-500 text-xs mt-2">
                            {new Date(notification.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              
              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-white/10">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
