"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading, Paragraph } from "@/components/ui/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Code2, Edit, Trash2, Plus, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useAppStore } from "@/store/use-app-store";
import type { Exercise } from "@/types/database";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAppStore();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/exercises", {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Erreur lors de la récupération des exercices"
          );
        }

        if (!Array.isArray(data)) {
          console.error("Format de données invalide:", data);
          throw new Error("Format de données invalide");
        }

        setExercises(data);
      } catch (error) {
        console.error("Erreur détaillée:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossible de charger les exercices"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet exercice ?")) return;

    try {
      const response = await fetch(`/api/exercises/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setExercises((prev) => prev.filter((exercise) => exercise.id !== id));
      toast.success("L'exercice a été supprimé");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de supprimer l'exercice");
    }
  };

  if (loading) {
    return (
      <Container>
        <SectionWrapper>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement des exercices...</p>
          </div>
        </SectionWrapper>
      </Container>
    );
  }

  if (exercises.length === 0) {
    return (
      <Container>
        <SectionWrapper>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aucun exercice disponible pour le moment.
            </p>
          </div>
        </SectionWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <SectionWrapper>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Heading as="h1" size="h1" className="mb-2">
                Exercices
              </Heading>
              <Paragraph className="text-muted-foreground">
                Pratiquez vos compétences avec des exercices interactifs.
              </Paragraph>
            </div>
            {isAdmin && (
              <Link href="/dashboard/exercises/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un exercice
                </Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <Card key={exercise.id} className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-violet-500/20 to-violet-700/20 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Code2 className="h-12 w-12 text-violet-500" />
                  </div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{exercise.title}</h3>
                    <div className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 text-xs rounded-full">
                      {exercise.difficulty}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {exercise.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 text-xs rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{exercise.duration}</span>
                    </div>
                    <Button
                      asChild
                      variant="ghost"
                      className="text-violet-600 dark:text-violet-400"
                    >
                      <Link href={`/dashboard/exercises/${exercise.id}`}>
                        Commencer
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </Container>
  );
}
