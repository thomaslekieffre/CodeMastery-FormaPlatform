import { createClient } from "@/lib/supabase/client";
import type {
  Database,
  Exercise,
  ExerciseTest,
  UserProgress,
} from "@/types/database";

const supabase = createClient<Database>();

// Exercices
export async function getExercises() {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getExerciseById(id: string) {
  const { data: exercise, error: exerciseError } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .single();

  if (exerciseError) throw exerciseError;

  const { data: tests, error: testsError } = await supabase
    .from("exercise_tests")
    .select("*")
    .eq("exercise_id", id)
    .order("created_at", { ascending: true });

  if (testsError) throw testsError;

  return {
    ...exercise,
    tests,
  };
}

// Progression utilisateur
export async function getUserProgress(userId: string) {
  const { data, error } = await supabase
    .from("user_progress")
    .select("*, exercises(*)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getExerciseProgress(userId: string, exerciseId: string) {
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("exercise_id", exerciseId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
  return data;
}

export async function updateExerciseProgress({
  userId,
  exerciseId,
  code,
  status,
}: {
  userId: string;
  exerciseId: string;
  code: string;
  status: UserProgress["status"];
}) {
  const { data: existing } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("exercise_id", exerciseId)
    .single();

  if (!existing) {
    // Créer une nouvelle entrée
    const { data, error } = await supabase
      .from("user_progress")
      .insert({
        user_id: userId,
        exercise_id: exerciseId,
        code,
        status,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Mettre à jour l'entrée existante
    const { data, error } = await supabase
      .from("user_progress")
      .update({
        code,
        status,
        completed_at:
          status === "completed"
            ? new Date().toISOString()
            : existing.completed_at,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
