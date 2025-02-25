"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Link,
  Image,
  List,
  Code,
  Eye,
  Edit2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Écrivez votre contenu ici...",
  minHeight = "300px",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleBold = () => {
    insertAtCursor("**", "**");
  };

  const handleItalic = () => {
    insertAtCursor("*", "*");
  };

  const handleCode = () => {
    insertAtCursor("```\n", "\n```");
  };

  const handleList = () => {
    insertAtCursor("- ");
  };

  const handleInsertLink = () => {
    if (linkText && linkUrl) {
      insertAtCursor(`[${linkText}](${linkUrl})`);
      setLinkDialogOpen(false);
      setLinkText("");
      setLinkUrl("");
    }
  };

  const handleInsertImage = () => {
    if (imageUrl) {
      insertAtCursor(`![${imageAlt}](${imageUrl})`);
      setImageDialogOpen(false);
      setImageAlt("");
      setImageUrl("");
    }
  };

  return (
    <div className="border rounded-md bg-card">
      <Tabs defaultValue="edit" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleBold}
              title="Gras"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleItalic}
              title="Italique"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCode}
              title="Code"
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleList}
              title="Liste"
            >
              <List className="h-4 w-4" />
            </Button>
            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="ghost" size="icon" title="Lien">
                  <Link className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Insérer un lien</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="link-text">Texte du lien</Label>
                    <Input
                      id="link-text"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="Texte à afficher"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="link-url">URL</Label>
                    <Input
                      id="link-url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://exemple.com"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <DialogClose asChild>
                      <Button variant="outline">Annuler</Button>
                    </DialogClose>
                    <Button onClick={handleInsertLink}>Insérer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="ghost" size="icon" title="Image">
                  <Image className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Insérer une image</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="image-alt">Texte alternatif</Label>
                    <Input
                      id="image-alt"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="Description de l'image"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image-url">URL de l'image</Label>
                    <Input
                      id="image-url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://exemple.com/image.jpg"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <DialogClose asChild>
                      <Button variant="outline">Annuler</Button>
                    </DialogClose>
                    <Button onClick={handleInsertImage}>Insérer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <TabsList className="grid grid-cols-2 h-8">
            <TabsTrigger value="edit" className="text-xs">
              <Edit2 className="h-3 w-3 mr-1" />
              Éditer
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Aperçu
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="edit" className="p-0 m-0">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none rounded-b-md",
              "min-h-[300px]"
            )}
            style={{ minHeight }}
          />
        </TabsContent>
        <TabsContent
          value="preview"
          className="p-4 m-0 min-h-[300px] prose prose-invert max-w-none"
        >
          {value ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-gray-400 italic">Rien à afficher</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
