import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/helpers";
import type { Module } from "@/types/database";

export async function PUT(
  request: Request,
  context: { params: { moduleId: string } }
) {
  try {
    const moduleId = context.params.moduleId;
    const supabase = await createClient();
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier le rôle admin
    const isAdmin =
      user.role === "admin" || user.user_metadata?.role === "admin";

    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const data = await request.json();

    // Validation des données
    if (!data.title || !data.type) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Mettre à jour le module
    const { data: moduleData, error: moduleError } = await supabase
      .from("modules")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", moduleId)
      .select()
      .single();

    if (moduleError) {
      console.error("Erreur lors de la mise à jour du module:", moduleError);
      return NextResponse.json(
        {
          error: "Erreur lors de la mise à jour du module",
          details: moduleError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(moduleData);
  } catch (err) {
    console.error("Erreur serveur:", err);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { moduleId: string } }
) {
  try {
    const moduleId = context.params.moduleId;
    const supabase = await createClient();
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier le rôle admin
    const isAdmin =
      user.role === "admin" || user.user_metadata?.role === "admin";

    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Supprimer le module
    const { error: moduleError } = await supabase
      .from("modules")
      .delete()
      .eq("id", moduleId);

    if (moduleError) {
      console.error("Erreur lors de la suppression du module:", moduleError);
      return NextResponse.json(
        {
          error: "Erreur lors de la suppression du module",
          details: moduleError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  context: { params: { moduleId: string } }
) {
  try {
    const moduleId = context.params.moduleId;
    const supabase = await createClient();
    const user = await getAuthUser();

    // Récupérer le module
    const { data: module, error: moduleError } = await supabase
      .from("modules")
      .select("*")
      .eq("id", moduleId)
      .single();

    if (moduleError) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération du module" },
        { status: 500 }
      );
    }

    if (!module) {
      return NextResponse.json({ error: "Module non trouvé" }, { status: 404 });
    }

    // Récupérer le cours associé
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", module.course_id)
      .single();

    if (courseError) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération du cours" },
        { status: 500 }
      );
    }

    // Récupérer les modules du cours pour déterminer le suivant et le précédent
    const { data: courseModules, error: modulesError } = await supabase
      .from("modules")
      .select("id, sort_order")
      .eq("course_id", module.course_id)
      .order("sort_order", { ascending: true });

    if (modulesError) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération des modules" },
        { status: 500 }
      );
    }

    // Trouver l'index du module actuel
    const currentIndex = courseModules.findIndex((m) => m.id === moduleId);
    const nextModuleId =
      currentIndex < courseModules.length - 1
        ? courseModules[currentIndex + 1].id
        : null;
    const prevModuleId =
      currentIndex > 0 ? courseModules[currentIndex - 1].id : null;

    // Vérifier si le module est complété pour l'utilisateur connecté
    let isCompleted = false;
    if (user) {
      const { data: progress } = await supabase
        .from("module_progress")
        .select("completed_at")
        .eq("module_id", moduleId)
        .eq("user_id", user.id)
        .single();

      isCompleted = !!progress;
    }

    return NextResponse.json({
      module,
      course,
      nextModuleId,
      prevModuleId,
      isCompleted,
    });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
