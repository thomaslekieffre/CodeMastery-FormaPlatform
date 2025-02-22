"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Target, Clock } from "lucide-react";
import type { Exercise, UserProgress } from "@/types/database";

interface ProgressStats {
  completed: number;
  inProgress: number;
  totalExercises: number;
  completionRate: number;
  streak: number;
  lastActivity: Date | null;
}

interface Props {
  userId: string;
}

const progressVariants = {
  hidden: { width: "0%" },
  visible: (value: number) => ({
    width: `${value}%`,
    transition: {
      duration: 1,
      ease: "easeOut",
    },
  }),
};

const statsVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1 + 0.5,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: (i: number) => ({
    scale: 1,
    rotate: 0,
    transition: {
      delay: i * 0.1 + 0.5,
      type: "spring",
      stiffness: 200,
    },
  }),
};

export function UserProgressCard({ userId }: Props) {
  const [stats, setStats] = useState<ProgressStats>({
    completed: 0,
    inProgress: 0,
    totalExercises: 0,
    completionRate: 0,
    streak: 0,
    lastActivity: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/progress`);
        if (!response.ok) throw new Error("Erreur lors du chargement");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Erreur lors du chargement de la progression:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Votre progression</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle>Votre progression</CardTitle>
        <CardDescription>Continuez sur votre lancée ! 🚀</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Barre de progression globale */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progression globale</span>
            <motion.span
              className="font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {Math.round(stats.completionRate)}%
            </motion.span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              variants={progressVariants}
              initial="hidden"
              animate="visible"
              custom={stats.completionRate}
            />
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid gap-4 md:grid-cols-3">
          <motion.div
            className="flex items-center gap-2"
            variants={statsVariants}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <motion.div
              className="p-2 bg-primary/10 text-primary rounded-full"
              variants={iconVariants}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <Trophy className="h-4 w-4" />
            </motion.div>
            <div>
              <motion.p
                className="text-sm font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {stats.completed}
              </motion.p>
              <p className="text-xs text-muted-foreground">
                Exercices complétés
              </p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-2"
            variants={statsVariants}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <motion.div
              className="p-2 bg-primary/10 text-primary rounded-full"
              variants={iconVariants}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              <Target className="h-4 w-4" />
            </motion.div>
            <div>
              <motion.p
                className="text-sm font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {stats.inProgress}
              </motion.p>
              <p className="text-xs text-muted-foreground">En cours</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-2"
            variants={statsVariants}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <motion.div
              className="p-2 bg-primary/10 text-primary rounded-full"
              variants={iconVariants}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              <Clock className="h-4 w-4" />
            </motion.div>
            <div>
              <motion.p
                className="text-sm font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {stats.streak} jours
              </motion.p>
              <p className="text-xs text-muted-foreground">Série actuelle</p>
            </div>
          </motion.div>
        </div>

        {/* Dernière activité */}
        {stats.lastActivity && (
          <motion.div
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            Dernière activité :{" "}
            {new Date(stats.lastActivity).toLocaleDateString()}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
