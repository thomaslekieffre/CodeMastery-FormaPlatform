"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForumStore } from "@/store/forum-store";
import { useAuth } from "@/hooks/use-auth";
import { ErrorMessage } from "@/components/ui/error-message";

export function CreatePostDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const createPost = useForumStore((state) => state.createPost);
  const { user, isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated || !user) {
      setError("Veuillez vous connecter pour créer une discussion");
      return;
    }

    try {
      await createPost({
        title,
        content,
        category: "general",
      });

      setIsOpen(false);
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Error creating post:", error);
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <MessageSquare className="w-4 h-4 mr-2" />
          Nouvelle discussion
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une nouvelle discussion</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorMessage message={error} />}
          <div className="space-y-2">
            <Input
              placeholder="Titre de la discussion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Contenu de votre message"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={!isAuthenticated}>
              Publier
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
