"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

export function ProfileSetupModal() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);

  // Vérifier si l'utilisateur a déjà un profil
  useEffect(() => {
    const checkProfile = async () => {
      if (!isAuthenticated || !user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (error || !data?.username) {
          setHasProfile(false);
          setOpen(true);
        } else {
          setHasProfile(true);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du profil:", error);
      }
    };

    checkProfile();
  }, [isAuthenticated, user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prévisualisation de l'image
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    setAvatarFile(file);
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    try {
      // Vérifier que le fichier est valide
      if (avatarFile.size === 0) {
        throw new Error("Fichier vide");
      }

      const fileExt = avatarFile.name.split(".").pop();
      if (!fileExt) {
        throw new Error("Extension de fichier non détectée");
      }

      const filePath = `avatars/${user.id}.${fileExt}`;

      console.log("Tentative d'upload du fichier:", {
        bucket: "avatars",
        path: filePath,
        fileSize: avatarFile.size,
        fileType: avatarFile.type,
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        console.error("Détails de l'erreur d'upload:", {
          message: uploadError.message,
          name: uploadError.name,
        });
        throw new Error(
          `Erreur d'upload: ${uploadError.message || "Erreur inconnue"}`
        );
      }

      console.log("Fichier uploadé avec succès:", filePath);

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      if (!data || !data.publicUrl) {
        throw new Error("Impossible d'obtenir l'URL publique de l'avatar");
      }

      return data.publicUrl;
    } catch (error: any) {
      console.error("Erreur détaillée lors de l'upload de l'avatar:", {
        message: error?.message || "Aucun message d'erreur",
        name: error?.name,
        stack: error?.stack,
        originalError: error,
      });

      throw new Error(
        error?.message || "Erreur inconnue lors de l'upload de l'avatar"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!username.trim()) {
      toast.error("Veuillez entrer un pseudo");
      return;
    }

    setIsLoading(true);

    try {
      // Upload de l'avatar si présent
      let finalAvatarUrl = null;
      if (avatarFile) {
        try {
          finalAvatarUrl = await uploadAvatar();
          if (!finalAvatarUrl) {
            console.warn(
              "L'upload de l'avatar a échoué mais on continue avec la création du profil"
            );
          }
        } catch (uploadError: any) {
          console.error("Erreur lors de l'upload de l'avatar:", uploadError);
          // Afficher l'erreur mais continuer avec la création du profil sans avatar
          toast.error(
            `Erreur lors de l'upload de l'avatar: ${
              uploadError.message || "Erreur inconnue"
            }`
          );
          finalAvatarUrl = null;
        }
      }

      // Mise à jour ou création du profil
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        username,
        avatar_url: finalAvatarUrl,
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

      toast.success("Profil mis à jour avec succès");
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error("Erreur détaillée lors de la mise à jour du profil:", {
        message: error?.message || "Aucun message d'erreur",
        name: error?.name,
        stack: error?.stack,
        originalError: error,
      });
      toast.error(
        `Erreur: ${
          error?.message ||
          "Une erreur est survenue lors de la mise à jour du profil"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Ne pas afficher le modal si l'utilisateur n'est pas connecté ou a déjà un profil
  if (!isAuthenticated || hasProfile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurez votre profil</DialogTitle>
          <DialogDescription>
            Avant de continuer, veuillez configurer votre profil. Ces
            informations seront visibles par les autres utilisateurs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Pseudo</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Votre pseudo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Photo de profil (optionnelle)</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>
                  {username ? username.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <Label
                htmlFor="avatar-upload"
                className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent"
              >
                <Upload className="h-4 w-4" />
                <span>Choisir une image</span>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading || !username.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
