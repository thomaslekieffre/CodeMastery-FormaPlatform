import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/helpers";
import type { Course } from "@/types/database";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const user = await getAuthUser();

    if (!user) {
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
  } catch (err) {
    console.error("Erreur serveur:", err);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: courses, error } = await supabase
      .from("courses")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération des cours" },
        { status: 500 }
      );
    }

    return NextResponse.json(courses);
  } catch (err) {
    console.error("Erreur serveur:", err);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
