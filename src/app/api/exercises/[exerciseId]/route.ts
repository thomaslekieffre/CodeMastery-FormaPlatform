import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Exercise, ExerciseTest } from "@/types/database";

export async function PUT(
  request: Request,
  context: { params: { exerciseId: string } }
) {
  try {
    const exerciseId = context.params.exerciseId;
    const supabase = await createClient();

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier le rôle admin
    const { data: adminCheck } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!adminCheck) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const data = await request.json();
    const { tests, ...exercise } = data;

    // Log des données avant mise à jour
    console.log("Données de l'exercice à mettre à jour:", {
      id: exerciseId,
      ...exercise,
    });

    // Mettre à jour l'exercice
    const { data: exerciseData, error: exerciseError } = await supabase
      .from("exercises")
      .update({
        ...exercise,
        updated_at: new Date().toISOString(),
      })
      .eq("id", exerciseId)
      .select()
      .single();

    if (exerciseError) {
      console.error("Erreur lors de la mise à jour de l'exercice:", {
        error: exerciseError,
        data: exercise,
      });
      return NextResponse.json(
        {
          error: "Erreur lors de la mise à jour de l'exercice",
          details: exerciseError,
        },
        { status: 500 }
      );
    }

    // Supprimer les anciens tests
    const { error: deleteError } = await supabase
      .from("exercise_tests")
      .delete()
      .eq("exercise_id", exerciseId);

    if (deleteError) {
      console.error(
        "Erreur lors de la suppression des anciens tests:",
        deleteError
      );
      return NextResponse.json(
        {
          error: "Erreur lors de la suppression des anciens tests",
          details: deleteError,
        },
        { status: 500 }
      );
    }

    // Insérer les nouveaux tests
    if (tests && tests.length > 0) {
      const testsWithExerciseId = tests.map(
        (test: Omit<ExerciseTest, "id" | "exercise_id" | "created_at">) => ({
          ...test,
          exercise_id: exerciseId,
          created_by: user.id,
        })
      );

      const { error: testsError } = await supabase
        .from("exercise_tests")
        .insert(testsWithExerciseId);

      if (testsError) {
        console.error("Erreur lors de l'insertion des nouveaux tests:", {
          error: testsError,
          tests: testsWithExerciseId,
        });
        return NextResponse.json(
          {
            error: "Erreur lors de l'insertion des tests",
            details: testsError,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(exerciseData);
  } catch (error) {
    console.error("Erreur lors de la modification de l'exercice:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'exercice", details: error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { exerciseId: string } }
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

    // Vérifier le rôle admin
    const isAdmin =
      user.role === "admin" || user.user_metadata?.role === "admin";
    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Supprimer les tests d'abord (à cause de la contrainte de clé étrangère)
    const { error: testsError } = await supabase
      .from("exercise_tests")
      .delete()
      .eq("exercise_id", params.exerciseId);

    if (testsError) {
      console.error("Erreur lors de la suppression des tests:", testsError);
      return NextResponse.json(
        {
          error: "Erreur lors de la suppression des tests",
          details: testsError,
        },
        { status: 500 }
      );
    }

    // Supprimer l'exercice
    const { error: exerciseError } = await supabase
      .from("exercises")
      .delete()
      .eq("id", params.exerciseId);

    if (exerciseError) {
      console.error(
        "Erreur lors de la suppression de l'exercice:",
        exerciseError
      );
      return NextResponse.json(
        {
          error: "Erreur lors de la suppression de l'exercice",
          details: exerciseError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'exercice:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'exercice", details: error },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { exerciseId: string } }
) {
  try {
    const supabase = await createClient();

    const { data: exercise, error: exerciseError } = await supabase
      .from("exercises")
      .select("*")
      .eq("id", params.exerciseId)
      .single();

    if (exerciseError) {
      console.error(
        "Erreur lors de la récupération de l'exercice:",
        exerciseError
      );
      return NextResponse.json(
        {
          error: "Erreur lors de la récupération de l'exercice",
          details: exerciseError,
        },
        { status: 500 }
      );
    }

    const { data: tests, error: testsError } = await supabase
      .from("exercise_tests")
      .select("*")
      .eq("exercise_id", params.exerciseId);

    if (testsError) {
      console.error("Erreur lors de la récupération des tests:", testsError);
      return NextResponse.json(
        {
          error: "Erreur lors de la récupération des tests",
          details: testsError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ...exercise, tests });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'exercice:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'exercice", details: error },
      { status: 500 }
    );
  }
}
