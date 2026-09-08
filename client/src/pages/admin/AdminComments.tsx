/**
 * AdminComments.tsx — Page de modération des commentaires candidats
 * Accessible uniquement aux admins/super_admins
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  MessageCircle, CheckCircle, XCircle, Trash2,
  Filter, RefreshCw, Heart, User, Crown
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_LABELS: Record<string, string> = {
  all: "Tous",
  pending: "En attente",
  approved: "Approuvés",
  rejected: "Rejetés",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

const CATEGORY_LABELS: Record<string, string> = {
  miss: "Miss",
  mister: "Mister",
  teen_miss: "Teen Miss",
  teen_mister: "Teen Mister",
};

export default function AdminComments() {
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const utils = trpc.useUtils();

  const { data: stats } = trpc.comments.getStats.useQuery();

  const { data: comments = [], isLoading, refetch } = trpc.comments.listForModeration.useQuery(
    { status: statusFilter },
    { refetchInterval: 30000 }
  );

  const moderateMutation = trpc.comments.moderate.useMutation({
    onSuccess: (_, vars) => {
      const labels: Record<string, string> = {
        approve: "Commentaire approuvé",
        reject: "Commentaire rejeté",
        delete: "Commentaire supprimé",
      };
      toast.success(labels[vars.action] || "Action effectuée");
      utils.comments.listForModeration.invalidate();
      utils.comments.getStats.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur lors de la modération"),
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-amber-400" />
            Modération des commentaires
          </h1>
          <p className="text-white/50 mt-1">Gérez les commentaires laissés sur les profils candidats</p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="border-white/20 text-white/70 hover:text-white gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-white" },
            { label: "Approuvés", value: stats.approved, color: "text-green-400" },
            { label: "En attente", value: stats.pending, color: "text-yellow-400" },
            { label: "Rejetés", value: stats.rejected, color: "text-red-400" },
            { label: "Likes totaux", value: stats.totalLikes, color: "text-pink-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-white/40 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="w-4 h-4 text-white/40" />
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statusFilter === status
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-white/5 text-white/50 border border-white/10 hover:text-white hover:border-white/20"
            }`}
          >
            {STATUS_LABELS[status]}
            {status === "pending" && stats?.pending ? (
              <span className="ml-2 bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                {stats.pending}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Liste des commentaires */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/10" />
                <div className="h-3 w-32 bg-white/10 rounded" />
                <div className="h-3 w-20 bg-white/10 rounded ml-auto" />
              </div>
              <div className="h-3 w-full bg-white/10 rounded mb-2" />
              <div className="h-3 w-3/4 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Aucun commentaire {statusFilter !== "all" ? STATUS_LABELS[statusFilter].toLowerCase() : ""}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment: any) => (
            <div
              key={comment.id}
              className={`bg-white/5 rounded-xl p-5 border transition-colors ${
                comment.status === "pending"
                  ? "border-yellow-500/30 bg-yellow-500/5"
                  : comment.status === "rejected"
                  ? "border-red-500/20 opacity-60"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Infos auteur + candidat */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-yellow-500 flex items-center justify-center text-black font-bold text-xs">
                        {comment.authorName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span className="text-white font-semibold text-sm">{comment.authorName}</span>
                    </div>

                    {comment.authorEmail && (
                      <span className="text-white/30 text-xs">{comment.authorEmail}</span>
                    )}

                    <span className="text-white/30 text-xs">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}
                    </span>

                    {/* Badge statut */}
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[comment.status] || ""}`}>
                      {STATUS_LABELS[comment.status] || comment.status}
                    </span>

                    {comment.parentId && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Réponse
                      </span>
                    )}
                  </div>

                  {/* Candidat concerné */}
                  {comment.candidateName && (
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-400 text-xs font-medium">
                        {comment.candidateName}
                      </span>
                      {comment.candidateCategory && (
                        <span className="text-white/30 text-xs">
                          — {CATEGORY_LABELS[comment.candidateCategory] || comment.candidateCategory}
                        </span>
                      )}
                      <a
                        href={`/candidates/${comment.candidateId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/30 hover:text-amber-400 text-xs underline"
                      >
                        Voir profil →
                      </a>
                    </div>
                  )}

                  {/* Contenu */}
                  <p className="text-white/80 text-sm leading-relaxed">{comment.content}</p>

                  {/* Likes */}
                  <div className="flex items-center gap-1.5 mt-2 text-white/30 text-xs">
                    <Heart className="w-3 h-3" />
                    <span>{comment.likes} like{comment.likes !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                {/* Actions de modération */}
                <div className="flex items-center gap-2 shrink-0">
                  {comment.status !== "approved" && (
                    <Button
                      size="sm"
                      onClick={() => moderateMutation.mutate({ commentId: comment.id, action: "approve" })}
                      disabled={moderateMutation.isPending}
                      className="bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/30 gap-1.5 h-8 px-3"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approuver
                    </Button>
                  )}
                  {comment.status !== "rejected" && (
                    <Button
                      size="sm"
                      onClick={() => moderateMutation.mutate({ commentId: comment.id, action: "reject" })}
                      disabled={moderateMutation.isPending}
                      variant="outline"
                      className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 gap-1.5 h-8 px-3"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rejeter
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      if (confirm("Supprimer définitivement ce commentaire ?")) {
                        moderateMutation.mutate({ commentId: comment.id, action: "delete" });
                      }
                    }}
                    disabled={moderateMutation.isPending}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 px-3"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
