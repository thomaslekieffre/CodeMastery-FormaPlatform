"use client";

import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn("prose dark:prose-invert", className)}>
      <MarkdownRenderer content={content} />
    </div>
  );
}
