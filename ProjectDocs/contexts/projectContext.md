# CodeMastery - Contexte Principal

## Vue d'ensemble

CodeMastery est une plateforme éducative moderne pour l'apprentissage du développement web, du HTML à Nuxt.js.

## Objectifs Principaux

- Fournir un parcours d'apprentissage structuré et progressif
- Offrir une expérience interactive et engageante
- Faciliter l'entraide et le mentorat entre apprenants

## Stack Technique

- Frontend: Next.js 15+, ShadCN UI, TailwindCSS
- État: Zustand
- Backend: Supabase (BDD + Auth)
- Déploiement: Vercel

## Principes de Développement

- Code TypeScript fortement typé
- Approche fonctionnelle et déclarative
- Composants atomiques et réutilisables
- Performance et accessibilité optimisées

## Structure du Projet

```
src/
├── app/               # Routes et pages
│   ├── (auth)        # Routes d'authentification
│   ├── (dashboard)   # Interface utilisateur
│   ├── (courses)     # Contenu des cours
│   ├── (community)   # Forum et discussions
│   └── (public)      # Pages publiques
├── components/        # Composants réutilisables
├── lib/              # Utilitaires et configurations
├── types/            # Types TypeScript
├── hooks/            # Custom hooks React
└── store/            # État global Zustand
```

## Thème et Design

- Couleur principale: #6d28d9 (violet)
- Support mode clair/sombre
- Design responsive et mobile-first
- Composants UI accessibles

## Fonctionnalités Clés

1. Système d'authentification
2. Gestion des cours et progression
3. Quiz et exercices interactifs
4. Forum communautaire
5. Système de mentorat
