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
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

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

    // Nettoyage des données
    const courseData = {
      title: data.title.trim(),
      description: data.description.trim(),
      difficulty: data.difficulty,
      duration: data.duration.trim(),
      image_url: data.image_url || null,
      sort_order: data.sort_order || 0,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insérer le cours
    const { data: insertedCourse, error: courseError } = await supabase
      .from("courses")
      .insert([courseData])
      .select()
      .single();

    if (courseError) {
      console.error("Erreur lors de la création du cours:", {
        error: courseError,
        data: courseData,
      });
      return NextResponse.json(
        {
          error: "Erreur lors de la création du cours",
          details: courseError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(insertedCourse);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du cours" },
      { status: 500 }
    );
  }
}
