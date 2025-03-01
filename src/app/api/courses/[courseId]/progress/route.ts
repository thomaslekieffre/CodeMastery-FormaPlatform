import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  context: { params: { courseId: string } }
) {
  try {
    const courseId = context.params.courseId;

    // Récupérer le token d'authentification depuis les headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier le token
    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient(token);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
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
