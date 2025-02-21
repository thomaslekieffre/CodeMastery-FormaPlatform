"use client";

import { useState } from "react";
import { CourseCard } from "@/components/courses/course-card";
import { Search } from "lucide-react";

// Données temporaires pour les cours (à remplacer par les données de Supabase)
const courses = [
  {
    id: "html-css",
    title: "HTML & CSS Fondamentaux",
    description:
      "Apprenez les bases du développement web avec HTML et CSS. Créez des sites web statiques et responsive.",
    duration: "6 heures",
    level: "débutant" as const,
    studentsCount: 1234,
    progress: 75,
  },
  {
    id: "javascript-basics",
    title: "JavaScript pour Débutants",
    description:
      "Découvrez JavaScript, le langage de programmation du web. Ajoutez de l'interactivité à vos sites.",
    duration: "8 heures",
    level: "débutant" as const,
    studentsCount: 890,
    progress: 30,
  },
  {
    id: "react-fundamentals",
    title: "React Fondamentaux",
    description:
      "Maîtrisez React, la bibliothèque JavaScript la plus populaire pour créer des interfaces utilisateur.",
    duration: "10 heures",
    level: "intermédiaire" as const,
    studentsCount: 567,
  },
  {
    id: "nextjs-advanced",
    title: "Next.js Avancé",
    description:
      "Créez des applications web modernes avec Next.js. SSR, SSG, et plus encore.",
    duration: "12 heures",
    level: "avancé" as const,
    studentsCount: 234,
  },
];

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Cours disponibles</h2>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un cours..."
            className="w-full pl-8 pr-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} {...course} />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Aucun cours ne correspond à votre recherche.
          </p>
        </div>
      )}
    </div>
  );
}
