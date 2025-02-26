"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Heading, Paragraph } from "@/components/ui/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpenCheck, Search, Edit, Trash2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { toast } from "sonner";
import { useAppStore } from "@/store/use-app-store";
import type { Exercise, Difficulty } from "@/types/database";

// Mapping pour l'affichage des difficultés
const difficultyDisplay: Record<string, { label: string; className: string }> =
  {
    facile: {
      label: "Débutant",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    },
    moyen: {
      label: "Intermédiaire",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    },
    difficile: {
      label: "Avancé",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    },
    // Fallback pour les anciennes valeurs potentielles
    beginner: {
      label: "Débutant",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    },
    intermediate: {
      label: "Intermédiaire",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    },
    advanced: {
      label: "Avancé",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    },
  };

export default function ManageExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAppStore();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/exercises");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des exercices");
        }
        const data = await response.json();
        setExercises(data);
        setFilteredExercises(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger les exercices");
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredExercises(exercises);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = exercises.filter(
        (exercise) =>
          exercise.title.toLowerCase().includes(query) ||
          exercise.description.toLowerCase().includes(query) ||
          exercise.difficulty.toLowerCase().includes(query) ||
          (exercise.technologies &&
            exercise.technologies.some((tech) =>
              tech.toLowerCase().includes(query)
            ))
      );
      setFilteredExercises(filtered);
    }
  }, [searchQuery, exercises]);

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

  if (!isAdmin) {
    return (
      <Container>
        <SectionWrapper>
          <div className="space-y-6">
            <Heading as="h1" size="h1" className="mb-2">
              Accès non autorisé
            </Heading>
            <Paragraph className="text-muted-foreground">
              Vous n'avez pas les droits nécessaires pour accéder à cette page.
            </Paragraph>
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
                Gestion des exercices
              </Heading>
              <Paragraph className="text-muted-foreground">
                Gérez et organisez les exercices de la plateforme.
              </Paragraph>
            </div>
            <Link href="/dashboard/exercises/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Créer un exercice
              </Button>
            </Link>
          </div>

          <Card className="bg-card/50 border-violet-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BookOpenCheck className="h-8 w-8 text-violet-500" />
                <div>
                  <h3 className="text-lg font-semibold">Liste des exercices</h3>
                  <p className="text-sm text-muted-foreground">
                    Consultez et modifiez les exercices existants.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un exercice..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Link href="/dashboard/exercises/create">
                    <Button>Ajouter un exercice</Button>
                  </Link>
                </div>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead>Catégorie</TableHead>
                          <TableHead>Difficulté</TableHead>
                          <TableHead>Durée</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExercises.length === 0 ? (
                          <TableRow>
                            <TableCell className="font-medium" colSpan={5}>
                              Aucun exercice disponible
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredExercises.map((exercise) => (
                            <TableRow key={exercise.id}>
                              <TableCell className="font-medium">
                                {exercise.title}
                              </TableCell>
                              <TableCell>
                                {exercise.technologies?.join(", ") || "-"}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    difficultyDisplay[exercise.difficulty]
                                      ?.className ||
                                    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                                  }`}
                                >
                                  {difficultyDisplay[exercise.difficulty]
                                    ?.label || exercise.difficulty}
                                </span>
                              </TableCell>
                              <TableCell>{exercise.duration}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Link
                                    href={`/dashboard/exercises/${exercise.id}`}
                                  >
                                    <Button variant="outline" size="sm">
                                      Voir
                                    </Button>
                                  </Link>
                                  <Link
                                    href={`/dashboard/exercises/edit/${exercise.id}`}
                                  >
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(exercise.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>
    </Container>
  );
}
