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
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    // Vérifier si l'utilisateur est connecté
    const session = data?.session;
    if (!session?.access_token || !session?.user) {
      throw new Error("Session invalide");
    }

    // Mettre à jour le client Supabase avec le token
    supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    return session;
  } catch (error) {
    console.error("Session error:", error);
    throw new Error("Veuillez vous connecter pour créer une discussion");
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
            createdAt: post.created_at,
            likesCount: post.likes || 0,
            repliesCount: post.replies || 0,
            authorId: post.user_id,
            author: {
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
        createdAt: post.created_at,
        likesCount: post.likes || 0,
        repliesCount: post.replies || 0,
        authorId: post.user_id,
        author: {
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

      // Récupérer les profils des auteurs
      const userIds = comments?.map((comment) => comment.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Créer un map des profils pour un accès rapide
      const profileMap = new Map(
        profiles?.map((profile) => [profile.id, profile])
      );

      // Formater les commentaires
      const formattedComments: Comment[] =
        comments?.map((comment) => {
          const profile = profileMap.get(comment.user_id);
          return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.created_at,
            author: {
              id: comment.user_id,
              name: profile?.username || "Utilisateur inconnu",
              avatar: profile?.avatar_url || "https://via.placeholder.com/150",
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
      // Vérifier la session d'abord
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("Veuillez vous connecter pour ajouter un commentaire");
      }

      console.log("Ajout d'un commentaire:", {
        postId,
        content,
        userId: session.user.id,
      });

      // Ajouter le commentaire
      const { data: comments, error: commentError } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: session.user.id,
          content,
          created_at: new Date().toISOString(),
        })
        .select();

      if (commentError) {
        console.error("Erreur lors de l'ajout du commentaire:", commentError);
        throw new Error(
          commentError.message || "Erreur lors de l'ajout du commentaire"
        );
      }

      if (!comments || comments.length === 0) {
        console.error("Aucun commentaire retourné après insertion");
        throw new Error("Erreur lors de l'ajout du commentaire");
      }

      // Prendre le premier commentaire retourné
      const comment = comments[0];
      console.log("Commentaire ajouté avec succès:", comment);

      // Récupérer le profil de l'auteur
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error(
          "Erreur lors de la récupération du profil:",
          profileError
        );
        throw new Error(
          profileError.message || "Erreur lors de la récupération du profil"
        );
      }

      if (!profile) {
        console.error("Profil non trouvé pour l'utilisateur:", session.user.id);
      }

      try {
        // Mettre à jour le compteur de réponses du post
        const { error: rpcError } = await supabase.rpc("increment_replies", {
          post_id: postId,
        });
        if (rpcError) {
          console.error(
            "Erreur lors de l'incrémentation des réponses:",
            rpcError
          );
          // On continue malgré l'erreur pour ne pas bloquer l'ajout du commentaire
        }
      } catch (rpcError) {
        console.error(
          "Exception lors de l'incrémentation des réponses:",
          rpcError
        );
        // On continue malgré l'erreur
      }

      // Formater le commentaire
      const formattedComment: Comment = {
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        author: {
          id: comment.user_id,
          name: profile?.username || "Utilisateur inconnu",
          avatar: profile?.avatar_url || "https://via.placeholder.com/150",
        },
      };

      return formattedComment;
    } catch (error) {
      console.error("Error adding comment:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur inattendue s'est produite lors de l'ajout du commentaire";
      set({ error: errorMessage });
      throw new Error(errorMessage);
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
}));
