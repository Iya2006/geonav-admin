# GeoNav Admin - Plateforme de Navigation Intelligente (Guinée)

GeoNav Admin est une application web de pointe conçue pour la gestion territoriale, la supervision de données géospatiales et l'optimisation de trajets assistée par l'Intelligence Artificielle (Google Gemini).

## 🚀 Technologies Utilisées

L'application repose sur une stack technologique moderne, sans étape de build complexe :

- **React 19** : Architecture modulaire et réactive.
- **Tailwind CSS** : Design système élégant, responsive et support natif du mode sombre.
- **Leaflet.js** : Moteur cartographique interactif pour une navigation fluide.
- **Google Gemini API (@google/genai)** :
  - **Gemini 3 Flash** : Recherche textuelle avancée et compréhension des lieux.
  - **Gemini 3 Pro** : Résolution de problèmes complexes d'optimisation de trajets.
- **Lucide React** : Iconographie moderne et cohérente.
- **Recharts** : Visualisation de données pour la supervision analytique.
- **ES Modules** : Importation directe des dépendances via `esm.sh`.

## 🛠️ Fonctionnalités Implémentées (A à Z)

### 1. Supervision et Gestion des Utilisateurs
- **Tableau de Bord** : Monitoring visuel des Points d'Intérêt et de l'état des utilisateurs (Recharts).
- **Interface Gestion Équipe** : CRUD complet des utilisateurs, modification des rôles et contrôle des statuts (Actif/Inactif).

### 2. Gestion des Points d'Intérêt (POI)
- **Interface Administrateur Dédiée** : Création, modification et suppression rapide de lieux.
- **Filtrage Intelligent** : Recherche instantanée par nom, adresse ou catégorie.
- **Support Multimédia** : Intégration d'images et descriptions détaillées pour chaque POI.

### 3. Navigation et Géolocalisation Temps Réel
- **Carte Interactive** : Navigation fluide avec support du zoom et de la rotation.
- **Géolocalisation** : Centrage temps réel sur la position de l'utilisateur via l'API Browser Geolocation.
- **Styles Adaptatifs** : Design inspiré de Google Maps avec menus contextuels avancés.

### 4. Recherche Textuelle Avancée
- **IA-Powered Search** : Barre de recherche utilisant Gemini pour interpréter les requêtes de l'utilisateur et localiser des lieux précis en Guinée.

### 5. Optimisation de Trajets par IA
- **Itinéraires Multi-points** : Sélection de plusieurs POIs pour une tournée.
- **Algorithme IA** : Calcul de l'ordre de passage le plus efficace pour minimiser le trajet total, avec explications détaillées fournies par Gemini Pro.

## 💻 Instructions d'Exécution

L'application est "Ready-to-Go" et s'exécute dans n'importe quel navigateur moderne.

1.  **Prérequis** : Un navigateur avec support de la géolocalisation.
2.  **Configuration** : L'application utilise la variable d'environnement `process.env.API_KEY` injectée pour les services IA.
3.  **Lancement** : 
    - Ouvrez `index.html`.
    - Activez la géolocalisation lorsque le navigateur le demande pour une expérience optimale.
    - Utilisez le menu latéral pour naviguer entre la Carte, le Dashboard, les POI et les Utilisateurs.

## 🛠️ Pourquoi l'application ne s'affichait pas ?
L'application utilise des fichiers `.tsx` (TypeScript + JSX). Les navigateurs ne peuvent pas lire ces fichiers directement. Il est donc **indispensable** d'utiliser un outil comme **Vite** pour transformer ces fichiers en JavaScript compréhensible par le navigateur.

## 💻 Guide de Lancement Local (Installation Correcte)

Suivez ces étapes précisément pour faire fonctionner l'application sur votre machine :

### 1. Installation de Node.js
Assurez-vous d'avoir **Node.js** (version 18 ou supérieure) installé sur votre ordinateur. Vous pouvez le télécharger sur [nodejs.org](https://nodejs.org/).

### 2. Téléchargement et Préparation
1. Téléchargez et extrayez le dossier du projet.
2. Ouvrez un terminal (ou une invite de commande) dans le dossier du projet.

### 3. Installation des dépendances
Tapez la commande suivante pour installer les outils nécessaires (React, Vite, etc.) :
```bash
npm install
```

### 4. Configuration de la Clé API
Pour que l'IA fonctionne, vous devez fournir votre clé API Gemini :
1. Créez un fichier nommé `.env` à la racine du projet.
2. Ajoutez la ligne suivante dans le fichier :
   ```env
   VITE_API_KEY=VOTRE_CLE_API_ICI
   ```
   *(Note: Le projet est configuré pour lire soit `process.env.API_KEY` soit vos variables d'environnement système).*

### 5. Lancement de l'Application
Lancez le serveur de développement avec cette commande :
```bash
npm run dev
```
Une fois lancée, l'application sera disponible sur **http://localhost:3000** (ou une adresse similaire affichée dans le terminal).

---
*Projet finalisé avec une attention particulière à l'esthétique et à la robustesse fonctionnelle.*
