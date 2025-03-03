export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role?: string;
  };
  likesCount: number;
  repliesCount: number;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    role?: string;
  };
}

export type ForumFilter = "popular" | "recent" | "unanswered";
