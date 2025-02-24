export type ForumPost = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  createdAt: string;
  likesCount: number;
  repliesCount: number;
};

export type ForumFilter = "popular" | "recent" | "unanswered";
