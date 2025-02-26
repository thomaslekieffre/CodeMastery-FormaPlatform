import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  context: { params: { courseId: string } }
) {
  try {
    const courseId = context.params.courseId;
    console.log("GET /api/courses/[courseId]/modules - ID reçu:", courseId);

    const supabase = await createClient();

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer le cours
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (courseError) {
      console.error("Erreur lors de la récupération du cours:", {
        error: courseError,
        courseId,
      });
      return NextResponse.json({ error: "Cours non trouvé" }, { status: 404 });
    }

    // Récupérer les modules du cours
    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: true });

    if (modulesError) {
      console.error("Erreur lors de la récupération des modules:", {
        error: modulesError,
        courseId,
      });
      return NextResponse.json(
        { error: "Erreur lors de la récupération des modules" },
        { status: 500 }
      );
    }

    console.log("Modules récupérés avec succès:", {
      courseId,
      courseTitle: course.title,
      moduleCount: modules?.length,
      modules: modules?.map((m) => ({
        id: m.id,
        title: m.title,
        type: m.type,
        sort_order: m.sort_order,
      })),
    });

    return NextResponse.json({ course, modules });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
