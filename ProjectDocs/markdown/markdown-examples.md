# Exemples de rendu Markdown

Ce document montre comment les différents éléments Markdown sont rendus dans CodeMastery.

## Titres

# Titre de niveau 1

## Titre de niveau 2

### Titre de niveau 3

#### Titre de niveau 4

## Formatage de texte

**Texte en gras**

_Texte en italique_

~~Texte barré~~

`Code en ligne`

## Listes

### Liste non ordonnée

- Premier élément
- Deuxième élément
  - Sous-élément
  - Autre sous-élément
- Troisième élément

### Liste ordonnée

1. Premier élément
2. Deuxième élément
   1. Sous-élément
   2. Autre sous-élément
3. Troisième élément

### Liste à cocher

- [ ] Tâche non complétée
- [x] Tâche complétée
- [ ] Autre tâche à faire

## Liens et images

[Lien vers Google](https://www.google.com)

![Logo CodeMastery](https://placehold.co/600x400?text=CodeMastery)

## Blocs de code

Code en ligne: `const x = 42;`

```javascript
// Commentaire
function hello(name) {
  return `Hello, ${name}!`;
}

console.log(hello("World"));
```

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Exemple HTML</title>
  </head>
  <body>
    <h1>Hello World</h1>
    <p>Ceci est un paragraphe.</p>
  </body>
</html>
```

```css
body {
  font-family: "Arial", sans-serif;
  color: #333;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}
```

## Tableaux

| Nom     | Âge | Profession    |
| ------- | --- | ------------- |
| Alice   | 28  | Développeuse  |
| Bob     | 32  | Designer      |
| Charlie | 25  | Product Owner |

## Citations

> Ceci est une citation simple.
>
> Elle peut s'étendre sur plusieurs lignes.

## Blocs d'alerte personnalisés

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

## Blocs dépliables

<details>
<summary>Cliquez pour voir plus d'informations</summary>

Ce contenu est masqué par défaut et s'affiche uniquement lorsque l'utilisateur clique sur le titre.

Vous pouvez inclure tout type de contenu Markdown à l'intérieur :

- Listes
- **Texte formaté**
- Etc.

</details>

## Séparateurs

---

Texte après un séparateur horizontal.
