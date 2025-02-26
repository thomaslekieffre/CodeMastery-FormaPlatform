"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import {
  CheckSquare,
  Square,
  AlertTriangle,
  Info,
  AlertCircle,
  Lightbulb,
  FileWarning,
} from "lucide-react";
import { Heading, Paragraph } from "./typography";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Fonction utilitaire pour extraire le texte d'un nœud de manière sécurisée
const getTextContent = (node: any): string => {
  if (!node || !node.children || node.children.length === 0) return "";

  const firstChild = node.children[0];
  if (!firstChild) return "";

  if (firstChild.type === "text" && typeof firstChild.value === "string") {
    return firstChild.value;
  }

  if (firstChild.children && firstChild.children.length > 0) {
    return getTextContent(firstChild);
  }

  return "";
};

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Fonction pour détecter le type d'alerte basé sur le contenu
  const getAlertType = (
    content: string
  ): { type: string; icon: React.ReactNode; title: string } | null => {
    if (content.startsWith("Note") || content.includes("ℹ️ Info")) {
      return {
        type: "note",
        icon: <Info className="h-5 w-5 text-blue-600" />,
        title: "Note",
      };
    }
    if (content.startsWith("Tip") || content.includes("🚀 Astuce")) {
      return {
        type: "tip",
        icon: <Lightbulb className="h-5 w-5 text-green-600" />,
        title: "Tip",
      };
    }
    if (content.startsWith("Important") || content.includes("❗ Important")) {
      return {
        type: "important",
        icon: <AlertCircle className="h-5 w-5 text-purple-600" />,
        title: "Important",
      };
    }
    if (content.startsWith("Warning") || content.includes("⚠️ Attention")) {
      return {
        type: "warning",
        icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
        title: "Warning",
      };
    }
    if (content.startsWith("Caution") || content.includes("🔺 Caution")) {
      return {
        type: "caution",
        icon: <FileWarning className="h-5 w-5 text-red-600" />,
        title: "Caution",
      };
    }
    return null;
  };

  return (
    <div className={cn("prose dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <Heading
              as="h1"
              size="h1"
              className="mb-4 pb-2 border-b"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <Heading as="h2" size="h2" className="mt-8 mb-4" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <Heading as="h3" size="h3" className="mt-6 mb-3" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <Heading as="h4" size="h4" className="mt-4 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => <Paragraph className="my-4" {...props} />,
          blockquote: ({ node, className, children, ...props }: any) => {
            // Convertir les enfants en texte pour analyse
            let textContent = "";
            React.Children.forEach(children, (child) => {
              if (typeof child === "string") {
                textContent += child;
              } else if (child?.props?.children) {
                // Récupérer le texte des enfants de React
                React.Children.forEach(child.props.children, (grandChild) => {
                  if (typeof grandChild === "string") {
                    textContent += grandChild;
                  }
                });
              }
            });

            // Détecter le type d'alerte
            const alertInfo = getAlertType(textContent);

            if (alertInfo) {
              const alertClasses = {
                note: "border-l-blue-600 bg-blue-50 dark:bg-blue-950/30",
                tip: "border-l-green-600 bg-green-50 dark:bg-green-950/30",
                important:
                  "border-l-purple-600 bg-purple-50 dark:bg-purple-950/30",
                warning: "border-l-amber-600 bg-amber-50 dark:bg-amber-950/30",
                caution: "border-l-red-600 bg-red-50 dark:bg-red-950/30",
              };

              return (
                <div
                  className={cn(
                    "my-4 border-l-4 pl-4 py-2",
                    alertClasses[alertInfo.type as keyof typeof alertClasses]
                  )}
                >
                  <div className="flex items-center gap-2 font-medium mb-1">
                    {alertInfo.icon}
                    <span>{alertInfo.title}</span>
                  </div>
                  <div className="pl-7">{children}</div>
                </div>
              );
            }

            // Blockquote standard si ce n'est pas une alerte
            return (
              <blockquote
                className="p-4 my-4 italic border-l-4 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                {...props}
              >
                {children}
              </blockquote>
            );
          },
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const inline = props.inline || false;

            return !inline && language ? (
              <SyntaxHighlighter
                style={(isDark ? vscDarkPlus : vs) as any}
                language={language}
                PreTag="div"
                className="rounded-md !my-4"
                showLineNumbers
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className={cn(
                  "bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table
                className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="px-6 py-4 whitespace-nowrap text-sm" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr
              className="bg-white dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800/50"
              {...props}
            />
          ),
          img: ({ node, ...props }) => (
            <img
              className="rounded-lg max-w-full h-auto my-4"
              {...props}
              alt={props.alt || "Image"}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          li: ({ node, className, ...props }: any) => {
            // Gestion des checklists
            const content = getTextContent(node);
            if (content.startsWith("[ ] ")) {
              return (
                <li className="flex items-start gap-2 my-1">
                  <Square className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>{content.substring(4)}</span>
                </li>
              );
            } else if (content.startsWith("[x] ")) {
              return (
                <li className="flex items-start gap-2 my-1">
                  <CheckSquare className="h-5 w-5 mt-0.5 flex-shrink-0 text-green-500" />
                  <span>{content.substring(4)}</span>
                </li>
              );
            }
            return <li className="my-1" {...props} />;
          },
          details: ({ node, ...props }) => (
            <details
              className="border border-gray-200 dark:border-gray-700 rounded-md p-2 my-4"
              {...props}
            />
          ),
          summary: ({ node, ...props }) => (
            <summary
              className="font-medium cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
