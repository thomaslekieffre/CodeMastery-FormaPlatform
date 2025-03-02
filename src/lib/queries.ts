import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

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
    .select("*")
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

interface UpdateCourseProgressParams {
  userId: string;
  courseId: string;
  moduleId: string;
  completed: boolean;
}

interface TrackTimeParams {
  userId: string;
  courseId: string;
  moduleId: string;
  duration: number;
}

export async function updateCourseProgress({
  userId,
  courseId,
  moduleId,
  completed,
}: UpdateCourseProgressParams) {
  const supabase = createClient();
  const { error } = await supabase.from("module_progress").upsert({
    user_id: userId,
    course_id: courseId,
    module_id: moduleId,
    completed,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function trackTime({
  userId,
  courseId,
  moduleId,
  duration,
}: TrackTimeParams) {
  const supabase = createClient();
  const { error } = await supabase.from("module_time_spent").insert({
    user_id: userId,
    course_id: courseId,
    module_id: moduleId,
    duration,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
}
