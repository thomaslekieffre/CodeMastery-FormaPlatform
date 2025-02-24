import { create } from "zustand";
import { ForumFilter, ForumPost } from "@/types/forum";
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
  createPost: (post: Partial<ForumPost>) => Promise<void>;
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
}));
