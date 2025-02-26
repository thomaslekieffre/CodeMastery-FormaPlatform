import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Module } from "@/types/database";

export async function PUT(
  request: Request,
  context: { params: { moduleId: string } }
) {
  try {
    const moduleId = context.params.moduleId;
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

    // Log des données avant mise à jour
    console.log("Données du module à mettre à jour:", {
      id: moduleId,
      ...data,
    });

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
      console.error("Erreur lors de la mise à jour du module:", {
        error: moduleError,
        data,
      });
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
    console.log("GET /api/modules/[moduleId] - ID reçu:", moduleId);

    const supabase = await createClient();

    // Récupérer le module
    const { data: module, error: moduleError } = await supabase
      .from("modules")
      .select("*, exercises(*), video_url, exercise_id")
      .eq("id", moduleId)
      .single();

    if (moduleError) {
      console.error("Erreur lors de la récupération du module:", {
        error: moduleError,
        moduleId,
      });
      return NextResponse.json(
        {
          error: "Erreur lors de la récupération du module",
          details: moduleError,
        },
        { status: 404 }
      );
    }

    if (!module) {
      console.error("Module non trouvé:", moduleId);
      return NextResponse.json({ error: "Module non trouvé" }, { status: 404 });
    }

    // Récupérer le cours associé
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", module.course_id)
      .single();

    if (courseError) {
      console.error("Erreur lors de la récupération du cours:", courseError);
    }

    // Récupérer les modules du cours pour déterminer le suivant et le précédent
    const { data: courseModules, error: modulesError } = await supabase
      .from("modules")
      .select("id, title, sort_order")
      .eq("course_id", module.course_id)
      .order("sort_order", { ascending: true });

    if (modulesError) {
      console.error(
        "Erreur lors de la récupération des modules du cours:",
        modulesError
      );
    }

    // Déterminer le module suivant et précédent
    let nextModuleId = null;
    let prevModuleId = null;

    if (courseModules && courseModules.length > 0) {
      const currentIndex = courseModules.findIndex((m) => m.id === moduleId);

      if (currentIndex !== -1) {
        if (currentIndex > 0) {
          prevModuleId = courseModules[currentIndex - 1].id;
        }

        if (currentIndex < courseModules.length - 1) {
          nextModuleId = courseModules[currentIndex + 1].id;
        }
      }
    }

    // Vérifier si l'utilisateur est authentifié pour récupérer sa progression
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    let isCompleted = false;

    if (user && !authError) {
      // Récupérer la progression de l'utilisateur pour ce module
      const { data: progress, error: progressError } = await supabase
        .from("user_course_progress")
        .select("completed_modules")
        .eq("user_id", user.id)
        .eq("course_id", module.course_id)
        .single();

      if (!progressError && progress) {
        isCompleted = progress.completed_modules.includes(moduleId);
      }
    }

    console.log("Module récupéré avec succès:", {
      moduleId,
      moduleTitle: module.title,
      courseId: module.course_id,
      nextModuleId,
      prevModuleId,
      isCompleted,
    });

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
