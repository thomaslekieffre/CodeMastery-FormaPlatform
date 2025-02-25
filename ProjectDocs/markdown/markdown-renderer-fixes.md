# Correction des erreurs de linter dans MarkdownRenderer

Ce document explique comment corriger les erreurs de linter identifiées dans le composant `MarkdownRenderer`.

## Erreurs identifiées

Le composant `MarkdownRenderer` présente actuellement les erreurs de linter suivantes :

1. **Erreur sur les propriétés `children` :**

   ```
   Property 'children' does not exist on type 'ElementContent'.
   Property 'children' does not exist on type 'Text'.
   ```

2. **Erreur sur la propriété `inline` :**

   ```
   Property 'inline' does not exist on type 'ClassAttributes<HTMLElement> & HTMLAttributes<HTMLElement> & ExtraProps'.
   ```

3. **Erreur sur le type de style pour SyntaxHighlighter :**

   ```
   Type 'CSSProperties | { [key: string]: CSSProperties; }' is not assignable to type '{ [key: string]: CSSProperties; } | undefined'.
   ```

4. **Erreur sur la propriété `value` :**
   ```
   Property 'value' does not exist on type 'ElementContent'.
   Property 'value' does not exist on type 'Element'.
   ```

## Solutions proposées

### 1. Correction des erreurs liées aux propriétés `children` et `value`

Ces erreurs sont liées au typage des nœuds dans `react-markdown`. Pour les corriger, nous devons utiliser des assertions de type ou des vérifications plus sûres :

```tsx
// Avant
const content = node?.children?.[0]?.children?.[0]?.value || "";

// Après
const content =
  ((node?.children?.[0] as any)?.children?.[0] as any)?.value || "";
```

Ou mieux, avec une approche plus sûre :

```tsx
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

// Utilisation
const content = getTextContent(node);
```

### 2. Correction de l'erreur sur la propriété `inline`

Cette erreur est due à un problème de typage avec les props du composant `code` dans `react-markdown`. Pour la corriger :

```tsx
// Avant
code: ({ node, inline, className, children, ...props }) => {
  // ...
};

// Après
code: ({ node, className, children, ...props }: any) => {
  const inline = props.inline || false;
  // ...
};
```

### 3. Correction de l'erreur sur le type de style pour SyntaxHighlighter

Cette erreur est liée au typage des styles dans `react-syntax-highlighter`. Pour la corriger :

```tsx
// Avant
<SyntaxHighlighter
  style={isDark ? vscDarkPlus : vs}
  language={language}
  // ...
>

// Après
<SyntaxHighlighter
  style={isDark ? vscDarkPlus as any : vs as any}
  language={language}
  // ...
>
```

## Version corrigée complète

Voici une version corrigée du composant qui résout toutes les erreurs de linter :

```tsx
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
import { CheckSquare, Square } from "lucide-react";

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

  // Fonction pour transformer les emojis spéciaux en classes CSS
  const processContent = (markdown: string) => {
    // Transformation des blocs personnalisés
    return markdown
      .replace(
        /> \*\*⚠️ Attention :\*\*/g,
        "> **⚠️ Attention :** {.alert .alert-warning}"
      )
      .replace(/> \*\*ℹ️ Info :\*\*/g, "> **ℹ️ Info :** {.alert .alert-info}")
      .replace(
        /> \*\*❗ Important :\*\*/g,
        "> **❗ Important :** {.alert .alert-important}"
      )
      .replace(
        /> \*\*📌 À retenir :\*\*/g,
        "> **📌 À retenir :** {.alert .alert-recap}"
      )
      .replace(
        /> \*\*🚀 Astuce avancée :\*\*/g,
        "> **🚀 Astuce avancée :** {.alert .alert-tip}"
      )
      .replace(
        /> \*\*🔍 Debugging :\*\*/g,
        "> **🔍 Debugging :** {.alert .alert-debug}"
      );
  };

  return (
    <div className={cn("prose dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold mb-4 pb-2 border-b" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-bold mt-6 mb-3" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-bold mt-4 mb-2" {...props} />
          ),
          blockquote: ({ node, className, ...props }: any) => {
            // Extraire la classe CSS des alertes si présente
            const content = getTextContent(node);
            const match = content.match(/{\.alert\s\.alert-([a-z]+)}/);

            let alertType = "";
            let cleanChildren = props.children;

            if (match) {
              alertType = match[1];
              // Nettoyer le contenu pour enlever le marqueur de classe
              cleanChildren = React.Children.map(props.children, (child) => {
                if (typeof child === "string") {
                  return child.replace(/{\.alert\s\.alert-[a-z]+}/g, "");
                }
                return child;
              });
            }

            const alertClasses = {
              warning:
                "bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500",
              info: "bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500",
              important:
                "bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500",
              recap:
                "bg-purple-100 dark:bg-purple-900/30 border-l-4 border-purple-500",
              tip: "bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500",
              debug: "bg-gray-100 dark:bg-gray-800 border-l-4 border-gray-500",
            };

            return (
              <blockquote
                className={cn(
                  "p-4 my-4 italic border-l-4 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50",
                  alertType &&
                    alertClasses[alertType as keyof typeof alertClasses]
                )}
                {...props}
              >
                {cleanChildren}
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
        {processContent(content)}
      </ReactMarkdown>
    </div>
  );
}
```

## Explications des corrections

1. **Fonction `getTextContent`** : Cette fonction utilitaire extrait le contenu textuel d'un nœud de manière sécurisée, en vérifiant l'existence des propriétés à chaque niveau.

2. **Typage explicite avec `any`** : Pour les composants qui utilisent des propriétés non standard de `react-markdown`, nous utilisons le type `any` pour éviter les erreurs de typage.

3. **Extraction de la propriété `inline`** : Nous extrayons la propriété `inline` des props avec une valeur par défaut.

4. **Assertion de type pour les styles** : Nous utilisons une assertion de type (`as any`) pour les styles de `SyntaxHighlighter`.

Ces modifications permettent de résoudre toutes les erreurs de linter tout en préservant la fonctionnalité du composant.
