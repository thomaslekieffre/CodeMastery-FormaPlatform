import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Exercise, ExerciseTest } from "@/types/database";

export async function POST(request: Request) {
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

    // Vérifier le rôle admin de manière plus robuste
    const isAdmin =
      user.role === "admin" || user.user_metadata?.role === "admin";

    if (!isAdmin) {
      console.log("Tentative d'accès non autorisé:", {
        userId: user.id,
        role: user.role,
        metadata: user.user_metadata,
      });
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const data = await request.json();
    const { tests, updated_at, ...exercise } = data;

    // Log des données avant insertion
    console.log("Données de l'exercice à insérer:", {
      ...exercise,
      created_by: user.id,
    });

    // Insérer l'exercice
    const { data: exerciseData, error: exerciseError } = await supabase
      .from("exercises")
      .insert([
        {
          ...exercise,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (exerciseError) {
      // Log détaillé de l'erreur
      console.error("Erreur détaillée lors de la création de l'exercice:", {
        error: exerciseError,
        errorCode: exerciseError.code,
        errorMessage: exerciseError.message,
        errorDetails: exerciseError.details,
        data: exercise,
        userId: user.id,
        userRole: user.role,
        userMetadata: user.user_metadata,
      });

      return NextResponse.json(
        {
          error: "Erreur lors de la création de l'exercice",
          details: exerciseError,
        },
        { status: 500 }
      );
    }

    // Log du succès
    console.log("Exercice créé avec succès:", exerciseData);

    // Insérer les tests
    if (tests && tests.length > 0) {
      const testsWithExerciseId = tests.map(
        (test: Omit<ExerciseTest, "id" | "exercise_id" | "created_at">) => ({
          ...test,
          exercise_id: exerciseData.id,
          created_by: user.id,
        })
      );

      // Log des tests à insérer
      console.log("Tests à insérer:", testsWithExerciseId);

      const { error: testsError } = await supabase
        .from("exercise_tests")
        .insert(testsWithExerciseId);

      if (testsError) {
        console.error("Erreur détaillée lors de la création des tests:", {
          error: testsError,
          errorCode: testsError.code,
          errorMessage: testsError.message,
          errorDetails: testsError.details,
          userRole: user.role,
          userMetadata: user.user_metadata,
        });
        return NextResponse.json(
          {
            error: "Erreur lors de la création des tests",
            details: testsError,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(exerciseData);
  } catch (error) {
    // Log détaillé de l'erreur générale
    console.error("Erreur détaillée lors de la création de l'exercice:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Erreur lors de la création de l'exercice", details: error },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur lors de la récupération des exercices:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des exercices" },
      { status: 500 }
    );
  }
}
