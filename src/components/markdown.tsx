"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypePrism from "rehype-prism-plus";
import { cn } from "@/lib/utils";
import type { Components } from "react-markdown";

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  const components: Components = {
    h1: ({ ...props }) => <h1 className="text-2xl font-bold mb-4" {...props} />,
    h2: ({ ...props }) => (
      <h2 className="text-xl font-semibold mb-3 mt-6" {...props} />
    ),
    h3: ({ ...props }) => (
      <h3 className="text-lg font-medium mb-2 mt-4" {...props} />
    ),
    p: ({ ...props }) => (
      <p className="text-muted-foreground mb-4" {...props} />
    ),
    ul: ({ ...props }) => (
      <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
    ),
    ol: ({ ...props }) => (
      <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
    ),
    li: ({ ...props }) => <li className="text-muted-foreground" {...props} />,
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      const isInline = !match;
      return !isInline ? (
        <pre className={cn(className, "rounded-lg p-4 bg-muted overflow-auto")}>
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      ) : (
        <code
          className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-sm"
          {...props}
        >
          {children}
        </code>
      );
    },
    blockquote: ({ ...props }) => (
      <blockquote
        className="border-l-4 border-primary pl-4 italic mb-4"
        {...props}
      />
    ),
    a: ({ href, ...props }) => (
      <a
        href={href}
        className="text-primary hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
  };

  return (
    <div className={cn("prose dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypePrism]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
