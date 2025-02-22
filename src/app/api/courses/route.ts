import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/database";

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

    // Log des données avant insertion
    console.log("Données du parcours à insérer:", {
      ...data,
      created_by: user.id,
    });

    // Insérer le parcours
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .insert([
        {
          ...data,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (courseError) {
      console.error("Erreur lors de la création du parcours:", {
        error: courseError,
        data,
      });
      return NextResponse.json(
        {
          error: "Erreur lors de la création du parcours",
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

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Erreur lors de la récupération des parcours:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des parcours" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Erreur serveur:", err);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
