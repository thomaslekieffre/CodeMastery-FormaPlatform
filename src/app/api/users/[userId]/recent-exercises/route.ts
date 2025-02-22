import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Exercise, UserProgress } from "@/types/database";

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

    // Récupérer la progression de l'utilisateur avec les exercices associés
    const { data: progress, error: progressError } = await supabase
      .from("user_progress")
      .select(
        `
        *,
        exercise:exercises (
          id,
          title,
          description,
          difficulty,
          duration,
          technologies
        )
      `
      )
      .eq("user_id", params.userId)
      .order("updated_at", { ascending: false })
      .limit(5);

    if (progressError) {
      throw progressError;
    }

    // Formater les données pour le front-end
    const recentExercises = progress
      .filter((p) => p.exercise) // Filtrer les exercices supprimés
      .map((p) => ({
        ...p.exercise,
        progress: {
          id: p.id,
          status: p.status,
          code: p.code,
          completed_at: p.completed_at,
          updated_at: p.updated_at,
        },
      }));

    return NextResponse.json(recentExercises);
  } catch (error) {
    console.error("Erreur lors de la récupération des exercices:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des exercices" },
      { status: 500 }
    );
  }
}
