/**
 * CommentsSection.tsx — Section de commentaires pour les profils candidats
 * Fonctionnalités : affichage, poster, répondre, liker
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageCircle, Heart, Reply, Send, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Comment {
  id: number;
  candidateId: number;
  parentId: number | null;
  authorName: string;
  content: string;
  likes: number;
  status: string;
  createdAt: Date;
  replies?: Comment[];
}

interface CommentFormProps {
  candidateId: number;
  parentId?: number;
  onSuccess: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

function CommentForm({ candidateId, parentId, onSuccess, onCancel, placeholder }: CommentFormProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const addMutation = trpc.comments.add.useMutation({
    onSuccess: () => {
      setName("");
      setContent("");
      toast.success("Commentaire publié !");
      onSuccess();
    },
    onError: (err) => {
      toast.error(err.message || "Erreur lors de la publication.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast.error("Veuillez remplir votre nom et votre commentaire.");
      return;
    }
    addMutation.mutate({ candidateId, parentId, authorName: name.trim(), content: content.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        placeholder="Votre prénom *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-amber-500/50"
      />
      <Textarea
        placeholder={placeholder || "Laissez un message d'encouragement... ✨"}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={1000}
        rows={3}
        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-amber-500/50 resize-none"
      />
      <div className="flex items-center gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}
            className="text-white/50 hover:text-white">
            Annuler
          </Button>
        )}
        <Button type="submit" size="sm" disabled={addMutation.isPending}
          className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-semibold gap-2">
          <Send className="w-3.5 h-3.5" />
          {addMutation.isPending ? "Envoi..." : "Publier"}
        </Button>
      </div>
    </form>
  );
}

interface CommentCardProps {
  comment: Comment;
  candidateId: number;
  onRefresh: () => void;
  depth?: number;
}

function CommentCard({ comment, candidateId, onRefresh, depth = 0 }: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [liked, setLiked] = useState(false);

  const likeMutation = trpc.comments.like.useMutation({
    onSuccess: (data) => {
      setLiked(data.liked);
      onRefresh();
    },
    onError: () => toast.error("Erreur lors du like."),
  });

  const replyCount = comment.replies?.length ?? 0;

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-amber-500/20 pl-4" : ""}`}>
      <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-amber-500/20 transition-colors">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-yellow-500 flex items-center justify-center text-black font-bold text-sm">
              {comment.authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-white font-semibold text-sm">{comment.authorName}</span>
              <span className="text-white/40 text-xs ml-2">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}
              </span>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <p className="text-white/80 text-sm leading-relaxed mb-3">{comment.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => likeMutation.mutate({ commentId: comment.id })}
            disabled={likeMutation.isPending}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              liked ? "text-red-400" : "text-white/40 hover:text-red-400"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-400" : ""}`} />
            <span>{comment.likes + (liked ? 0 : 0)}</span>
          </button>

          {depth === 0 && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-amber-400 transition-colors"
            >
              <Reply className="w-3.5 h-3.5" />
              Répondre
            </button>
          )}

          {replyCount > 0 && depth === 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors ml-auto"
            >
              {showReplies ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {replyCount} réponse{replyCount > 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>

      {/* Formulaire de réponse */}
      {showReplyForm && (
        <div className="mt-2 ml-6">
          <CommentForm
            candidateId={candidateId}
            parentId={comment.id}
            placeholder={`Répondre à ${comment.authorName}...`}
            onSuccess={() => { setShowReplyForm(false); onRefresh(); }}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Réponses imbriquées */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              candidateId={candidateId}
              onRefresh={onRefresh}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
interface CommentsSectionProps {
  candidateId: number;
  candidateName: string;
}

export default function CommentsSection({ candidateId, candidateName }: CommentsSectionProps) {
  const utils = trpc.useUtils();

  const { data: comments = [], isLoading } = trpc.comments.getByCandidate.useQuery(
    { candidateId },
    { enabled: !!candidateId }
  );

  const refresh = () => {
    utils.comments.getByCandidate.invalidate({ candidateId });
  };

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);

  return (
    <section className="mt-10">
      {/* En-tête section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Commentaires</h3>
          <p className="text-white/40 text-sm">
            {totalComments > 0
              ? `${totalComments} message${totalComments > 1 ? "s" : ""} d'encouragement`
              : `Soyez le premier à encourager ${candidateName} !`}
          </p>
        </div>
      </div>

      {/* Formulaire principal */}
      <div className="bg-white/5 rounded-xl p-5 border border-white/10 mb-6">
        <p className="text-white/60 text-sm mb-4">
          Laissez un message d'encouragement pour <span className="text-amber-400 font-semibold">{candidateName}</span> ✨
        </p>
        <CommentForm candidateId={candidateId} onSuccess={refresh} />
      </div>

      {/* Liste des commentaires */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-white/10" />
                <div className="h-3 w-24 bg-white/10 rounded" />
              </div>
              <div className="h-3 w-full bg-white/10 rounded mb-1" />
              <div className="h-3 w-3/4 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-white/30">
          <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Aucun commentaire pour l'instant.</p>
          <p className="text-sm mt-1">Soyez le premier à encourager ce candidat !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment as Comment}
              candidateId={candidateId}
              onRefresh={refresh}
            />
          ))}
        </div>
      )}
    </section>
  );
}
