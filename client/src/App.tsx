import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Contests from "./pages/Contests";
import Gallery from "./pages/Gallery";
import Candidates from "./pages/Candidates";
import MyProfile from "./pages/MyProfile";
import CandidateRegister from "./pages/CandidateRegister";
import Vote from "./pages/Vote";
import Chat from "./pages/Chat";
import JuryEvaluation from "./pages/JuryEvaluation";
import Rankings from "./pages/Rankings";
import SocialTracking from "./pages/SocialTracking";
import Calendar from "./pages/Calendar";
import CandidateProfile from "./pages/CandidateProfile";
import CandidateAnalytics from "./pages/CandidateAnalytics";
import VerifyCertificate from "./pages/VerifyCertificate";
import JSInnovHome from "./pages/JSInnovHome";
import LiligagaMirror from "./pages/LiligagaMirror";
import MissMisterDour2026Intro from "./pages/MissMisterDour2026Intro";
import MissMisterDour2026Premium from "./pages/MissMisterDour2026Premium";
import CandidateRegistration from "./pages/CandidateRegistration";
import RegistrationThankYou from "./pages/RegistrationThankYou";
import HomeArticles from "./pages/HomeArticles";
import ArticleDetail from "./pages/ArticleDetail";
import AdminArticles from "./pages/AdminArticles";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminAnalytics } from "./pages/AdminAnalytics";
import { Ranking } from "./pages/Ranking";
import VideoFactory2026 from "./pages/VideoFactory2026";
import InternalDashboard from "./pages/InternalDashboard";
import Homepage from "./pages/Homepage";
import AdminInvitations from "./pages/admin/AdminInvitations";
import AdminUsers from "./pages/AdminUsers";
import CandidateOnboarding from "./pages/admin/CandidateOnboarding";
import AdminCandidates from "./pages/admin/AdminCandidates";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminComments from "./pages/admin/AdminComments";
import AdminVotes from "./pages/admin/AdminVotes";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminPartners from "./pages/admin/AdminPartners";
import AdminAssistant from "./pages/admin/AdminAssistant";
import AdminWhatsApp from "./pages/admin/AdminWhatsApp";
import AdminVideoGenerator from "./pages/admin/AdminVideoGenerator";
import AdminValidation from "./pages/admin/AdminValidation";
import ContestDetail from "./pages/ContestDetail";
import CandidateOnboardingForm from "./pages/CandidateOnboardingForm";
import AcceptInvitation from "./pages/AcceptInvitation";
import About from "./pages/About";
import Press from "./pages/Press";
import Sponsors from "./pages/Sponsors";
import Contact from "./pages/Contact";
import LegalCGU from "./pages/LegalCGU";
import LegalPrivacy from "./pages/LegalPrivacy";
import LegalCookies from "./pages/LegalCookies";
import LegalNotice from "./pages/LegalNotice";
import { Footer } from "./components/Footer";
import { SplashScreen } from "./components/SplashScreen";
import CookieBanner from "./components/CookieBanner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleGuard } from "./components/RoleGuard";
import { Permission } from "../../server/permissions";
import Choreographer from "./pages/Choreographer";
import CandidateProfileEdit from "./pages/CandidateProfileEdit";
import CandidatePublicProfile from "./pages/CandidatePublicProfile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Photographer from "./pages/Photographer";

function Router() {
  return (
    <Switch>
      {/* ========== PAGES PUBLIQUES ========== */}
      <Route path="/" component={Homepage} />
      <Route path="/about" component={About} />
      <Route path="/press" component={Press} />
      <Route path="/sponsors" component={Sponsors} />
      <Route path="/contact" component={Contact} />
      
      {/* Pages légales */}
      <Route path="/legal/cgu" component={LegalCGU} />
      <Route path="/legal/privacy" component={LegalPrivacy} />
      <Route path="/legal/cookies" component={LegalCookies} />
      <Route path="/mentions-legales" component={LegalNotice} />
      
      {/* Pages événement */}
      <Route path="/intro" component={MissMisterDour2026Intro} />
      <Route path="/miss-mister-dour-2026" component={MissMisterDour2026Premium} />
      <Route path="/miss-mister" component={Home} />
      <Route path="/video-factory" component={VideoFactory2026} />
      <Route path="/ranking" component={Ranking} />
      
      {/* Pages articles/news */}
      <Route path="/public" component={HomeArticles} />
      <Route path="/article/:slug" component={ArticleDetail} />
      
      {/* Pages spéciales */}
      <Route path="/js-innov" component={JSInnovHome} />
      <Route path="/liligaga" component={LiligagaMirror} />
      <Route path="/verify/:certificateId" component={VerifyCertificate} />
      
      {/* Profil candidat public & remplissage */}
      <Route path="/candidat/:id" component={CandidatePublicProfile} />
      <Route path="/candidates/:id" component={CandidatePublicProfile} />
      <Route path="/profile/edit/:token" component={CandidateProfileEdit} />
      
      {/* Inscription candidat (public) */}
      <Route path="/inscription-candidat" component={CandidateRegistration} />
      <Route path="/inscription-merci" component={RegistrationThankYou} />
      <Route path="/onboarding/candidate/:token" component={CandidateOnboardingForm} />
      <Route path="/invite/:token" component={AcceptInvitation} />
      <Route path="/invitation/:token" component={AcceptInvitation} />
      
      {/* ========== PAGES ADMIN (role >= admin) ========== */}
      <Route path="/admin">
        <RoleGuard requiredRole="admin">
          <AdminDashboard />
        </RoleGuard>
      </Route>
      <Route path={"/admin/articles"}>
        <RoleGuard requiredRole="admin">
          <AdminArticles />
        </RoleGuard>
      </Route>
      <Route path={"/admin/analytics"}>
        <RoleGuard requiredRole="admin">
          <AdminAnalytics />
        </RoleGuard>
      </Route>
      <Route path="/admin/invitations">
        <RoleGuard requiredRole="admin">
          <AdminInvitations />
        </RoleGuard>
      </Route>
      <Route path="/admin/users">
        <RoleGuard requiredRole="admin">
          <AdminUsers />
        </RoleGuard>
      </Route>
      <Route path={"/admin/candidate-onboarding"}>
        <RoleGuard requiredRole="admin">
          <CandidateOnboarding />
        </RoleGuard>
      </Route>
      <Route path="/admin/candidates">
        <RoleGuard requiredRole="admin">
          <AdminCandidates />
        </RoleGuard>
      </Route>
      <Route path="/admin/notifications">
        <RoleGuard requiredRole="admin">
          <AdminNotifications />
        </RoleGuard>
      </Route>
      <Route path="/admin/comments">
        <RoleGuard requiredRole="admin">
          <AdminComments />
        </RoleGuard>
      </Route>
      <Route path="/admin/votes">
        <RoleGuard requiredRole="admin">
          <AdminVotes />
        </RoleGuard>
      </Route>
      <Route path="/admin/events">
        <RoleGuard requiredRole="admin">
          <AdminEvents />
        </RoleGuard>
      </Route>
      <Route path="/admin/partners">
        <RoleGuard requiredRole="admin">
          <AdminPartners />
        </RoleGuard>
      </Route>
      <Route path="/admin/assistant">
        <RoleGuard requiredRole="admin">
          <AdminAssistant />
        </RoleGuard>
      </Route>
      <Route path="/admin/whatsapp">
        <RoleGuard requiredRole="admin">
          <AdminWhatsApp />
        </RoleGuard>
      </Route>
      <Route path="/admin/video-generator">
        <RoleGuard requiredRole="super_admin">
          <AdminVideoGenerator />
        </RoleGuard>
      </Route>
      <Route path="/admin/validation">
        <RoleGuard requiredRole="admin">
          <AdminValidation />
        </RoleGuard>
      </Route>
      <Route path={"/dashboard-internal"}>
        <RoleGuard requiredRole="admin">
          <InternalDashboard />
        </RoleGuard>
      </Route>
      
      {/* ========== PAGES STAFF (role >= staff) ========== */}
      <Route path="/choreographer">
        <RoleGuard requiredRole="staff">
          <Choreographer />
        </RoleGuard>
      </Route>
      <Route path={"/jury/evaluation"}>
        <RoleGuard requiredRole="staff">
          <JuryEvaluation />
        </RoleGuard>
      </Route>
      
      {/* ========== PAGES PHOTOGRAPHE (role >= photographer) ========== */}
      <Route path="/photographer">
        <RoleGuard requiredRole="photographer">
          <Photographer />
        </RoleGuard>
      </Route>
      
      {/* ========== PAGES CANDIDAT (role >= candidate) ========== */}
      <Route path={"/dashboard"}>
        <RoleGuard requiredRole="candidate">
          <Dashboard />
        </RoleGuard>
      </Route>
      <Route path={"/my-profile"}>
        <RoleGuard requiredRole="candidate">
          <MyProfile />
        </RoleGuard>
      </Route>
      <Route path={"/candidate/register"}>
        <RoleGuard requiredRole="candidate">
          <CandidateRegister />
        </RoleGuard>
      </Route>
      <Route path={"/candidate/:id"}>
        <RoleGuard requiredRole="candidate">
          <CandidateProfile />
        </RoleGuard>
      </Route>
      <Route path={"/candidate/:id/analytics"}>
        <RoleGuard requiredRole="candidate">
          <CandidateAnalytics />
        </RoleGuard>
      </Route>
      <Route path={"/contests"}>
        <RoleGuard requiredRole="admin">
          <Contests />
        </RoleGuard>
      </Route>
      <Route path="/contests/:id">
        <RoleGuard requiredRole="admin">
          <ContestDetail />
        </RoleGuard>
      </Route>
      <Route path={"/gallery"}>
        <Gallery />
      </Route>
      <Route path={"/candidates"}>
        <Candidates />
      </Route>
      <Route path={"/vote"}>
        <RoleGuard requiredRole="candidate">
          <Vote />
        </RoleGuard>
      </Route>
      <Route path={"/chat"}>
        <RoleGuard requiredRole="candidate">
          <Chat />
        </RoleGuard>
      </Route>
      <Route path={"/rankings"}>
        <RoleGuard requiredRole="candidate">
          <Rankings />
        </RoleGuard>
      </Route>
      <Route path={"/social-tracking"}>
        <RoleGuard requiredRole="candidate">
          <SocialTracking />
        </RoleGuard>
      </Route>
      <Route path="/calendar">
        <RoleGuard requiredRole="user">
          <Calendar />
        </RoleGuard>
      </Route>
      <Route path="/settings">
        <RoleGuard requiredRole="candidate">
          <Settings />
        </RoleGuard>
      </Route>
      <Route path="/notifications">
        <RoleGuard requiredRole="candidate">
          <Notifications />
        </RoleGuard>
      </Route>
      
      {/* ========== PAGES 404 ========== */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const [location] = useLocation();
  const [showSplash, setShowSplash] = useState(() => {
    // Afficher le splash uniquement à la première visite de la session
    if (typeof window !== 'undefined') {
      const seen = sessionStorage.getItem('splash_seen');
      return !seen;
    }
    return false;
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('splash_seen', '1');
    setShowSplash(false);
  };

  // Masquer le footer sur les dashboards et pages admin
  const hideFooter = location.startsWith('/dashboard') || 
                     location.startsWith('/admin') || 
                     location.startsWith('/my-profile') ||
                     location.startsWith('/candidate/') ||
                     location.startsWith('/candidat/') ||
                     location.startsWith('/profile/edit/') ||
                     location.startsWith('/photographer') ||
                     location.startsWith('/choreographer') ||
                     location.startsWith('/jury') ||
                     location.startsWith('/settings') ||
                     location.startsWith('/notifications');

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
          <div className="flex flex-col min-h-screen">
            <Toaster />
            <div className="flex-1">
              <Router />
            </div>
            {!hideFooter && <Footer />}
          </div>
          <CookieBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
