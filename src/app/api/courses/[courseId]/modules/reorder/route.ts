import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Module } from "@/types/database";

export async function PUT(
  request: Request,
  context: { params: { courseId: string } }
) {
  try {
    const courseId = context.params.courseId;
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

    const { modules } = await request.json();

    // Log des données avant mise à jour
    console.log("Données des modules à réorganiser:", {
      courseId,
      modules,
    });

    // Mettre à jour l'ordre des modules
    for (const module of modules) {
      const { error: moduleError } = await supabase
        .from("modules")
        .update({
          order: module.order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", module.id)
        .eq("course_id", courseId);

      if (moduleError) {
        console.error("Erreur lors de la mise à jour du module:", {
          error: moduleError,
          moduleId: module.id,
        });
        return NextResponse.json(
          {
            error: "Erreur lors de la réorganisation des modules",
            details: moduleError,
          },
          { status: 500 }
        );
      }
    }

    // Récupérer les modules mis à jour
    const { data: updatedModules, error: fetchError } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", courseId)
      .order("order", { ascending: true });

    if (fetchError) {
      console.error("Erreur lors de la récupération des modules:", fetchError);
      return NextResponse.json(
        {
          error: "Erreur lors de la récupération des modules",
          details: fetchError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedModules);
  } catch (err) {
    console.error("Erreur serveur:", err);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
