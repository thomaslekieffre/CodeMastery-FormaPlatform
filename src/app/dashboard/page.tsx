"use client";

import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Heading, Paragraph } from "@/components/ui/typography";
import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  BookOpen,
  Code,
  MessageSquare,
  Trophy,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();

  if (isLoading) {
    return (
      <Container>
        <SectionWrapper>
          <div className="flex h-[50vh] items-center justify-center">
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
          <div className="flex h-[50vh] items-center justify-center">
            <Card className="w-full max-w-md" variant="elevated">
              <CardHeader>
                <CardTitle>Accès non autorisé</CardTitle>
                <CardDescription>
                  Vous devez être connecté pour accéder au tableau de bord.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full"
                >
                  Se connecter
                </Button>
              </CardFooter>
            </Card>
          </div>
        </SectionWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <SectionWrapper>
        <div className="space-y-8 py-6">
          <div>
            <Heading as="h1" size="h1" className="mb-2 text-foreground">
              Bienvenue, {profile?.username || "Apprenant"}
            </Heading>
            <Paragraph className="text-muted-foreground max-w-2xl">
              Suivez votre progression, accédez à vos cours et exercices, et
              rejoignez la communauté pour échanger avec d'autres apprenants.
            </Paragraph>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader className="pb-3">
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Mes Cours</CardTitle>
                <CardDescription>
                  Accédez à vos cours et continuez votre apprentissage
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: "35%" }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  35% complété
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="w-full justify-between group hover:text-primary"
                  asChild
                >
                  <Link href="/dashboard/courses">
                    Continuer l'apprentissage
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader className="pb-3">
                <Code className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Exercices</CardTitle>
                <CardDescription>
                  Pratiquez vos compétences avec des exercices interactifs
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Exercices complétés: 12</span>
                  <span>Total: 30</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="w-full justify-between group hover:text-primary"
                  asChild
                >
                  <Link href="/dashboard/exercises">
                    Voir les exercices
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader className="pb-3">
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Forum</CardTitle>
                <CardDescription>
                  Échangez avec la communauté et obtenez de l'aide
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground">
                  5 nouvelles discussions aujourd'hui
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="w-full justify-between group hover:text-primary"
                  asChild
                >
                  <Link href="/dashboard/forum">
                    Rejoindre les discussions
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-10">
            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Mes réalisations</CardTitle>
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        Premier cours terminé
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vous avez terminé votre premier cours
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        5 exercices réussis
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vous avez réussi 5 exercices
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Code className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="w-full justify-between group hover:text-primary"
                  asChild
                >
                  <Link href="/dashboard/achievements">
                    Voir toutes mes réalisations
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </SectionWrapper>
    </Container>
  );
}
