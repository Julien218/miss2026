/**
 * Page d'acceptation d'invitation
 * 
 * Permet aux utilisateurs d'accepter une invitation via un lien sécurisé /invite/:token
 * Valide le token, affiche les informations, gère l'auth OAuth, et applique le rôle + overrides
 */

import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Shield, Users, Clock, Mail } from "lucide-react";


import { getLoginUrl } from "@/const";

export default function AcceptInvitation() {
  const [, params] = useRoute("/invite/:token");
  const [, setLocation] = useLocation();

  const { data: user, isLoading: authLoading } = trpc.auth.me.useQuery();
  const token = params?.token || "";

  const [validationState, setValidationState] = useState<"loading" | "valid" | "invalid" | "accepted">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Valider le token
  const { data: validation, isLoading: validating, error: validationError } = trpc.invitations.validateToken.useQuery(
    { token },
    { 
      enabled: !!token,
      retry: false,
    }
  );

  // Mutation pour accepter l'invitation
  const acceptMutation = trpc.invitations.acceptInvitation.useMutation({
    onSuccess: () => {
      setValidationState("accepted");
      // Success - will redirect
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    },
    onError: (error: any) => {
      alert(`Erreur: ${error.message}`);
    },
  });

  // Gérer la validation du token
  useEffect(() => {
    if (validating || authLoading) return;

    if (validationError) {
      setValidationState("invalid");
      setErrorMessage(validationError.message);
      return;
    }

    if (validation) {
      if (validation.valid) {
        setValidationState("valid");
      } else {
        setValidationState("invalid");
        setErrorMessage("Token invalide");
      }
    }
  }, [validation, validating, validationError, authLoading]);

  // Rediriger vers OAuth si non connecté
  useEffect(() => {
    if (!authLoading && !user && validationState === "valid") {
      const returnPath = `/invite/${token}`;
      window.location.href = getLoginUrl(returnPath);
    }
  }, [user, authLoading, validationState, token]);

  const handleAccept = async () => {
    if (!user) {
      window.location.href = getLoginUrl(`/invite/${token}`);
      return;
    }

    await acceptMutation.mutateAsync({ token });
  };

  // Loading state
  if (validating || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-slate-900/50 backdrop-blur-xl border-slate-800">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
            <h2 className="text-xl font-semibold text-white">Validation de l'invitation...</h2>
            <p className="text-slate-400 text-center">Veuillez patienter pendant que nous vérifions votre invitation.</p>
          </div>
        </Card>
      </div>
    );
  }

  // Invalid token
  if (validationState === "invalid") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-slate-900/50 backdrop-blur-xl border-slate-800">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Invitation invalide</h2>
            <p className="text-slate-400 text-center">{errorMessage}</p>
            <Button
              onClick={() => setLocation("/")}
              className="mt-4 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400"
            >
              Retour à l'accueil
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Accepted state
  if (validationState === "accepted") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 bg-slate-900/50 backdrop-blur-xl border-slate-800">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Invitation acceptée !</h2>
            <p className="text-slate-400 text-center">Votre compte a été créé avec succès. Redirection en cours...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Valid invitation - show details
  if (validationState === "valid" && validation) {
    const invitation = validation.invitation;
    if (!invitation) return null;

    // Parse permission overrides
    let overrides: { add?: string[]; remove?: string[] } = {};
    try {
      if (invitation.permissionOverrides) {
        overrides = JSON.parse(invitation.permissionOverrides);
      }
    } catch (e) {
      console.error("Failed to parse permission overrides:", e);
    }

    const hasOverrides = (overrides.add && overrides.add.length > 0) || (overrides.remove && overrides.remove.length > 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 bg-slate-900/50 backdrop-blur-xl border-slate-800">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col items-center gap-4 pb-6 border-b border-slate-800">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Mail className="w-10 h-10 text-yellow-500" />
              </div>
              <h1 className="text-3xl font-bold text-white text-center">Vous avez été invité !</h1>
              <p className="text-slate-400 text-center">
                Vous avez reçu une invitation pour rejoindre <span className="text-yellow-500 font-semibold">Miss & Mister Dour 2026</span>
              </p>
            </div>

            {/* Invitation details */}
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-white font-medium">{invitation.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                <Shield className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-slate-500">Rôle assigné</p>
                  <p className="text-white font-medium capitalize">{invitation.role}</p>
                </div>
              </div>

              {/* Expiration */}
              <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Expire le</p>
                  <p className="text-white font-medium">
                    {invitation.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Usage */}
              {invitation.maxUses && invitation.maxUses > 1 && (
                <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                  <Users className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Utilisations</p>
                    <p className="text-white font-medium">
                      {invitation.usedCount} / {invitation.maxUses}
                    </p>
                  </div>
                </div>
              )}

              {/* Permission overrides */}
              {hasOverrides && (
                <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-500 mb-3">Permissions personnalisées</p>
                  <div className="space-y-2">
                    {overrides.add && overrides.add.length > 0 && (
                      <div>
                        <p className="text-xs text-green-400 mb-1">✓ Permissions ajoutées :</p>
                        <div className="flex flex-wrap gap-1">
                          {overrides.add.map((perm) => (
                            <span
                              key={perm}
                              className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded border border-green-500/20"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {overrides.remove && overrides.remove.length > 0 && (
                      <div>
                        <p className="text-xs text-red-400 mb-1">✗ Permissions retirées :</p>
                        <div className="flex flex-wrap gap-1">
                          {overrides.remove.map((perm) => (
                            <span
                              key={perm}
                              className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded border border-red-500/20"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-6 border-t border-slate-800">
              <Button
                onClick={handleAccept}
                disabled={acceptMutation.isPending}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-semibold py-6 text-lg"
              >
                {acceptMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Acceptation en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Accepter l'invitation
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Refuser
              </Button>
            </div>

            {/* Info */}
            <p className="text-xs text-slate-500 text-center">
              En acceptant cette invitation, vous confirmez avoir lu et accepté les conditions d'utilisation de la plateforme.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
