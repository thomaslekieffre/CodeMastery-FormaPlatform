"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { getExercises } from "@/lib/queries";
import { useAppStore } from "@/store/use-app-store";
import type { Exercise } from "@/types/database";
import { cn } from "@/lib/utils";

export default function AdminExercisesPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    const loadExercises = async () => {
      try {
        const data = await getExercises();
        setExercises(data);
      } catch (error) {
        console.error("Erreur lors du chargement des exercices:", error);
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, [user, router]);

  const handleDelete = async (exerciseId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet exercice ?")) {
      return;
    }

    setDeleting(exerciseId);
    try {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Une erreur est survenue lors de la suppression");
    } finally {
      setDeleting(null);
    }
  };

  const filteredExercises = exercises.filter((exercise) =>
    exercise.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Chargement des exercices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Gestion des exercices</h1>
        <button
          onClick={() => router.push("/admin/exercises/new")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
        >
          <Plus className="h-4 w-4" />
          Nouvel exercice
        </button>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un exercice..."
          className="w-full pl-8 pr-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  Difficulté
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  Technologies
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">
                  Durée
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredExercises.map((exercise) => (
                <tr key={exercise.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm">{exercise.title}</td>
                  <td className="px-6 py-4 text-sm capitalize">
                    {exercise.difficulty}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {exercise.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{exercise.duration}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          router.push(`/admin/exercises/${exercise.id}/edit`)
                        }
                        className="p-2 text-muted-foreground hover:text-primary rounded-md hover:bg-primary/10 transition"
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exercise.id)}
                        disabled={deleting === exercise.id}
                        className={cn(
                          "p-2 text-muted-foreground rounded-md transition",
                          deleting === exercise.id
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:text-destructive hover:bg-destructive/10"
                        )}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery
                ? "Aucun exercice ne correspond à votre recherche."
                : "Aucun exercice n'a été créé pour le moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
