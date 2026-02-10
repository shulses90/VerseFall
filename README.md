# Versefall: War of the Absolutes

Bienvenue dans **Versefall**, une aventure narrative stratégique textuelle propulsée par l'intelligence artificielle.

Dans ce jeu, vous incarnez le dirigeant d'une des grandes factions du multivers, luttant pour la survie face à une menace cosmique grandissante : les Célestes et leur "Perfection Silencieuse". Vos choix détermineront non seulement le destin de votre peuple, mais aussi la nature même de la réalité.

## 🌟 Présentation

Le multivers est menacé par un Ordre parfait et terrifiant. Les Célestes, des êtres de loi pure, cherchent à figer toute réalité dans un cristal immuable. En tant que leader, vous devrez :
- **Gérer des crises** : Cultes internes, invasions de morts-vivants, diplomatie tendue.
- **Faire des choix moraux** : La fin justifie-t-elle les moyens ? La force brute ou l'alliance ?
- **Découvrir le Lore** : Percez les secrets de L'Absolu (la Mort) et des Démons.

### Les Factions Jouables
- **Pacte Aethelgard** : République hyper-capitaliste et technologique.
- **Souverainetés Veridian** : Coalition symbiotique avec la nature.
- **Guildes Chronomach** : Société cyberpunk transhumaniste.
- **Pureté Céleste** : Théocratie monolithique (un choix risqué !).
- **Tisserands Anciens** : Gardiens de l'équilibre cosmique et de la magie.
- **Panthéon Ascendant** : Société héroïque de demi-dieux.

## 🛠️ Prérequis

Pour installer et jouer à ce jeu, vous avez besoin de :
1.  **Node.js** (version 18 ou supérieure recommandée) installé sur votre ordinateur.
2.  Une **Clé API Google Gemini**.

## 🔑 Configuration (Google AI Studio)

Le jeu utilise l'IA de Google (Gemini) pour générer l'histoire et les images en temps réel. Vous devez obtenir une clé API gratuite pour le développement.

1.  Rendez-vous sur [Google AI Studio](https://aistudio.google.com/).
2.  Connectez-vous avec votre compte Google.
3.  Cliquez sur **"Get API key"** (ou "Créer une clé API").
4.  Copiez la clé générée (elle ressemble à `AIzaSy...`).

## 🚀 Installation

Vous pouvez installer le jeu localement sur votre PC.

1.  **Cloner ou télécharger le projet** :
    Si vous avez Git :
    ```bash
    git clone <votre-url-repo>
    cd versefall-war-of-the-absolutes
    ```
    Sinon, téléchargez le ZIP et extrayez-le.

2.  **Installer les dépendances** :
    Ouvrez un terminal dans le dossier du projet et lancez :
    ```bash
    npm install
    ```

3.  **Configurer l'environnement** :
    *   Dupliquez le fichier `.env.example` et renommez-le en `.env`.
    *   Ouvrez ce fichier `.env` avec un éditeur de texte (Bloc-notes, VS Code...).
    *   Collez votre clé API après le signe égal :
        ```env
        VITE_GEMINI_API_KEY=AIzaSyVotreCléSecreteIci
        ```
    *   *(Optionnel)* Vous pouvez changer les modèles utilisés si vous avez accès à des versions spécifiques :
        ```env
        VITE_GEMINI_MODEL=gemini-1.5-flash
        VITE_IMAGEN_MODEL=imagen-3.0-generate-001
        ```

## ▶️ Lancement

Une fois configuré, lancez le jeu avec :

```bash
npm run dev
```

Ouvrez ensuite votre navigateur à l'adresse indiquée (généralement `http://localhost:3000` ou `http://localhost:5173`).

## 📖 Tutoriel de Fonctionnement

1.  **Écran de Démarrage** : Cliquez sur "Commencer la Transmission".
2.  **Choix de la Faction** : Sélectionnez la faction que vous souhaitez incarner. Chaque faction a sa propre philosophie et son style visuel.
3.  **L'Aventure** :
    *   L'IA générera une scène et une image (pixel art rétro).
    *   Lisez le texte (il défile comme sur un vieux terminal).
    *   Trois choix vous seront proposés. Il n'y a pas de "bon" choix évident.
    *   **Attention** : Vos actions vous mènent vers l'une des 3 fins possibles.
4.  **Les Fins** :
    *   🔴 **Fin Tyrannique** : Vous gagnez par la force brute, mais devenez un dictateur.
    *   ⚪ **Fin de la Stagnation** : L'ordre parfait des Célestes l'emporte. L'univers se fige.
    *   🟢 **Fin de l'Éveil** : La "bonne" fin, difficile à obtenir. Nécessite de comprendre l'ennemi, de nouer des alliances et de libérer L'Absolu.
5.  **Le Codex** : En haut à droite, le bouton "Codex" s'allume quand vous découvrez de nouvelles informations sur l'univers. Consultez-le pour comprendre les enjeux cachés.

## ⚠️ Dépannage

- **Erreur "API_KEY environment variable not set"** : Vérifiez que vous avez bien créé le fichier `.env` à la racine (pas dans `src`) et qu'il contient votre clé. Redémarrez le serveur (`Ctrl+C` puis `npm run dev`) après avoir modifié le `.env`.
- **Erreur de génération d'image** : Parfois, le modèle d'image peut échouer ou être surchargé. Le jeu continuera avec l'histoire même sans image.
- **Modèle introuvable** : Si vous avez une erreur 404 liée au modèle, essayez de changer `VITE_GEMINI_MODEL` dans le `.env` pour `gemini-pro` ou `gemini-1.5-flash`.

---
*Développé avec React, Vite et Google Gemini API.*
