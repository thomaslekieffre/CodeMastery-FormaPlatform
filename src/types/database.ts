export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  image_url?: string;
  sort_order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  type: "article" | "video";
  content: string;
  video_url?: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: Course;
        Insert: Omit<Course, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Course, "id">>;
      };
    };
  };
}
