# Documentation Markdown pour CodeMastery

Cette documentation explique comment utiliser et intégrer le Markdown dans l'application CodeMastery.

## Contenu de la documentation

1. [Guide d'utilisation du Markdown](./markdown-guide.md) - Guide complet pour les utilisateurs sur la syntaxe Markdown supportée dans CodeMastery.

2. [Exemples de rendu Markdown](./markdown-examples.md) - Exemples visuels montrant comment les différents éléments Markdown sont rendus dans l'application.

3. [Intégration du composant MarkdownRenderer](./markdown-integration.md) - Documentation technique pour les développeurs sur l'intégration du composant MarkdownRenderer dans d'autres parties de l'application.

4. [Correction des erreurs de linter](./markdown-renderer-fixes.md) - Guide technique pour résoudre les erreurs de linter dans le composant MarkdownRenderer.

## Fonctionnalités Markdown supportées

CodeMastery prend en charge une large gamme de fonctionnalités Markdown, notamment :

- Formatage de texte (gras, italique, barré)
- Titres hiérarchiques
- Listes (ordonnées, non ordonnées, à cocher)
- Liens et images
- Blocs de code avec coloration syntaxique
- Tableaux
- Citations
- Blocs d'alerte personnalisés
- Blocs dépliables (details/summary)

## Architecture

Le système Markdown de CodeMastery est basé sur les composants suivants :

- `MarkdownRenderer` - Composant principal pour le rendu du Markdown
- `Markdown` - Composant wrapper simplifié
- `MarkdownEditor` - Éditeur Markdown avec prévisualisation

Ces composants utilisent les bibliothèques suivantes :

- `react-markdown` - Bibliothèque de base pour le parsing et le rendu Markdown
- `remark-gfm` - Plugin pour le support des fonctionnalités GitHub Flavored Markdown
- `rehype-raw` - Plugin pour le support du HTML brut
- `react-syntax-highlighter` - Bibliothèque pour la coloration syntaxique des blocs de code

## Contribution

Pour contribuer à l'amélioration du système Markdown de CodeMastery :

1. Consultez la documentation technique
2. Testez vos modifications avec les exemples fournis
3. Assurez-vous que toutes les fonctionnalités existantes continuent de fonctionner
4. Soumettez vos modifications via une pull request
