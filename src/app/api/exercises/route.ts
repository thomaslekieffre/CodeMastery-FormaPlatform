import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Vérifier l'authentification
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier si admin via les métadonnées
    if (session.user.user_metadata.role !== "admin") {
      return NextResponse.json(
        { error: "Accès réservé aux administrateurs" },
        { status: 403 }
      );
    }

    // Créer un client avec les droits de service pour bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { test_code, technologies, ...exerciseData } = await req.json();

    // Créer l'exercice avec le client admin
    const { data: exercise, error } = await supabaseAdmin
      .from("exercises")
      .insert([
        {
          title: exerciseData.title,
          description: exerciseData.description,
          difficulty: exerciseData.difficulty,
          duration: exerciseData.duration,
          instructions: exerciseData.instructions,
          initial_code: exerciseData.initial_code,
          language: exerciseData.language,
          technologies: technologies,
          created_by: session.user.id,
          created_at: new Date().toISOString(),
          is_published: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Erreur Supabase:", error);
      return NextResponse.json(
        { error: "Erreur lors de la création de l'exercice" },
        { status: 500 }
      );
    }

    // Créer le test avec le client admin
    const { error: testError } = await supabaseAdmin
      .from("exercise_tests")
      .insert({
        exercise_id: exercise.id,
        name: "Test principal",
        description: "Test de validation principal",
        validation_code: test_code,
        created_by: session.user.id,
        created_at: new Date().toISOString(),
      });

    if (testError) {
      console.error("Erreur création test:", testError);
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createServerClient();
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
