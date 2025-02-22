export type Difficulty = "facile" | "moyen" | "difficile";
export type ProgressStatus = "not_started" | "in_progress" | "completed";

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  duration: string;
  technologies: string[];
  instructions: string;
  initial_code: string;
  language: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ExerciseTest {
  id: string;
  exercise_id: string;
  name: string;
  description: string;
  validation_code: string;
  error_message: string;
  created_at: string;
  created_by: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  exercise_id: string;
  status: ProgressStatus;
  code: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  created_at: string;
  title: string;
  description: string;
  image_url?: string;
  duration: string;
  difficulty: "facile" | "moyen" | "difficile";
  sort_order: number;
  modules?: Module[];
}

export interface Module {
  id: string;
  created_at: string;
  title: string;
  description: string;
  content?: string;
  type: "article" | "video" | "exercise";
  video_url?: string;
  course_id: string;
  sort_order: number;
}

export interface UserCourseProgress {
  id: string;
  created_at: string;
  user_id: string;
  course_id: string;
  completed_modules: string[];
  status: "not_started" | "in_progress" | "completed";
  started_at: string;
  completed_at?: string;
}

export interface Database {
  public: {
    Tables: {
      exercises: {
        Row: Exercise;
        Insert: Omit<Exercise, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Exercise, "id" | "created_at" | "updated_at">>;
      };
      exercise_tests: {
        Row: ExerciseTest;
        Insert: Omit<ExerciseTest, "id" | "created_at">;
        Update: Partial<Omit<ExerciseTest, "id" | "created_at">>;
      };
      user_progress: {
        Row: UserProgress;
        Insert: Omit<UserProgress, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<UserProgress, "id" | "created_at" | "updated_at">>;
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Course, "id" | "created_at" | "updated_at">>;
      };
      modules: {
        Row: Module;
        Insert: Omit<Module, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Module, "id" | "created_at" | "updated_at">>;
      };
      user_course_progress: {
        Row: UserCourseProgress;
        Insert: Omit<UserCourseProgress, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<UserCourseProgress, "id" | "created_at" | "updated_at">
        >;
      };
    };
  };
}
