import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/helpers";

interface ModuleOrder {
  id: string;
  order: number;
}

export async function POST(
  request: Request,
  context: { params: { courseId: string } }
) {
  try {
    const supabase = await createClient();
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
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

    const { modules }: { modules: ModuleOrder[] } = await request.json();

    // Mettre à jour l'ordre des modules
    const promises = modules.map(({ id, order }) =>
      supabase
        .from("modules")
        .update({ order })
        .eq("id", id)
        .eq("course_id", context.params.courseId)
    );

    await Promise.all(promises);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur serveur:", err);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
