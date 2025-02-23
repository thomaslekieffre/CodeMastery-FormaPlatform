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

// Parcours
export async function getCourses() {
  try {
    console.log("Début getCourses");
    const supabase = createClient();

    // Test de connexion
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    console.log("Session:", {
      exists: !!session,
      user: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role,
      metadata: session?.user?.user_metadata,
      error: sessionError,
    });

    // Requête directe pour vérifier
    console.log("Exécution de la requête courses...");
    const { data, error, status, statusText } = await supabase
      .from("courses")
      .select("*")
      .order("sort_order", { ascending: true });

    console.log("Résultat de la requête courses:", {
      success: !!data,
      error,
      status,
      statusText,
      rowCount: data?.length || 0,
      firstRow: data?.[0],
    });

    if (error) {
      console.error("Erreur Supabase:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Exception dans getCourses:", error);
    throw error;
  }
}

export async function getCourseById(id: string) {
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (courseError) throw courseError;

  const { data: modules, error: modulesError } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", id)
    .order("sort_order", { ascending: true });

  if (modulesError) throw modulesError;

  return {
    ...course,
    modules,
  };
}

// Modules
export async function getModuleById(id: string) {
  const { data, error } = await supabase
    .from("modules")
    .select("*, exercises(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Progression des parcours
export async function getUserCourseProgress(userId: string) {
  try {
    console.log("Récupération de la progression pour userId:", userId);

    const { data: progress, error: progressError } = await supabase
      .from("user_course_progress")
      .select("*, courses(*, modules(*))")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (progressError) {
      console.error(
        "Erreur lors de la récupération de la progression:",
        progressError
      );
      throw progressError;
    }

    // Recalculer le statut pour chaque cours
    const updatedProgress =
      progress?.map((p) => {
        const modules = p.courses?.modules || [];
        const isFullyCompleted =
          modules.length > 0 &&
          modules.every((module: { id: string }) =>
            p.completed_modules.includes(module.id)
          );

        // Si le statut devrait être différent, mettre à jour en base
        if (isFullyCompleted && p.status !== "completed") {
          console.log(
            "Mise à jour du statut vers completed pour le cours:",
            p.course_id
          );

          // Utiliser une fonction asynchrone séparée pour la mise à jour
          const updateStatus = async () => {
            try {
              await supabase
                .from("user_course_progress")
                .update({
                  status: "completed",
                  completed_at: new Date().toISOString(),
                })
                .eq("id", p.id);
              console.log("Statut mis à jour avec succès");
            } catch (error) {
              console.error("Erreur lors de la mise à jour du statut:", error);
            }
          };

          // Exécuter la mise à jour en arrière-plan
          void updateStatus();
        }

        return {
          ...p,
          status: isFullyCompleted ? "completed" : p.status,
        };
      }) || [];

    console.log("Progression calculée:", updatedProgress);
    return updatedProgress;
  } catch (error) {
    console.error("Erreur dans getUserCourseProgress:", error);
    throw error;
  }
}

export async function getCourseProgress(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from("user_course_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
  return data;
}

export async function updateCourseProgress({
  userId,
  courseId,
  moduleId,
  completed,
}: {
  userId: string;
  courseId: string;
  moduleId: string;
  completed: boolean;
}) {
  try {
    console.log("Mise à jour de la progression:", {
      userId,
      courseId,
      moduleId,
      completed,
    });

    // Récupérer la progression existante
    const { data: existing } = await supabase
      .from("user_course_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    // Récupérer tous les modules du cours
    const { data: modules } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: true });

    if (!modules) throw new Error("Modules non trouvés");

    console.log("Modules trouvés:", modules.length);

    const completedModules = existing ? [...existing.completed_modules] : [];

    if (completed && !completedModules.includes(moduleId)) {
      completedModules.push(moduleId);
    } else if (!completed) {
      const index = completedModules.indexOf(moduleId);
      if (index > -1) {
        completedModules.splice(index, 1);
      }
    }

    // Calculer le nouveau statut
    const isFullyCompleted = modules.every((module) =>
      completedModules.includes(module.id)
    );

    const status = isFullyCompleted
      ? "completed"
      : completedModules.length > 0
      ? "in_progress"
      : "not_started";

    console.log("Nouveau statut calculé:", {
      completedModules: completedModules.length,
      totalModules: modules.length,
      status,
    });

    const progressData = {
      user_id: userId,
      course_id: courseId,
      completed_modules: completedModules,
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    };

    if (!existing) {
      // Créer une nouvelle entrée
      const { data, error } = await supabase
        .from("user_course_progress")
        .insert([progressData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Mettre à jour l'entrée existante
      const { data, error } = await supabase
        .from("user_course_progress")
        .update(progressData)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la progression:", error);
    throw error;
  }
}
