"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { ForumPost } from "@/types/forum";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heading, Paragraph } from "@/components/ui/typography";

interface ForumCardProps {
  post: ForumPost;
}

export function ForumCard({ post }: ForumCardProps) {
  return (
    <Link href={`/dashboard/forum/${post.id}`} className="block">
      <Card className="hover:bg-black/50 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <Heading as="h3" size="h5" className="font-medium">
                {post.author.name}
              </Heading>
              <Paragraph size="sm" colorScheme="muted">
                {post.created_at
                  ? formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })
                  : "Date inconnue"}
              </Paragraph>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <CardTitle className="mb-2">{post.title}</CardTitle>
          <Paragraph colorScheme="muted" className="mb-4 line-clamp-2">
            {post.content.replace(/[#*`]/g, "")}
          </Paragraph>
        </CardContent>

        <CardFooter className="flex items-center justify-between">
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
        </CardFooter>
      </Card>
    </Link>
  );
}
