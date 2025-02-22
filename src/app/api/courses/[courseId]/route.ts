import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/database";

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

    const data = await request.json();

    // Log des données avant mise à jour
    console.log("Données du parcours à mettre à jour:", {
      id: courseId,
      ...data,
    });

    // Mettre à jour le parcours
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId)
      .select()
      .single();

    if (courseError) {
      console.error("Erreur lors de la mise à jour du parcours:", {
        error: courseError,
        data,
      });
      return NextResponse.json(
        {
          error: "Erreur lors de la mise à jour du parcours",
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

export async function DELETE(
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

    // Supprimer les modules associés
    const { error: modulesError } = await supabase
      .from("modules")
      .delete()
      .eq("course_id", courseId);

    if (modulesError) {
      console.error("Erreur lors de la suppression des modules:", modulesError);
      return NextResponse.json(
        {
          error: "Erreur lors de la suppression des modules",
          details: modulesError,
        },
        { status: 500 }
      );
    }

    // Supprimer le parcours
    const { error: courseError } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (courseError) {
      console.error("Erreur lors de la suppression du parcours:", courseError);
      return NextResponse.json(
        {
          error: "Erreur lors de la suppression du parcours",
          details: courseError,
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
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    const supabase = await createClient();

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (courseError) {
      console.error("Erreur lors de la récupération du parcours:", courseError);
      return NextResponse.json(
        { error: "Erreur lors de la récupération du parcours" },
        { status: 500 }
      );
    }

    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("*")
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

    return NextResponse.json({
      ...course,
      modules,
    });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
