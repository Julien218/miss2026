import { ReactNode } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Redirect } from "wouter";
import { getLoginUrl } from "@/const";
import { Loader2, ShieldAlert } from "lucide-react";
import { Permission } from "../../../server/permissions";
import { trpc } from "@/lib/trpc";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Permission requise pour accéder à la route */
  requiredPermission?: Permission;
  /** Message personnalisé si permission manquante */
  permissionDeniedMessage?: string;
}

/**
 * Composant pour protéger les routes avec authentification et permissions
 * 
 * Usage:
 * <ProtectedRoute requiredPermission={Permission.CAN_VIEW_CANDIDATES}>
 *   <CandidatesPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requiredPermission,
  permissionDeniedMessage = "Vous n'avez pas la permission d'accéder à cette page.",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Vérifier la permission si requise
  const { data: hasPermission, isLoading: isCheckingPermission } = trpc.permissions.checkPermission.useQuery(
    { permission: requiredPermission! },
    {
      enabled: !!user && !!requiredPermission,
    }
  );

  // Afficher loader pendant vérification auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />
          <p className="text-lg text-slate-300">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Rediriger vers login si non authentifié
  if (!user) {
    const currentPath = window.location.pathname;
    const loginUrl = getLoginUrl(currentPath);
    window.location.href = loginUrl;
    return null;
  }

  // Si permission requise, vérifier
  if (requiredPermission) {
    // Afficher loader pendant vérification permission
    if (isCheckingPermission) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />
            <p className="text-lg text-slate-300">Vérification des permissions...</p>
          </div>
        </div>
      );
    }

    // Afficher erreur si permission manquante
    if (!hasPermission) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 px-4">
          <div className="max-w-md rounded-2xl border border-red-500/20 bg-slate-900/50 p-8 text-center backdrop-blur-xl">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-500/10 p-4">
                <ShieldAlert className="h-12 w-12 text-red-500" />
              </div>
            </div>
            <h1 className="mb-4 text-2xl font-bold text-white">Accès refusé</h1>
            <p className="mb-6 text-slate-300">{permissionDeniedMessage}</p>
            <p className="text-sm text-slate-400">
              Contactez un administrateur si vous pensez qu'il s'agit d'une erreur.
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 rounded-lg bg-[#D4AF37] px-6 py-2 font-semibold text-slate-950 transition-all hover:bg-[#B8941E]"
            >
              Retour
            </button>
          </div>
        </div>
      );
    }
  }

  // Utilisateur authentifié et autorisé
  return <>{children}</>;
}
