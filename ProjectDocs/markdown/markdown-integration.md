# Intégration du composant MarkdownRenderer

Ce document explique comment intégrer le composant `MarkdownRenderer` dans différentes parties de l'application CodeMastery.

## Vue d'ensemble

Le composant `MarkdownRenderer` est un composant React qui permet de rendre du contenu Markdown avec des fonctionnalités avancées, notamment :

- Formatage de texte (gras, italique, etc.)
- Titres hiérarchiques
- Listes (ordonnées, non ordonnées, à cocher)
- Blocs de code avec coloration syntaxique
- Tableaux
- Blocs d'alerte personnalisés
- Blocs dépliables (details/summary)
- Et plus encore...

## Installation des dépendances

Assurez-vous que les dépendances suivantes sont installées :

```bash
pnpm add react-markdown remark-gfm rehype-raw react-syntax-highlighter
pnpm add -D @types/react-syntax-highlighter
```

## Utilisation de base

Pour utiliser le composant `MarkdownRenderer` dans vos composants React :

```tsx
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

// Dans votre composant React
function MyComponent() {
  const markdownContent = "# Titre\n\nCeci est du **contenu** en Markdown.";

  return (
    <div>
      <h2>Mon contenu Markdown</h2>
      <MarkdownRenderer content={markdownContent} />
    </div>
  );
}
```

## Personnalisation

Vous pouvez personnaliser l'apparence du rendu Markdown en passant une classe CSS via la prop `className` :

```tsx
<MarkdownRenderer
  content={markdownContent}
  className="prose-sm dark:prose-invert prose-violet"
/>
```

## Exemples d'intégration

### Dans une page de détail

```tsx
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

export default function CourseDetailPage({ course }) {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">{course.title}</h1>

      <div className="bg-card rounded-lg p-6">
        <MarkdownRenderer content={course.description} />
      </div>
    </div>
  );
}
```

### Dans un composant de commentaires

```tsx
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

function CommentItem({ comment }) {
  return (
    <div className="border-b pb-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Avatar user={comment.author} />
        <span className="font-medium">{comment.author.name}</span>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <MarkdownRenderer content={comment.content} />
      </div>
    </div>
  );
}
```

### Dans un éditeur avec prévisualisation

```tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

function MarkdownEditor() {
  const [content, setContent] = useState("");

  return (
    <Tabs defaultValue="edit">
      <TabsList>
        <TabsTrigger value="edit">Éditer</TabsTrigger>
        <TabsTrigger value="preview">Aperçu</TabsTrigger>
      </TabsList>

      <TabsContent value="edit">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrivez votre contenu en Markdown..."
          className="min-h-[300px]"
        />
      </TabsContent>

      <TabsContent value="preview">
        <div className="border rounded-md p-4 min-h-[300px]">
          {content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <p className="text-muted-foreground">Rien à afficher</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
```

## Résolution des problèmes courants

### Problème : Le contenu Markdown ne s'affiche pas correctement

Vérifiez que :

1. Le contenu passé à la prop `content` est bien une chaîne de caractères valide
2. Les dépendances sont correctement installées
3. Le composant est bien importé depuis le bon chemin

### Problème : Les blocs de code ne sont pas colorés

Assurez-vous que :

1. La dépendance `react-syntax-highlighter` est installée
2. Le langage est correctement spécifié dans le bloc de code (ex: ```javascript)

### Problème : Les blocs d'alerte personnalisés ne fonctionnent pas

Vérifiez que la syntaxe est correcte :

```markdown
> **⚠️ Attention :** Votre message d'alerte
```

Le format doit être exactement comme ci-dessus, avec les emojis spécifiques.

## Architecture technique

Le composant `MarkdownRenderer` utilise :

- `react-markdown` pour le parsing et le rendu de base du Markdown
- `remark-gfm` pour le support des fonctionnalités GitHub Flavored Markdown
- `rehype-raw` pour le support du HTML brut
- `react-syntax-highlighter` pour la coloration syntaxique des blocs de code

Le composant transforme également certains motifs spécifiques (comme les blocs d'alerte) en utilisant une fonction de prétraitement du contenu Markdown.

## Contribution

Pour étendre les fonctionnalités du composant `MarkdownRenderer`, modifiez le fichier `src/components/ui/markdown-renderer.tsx` et ajoutez vos personnalisations dans la configuration des composants.
