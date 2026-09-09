import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, LogOut, PanelLeft, Users } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

import { Crown, Calendar, Camera, Music, Star, MessageSquare, Bell, Settings, Image, Trophy, UserCircle, TrendingUp, MessageCircle, UserPlus, Vote, Briefcase, Brain, Smartphone, Clapperboard, ShieldCheck, Cloud } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { BRANDING } from "@/config/branding";

const getMenuItems = (userRole: string | null | undefined, unreadCount: number) => [
  { icon: LayoutDashboard, label: "Tableau de Bord", path: "/dashboard" },
  { icon: Crown, label: "Concours", path: "/contests", roles: ['admin'] },
  { icon: Users, label: "Candidats", path: "/candidates" },
  { icon: UserCircle, label: "Mon Profil", path: "/my-profile", roles: ['user'] },
  { icon: Trophy, label: "Voter", path: "/vote" },
  { icon: Image, label: "Galerie", path: "/gallery" },
  { icon: Calendar, label: "Événements", path: "/calendar" },
  { icon: Star, label: "Évaluer", path: "/jury/evaluation", roles: ['admin', 'jury'] },
  { icon: Trophy, label: "Classement", path: "/rankings" },
  { icon: TrendingUp, label: "Tracking Live", path: "/social-tracking" },
  { icon: Camera, label: "Photos", path: "/photographer", roles: ['photographer'] },
  { icon: Music, label: "Chorégraphie", path: "/choreographer", roles: ['choreographer'] },
  { icon: MessageSquare, label: "Chat", path: "/chat", badge: unreadCount },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: Bell, label: "Gestion Notifs", path: "/admin/notifications", roles: ['admin'] },
  { icon: MessageCircle, label: "Commentaires", path: "/admin/comments", roles: ['admin'] },
  { icon: UserPlus, label: "Invitations", path: "/admin/invitations", roles: ['admin'] },
  { icon: Vote, label: "Votes", path: "/admin/votes", roles: ['admin'] },
  { icon: Calendar, label: "Événements Admin", path: "/admin/events", roles: ['admin'] },
  { icon: Briefcase, label: "Partenaires", path: "/admin/partners", roles: ['admin'] },
  { icon: Brain, label: "Assistant IA", path: "/admin/assistant", roles: ['admin'] },
  { icon: Smartphone, label: "Centre WhatsApp", path: "/admin/whatsapp", roles: ['admin'] },
  { icon: ShieldCheck, label: "Validation", path: "/admin/validation", roles: ['admin'] },
  { icon: Cloud, label: "Dropbox officiel", path: "/admin/dropbox", roles: ['admin'] },
  { icon: Clapperboard, label: "Générateur Vidéo IA", path: "/admin/video-generator", roles: ['super_admin'] },
  { icon: Settings, label: "Paramètres", path: "/settings" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Sign in to continue
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Access to this dashboard requires authentication. Continue to launch the login flow.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const { data: notifications } = trpc.notifications.list.useQuery({ limit: 10 });
  const unreadCount = notifications?.filter(n => n.isRead === 0).length || 0;
  // Notifications admin (non lues)
  const { data: adminUnread } = trpc.notificationsAdmin.getUnreadCount.useQuery(undefined, {
    enabled: user?.role === 'admin' || user?.role === 'super_admin',
    refetchInterval: 30000, // Actualiser toutes les 30s
  });
  const adminUnreadCount = adminUnread?.count ?? 0;
  
  const isAdmin = user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const menuItems = getMenuItems(user?.role, unreadCount);
  
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    // super_admin voit tout
    if (isSuperAdmin) return true;
    // admin voit les items admin (mais pas super_admin exclusif)
    if (isAdmin && !item.roles.includes('super_admin')) return true;
    return item.roles.includes(user?.role || 'user');
  });
  
  const activeMenuItem = filteredMenuItems.find(item => item.path === location);

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-20 justify-center border-b">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center justify-center flex-1 min-w-0">
                  <a href="/" className="flex items-center justify-center">
                    <img
                      src={BRANDING.logoIdentity}
                      alt="Logo officiel Miss & Mister Dour 2026"
                      className="h-14 max-h-[56px] md:max-h-[56px] max-[640px]:h-10 max-[640px]:max-h-[38px] w-auto object-contain"
                      loading="eager"
                    />
                  </a>
                </div>
              ) : (
                <div className="flex items-center justify-center flex-1">
                  <a href="/" className="flex items-center justify-center">
                    <Crown className="h-5 w-5 text-primary" />
                  </a>
                </div>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {filteredMenuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 space-y-3">
            {/* Logo secondaire */}
            <div className="flex items-center justify-center py-2 group-data-[collapsible=icon]:hidden">
              <img
                src={BRANDING.logoIdentity}
                alt="Logo officiel Miss & Mister Dour 2026"
                className="h-10 w-auto object-contain opacity-90"
                loading="lazy"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ─── Cloche admin notifications ─────────────────────────────── */}
        {(user?.role === 'admin' || user?.role === 'super_admin') && adminUnreadCount > 0 && (
          <div
            className="fixed bottom-6 right-6 z-50 cursor-pointer"
            onClick={() => setLocation('/admin/notifications')}
            title={`${adminUnreadCount} notification(s) non lue(s)`}
          >
            <div
              className="relative rounded-full p-3 shadow-lg transition-all hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #C87941, #D4956A)',
                boxShadow: '0 4px 20px #C8794150',
              }}
            >
              <Bell className="w-6 h-6" style={{ color: '#0A0A0F' }} />
              <span className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center" style={{ background: '#C45E6A' }}>
                {adminUnreadCount > 9 ? '9+' : adminUnreadCount}
              </span>
            </div>
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
