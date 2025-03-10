import { create } from "zustand";
import { ForumFilter, ForumPost, Comment } from "@/types/forum";
import { supabase } from "@/lib/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";

interface ForumStore {
  posts: ForumPost[];
  isLoading: boolean;
  error: string | null;
  filter: ForumFilter;
  searchQuery: string;
  setFilter: (filter: ForumFilter) => void;
  setSearchQuery: (query: string) => void;
  fetchPosts: () => Promise<void>;
  fetchPostById: (id: string) => Promise<ForumPost | null>;
  createPost: (post: Partial<ForumPost>) => Promise<void>;
  fetchComments: (postId: string) => Promise<Comment[]>;
  addComment: (postId: string, content: string) => Promise<Comment | null>;
  likePost: (postId: string) => Promise<boolean>;
  unlikePost: (postId: string) => Promise<boolean>;
  checkIfUserLikedPost: (postId: string) => Promise<boolean>;
  deletePost: (postId: string) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<boolean>;
}

const handleError = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if ((error as PostgrestError)?.message)
    return (error as PostgrestError).message;
  return "Une erreur inattendue s'est produite";
};

// Fonction pour récupérer la session active
const getCurrentSession = async () => {
  try {
    // Récupérer la session active
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    const session = sessionData?.session;
    if (!session) {
      throw new Error("Session invalide");
    }

    // Rafraîchir la session si nécessaire
    if (
      session.expires_at &&
      new Date(session.expires_at * 1000) < new Date()
    ) {
      const {
        data: { session: refreshedSession },
        error: refreshError,
      } = await supabase.auth.refreshSession();

      if (refreshError) throw refreshError;
      if (!refreshedSession)
        throw new Error("Impossible de rafraîchir la session");

      return refreshedSession;
    }

    return session;
  } catch (error) {
    console.error("Session error:", error);
    throw new Error("Veuillez vous reconnecter pour continuer");
  }
};

export const useForumStore = create<ForumStore>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  filter: "recent",
  searchQuery: "",

  setFilter: (filter) => {
    set({ filter });
    get().fetchPosts();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchPosts();
  },

  fetchPosts: async () => {
    const { filter, searchQuery } = get();
    set({ isLoading: true, error: null });

    try {
      console.log("Fetching posts with filter:", filter);

      // Requête de base
      let query = supabase.from("posts").select("*");

      // Log de la requête avant les filtres
      console.log("Initial query:", query);

      // Appliquer les filtres
      switch (filter) {
        case "popular":
          query = query.order("likes", { ascending: false });
          break;
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
        case "unanswered":
          query = query.eq("replies", 0);
          break;
      }

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      // Log de la requête finale
      console.log("Final query:", query);

      const { data: posts, error: postsError } = await query;
      console.log("Posts response:", { posts, error: postsError });

      if (postsError) throw postsError;

      // Log des posts récupérés
      console.log("Retrieved posts:", posts);

      // Récupérer les profils séparément
      const userIds = posts?.map((post) => post.user_id) || [];
      console.log("User IDs to fetch:", userIds);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      console.log("Profiles response:", { profiles, error: profilesError });

      if (profilesError) throw profilesError;

      // Créer un map des profils pour un accès rapide
      const profileMap = new Map(
        profiles?.map((profile) => [profile.id, profile])
      );

      const formattedPosts =
        posts?.map((post) => {
          const profile = profileMap.get(post.user_id);
          return {
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category || "Général",
            created_at: post.created_at,
            likesCount: post.likes || 0,
            repliesCount: post.replies || 0,
            authorId: post.user_id,
            author: {
              id: post.user_id,
              name: profile?.username || "Utilisateur inconnu",
              avatar: profile?.avatar_url || "https://via.placeholder.com/150",
            },
          };
        }) || [];

      console.log("Formatted posts:", formattedPosts);
      set({ posts: formattedPosts, error: null });
    } catch (error) {
      console.error("Detailed error:", error);
      set({ error: handleError(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPostById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      console.log("Fetching post with ID:", id);

      // D'abord, récupérer le post
      const { data: post, error: postError } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      console.log("Post response:", { post, postError });

      if (postError) {
        console.error("Error fetching post:", postError);
        throw postError;
      }

      if (!post) {
        console.error("Post not found for ID:", id);
        throw new Error("Post non trouvé");
      }

      // Ensuite, récupérer le profil de l'auteur
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", post.user_id)
        .single();

      console.log("Profile response:", { profile, profileError });

      if (profileError) {
        console.warn("Error fetching profile:", profileError);
        // On continue avec un profil par défaut plutôt que de faire échouer toute la requête
      }

      // Formater le post
      const formattedPost: ForumPost = {
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category || "Général",
        created_at: post.created_at,
        likesCount: post.likes || 0,
        repliesCount: post.replies || 0,
        author: {
          id: post.user_id,
          name: profile?.username || "Utilisateur inconnu",
          avatar: profile?.avatar_url || "https://via.placeholder.com/150",
        },
      };

      console.log("Formatted post:", formattedPost);
      return formattedPost;
    } catch (error) {
      console.error("Error in fetchPostById:", error);
      set({ error: handleError(error) });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  createPost: async (post) => {
    set({ isLoading: true, error: null });
    try {
      // Vérifier la session d'abord
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("Veuillez vous connecter pour créer une discussion");
      }

      const { data, error } = await supabase
        .from("posts")
        .insert({
          title: post.title,
          content: post.content,
          category: post.category || "Général",
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          likes: 0,
          replies: 0,
        })
        .select()
        .single();

      if (error) {
        console.error("Post creation error:", error);
        throw error;
      }

      console.log("Post created successfully:", data);
      await get().fetchPosts();
    } catch (error) {
      console.error("Error in createPost:", error);
      set({ error: handleError(error) });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchComments: async (postId) => {
    set({ isLoading: true, error: null });
    try {
      // Récupérer les commentaires
      const { data: comments, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      // Récupérer les profils et les rôles des auteurs
      const userIds = comments?.map((comment) => comment.user_id) || [];
      const { data: users, error: usersError } = await supabase.rpc(
        "admin_fetch_user_metadata",
        { user_ids: userIds }
      );

      if (usersError) {
        console.error("Error fetching user roles:", usersError);
      }

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Créer un map des profils et des rôles pour un accès rapide
      const profileMap = new Map(
        profiles?.map((profile) => [profile.id, profile])
      );
      const roleMap = new Map(
        users?.map((user: { id: string; metadata: { role?: string } }) => [
          user.id,
          user.metadata?.role,
        ]) || []
      );

      // Formater les commentaires
      const formattedComments: Comment[] =
        comments?.map((comment) => {
          const profile = profileMap.get(comment.user_id);
          const role = roleMap.get(comment.user_id);
          return {
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at,
            author: {
              id: comment.user_id,
              name: profile?.username || "Utilisateur inconnu",
              avatar: profile?.avatar_url || "https://via.placeholder.com/150",
              role: typeof role === "string" ? role : undefined,
            },
          };
        }) || [];

      return formattedComments;
    } catch (error) {
      console.error("Error fetching comments:", error);
      set({ error: handleError(error) });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  addComment: async (postId, content) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/forum/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId, content }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Une erreur est survenue");
      }

      const comment = await response.json();
      return comment;
    } catch (error) {
      console.error("Error adding comment:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur inattendue s'est produite";
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  likePost: async (postId) => {
    set({ isLoading: true, error: null });
    try {
      // Vérifier la session d'abord
      const session = await getCurrentSession();
      if (!session?.user) {
        throw new Error("Veuillez vous connecter pour aimer ce post");
      }

      // Vérifier si l'utilisateur a déjà aimé ce post
      const { data: existingLike, error: checkError } = await supabase
        .from("post_likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", session.user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 est le code d'erreur pour "No rows returned"
        throw checkError;
      }

      if (existingLike) {
        console.log("User already liked this post");
        return false; // L'utilisateur a déjà aimé ce post
      }

      // Ajouter le like
      const { error: likeError } = await supabase.from("post_likes").insert({
        post_id: postId,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
      });

      if (likeError) throw likeError;

      // Mettre à jour le compteur de likes du post
      await supabase.rpc("increment_likes", { post_id: postId });

      // Mettre à jour le post dans le state si présent
      const currentPost = await get().fetchPostById(postId);
      if (currentPost) {
        const updatedPost = {
          ...currentPost,
          likesCount: currentPost.likesCount + 1,
        };

        // Mettre à jour le post dans la liste des posts si présent
        const updatedPosts = get().posts.map((post) =>
          post.id === postId
            ? { ...post, likesCount: post.likesCount + 1 }
            : post
        );

        set({ posts: updatedPosts });
      }

      return true;
    } catch (error) {
      console.error("Error liking post:", error);
      set({ error: handleError(error) });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  unlikePost: async (postId) => {
    set({ isLoading: true, error: null });
    try {
      // Vérifier la session d'abord
      const session = await getCurrentSession();
      if (!session?.user) {
        throw new Error("Veuillez vous connecter pour retirer votre like");
      }

      // Vérifier si l'utilisateur a aimé ce post
      const { data: existingLike, error: checkError } = await supabase
        .from("post_likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", session.user.id)
        .single();

      if (checkError) {
        if (checkError.code === "PGRST116") {
          // L'utilisateur n'a pas aimé ce post
          return false;
        }
        throw checkError;
      }

      if (!existingLike) {
        return false; // L'utilisateur n'a pas aimé ce post
      }

      // Supprimer le like
      const { error: unlikeError } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", session.user.id);

      if (unlikeError) throw unlikeError;

      // Mettre à jour le compteur de likes du post
      await supabase.rpc("decrement_likes", { post_id: postId });

      // Mettre à jour le post dans le state si présent
      const currentPost = await get().fetchPostById(postId);
      if (currentPost) {
        const updatedPost = {
          ...currentPost,
          likesCount: Math.max(0, currentPost.likesCount - 1),
        };

        // Mettre à jour le post dans la liste des posts si présent
        const updatedPosts = get().posts.map((post) =>
          post.id === postId
            ? { ...post, likesCount: Math.max(0, post.likesCount - 1) }
            : post
        );

        set({ posts: updatedPosts });
      }

      return true;
    } catch (error) {
      console.error("Error unliking post:", error);
      set({ error: handleError(error) });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  checkIfUserLikedPost: async (postId) => {
    try {
      // Vérifier la session d'abord
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        return false; // Non connecté = pas de like
      }

      // Vérifier si l'utilisateur a aimé ce post
      const { data, error } = await supabase
        .from("post_likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Pas de like trouvé
          return false;
        }
        console.error("Error checking like status:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error checking like status:", error);
      return false;
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la suppression");
      }

      // Mettre à jour la liste des posts
      set((state) => ({
        posts: state.posts.filter((post) => post.id !== postId),
      }));

      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      return false;
    }
  },

  deleteComment: async (commentId) => {
    try {
      const response = await fetch(`/api/forum/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la suppression");
      }

      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      return false;
    }
  },
}));
