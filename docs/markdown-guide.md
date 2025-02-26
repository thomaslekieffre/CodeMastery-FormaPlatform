# Guide d'utilisation du Markdown dans CodeMastery

Ce guide explique comment utiliser le Markdown dans les différentes sections de CodeMastery (forums, commentaires, etc.) pour créer du contenu riche et bien formaté.

## Syntaxe de base

### Titres

```markdown
# Titre de niveau 1

## Titre de niveau 2

### Titre de niveau 3

#### Titre de niveau 4
```

### Formatage de texte

```markdown
**Texte en gras**
_Texte en italique_
~~Texte barré~~
```

### Listes

```markdown
- Élément de liste non ordonnée
- Autre élément
  - Sous-élément (avec 2 espaces d'indentation)

1. Élément de liste ordonnée
2. Deuxième élément
```

### Liens et images

```markdown
[Texte du lien](https://example.com)
![Texte alternatif](https://example.com/image.jpg)
```

## Fonctionnalités avancées

### Blocs de code

````markdown
```javascript
function hello() {
  console.log("Hello, world!");
}
```
````

Langages supportés : `javascript`, `typescript`, `html`, `css`, `jsx`, `bash`, `sql`, etc.

### Tableaux

```markdown
| Colonne 1 | Colonne 2 | Colonne 3 |
| --------- | --------- | --------- |
| Ligne 1   | Donnée    | Donnée    |
| Ligne 2   | Donnée    | Donnée    |
```

### Listes à cocher

```markdown
- [ ] Tâche non complétée
- [x] Tâche complétée
```

### Blocs dépliables (details)

```markdown
<details>
<summary>Cliquez pour voir plus</summary>

Contenu qui sera affiché lorsque l'utilisateur clique sur le titre.

</details>
```

## Blocs d'alerte personnalisés

CodeMastery supporte des blocs d'alerte spéciaux pour mettre en évidence certaines informations :

```markdown
> Note
> Informations utiles que les utilisateurs devraient connaître, même en survolant le contenu.

> Tip
> Conseils utiles pour faire les choses mieux ou plus facilement.

> Important
> Informations essentielles dont les utilisateurs ont besoin pour atteindre leur objectif.

> Warning
> Informations urgentes qui nécessitent l'attention immédiate de l'utilisateur pour éviter des problèmes.

> Caution
> Avertissements concernant les risques ou conséquences négatives de certaines actions.
```

Vous pouvez également utiliser les anciennes syntaxes qui seront automatiquement converties :

```markdown
> ℹ️ Info : Informations utiles...

> 🚀 Astuce : Conseils utiles...

> ❗ Important : Informations essentielles...

> ⚠️ Attention : Informations urgentes...

> 🔺 Caution : Avertissements concernant les risques...
```

## Exemples concrets

### Exemple de post de forum

````markdown
# Introduction à JavaScript

## Qu'est-ce que JavaScript?

JavaScript est un langage de programmation qui permet d'ajouter de l'interactivité aux pages web.

> Important
> JavaScript n'est pas Java! Ce sont deux langages complètement différents.

### Votre premier programme

```javascript
// Affiche un message dans la console
console.log("Bonjour, monde!");

// Affiche une alerte dans le navigateur
alert("Bonjour, monde!");
```

### Concepts de base

- Variables
- Fonctions
- Objets
- Tableaux

## Exercices pratiques

- [ ] Créer une variable et l'afficher dans la console
- [ ] Écrire une fonction qui additionne deux nombres
- [x] Comprendre la différence entre `let` et `const`

> Tip
> Utilisez les outils de développement de votre navigateur pour déboguer votre code JavaScript.
````

### Exemple de commentaire

```markdown
**@utilisateur** Merci pour ton explication!

Je voudrais ajouter que:

1. Les fonctions fléchées (`=>`) ont un comportement différent avec `this`
2. On peut utiliser `const` pour les objets et tableaux, même si leur contenu change

> Note
> MDN est une excellente ressource pour apprendre JavaScript: [MDN Web Docs](https://developer.mozilla.org)
```

## Conseils d'utilisation

- Utilisez les titres pour structurer votre contenu
- Mettez en évidence les points importants avec les blocs d'alerte
- Utilisez les blocs de code avec coloration syntaxique pour partager du code
- Insérez des liens vers des ressources externes pertinentes
- Utilisez les listes à cocher pour les étapes à suivre

---

Pour toute question sur l'utilisation du Markdown dans CodeMastery, n'hésitez pas à demander de l'aide sur le forum.
