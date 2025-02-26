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
          is_published: false, // Par défaut, les nouveaux exercices ne sont pas publiés
        },
      ])
      .select()
      .single();

    if (exerciseError) {
      console.error("Erreur lors de la création de l'exercice:", {
        error: exerciseError,
        userId: user.id,
      });
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Insérer les tests
    if (tests && tests.length > 0) {
      const testsWithExerciseId = tests.map(
        (test: Omit<ExerciseTest, "id" | "exercise_id" | "created_at">) => ({
          ...test,
          exercise_id: exerciseData.id,
          created_by: user.id,
        })
      );

      const { error: testsError } = await supabase
        .from("exercise_tests")
        .insert(testsWithExerciseId);

      if (testsError) {
        console.error("Erreur lors de la création des tests:", testsError);
        return NextResponse.json(
          { error: "Erreur lors de la création des tests" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(exerciseData);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("Erreur d'authentification:", { error: authError });
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Log des informations utilisateur
    console.log("Informations utilisateur:", {
      id: user.id,
      email: user.email,
      role: user.role,
      metadata: user.user_metadata,
    });

    // Vérifier si l'utilisateur est admin
    const isAdmin =
      user.role === "admin" || user.user_metadata?.role === "admin";

    // Construire la requête de base
    let query = supabase.from("exercises").select("*");

    // Filtrer les exercices publiés seulement pour les non-admins
    if (!isAdmin) {
      query = query.eq("is_published", true);
    }

    // Exécuter la requête avec le tri
    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Erreur Supabase:", {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { error: "Erreur lors de la récupération des exercices" },
        { status: 500 }
      );
    }

    // Log du succès
    console.log("Exercices récupérés:", {
      count: data?.length,
      exercices: data?.map((e) => ({
        id: e.id,
        title: e.title,
        published: e.is_published,
      })),
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur détaillée:", {
      error,
      message: error instanceof Error ? error.message : "Erreur inconnue",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
