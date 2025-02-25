"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  Plus,
} from "lucide-react";
import { ForumCard } from "@/components/forum/forum-card";
import { PopularTopics } from "@/components/forum/popular-topics";
import { TopContributors } from "@/components/forum/top-contributors";
import { useForumStore } from "@/store/forum-store";
import { useEffect } from "react";
import { ErrorMessage } from "@/components/ui/error-message";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function ForumPage() {
  const {
    posts,
    filter,
    searchQuery,
    isLoading,
    error,
    setFilter,
    setSearchQuery,
    fetchPosts,
  } = useForumStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Forum Communautaire</h1>
          <p className="text-gray-400">
            Échangez avec la communauté, posez vos questions et partagez vos
            connaissances
          </p>
        </div>
        <Link href="/dashboard/forum/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle discussion
          </Button>
        </Link>
      </div>

      {/* Search and filters */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Rechercher dans les discussions..."
          className="pl-10 bg-card"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              className={
                filter === "popular" ? "text-violet-400" : "text-gray-400"
              }
              onClick={() => setFilter("popular")}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Populaire
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={
                filter === "recent" ? "text-violet-400" : "text-gray-400"
              }
              onClick={() => setFilter("recent")}
            >
              <Clock className="w-4 h-4 mr-2" />
              Récent
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={
                filter === "unanswered" ? "text-violet-400" : "text-gray-400"
              }
              onClick={() => setFilter("unanswered")}
            >
              <Users className="w-4 h-4 mr-2" />
              Sans réponse
            </Button>
          </div>

          {/* Forum posts list */}
          <div className="space-y-4">
            {error && <ErrorMessage message={error} />}

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Aucune discussion trouvée
              </div>
            ) : (
              posts.map((post) => <ForumCard key={post.id} post={post} />)
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <PopularTopics />
          <TopContributors />
        </div>
      </div>
    </div>
  );
}
