import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { Course } from "@/types/database";

export async function GET(request: Request) {
  try {
    const supabase = createServerClient();
    const { data: courses, error } = await supabase
      .from("courses")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des cours" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier le rôle admin
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

    // Validation des données
    if (
      !data.title ||
      !data.description ||
      !data.difficulty ||
      !data.duration
    ) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Insérer le cours
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .insert([
        {
          ...data,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (courseError) {
      console.error("Erreur lors de la création du cours:", {
        error: courseError,
        data,
      });
      return NextResponse.json(
        {
          error: "Erreur lors de la création du cours",
          details: courseError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(courseData);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du cours" },
      { status: 500 }
    );
  }
}
