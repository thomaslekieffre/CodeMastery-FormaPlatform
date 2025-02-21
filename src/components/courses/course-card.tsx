import { Clock, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CourseLevel = "débutant" | "intermédiaire" | "avancé";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: CourseLevel;
  studentsCount: number;
  image?: string;
  progress?: number;
}

const levelColors: Record<CourseLevel, string> = {
  débutant: "bg-emerald-500",
  intermédiaire: "bg-yellow-500",
  avancé: "bg-red-500",
};

export function CourseCard({
  id,
  title,
  description,
  duration,
  level,
  studentsCount,
  image,
  progress,
}: CourseCardProps) {
  return (
    <Link
      href={`/dashboard/courses/${id}`}
      className="group block bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition"
    >
      <div className="aspect-video relative bg-muted">
        {image ? (
          <img src={image} alt={title} className="object-cover w-full h-full" />
        ) : (
          <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
            <span className="text-primary text-xl font-bold">{title[0]}</span>
          </div>
        )}
        <div
          className={cn(
            "absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white",
            levelColors[level]
          )}
        >
          {level}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold group-hover:text-primary transition">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {description}
        </p>

        {progress !== undefined && (
          <div className="mt-4 w-full bg-muted rounded-full h-1">
            <div
              className="bg-primary h-1 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{studentsCount} étudiants</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
