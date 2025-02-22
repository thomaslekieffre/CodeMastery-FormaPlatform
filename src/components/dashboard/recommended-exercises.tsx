"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Exercise } from "@/types/database";

interface Props {
  userId: string;
}

const cardVariants = {
  hidden: { opacity: 0, x: 20 },
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

const techBadgeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
    },
  },
};

export function RecommendedExercises({ userId }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedExercises = async () => {
      try {
        const response = await fetch(
          `/api/users/${userId}/recommended-exercises`
        );
        if (!response.ok) throw new Error("Erreur lors du chargement");
        const data = await response.json();
        setExercises(data);
      } catch (error) {
        console.error("Erreur lors du chargement des exercices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedExercises();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recommandations</h2>
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recommandations</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              Aucune recommandation pour le moment.{" "}
              <Link
                href="/dashboard/exercises"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Explorer tous les exercices
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
      <h2 className="text-lg font-semibold">Recommandations</h2>
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
                <div className="flex items-start gap-3">
                  <motion.div
                    className="p-2 bg-primary/10 text-primary rounded-full"
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{
                      delay: i * 0.1 + 0.2,
                      type: "spring",
                      stiffness: 200,
                    }}
                  >
                    <Star className="h-4 w-4" />
                  </motion.div>
                  <div>
                    <h3 className="font-medium">{exercise.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {exercise.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {exercise.technologies.map((tech, techIndex) => (
                        <motion.span
                          key={tech}
                          variants={techBadgeVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{
                            delay: i * 0.1 + techIndex * 0.05 + 0.3,
                          }}
                          className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs"
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
