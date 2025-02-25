# CodeMastery - Plateforme d'Apprentissage du Développement Web

![CodeMastery Logo](public/logo.png)

CodeMastery est une plateforme éducative moderne destinée aux débutants en développement web. Notre mission est de fournir un parcours d'apprentissage structuré, interactif et communautaire pour accompagner les "baby devs" du HTML jusqu'à Nuxt.js.

## 🚀 Fonctionnalités

### Système d'Authentification

- Authentification par magic link
- Gestion des rôles (Admin, Formateur, Apprenant)
- Profils utilisateurs personnalisables

### Parcours d'Apprentissage

- Cours interactifs avec vidéos, articles et quiz
- Progression structurée du HTML aux frameworks modernes
- Projets pratiques à chaque étape d'apprentissage
- Système de validation des compétences
- Certification après validation d'un parcours

### Environnement de Code

- Éditeur de code intégré
- Environnement d'exécution en direct
- Validation automatique des exercices
- Feedback instantané sur le code

### Communauté et Support

- Forum de discussion intégré
- Système de commentaires sous les cours
- Partage de projets et de solutions

### Interface Utilisateur

- Design moderne avec ShadCN et TailwindCSS
- Mode clair/sombre
- Interface responsive (desktop & mobile)
- Dashboard interactif pour suivre sa progression

### Gestion des Contenus

- Interface d'administration pour les formateurs
- Outils de création et modification de cours
- Modération des contributions
- Statistiques d'utilisation et de progression

## 🛠️ Stack Technique

### Frontend

- **Next.js 15+** avec App Router et React Server Components
- **ShadCN UI** pour les composants d'interface
- **TailwindCSS** pour le styling
- **Framer Motion** pour les animations
- **Zustand** pour la gestion d'état côté client

### Backend

- **Next.js** (server actions)
- **Supabase** pour la base de données
- **Supabase Auth** pour l'authentification
- **Row Level Security** pour la gestion des permissions

### Outils de Développement

- **TypeScript** pour un code fortement typé
- **PNPM** comme gestionnaire de paquets
- **Vercel** pour le déploiement

## 📁 Structure du Projet

```
codemastery/
├── public/             # Fichiers statiques
├── src/
│   ├── app/            # Routes et pages (App Router)
│   │   ├── (auth)/     # Routes d'authentification
│   │   ├── (admin)/    # Routes d'administration
│   │   ├── dashboard/  # Dashboard utilisateur
│   │   └── ...
│   ├── components/     # Composants React réutilisables
│   │   ├── ui/         # Composants d'interface
│   │   ├── landing/    # Composants de la page d'accueil
│   │   └── ...
│   ├── lib/            # Utilitaires et fonctions
│   ├── hooks/          # Hooks React personnalisés
│   ├── store/          # Gestion d'état (Zustand)
│   └── types/          # Types TypeScript
└── ...
```

## 📝 Licence

Ce projet est sous licence [MIT](LICENSE).

## 👥 Contributeurs

- [Lekieffre Thomas](https://github.com/thomaslekieffre)

## 🙏 Remerciements

- [Next.js](https://nextjs.org/)
- [ShadCN UI](https://ui.shadcn.com/)
- [Supabase](https://supabase.io/)
- [TailwindCSS](https://tailwindcss.com/)
