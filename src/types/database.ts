export interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
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
