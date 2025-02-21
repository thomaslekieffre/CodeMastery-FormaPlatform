"use client";

import { useState, useEffect } from "react";
import { ExerciseCard } from "@/components/exercises/exercise-card";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { getExercises } from "@/lib/queries";
import type { Exercise } from "@/types/database";

const technologies = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "TypeScript",
  "Flexbox",
  "DOM",
];
const difficulties = ["facile", "moyen", "difficile"] as const;

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    (typeof difficulties)[number][]
  >([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTech =
      selectedTech.length === 0 ||
      selectedTech.some((tech) => exercise.technologies.includes(tech));
    const matchesDifficulty =
      selectedDifficulty.length === 0 ||
      selectedDifficulty.includes(
        exercise.difficulty as (typeof difficulties)[number]
      );

    return matchesSearch && matchesTech && matchesDifficulty;
  });

  const toggleTech = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const toggleDifficulty = (difficulty: (typeof difficulties)[number]) => {
    setSelectedDifficulty((prev) =>
      prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Chargement des exercices...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Exercices</h1>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un exercice..."
                className="pl-9 pr-4 py-2 w-full md:w-[300px] bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => toggleTech(tech)}
                    className={cn(
                      "px-3 py-1 text-sm rounded-full transition-colors",
                      selectedTech.includes(tech)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-primary/10"
                    )}
                  >
                    {tech}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => toggleDifficulty(difficulty)}
                    className={cn(
                      "px-3 py-1 text-sm rounded-full capitalize transition-colors",
                      selectedDifficulty.includes(difficulty)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-primary/10"
                    )}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {filteredExercises.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ||
              selectedTech.length > 0 ||
              selectedDifficulty.length > 0
                ? "Aucun exercice ne correspond à vos critères de recherche."
                : "Aucun exercice n'est disponible pour le moment."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.map((exercise) => (
              <ExerciseCard key={exercise.id} {...exercise} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
