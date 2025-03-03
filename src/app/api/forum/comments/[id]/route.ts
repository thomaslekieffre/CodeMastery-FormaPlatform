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

    // Vérifier que l'utilisateur est l'auteur du commentaire ou un admin
    const { data: comment } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", params.id)
      .single();

    if (!comment) {
      return NextResponse.json(
        { error: "Commentaire non trouvé" },
        { status: 404 }
      );
    }

    if (comment.user_id !== session.user.id) {
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

    // Récupérer le post_id du commentaire avant de le supprimer
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .select("post_id")
      .eq("id", params.id)
      .single();

    if (commentError) {
      console.error("Erreur lors de la récupération du post_id:", commentError);
      throw commentError;
    }

    if (!commentData || !commentData.post_id) {
      console.error("Pas de post_id trouvé pour le commentaire:", params.id);
      return NextResponse.json(
        { error: "Commentaire non trouvé ou post_id manquant" },
        { status: 404 }
      );
    }

    // Mettre à jour le compteur de réponses directement
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        replies: 0, // On met d'abord à 0 pour éviter les valeurs négatives
      })
      .eq("id", commentData.post_id)
      .gt("replies", 0); // On ne met à jour que si replies > 0

    if (updateError) {
      console.error("Erreur lors de la mise à jour du compteur:", updateError);
    } else {
      // Si la première mise à jour a réussi, on incrémente de nouveau
      const { error: incrementError } = await supabase
        .from("posts")
        .update({
          replies: -1,
        })
        .eq("id", commentData.post_id)
        .eq("replies", 0); // On ne met à jour que si replies = 0

      if (incrementError) {
        console.error("Erreur lors de l'incrémentation:", incrementError);
      }
    }

    // Supprimer le commentaire
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du commentaire:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
