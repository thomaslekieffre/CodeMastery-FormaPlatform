# Guide d'écriture des tests de validation

## Introduction

Le système de validation des exercices permet de vérifier automatiquement le code soumis par les apprenants. Chaque test reçoit le code de l'apprenant en paramètre et doit retourner `true` si le test est réussi, `false` sinon.

## Structure d'un test

Un test est composé de :

- Un nom
- Une description
- Un code de validation
- Un message d'erreur

## Exemples par type d'exercice

### 1. Test de déclaration de variable

```javascript
// Test si une variable 'test' est déclarée et égale à 1
return code.trim() === "const test = 1;";

// Version plus flexible (accepte let/var et espaces)
return /^(const|let|var)\s+test\s*=\s*1\s*;?\s*$/.test(code);
```

### 2. Test de fonction

```javascript
// Test une fonction qui retourne la somme de deux nombres
try {
  eval(code); // Évalue le code de l'utilisateur
  const add = eval("add(2, 3)"); // Teste la fonction
  return add === 5;
} catch (error) {
  return false;
}
```

### 3. Test de manipulation du DOM

```javascript
// Test si un élément a été créé avec le bon contenu
try {
  const doc = new DOMParser().parseFromString(code, "text/html");
  const element = doc.querySelector(".my-class");
  return element && element.textContent === "Hello World";
} catch (error) {
  return false;
}
```

### 4. Test de style CSS

```javascript
// Test si une règle CSS spécifique est présente
try {
  return (
    code.includes("background-color: #ff0000") ||
    code.includes("background-color: red")
  );
} catch (error) {
  return false;
}
```

### 5. Test avec plusieurs conditions

```javascript
// Test multiple conditions
try {
  // Vérifie la syntaxe
  eval(code);

  // Vérifie plusieurs conditions
  const hasVariable = /const\s+myVar/.test(code);
  const hasFunction = /function\s+myFunc/.test(code);
  const hasLoop = /for\s*\(/.test(code);

  return hasVariable && hasFunction && hasLoop;
} catch (error) {
  return false;
}
```

### 6. Test avec validation de sortie console

```javascript
// Test si console.log est appelé avec le bon argument
try {
  let loggedValue;
  const fakeConsole = {
    log: (value) => {
      loggedValue = value;
    },
  };

  const testCode = `
    const console = fakeConsole;
    ${code}
  `;

  eval(testCode);
  return loggedValue === "expected output";
} catch (error) {
  return false;
}
```

## Bonnes pratiques

1. **Sécurité** :

   - Toujours utiliser `try/catch` pour gérer les erreurs
   - Éviter d'exécuter du code dangereux
   - Limiter l'accès aux APIs sensibles

2. **Flexibilité** :

   - Accepter différents styles de code valides
   - Gérer les espaces et retours à la ligne
   - Accepter les points-virgules optionnels

3. **Messages d'erreur** :
   - Fournir des messages d'erreur clairs et utiles
   - Indiquer précisément ce qui ne va pas
   - Donner des indices sur la correction

## Exemples de messages d'erreur

```javascript
// Messages d'erreur bien formulés
"La variable 'test' n'est pas déclarée avec 'const'";
"La fonction doit retourner 42";
"L'élément doit avoir la classe 'header'";
"La couleur de fond doit être rouge (#ff0000)";
```

## Débogage

Pour déboguer vos tests, vous pouvez utiliser `console.log` dans le code de validation :

```javascript
try {
  console.log("Code reçu:", code);
  const result = eval(code);
  console.log("Résultat:", result);
  return result === 42;
} catch (error) {
  console.log("Erreur:", error);
  return false;
}
```

## Limitations connues

- Les tests s'exécutent dans un environnement limité
- Certaines APIs du navigateur ne sont pas disponibles
- Les modules ES6 ne sont pas supportés dans le code de validation
