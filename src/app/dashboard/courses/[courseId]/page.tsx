"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading, Paragraph } from "@/components/ui/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Circle,
  PlayCircle,
  FileText,
  Code,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAppStore } from "@/store/use-app-store";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { Course, Module, UserCourseProgress } from "@/types/database";

const moduleTypeIcons = {
  video: PlayCircle,
  article: FileText,
  exercise: Code,
};

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course & { modules?: Module[] }>();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserCourseProgress | null>(null);
  const { user } = useAppStore();
  const { isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du cours");
        }
        const data = await response.json();
        setCourse(data);

        // Récupérer la progression si l'utilisateur est connecté
        if (user) {
          try {
            const progressResponse = await fetch(
              `/api/courses/${courseId}/progress`
            );
            if (progressResponse.ok) {
              const progressData = await progressResponse.json();
              setProgress(progressData);
            }
          } catch (error) {
            console.error(
              "Erreur lors de la récupération de la progression:",
              error
            );
          }
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger le cours");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user]);

  const startCourse = async () => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour suivre ce cours");
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/start`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Erreur lors du démarrage du cours");
      }

      const data = await response.json();
      setProgress(data);

      // Rediriger vers le premier module s'il existe
      if (course?.modules && course.modules.length > 0) {
        router.push(`/dashboard/courses/modules/${course.modules[0].id}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de démarrer le cours");
    }
  };

  const continueCourse = () => {
    if (!course?.modules || !progress) return;

    // Trouver le premier module non complété
    const nextModuleIndex = course.modules.findIndex(
      (module) => !progress.completed_modules?.includes(module.id)
    );

    if (nextModuleIndex !== -1) {
      router.push(
        `/dashboard/courses/modules/${course.modules[nextModuleIndex].id}`
      );
    } else if (course.modules.length > 0) {
      // Si tous les modules sont complétés, aller au dernier module
      router.push(
        `/dashboard/courses/modules/${
          course.modules[course.modules.length - 1].id
        }`
      );
    }
  };

  const completedModules = progress?.completed_modules || [];
  const totalModules = course?.modules?.length || 0;
  const progressPercentage =
    totalModules > 0
      ? Math.round((completedModules.length / totalModules) * 100)
      : 0;

  return (
    <Container>
      <SectionWrapper>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/courses">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <Heading as="h1" size="h1" className="mb-2">
                {loading
                  ? "Chargement..."
                  : course?.title || "Cours non trouvé"}
              </Heading>
              <Paragraph className="text-muted-foreground">
                {loading
                  ? "Chargement des détails du cours..."
                  : course?.description || ""}
              </Paragraph>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          ) : !course ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  Cours non trouvé
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card className="bg-card/50 border-violet-500/20">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-8 w-8 text-violet-500" />
                      <div>
                        <h3 className="text-lg font-semibold">
                          À propos de ce cours
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Informations détaillées sur le cours
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-muted-foreground">
                        {course.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <h4 className="font-medium mb-1">Difficulté</h4>
                        <div className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 text-xs rounded-full inline-block">
                          {course.difficulty}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Durée estimée</h4>
                        <p className="text-sm text-muted-foreground">
                          {course.duration}
                        </p>
                      </div>
                      {totalModules > 0 && (
                        <div>
                          <h4 className="font-medium mb-1">Modules</h4>
                          <p className="text-sm text-muted-foreground">
                            {totalModules} modules
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {course.modules && course.modules.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">
                        Contenu du cours
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {course.modules.map((module) => {
                          const Icon = moduleTypeIcons[module.type] || FileText;
                          const isCompleted = completedModules.includes(
                            module.id
                          );

                          return (
                            <Link
                              key={module.id}
                              href={`/dashboard/courses/modules/${module.id}`}
                              className={cn(
                                "flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-accent",
                                "hover:border-primary"
                              )}
                            >
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5 text-primary" />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>

                              <div className="flex flex-1 items-center justify-between">
                                <div>
                                  <p className="font-medium leading-none">
                                    {module.title}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                                    {module.description}
                                  </p>
                                </div>
                                <Icon className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-muted-foreground">
                        Aucun module disponible pour ce cours
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div>
                <Card className="sticky top-6">
                  <CardContent className="pt-6 space-y-4">
                    {course.image_url && (
                      <div className="aspect-video bg-gradient-to-br from-violet-500/20 to-violet-700/20 relative rounded-lg overflow-hidden mb-4">
                        <img
                          src={course.image_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {progress ? (
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progression</span>
                            <span>{progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                              className="bg-violet-500 h-2.5 rounded-full"
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>
                              {completedModules.length} modules terminés
                            </span>
                            <span>{totalModules} modules au total</span>
                          </div>
                        </div>
                        <Button className="w-full" onClick={continueCourse}>
                          Continuer le cours
                        </Button>
                      </div>
                    ) : (
                      <Button className="w-full" onClick={startCourse}>
                        Commencer le cours
                      </Button>
                    )}

                    {isAdmin && (
                      <div className="pt-4 border-t space-y-2">
                        <h4 className="text-sm font-medium">Administration</h4>
                        <div className="flex flex-col gap-2">
                          <Link href={`/dashboard/courses/edit/${courseId}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                            >
                              Modifier le cours
                            </Button>
                          </Link>
                          <Link
                            href={`/dashboard/courses/${courseId}/modules/manage`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                            >
                              Gérer les modules
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </SectionWrapper>
    </Container>
  );
}
