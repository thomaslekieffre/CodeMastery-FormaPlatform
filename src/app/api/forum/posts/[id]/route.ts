import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Vérifier l'authentification
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est l'auteur du post ou un admin
    const { data: post } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", params.id)
      .single();

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
    }

    if (post.user_id !== session.user.id) {
      // Vérifier si l'utilisateur est admin
      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!adminUser) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }
    }

    // Supprimer le post (les likes et commentaires seront supprimés en cascade)
    const { error, data } = await supabase
      .from("posts")
      .delete()
      .eq("id", params.id);

    console.log("Tentative de suppression:", {
      postId: params.id,
      error,
      data,
      userId: session.user.id,
      postUserId: post.user_id,
    });

    if (error) {
      console.error("Erreur détaillée:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du post:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
