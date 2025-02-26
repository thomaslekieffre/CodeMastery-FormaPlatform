import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface Stats {
  total: number;
  completed: number;
  inProgress: number;
  completionRate: number;
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Vérifier l'authentification
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Récupérer les statistiques des cours
    const { data: coursesData, error: coursesError } = await supabase
      .from("user_course_progress")
      .select("status")
      .eq("user_id", userId);

    if (coursesError) throw coursesError;

    const coursesStats: Stats = {
      total: coursesData.length,
      completed: coursesData.filter(c => c.status === "completed").length,
      inProgress: coursesData.filter(c => c.status === "in_progress").length,
      completionRate: 0
    };

    coursesStats.completionRate = coursesStats.total > 0 
      ? Math.round((coursesStats.completed / coursesStats.total) * 100) 
      : 0;

    // Récupérer les statistiques des exercices
    const { data: exercisesData, error: exercisesError } = await supabase
      .from("user_progress")
      .select("status")
      .eq("user_id", userId);

    if (exercisesError) throw exercisesError;

    // Récupérer le nombre total d'exercices
    const { count: totalExercises, error: countError } = await supabase
      .from("exercises")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    const exercisesStats: Stats = {
      total: totalExercises || 0,
      completed: exercisesData.filter(e => e.status === "completed").length,
      inProgress: exercisesData.filter(e => e.status === "in_progress").length,
      completionRate: 0
    };

    exercisesStats.completionRate = exercisesStats.total > 0 
      ? Math.round((exercisesStats.completed / exercisesStats.total) * 100) 
      : 0;

    // Pour l'instant, on met un nombre fixe de discussions
    // TODO: Implémenter le forum et les vraies statistiques
    const discussionsStats = {
      newToday: 5
    };

    return NextResponse.json({
      courses: coursesStats,
      exercises: exercisesStats,
      discussions: discussionsStats
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
