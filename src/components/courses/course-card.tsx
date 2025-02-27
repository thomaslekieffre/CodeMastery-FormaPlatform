"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course, UserCourseProgress } from "@/types/database";

type DifficultyColor = {
  [K in Course["difficulty"]]: string;
};

const difficultyColors: DifficultyColor = {
  facile: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100",
  moyen:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100",
  difficile: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100",
};

interface CourseCardProps {
  course: Course;
  progress?: UserCourseProgress;
  href: string;
  totalModules?: number;
}

export function CourseCard({
  course,
  progress,
  href,
  totalModules = 0,
}: CourseCardProps) {
  const completedModules = progress?.completed_modules?.length || 0;
  const progressPercentage =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground p-5 transition-all hover:border-primary"
    >
      {course.image_url && (
        <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-md">
          <Image
            src={course.image_url}
            alt={course.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold leading-none tracking-tight">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{course.duration}</span>
        </div>
        <div
          className={cn(
            "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
            difficultyColors[course.difficulty]
          )}
        >
          {course.difficulty}
        </div>
      </div>

      {progress && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>
                {completedModules} / {totalModules} modules
              </span>
            </div>
            <span className="text-xs font-medium">{progressPercentage}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {progress.status === "completed" && "Terminé"}
            {progress.status === "in_progress" && "En cours"}
            {progress.status === "not_started" && "Non commencé"}
          </p>
        </div>
      )}
    </Link>
  );
}
