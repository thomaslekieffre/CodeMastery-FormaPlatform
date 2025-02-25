"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, MessageSquare, Reply, ThumbsUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ErrorMessage } from "@/components/ui/error-message";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypePrismPlus from "rehype-prism-plus";
import { useForumStore } from "@/store/forum-store";
import { Comment } from "@/types/forum";
import { toast } from "sonner";

interface CommentSectionProps {
  postId: string;
  initialComments?: Comment[];
}

export function CommentSection({
  postId,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [newComment, setNewComment] = useState("");
  const [replyToComment, setReplyToComment] = useState<Comment | null>(null);
  const [isLoading, setIsLoading] = useState(!initialComments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { fetchComments, addComment } = useForumStore();

  useEffect(() => {
    if (initialComments) {
      return;
    }

    const loadComments = async () => {
      try {
        setIsLoading(true);
        const fetchedComments = await fetchComments(postId);
        setComments(fetchedComments);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();
  }, [postId, fetchComments, initialComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      setError("Veuillez vous connecter pour ajouter un commentaire");
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Préparer le contenu du commentaire
      let content = newComment;

      // Si c'est une réponse à un commentaire, ajouter une mention
      if (replyToComment) {
        content = `**@${replyToComment.author.name}** ${content}`;
      }

      console.log("Envoi du commentaire:", { postId, content });

      try {
        const comment = await addComment(postId, content);

        if (comment) {
          setComments((prev) => [...prev, comment]);
          setNewComment("");
          setReplyToComment(null);
          toast.success("Commentaire ajouté avec succès");
        } else {
          throw new Error("Impossible d'ajouter le commentaire");
        }
      } catch (addError) {
        console.error(
          "Erreur spécifique lors de l'ajout du commentaire:",
          addError
        );
        throw addError;
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Une erreur inattendue s'est produite";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyClick = (comment: Comment) => {
    setReplyToComment(comment);
    // Focus sur la zone de texte
    document.getElementById("comment-textarea")?.focus();
  };

  const cancelReply = () => {
    setReplyToComment(null);
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2" />
        Commentaires ({comments.length})
      </h2>

      {error && <ErrorMessage message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {comments.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              Aucun commentaire pour le moment. Soyez le premier à réagir !
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-gray-800 pb-6 last:border-0"
              >
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage
                      src={comment.author.avatar}
                      alt={comment.author.name}
                    />
                    <AvatarFallback>
                      {comment.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{comment.author.name}</h3>
                      <p className="text-sm text-gray-400">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypePrismPlus]}
                      >
                        {comment.content}
                      </ReactMarkdown>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleReplyClick(comment)}
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Répondre
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <form onSubmit={handleSubmitComment} className="space-y-4">
        {replyToComment && (
          <div className="bg-muted p-3 rounded-md flex items-center justify-between mb-2">
            <p className="text-sm">
              Répondre à{" "}
              <span className="font-medium">{replyToComment.author.name}</span>
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={cancelReply}
              className="h-7 px-2"
            >
              Annuler
            </Button>
          </div>
        )}

        <Textarea
          id="comment-textarea"
          placeholder={
            isAuthenticated
              ? replyToComment
                ? `Répondre à ${replyToComment.author.name}...`
                : "Ajouter un commentaire..."
              : "Connectez-vous pour commenter"
          }
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!isAuthenticated || isSubmitting}
          className="min-h-[100px] bg-background"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isAuthenticated || isSubmitting || !newComment.trim()}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSubmitting ? "Envoi..." : "Commenter"}
          </Button>
        </div>
      </form>
    </div>
  );
}
