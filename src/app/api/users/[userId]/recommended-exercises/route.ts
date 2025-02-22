import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Exercise } from "@/types/database";

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

    // Récupérer les exercices complétés par l'utilisateur
    const { data: completedExercises, error: completedError } = await supabase
      .from("user_progress")
      .select("exercise_id")
      .eq("user_id", params.userId)
      .eq("status", "completed");

    if (completedError) {
      throw completedError;
    }

    // Récupérer les technologies des exercices complétés
    const { data: userTechnologies, error: techError } = await supabase
      .from("exercises")
      .select("technologies")
      .in(
        "id",
        completedExercises.map((e) => e.exercise_id)
      );

    if (techError) {
      throw techError;
    }

    // Créer un tableau plat des technologies maîtrisées
    const masteredTechnologies = Array.from(
      new Set(userTechnologies.flatMap((exercise) => exercise.technologies))
    );

    // Récupérer les exercices recommandés
    // Critères :
    // 1. Non complétés par l'utilisateur
    // 2. Utilisant des technologies similaires
    // 3. Difficulté progressive
    const { data: recommendedExercises, error: recommendedError } =
      await supabase
        .from("exercises")
        .select("*")
        .not(
          "id",
          "in",
          `(${completedExercises.map((e) => e.exercise_id).join(",")})`
        )
        .order("created_at", { ascending: false })
        .limit(5);

    if (recommendedError) {
      throw recommendedError;
    }

    // Trier les exercices par pertinence
    const sortedExercises = recommendedExercises.sort((a, b) => {
      // Calculer le nombre de technologies en commun
      const aTechMatch = a.technologies.filter((tech) =>
        masteredTechnologies.includes(tech)
      ).length;
      const bTechMatch = b.technologies.filter((tech) =>
        masteredTechnologies.includes(tech)
      ).length;

      // Prioriser les exercices avec des technologies similaires
      if (aTechMatch !== bTechMatch) {
        return bTechMatch - aTechMatch;
      }

      // En cas d'égalité, prioriser les exercices plus récents
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return NextResponse.json(sortedExercises);
  } catch (error) {
    console.error("Erreur lors de la récupération des recommandations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des recommandations" },
      { status: 500 }
    );
  }
}
