"use client";

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
    <Link href={`/dashboard/forum/${post.id}`} className="block">
      <div className="bg-card rounded-lg p-6 hover:bg-card/80 transition-colors">
        <div className="flex items-center gap-4 mb-4">
          <Avatar>
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{post.author.name}</h3>
            <p className="text-sm text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: fr,
              })}
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-2">{post.title}</h2>
        <p className="text-gray-400 mb-4 line-clamp-2">
          {post.content.replace(/[#*`]/g, "")}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline">{post.category}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-gray-400">
              <ThumbsUp className="w-4 h-4 mr-1" />
              <span>{post.likesCount}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <MessageSquare className="w-4 h-4 mr-1" />
              <span>{post.repliesCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
