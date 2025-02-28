import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/helpers";

export async function GET(
  request: Request,
  context: { params: { courseId: string } }
) {
  try {
    const courseId = context.params.courseId;
    const supabase = await createClient();
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    // Récupérer tous les modules du cours
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: true });

    if (modulesError) {
      console.error(
        "Erreur lors de la récupération des modules:",
        modulesError
      );
      return NextResponse.json(
        { error: "Erreur lors de la récupération des modules" },
        { status: 500 }
      );
    }

    if (!modules || modules.length === 0) {
      return NextResponse.json(
        { error: "Aucun module trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les modules complétés par l'utilisateur
    const { data: completedModules, error: progressError } = await supabase
      .from("module_progress")
      .select("module_id, completed_at")
      .eq("user_id", user.id)
      .in(
        "module_id",
        modules.map((m) => m.id)
      );

    if (progressError) {
      console.error(
        "Erreur lors de la récupération de la progression:",
        progressError
      );
      return NextResponse.json(
        { error: "Erreur lors de la récupération de la progression" },
        { status: 500 }
      );
    }

    // Calculer le pourcentage de progression
    const totalModules = modules.length;
    const completedCount = completedModules?.length || 0;
    const progressPercentage = Math.round(
      (completedCount / totalModules) * 100
    );

    console.log({
      userId: user.id,
      courseId,
      modules: modules.map((m) => m.id),
      completedModules: completedModules?.map((m) => m.module_id),
      totalModules,
      completedCount,
    });

    return NextResponse.json({
      totalModules,
      completedModules: completedCount,
      progressPercentage,
      completedModuleIds: completedModules?.map((m) => m.module_id) || [],
    });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
