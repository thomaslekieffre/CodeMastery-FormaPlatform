import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserProgress, Exercise } from "@/types/database";

export async function GET(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que l'utilisateur accède à ses propres données
    if (user.id !== params.userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Récupérer tous les exercices
    const { data: exercises, error: exercisesError } = await supabase
      .from("exercises")
      .select("id");

    if (exercisesError) {
      throw exercisesError;
    }

    // Récupérer la progression de l'utilisateur
    const { data: progress, error: progressError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", params.userId)
      .order("updated_at", { ascending: false });

    if (progressError) {
      throw progressError;
    }

    // Calculer les statistiques
    const totalExercises = exercises.length;
    const completed = progress.filter((p) => p.status === "completed").length;
    const inProgress = progress.filter(
      (p) => p.status === "in_progress"
    ).length;
    const completionRate = (completed / totalExercises) * 100;

    // Calculer la série de jours consécutifs
    let streak = 0;
    if (progress.length > 0) {
      const today = new Date();
      const activityDates = progress
        .map((p) => new Date(p.updated_at))
        .sort((a, b) => b.getTime() - a.getTime());

      const lastActivity = activityDates[0];
      const dayDiff = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff <= 1) {
        streak = 1;
        let currentDate = new Date(lastActivity);
        currentDate.setDate(currentDate.getDate() - 1);

        for (let i = 1; i < activityDates.length; i++) {
          const activityDate = activityDates[i];
          const diff = Math.floor(
            (currentDate.getTime() - activityDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          if (diff === 0) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    return NextResponse.json({
      completed,
      inProgress,
      totalExercises,
      completionRate,
      streak,
      lastActivity: progress[0]?.updated_at || null,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la progression:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la progression" },
      { status: 500 }
    );
  }
}
