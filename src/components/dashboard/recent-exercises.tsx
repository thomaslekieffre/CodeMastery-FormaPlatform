"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Exercise, UserProgress } from "@/types/database";

interface RecentExercise extends Exercise {
  progress: UserProgress;
}

interface Props {
  userId: string;
}

const cardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

export function RecentExercises({ userId }: Props) {
  const [exercises, setExercises] = useState<RecentExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentExercises = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/recent-exercises`);
        if (!response.ok) throw new Error("Erreur lors du chargement");
        const data = await response.json();
        setExercises(data);
      } catch (error) {
        console.error("Erreur lors du chargement des exercices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentExercises();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Derniers exercices</h2>
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Derniers exercices</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              Vous n'avez pas encore commencé d'exercices.{" "}
              <Link
                href="/dashboard/exercises"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Découvrir les exercices
                <ArrowRight className="h-4 w-4" />
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Derniers exercices</h2>
      <div className="space-y-2">
        {exercises.map((exercise, i) => (
          <motion.div
            key={exercise.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={`/dashboard/exercises/${exercise.id}`}
              className="block"
            >
              <Card className="p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{exercise.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {exercise.description}
                    </p>
                  </div>
                  <motion.div
                    className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                      exercise.progress.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-yellow-500/10 text-yellow-500"
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                  >
                    {exercise.progress.status === "completed"
                      ? "Terminé"
                      : "En cours"}
                  </motion.div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
