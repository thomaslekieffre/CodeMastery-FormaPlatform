"use client";

import { useAuth } from "@/hooks/use-auth";
import { ProfileEditor } from "@/components/auth/profile-editor";
import { ProfileSetupModal } from "@/components/auth/profile-setup-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Accès non autorisé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Vous devez être connecté pour accéder à cette page.</p>
          <Button onClick={() => router.push("/login")}>Se connecter</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Votre profil</h1>

      {/* Modal de configuration initiale du profil */}
      <ProfileSetupModal />

      {/* Éditeur de profil */}
      <ProfileEditor />
    </div>
  );
}
