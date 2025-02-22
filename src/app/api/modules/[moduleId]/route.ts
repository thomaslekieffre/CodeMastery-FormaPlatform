import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Module } from "@/types/database";

export async function PUT(
  request: Request,
  context: { params: { moduleId: string } }
) {
  try {
    const moduleId = context.params.moduleId;
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
    console.log("Données du module à mettre à jour:", {
      id: moduleId,
      ...data,
    });

    // Mettre à jour le module
    const { data: moduleData, error: moduleError } = await supabase
      .from("modules")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", moduleId)
      .select()
      .single();

    if (moduleError) {
      console.error("Erreur lors de la mise à jour du module:", {
        error: moduleError,
        data,
      });
      return NextResponse.json(
        {
          error: "Erreur lors de la mise à jour du module",
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

export async function DELETE(
  request: Request,
  context: { params: { moduleId: string } }
) {
  try {
    const moduleId = context.params.moduleId;
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

    // Supprimer le module
    const { error: moduleError } = await supabase
      .from("modules")
      .delete()
      .eq("id", moduleId);

    if (moduleError) {
      console.error("Erreur lors de la suppression du module:", moduleError);
      return NextResponse.json(
        {
          error: "Erreur lors de la suppression du module",
          details: moduleError,
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
  context: { params: { moduleId: string } }
) {
  try {
    const moduleId = context.params.moduleId;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("modules")
      .select("*, exercises(*)")
      .eq("id", moduleId)
      .single();

    if (error) {
      console.error("Erreur lors de la récupération du module:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération du module" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Erreur serveur:", err);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
