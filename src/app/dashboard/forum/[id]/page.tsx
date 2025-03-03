"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  Share2,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useForumStore } from "@/store/forum-store";
import { ForumPost, Comment } from "@/types/forum";
import { CommentSection } from "@/components/forum/comment-section";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ErrorMessage } from "@/components/ui/error-message";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function ForumPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const forumStore = useForumStore();
  const { isAuthenticated, user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPost = async () => {
      try {
        if (!postId) return;

        setIsLoading(true);
        setError(null);

        console.log("Loading post with ID:", postId);
        const fetchedPost = await forumStore.fetchPostById(postId);

        if (!isMounted) return;

        if (!fetchedPost) {
          console.error("Post not found or error occurred");
          setError("Post non trouvé");
          return;
        }

        setPost(fetchedPost);

        const fetchedComments = await forumStore.fetchComments(postId);
        if (!isMounted) return;
        setComments(fetchedComments);

        // Vérifier si l'utilisateur a déjà aimé ce post
        if (isAuthenticated) {
          const liked = await forumStore.checkIfUserLikedPost(postId);
          if (isMounted) {
            setHasLiked(liked);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Error in loadPost:", err);
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPost();

    return () => {
      isMounted = false;
    };
  }, [postId, isAuthenticated]);

  const handleGoBack = () => {
    router.back();
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour aimer ce post");
      return;
    }

    if (!post) return;

    try {
      setIsLikeLoading(true);

      if (hasLiked) {
        // Unlike the post
        const success = await forumStore.unlikePost(post.id);
        if (success) {
          setHasLiked(false);
          setPost((prev) =>
            prev
              ? {
                  ...prev,
                  likesCount: Math.max(0, prev.likesCount - 1),
                }
              : null
          );
        }
      } else {
        // Like the post
        const success = await forumStore.likePost(post.id);
        if (success) {
          setHasLiked(true);
          setPost((prev) =>
            prev
              ? {
                  ...prev,
                  likesCount: prev.likesCount + 1,
                }
              : null
          );
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      toast.error(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !user) return;

    // Vérifier si l'utilisateur est l'auteur ou admin
    if (post.author.id !== user.id) {
      toast.error("Vous n'êtes pas autorisé à supprimer ce post");
      return;
    }

    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce post ? Cette action est irréversible."
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const success = await forumStore.deletePost(post.id);

      if (success) {
        toast.success("Post supprimé avec succès");
        router.push("/dashboard/forum");
      } else {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h1 className="text-xl font-semibold">{error || "Post non trouvé"}</h1>
        <Button asChild>
          <Link href="/dashboard/forum">Retour au forum</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={handleGoBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        {post.author.id === user?.id && (
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Supprimer
          </Button>
        )}
      </div>

      <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.author.name}</p>
            <p className="text-sm text-muted-foreground">
              {post.created_at
                ? formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })
                : "Date inconnue"}
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
        <Badge variant="outline" className="mb-4">
          {post.category}
        </Badge>

        <div className="prose dark:prose-invert max-w-none mt-6">
          <MarkdownRenderer content={post.content} />
        </div>

        <div className="flex items-center gap-6 mt-8 pt-4 border-t">
          <Button
            variant={hasLiked ? "default" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={handleLikeToggle}
            disabled={isLikeLoading}
          >
            {isLikeLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ThumbsUp
                className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`}
              />
            )}
            <span>{post.likesCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>{post.repliesCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            <span>Partager</span>
          </Button>
        </div>
      </div>

      <CommentSection postId={post.id} initialComments={comments} />
    </div>
  );
}
