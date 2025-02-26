"use client";

import { useAuth } from "@/hooks/use-auth";
import { ProfileEditor } from "@/components/auth/profile-editor";
import { ProfileSetupModal } from "@/components/auth/profile-setup-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Heading, Paragraph } from "@/components/ui/typography";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Container } from "@/components/ui/container";

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <Container>
        <SectionWrapper>
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          </div>
        </SectionWrapper>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container>
        <SectionWrapper>
          <Card className="max-w-md mx-auto mt-8" variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                Accès non autorisé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Paragraph>
                Vous devez être connecté pour accéder à cette page.
              </Paragraph>
              <Button onClick={() => router.push("/login")}>
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </SectionWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <SectionWrapper>
        <Heading as="h1" size="h2" className="mb-8">
          Votre profil
        </Heading>

        {/* Modal de configuration initiale du profil */}
        <ProfileSetupModal />

        {/* Éditeur de profil */}
        <ProfileEditor />
      </SectionWrapper>
    </Container>
  );
}
