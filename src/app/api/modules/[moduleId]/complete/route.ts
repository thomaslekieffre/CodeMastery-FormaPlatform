import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/helpers";

export async function POST(
  request: Request,
  context: { params: { moduleId: string } }
) {
  try {
    const moduleId = context.params.moduleId;
    const supabase = await createClient();
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      );
    }

    // Vérifier si le module existe
    const { data: module, error: moduleError } = await supabase
      .from("modules")
      .select("id")
      .eq("id", moduleId)
      .single();

    if (moduleError || !module) {
      return NextResponse.json({ error: "Module non trouvé" }, { status: 404 });
    }

    // Marquer le module comme complété
    const { error: progressError } = await supabase
      .from("module_progress")
      .upsert(
        {
          user_id: user.id,
          module_id: moduleId,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,module_id",
        }
      );

    if (progressError) {
      console.error(
        "Erreur lors de la mise à jour de la progression:",
        progressError
      );
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour de la progression" },
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
