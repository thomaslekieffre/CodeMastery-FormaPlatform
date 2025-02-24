import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { ForumPost } from "@/types/forum";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ForumCardProps {
  post: ForumPost;
}

export function ForumCard({ post }: ForumCardProps) {
  return (
    <div className="p-6 rounded-xl border bg-card hover:bg-card/80 transition-colors">
      <div className="flex items-start gap-4">
        <Avatar>
          <AvatarImage src={post.author.avatar} />
          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/dashboard/forum/${post.id}`}
              className="font-semibold hover:text-violet-400 transition-colors"
            >
              {post.title}
            </Link>
            <Badge variant="outline" className="text-violet-400">
              {post.category}
            </Badge>
          </div>
          <p className="text-sm text-gray-400 line-clamp-2 mb-4">
            {post.content}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{post.repliesCount} réponses</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              <span>{post.likesCount} likes</span>
            </div>
            <span>
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: fr,
              })}
            </span>
            <Link
              href={`/dashboard/forum/${post.id}`}
              className="text-violet-400 hover:underline ml-auto"
            >
              Voir la discussion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
