"use client";

import Link from "next/link";
import { Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/types/database";

type DifficultyColor = {
  [K in Exercise["difficulty"]]: string;
};

const difficultyColors: DifficultyColor = {
  facile: "bg-green-500/10 text-green-500",
  moyen: "bg-yellow-500/10 text-yellow-500",
  difficile: "bg-red-500/10 text-red-500",
};

export function ExerciseCard({
  id,
  title,
  description,
  difficulty,
  duration,
  technologies,
}: Exercise) {
  return (
    <Link
      href={`/dashboard/exercises/${id}`}
      className="block p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{title}</h3>
            <span
              className={cn(
                "px-2 py-1 text-xs font-medium rounded capitalize",
                difficultyColors[difficulty]
              )}
            >
              {difficulty}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
