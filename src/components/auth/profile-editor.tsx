"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, User } from "lucide-react";
import { toast } from "sonner";

export function ProfileEditor() {
  const { profile, isLoading, updateProfile, uploadAvatar } = useProfile();
  const [username, setUsername] = useState(profile?.username || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile?.avatar_url || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mettre à jour les champs lorsque le profil est chargé
  if (profile && !username && profile.username) {
    setUsername(profile.username);
  }
  if (profile && !avatarPreview && profile.avatar_url) {
    setAvatarPreview(profile.avatar_url);
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prévisualisation de l'image
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarPreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    setAvatarFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Veuillez entrer un pseudo");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload de l'avatar si présent
      let finalAvatarUrl = profile?.avatar_url || null;
      if (avatarFile) {
        try {
          finalAvatarUrl = await uploadAvatar(avatarFile);
          if (!finalAvatarUrl) {
            throw new Error("L'URL de l'avatar n'a pas été retournée");
          }
        } catch (uploadError: any) {
          console.error("Erreur lors de l'upload de l'avatar:", uploadError);
          // Afficher l'erreur mais continuer avec la mise à jour du profil sans avatar
          toast.error(
            `Erreur lors de l'upload de l'avatar: ${
              uploadError.message || "Erreur inconnue"
            }`
          );
          // On garde l'ancien avatar
          finalAvatarUrl = profile?.avatar_url || null;
        }
      }

      // Mise à jour du profil
      await updateProfile({
        username,
        avatar_url: finalAvatarUrl,
      });

      toast.success("Profil mis à jour avec succès");
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
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Modifier votre profil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label htmlFor="avatar">Photo de profil</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback>
                  {username ? username.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <Label
                htmlFor="avatar-upload"
                className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent"
              >
                <Upload className="h-4 w-4" />
                <span>Changer d'image</span>
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

          <Button type="submit" disabled={isSubmitting || !username.trim()}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
