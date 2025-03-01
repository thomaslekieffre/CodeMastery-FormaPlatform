import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/helpers";
import type { Module } from "@/types/database";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
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
    const supabase = createServerClient(token);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les modules du cours
    const { data: modules, error } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", params.courseId)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Erreur lors de la récupération des modules:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des modules" },
        { status: 500 }
      );
    }

    return NextResponse.json({ modules });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: { courseId: string } }
) {
  try {
    const courseId = context.params.courseId;
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

    // Récupérer le dernier ordre de tri
    const { data: lastModule } = await supabase
      .from("modules")
      .select("sort_order")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = lastModule ? lastModule.sort_order + 1 : 0;

    // Insérer le module
    const { data: moduleData, error: moduleError } = await supabase
      .from("modules")
      .insert([
        {
          ...data,
          course_id: courseId,
          created_by: user.id,
          sort_order: nextSortOrder,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (moduleError) {
      console.error("Erreur lors de la création du module:", moduleError);
      return NextResponse.json(
        {
          error: "Erreur lors de la création du module",
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
