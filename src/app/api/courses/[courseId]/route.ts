import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    console.log("GET /api/courses/[courseId] - Début");
    console.log("courseId:", params.courseId);

    // Récupérer le token d'authentification depuis les headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      console.log("Pas de token d'authentification");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier le token
    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      console.log("Token invalide:", { authError });
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("Utilisateur authentifié:", {
      userId: user.id,
      email: user.email,
      role: user.role,
      metadata: user.user_metadata,
    });

    console.log("Récupération du cours...");
    const { data: course, error } = await supabase
      .from("courses")
      .select(
        `
        *,
        modules:modules (
          id,
          title,
          type,
          sort_order
        )
      `
      )
      .eq("id", params.courseId)
      .order("sort_order", { referencedTable: "modules", ascending: true })
      .single();

    console.log("Résultat:", { course, error });

    if (error) {
      if (error.code === "PGRST116") {
        console.log("Cours non trouvé");
        return NextResponse.json(
          { error: "Cours non trouvé" },
          { status: 404 }
        );
      }
      console.error("Erreur Supabase:", error);
      throw error;
    }

    console.log("Cours trouvé:", course);
    return NextResponse.json({ course });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du cours" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    // Récupérer le token d'authentification depuis les headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier le token
    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("Vérification du rôle:", {
      userId: user.id,
      userMetadata: user.user_metadata,
      role: user.role,
      isAdmin: user.role === "admin" || user.user_metadata?.role === "admin",
    });

    const isAdmin =
      user.role === "admin" || user.user_metadata?.role === "admin";
    if (!isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Vérifier si le cours existe
    const { data: existingCourse, error: existingError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", params.courseId)
      .single();

    if (existingError) {
      if (existingError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Cours non trouvé" },
          { status: 404 }
        );
      }
      throw existingError;
    }

    const courseData = await request.json();

    const { data: course, error } = await supabase
      .from("courses")
      .update({
        title: courseData.title,
        description: courseData.description,
        image_url: courseData.image_url,
        difficulty: courseData.difficulty,
        duration: courseData.duration,
        sort_order: courseData.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.courseId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du cours" },
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

    // Récupérer le token d'authentification depuis les headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier le token
    const token = authHeader.replace("Bearer ", "");
    const supabase = createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    console.log("Vérification du rôle:", {
      userId: user.id,
      userMetadata: user.user_metadata,
      role: user.role,
      isAdmin: user.role === "admin" || user.user_metadata?.role === "admin",
    });

    // Vérifier le rôle admin
    const isAdmin =
      user.role === "admin" || user.user_metadata?.role === "admin";
    if (!isAdmin) {
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
