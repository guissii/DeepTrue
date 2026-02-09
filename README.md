# DeepTrust

DeepTrust est une plateforme avancée d'analyse et de vérification alimentée par l'intelligence artificielle (Google Gemini). Elle permet de détecter les contenus manipulés (Deepfakes) et d'analyser la conformité des documents financiers.

![DeepTrust Banner](public/logo.jpeg)

## 🚀 Fonctionnalités Principales

### 🕵️ Détection de Deepfake
- **Analyse Multi-modale** : Supporte les fichiers **Audio**, **Vidéo** et **Image**.
- **IA Générative** : Utilise les modèles Gemini 1.5/2.0 Flash pour une détection précise des artefacts de manipulation.
- **Score de Risque** : Fournit un score de confiance (0-100%) et un niveau de risque (Faible, Moyen, Élevé).
- **Explications Détaillées** : Analyse spectrale et contextuelle pour expliquer pourquoi un contenu est suspect.

### 📄 Analyse Financière
- **Extraction OCR** : Extraction automatique des données clés (dates, montants, fournisseurs).
- **Vérification de Conformité** : Détection automatique des signatures, tampons et anomalies (dates incohérentes, IBAN suspects).
- **Génération de Rapports** : Création de rapports d'audit détaillés.

### 🛠️ Administration & Système
- **Tableau de Bord Admin** : Gestion des utilisateurs, statistiques d'utilisation et surveillance des API.
- **Authentification** : Système sécurisé avec JWT et cryptage des mots de passe (Bcrypt).
- **Historique** : Suivi complet de toutes les analyses effectuées par les utilisateurs.
- **Multilingue** : Interface disponible en Français et Anglais.

## 📦 Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/guissii/DeepTrue.git
   cd DeepTrue
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   Créez un fichier `.env.local` à la racine du projet et ajoutez votre clé API Gemini :
   ```env
   VITE_GEMINI_API_KEY=votre_cle_api_ici
   # Optionnel : Clés pour autres services si nécessaire
   VITE_DEEPFAKE_API_KEY=
   VITE_FINANCE_API_KEY=
   ```

## 🚀 Démarrage

Le projet nécessite de lancer à la fois le serveur backend (API) et le frontend (React).

### 1. Lancer le Backend (Serveur Node.js)
Dans un terminal :
```bash
node server.js
```
*Le serveur démarrera sur http://localhost:3000*

### 2. Lancer le Frontend (Vite)
Dans un second terminal :
```bash
npm run dev
```
*L'application sera accessible sur http://localhost:5173*

## 👤 Compte Admin par défaut

Lors du premier lancement, un compte administrateur est créé automatiquement :
- **Utilisateur** : `admin`
- **Mot de passe** : `admin123`

## 🛠️ Technologies Utilisées

- **Frontend** : React, TypeScript, Tailwind CSS, Vite, Shadcn/UI
- **Backend** : Node.js, Express
- **Base de données** : LowDB (Base de données JSON locale)
- **IA** : Google Generative AI SDK (Gemini)
- **Sécurité** : JSON Web Tokens (JWT), Bcrypt

## 📄 Licence

Ce projet est sous licence MIT.
