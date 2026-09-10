import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { hasRoleLevel, type Role } from "../../../shared/roles";
import { getLoginUrl } from "@/const";

interface RoleGuardProps {
  children: ReactNode;
  requiredRole: Role;
  fallbackPath?: string;
}

/**
 * Composant de protection par rôle.
 * Les visiteurs non authentifiés sont redirigés vers le login local en
 * conservant la route qu'ils voulaient ouvrir.
 */
export function RoleGuard({ children, requiredRole, fallbackPath = "/" }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (!user) {
    const returnTo = typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : undefined;
    return <Redirect to={getLoginUrl(returnTo)} />;
  }

  const userRole = user.role as Role;
  if (!hasRoleLevel(userRole, requiredRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-gold-500 mb-4">Accès refusé</h1>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Rôle requis : <span className="font-semibold">{requiredRole}</span>
            <br />
            Votre rôle : <span className="font-semibold">{userRole}</span>
          </p>
          <a
            href={fallbackPath}
            className="inline-block px-6 py-3 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
