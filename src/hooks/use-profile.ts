import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";
import { supabase } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export function useProfile() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  const fetchProfile = async () => {
    if (!isAuthenticated || !user) {
      setProfile(null);
      setIsLoading(false);
      setHasProfile(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data as UserProfile);
      setHasProfile(!!data && !!data.username);
    } catch (err) {
      console.error("Erreur lors de la récupération du profil:", err);
      setError("Impossible de récupérer le profil");
      setHasProfile(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (
    updates: Partial<Omit<UserProfile, "id" | "created_at">>
  ) => {
    if (!isAuthenticated || !user) {
      throw new Error("Utilisateur non authentifié");
    }

    try {
      console.log("Tentative de mise à jour du profil avec:", updates);

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        ...updates,
        // Suppression de updated_at pour éviter l'erreur
      });

      if (error) {
        console.error("Détails de l'erreur d'upsert:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      // Rafraîchir le profil après la mise à jour
      await fetchProfile();
      return true;
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      throw err;
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!isAuthenticated || !user) {
      throw new Error("Utilisateur non authentifié");
    }

    try {
      // Vérifier que le fichier est valide
      if (!file || file.size === 0) {
        throw new Error("Fichier invalide ou vide");
      }

      const fileExt = file.name.split(".").pop();
      if (!fileExt) {
        throw new Error("Extension de fichier non détectée");
      }

      const filePath = `avatars/${user.id}.${fileExt}`;

      console.log("Tentative d'upload du fichier:", {
        bucket: "avatars",
        path: filePath,
        fileSize: file.size,
        fileType: file.type,
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Détails de l'erreur d'upload:", {
          message: uploadError.message,
          name: uploadError.name,
        });
        throw new Error(
          `Erreur d'upload: ${uploadError.message || "Erreur inconnue"}`
        );
      }

      if (!uploadData) {
        throw new Error("Upload réussi mais aucune donnée retournée");
      }

      console.log("Fichier uploadé avec succès:", filePath);

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        throw new Error("Impossible d'obtenir l'URL publique de l'avatar");
      }

      console.log("URL publique obtenue:", urlData.publicUrl);

      // Mettre à jour le profil avec la nouvelle URL
      await updateProfile({ avatar_url: urlData.publicUrl });

      return urlData.publicUrl;
    } catch (error: any) {
      // Amélioration du logging d'erreur
      console.error("Erreur détaillée lors de l'upload de l'avatar:", {
        message: error?.message || "Aucun message d'erreur",
        name: error?.name,
        stack: error?.stack,
        code: error?.code,
        details: error?.details,
        originalError: error,
      });

      // Créer un message d'erreur plus descriptif
      const errorMessage = error?.message
        ? `Erreur lors de l'upload de l'avatar: ${error.message}`
        : "Erreur inconnue lors de l'upload de l'avatar. Vérifiez la console pour plus de détails.";

      throw new Error(errorMessage);
    }
  };

  // Charger le profil au montage du composant
  useEffect(() => {
    fetchProfile();
  }, [isAuthenticated, user]);

  return {
    profile,
    isLoading,
    error,
    hasProfile,
    fetchProfile,
    updateProfile,
    uploadAvatar,
  };
}
