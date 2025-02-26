"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading, Paragraph } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAppStore } from "@/store/use-app-store";
import { useAuth } from "@/hooks/use-auth";
import { Markdown } from "@/components/markdown";
import type { Module, Course } from "@/types/database";

export default function ModuleDetailPage() {
  const { moduleId } = useParams();
  const router = useRouter();
  const [module, setModule] = useState<Module | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextModuleId, setNextModuleId] = useState<string | null>(null);
  const [prevModuleId, setPrevModuleId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompletingModule, setIsCompletingModule] = useState(false);
  const { user } = useAppStore();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/modules/${moduleId}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du module");
        }
        const data = await response.json();
        setModule(data.module);
        setCourse(data.course);
        setNextModuleId(data.nextModuleId);
        setPrevModuleId(data.prevModuleId);
        setIsCompleted(data.isCompleted || false);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger le module");
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  const handleCompleteModule = async () => {
    if (!isAuthenticated || !module || !course) return;

    try {
      setIsCompletingModule(true);
      const response = await fetch(`/api/modules/${moduleId}/complete`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la validation du module");
      }

      setIsCompleted(true);
      toast.success("Module validé avec succès");

      // Si c'est le dernier module, afficher un message de félicitations
      if (!nextModuleId) {
        toast.success("Félicitations ! Vous avez terminé ce cours !");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de valider le module");
    } finally {
      setIsCompletingModule(false);
    }
  };

  const navigateToNextModule = () => {
    if (nextModuleId) {
      router.push(`/dashboard/courses/modules/${nextModuleId}`);
    } else {
      // Retourner à la page du cours si c'est le dernier module
      router.push(`/dashboard/courses/${course?.id}`);
    }
  };

  const renderModuleContent = () => {
    if (!module) return null;

    switch (module.type) {
      case "video":
        if (!module.video_url) return null;

        // Convertir l'URL YouTube en URL d'intégration
        const videoId = module.video_url.match(
          /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/
        )?.[1];
        if (!videoId) return null;

        const embedUrl = `https://www.youtube.com/embed/${videoId}`;

        return (
          <div className="aspect-video w-full mb-6">
            <iframe
              src={embedUrl}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      case "exercise":
        return module.exercise_id ? (
          <div className="mb-6">
            <Link href={`/dashboard/exercises/${module.exercise_id}`}>
              <Button className="w-full">Accéder à l'exercice</Button>
            </Link>
          </div>
        ) : null;
      case "article":
      default:
        return null;
    }
  };

  return (
    <Container>
      <SectionWrapper>
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          ) : !module || !course ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  Module non trouvé
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/courses/${course.id}`}>
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <Heading as="h1" size="h1" className="mb-2">
                    {module.title}
                  </Heading>
                  <Paragraph className="text-muted-foreground">
                    {module.description}
                  </Paragraph>
                </div>
              </div>

              <Card className="bg-card/50 border-violet-500/20">
                <CardContent className="pt-6">
                  {renderModuleContent()}
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <Markdown content={module.content} />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center pt-4">
                {prevModuleId ? (
                  <Link href={`/dashboard/courses/modules/${prevModuleId}`}>
                    <Button variant="outline">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Module précédent
                    </Button>
                  </Link>
                ) : (
                  <div></div>
                )}

                <div className="flex gap-2">
                  {!isCompleted ? (
                    <Button
                      onClick={handleCompleteModule}
                      disabled={isCompletingModule}
                    >
                      {isCompletingModule ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                          Validation...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marquer comme terminé
                        </>
                      )}
                    </Button>
                  ) : nextModuleId ? (
                    <Button onClick={navigateToNextModule}>
                      Module suivant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Link href={`/dashboard/courses/${course.id}`}>
                      <Button>
                        Terminer le cours
                        <CheckCircle className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </SectionWrapper>
    </Container>
  );
}
