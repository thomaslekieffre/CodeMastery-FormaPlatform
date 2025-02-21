"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Users, PlayCircle } from "lucide-react";
import Link from "next/link";

// Données temporaires (à remplacer par les données de Supabase)
const coursesData = {
  "html-css": {
    title: "HTML & CSS Fondamentaux",
    description:
      "Apprenez les bases du développement web avec HTML et CSS. Créez des sites web statiques et responsive.",
    duration: "6 heures",
    level: "débutant" as const,
    studentsCount: 1234,
    chapters: [
      {
        id: 1,
        title: "Introduction au HTML",
        duration: "45 minutes",
        isCompleted: true,
      },
      {
        id: 2,
        title: "Structure d'une page web",
        duration: "1 heure",
        isCompleted: true,
      },
      {
        id: 3,
        title: "Les bases du CSS",
        duration: "1 heure",
        isCompleted: false,
      },
      {
        id: 4,
        title: "Mise en page avec Flexbox",
        duration: "1.5 heures",
        isCompleted: false,
      },
      {
        id: 5,
        title: "Design Responsive",
        duration: "1.5 heures",
        isCompleted: false,
      },
    ],
  },
  // Ajoutez d'autres cours ici
};

export default function CoursePage() {
  const { courseId } = useParams();
  const course = coursesData[courseId as keyof typeof coursesData];

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ce cours n'existe pas.</p>
        <Link
          href="/dashboard/courses"
          className="text-primary hover:underline mt-4 inline-block"
        >
          Retour aux cours
        </Link>
      </div>
    );
  }

  const completedChapters = course.chapters.filter(
    (chapter) => chapter.isCompleted
  ).length;
  const progress = (completedChapters / course.chapters.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/courses"
          className="text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">{course.title}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <PlayCircle className="h-12 w-12 text-primary" />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.studentsCount} étudiants</span>
            </div>
          </div>
          <p className="text-muted-foreground">{course.description}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Progression du cours</h2>
            <span className="text-sm text-muted-foreground">
              {completedChapters}/{course.chapters.length} chapitres
            </span>
          </div>

          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="space-y-2">
            {course.chapters.map((chapter) => (
              <button
                key={chapter.id}
                className="w-full p-4 bg-background rounded-lg hover:bg-primary/5 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      chapter.isCompleted ? "bg-primary" : "bg-muted-foreground"
                    }`}
                  />
                  <span
                    className={`${
                      chapter.isCompleted ? "text-primary" : "text-foreground"
                    } group-hover:text-primary transition`}
                  >
                    {chapter.title}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {chapter.duration}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
