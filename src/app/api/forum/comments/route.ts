import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { postId, content } = await request.json();

    if (!postId || !content) {
      return NextResponse.json(
        { error: "postId et content sont requis" },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: session.user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (commentError) {
      console.error("Erreur lors de l'ajout du commentaire:", commentError);
      return NextResponse.json(
        { error: commentError.message },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", session.user.id)
      .single();

    await supabase.rpc("increment_replies", { post_id: postId });

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      author: {
        id: session.user.id,
        name: profile?.username || "Utilisateur inconnu",
        avatar: profile?.avatar_url || "https://via.placeholder.com/150",
      },
    });
  } catch (error) {
    console.error("Error in POST /api/forum/comments:", error);
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite" },
      { status: 500 }
    );
  }
}
