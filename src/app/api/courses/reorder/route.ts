import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/database";

export async function PUT(request: Request) {
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

    const { courses } = await request.json();

    // Log des données avant mise à jour
    console.log("Données des parcours à réorganiser:", courses);

    // Mettre à jour l'ordre des parcours
    for (const course of courses) {
      const { error: courseError } = await supabase
        .from("courses")
        .update({
          sort_order: course.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", course.id);

      if (courseError) {
        console.error("Erreur lors de la mise à jour du parcours:", {
          error: courseError,
          courseId: course.id,
        });
        return NextResponse.json(
          {
            error: "Erreur lors de la réorganisation des parcours",
            details: courseError,
          },
          { status: 500 }
        );
      }
    }

    // Récupérer les parcours mis à jour
    const { data: updatedCourses, error: fetchError } = await supabase
      .from("courses")
      .select("*")
      .order("sort_order", { ascending: true });

    if (fetchError) {
      console.error("Erreur lors de la récupération des parcours:", fetchError);
      return NextResponse.json(
        {
          error: "Erreur lors de la récupération des parcours",
          details: fetchError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedCourses);
  } catch (err) {
    console.error("Erreur serveur:", err);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
