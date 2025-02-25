"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Image, Link, List, Bold, Italic, Code } from "lucide-react";
import { useForumStore } from "@/store/forum-store";
import { MarkdownEditor } from "@/components/forum/markdown-editor";
import { useAuth } from "@/hooks/use-auth";
import { ErrorMessage } from "@/components/ui/error-message";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewForumPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createPost = useForumStore((state) => state.createPost);
  const { user, isAuthenticated } = useAuth();

  const handleGoBack = () => {
    router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated || !user) {
      setError("Veuillez vous connecter pour créer une discussion");
      return;
    }

    if (!title.trim()) {
      setError("Le titre est requis");
      return;
    }

    if (!content.trim()) {
      setError("Le contenu est requis");
      return;
    }

    try {
      setIsSubmitting(true);
      await createPost({
        title,
        content,
        category,
      });

      // Rediriger vers la page du forum
      router.push("/dashboard/forum");
    } catch (err) {
      console.error("Error creating post:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={handleGoBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour
      </Button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Créer une nouvelle discussion
        </h1>

        {error && <ErrorMessage message={error} className="mb-6" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Titre
            </label>
            <Input
              id="title"
              placeholder="Titre de votre discussion"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-card"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Catégorie
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Général</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="nextjs">Next.js</SelectItem>
                <SelectItem value="nuxtjs">Nuxt.js</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Contenu
            </label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Rédigez votre message ici... Vous pouvez utiliser la syntaxe Markdown"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !isAuthenticated}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isSubmitting ? "Publication..." : "Publier"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
