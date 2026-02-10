# Versefall: War of the Absolutes

Bienvenue dans **Versefall**, une aventure narrative stratégique textuelle propulsée par l'intelligence artificielle.

Dans ce jeu, vous incarnez le dirigeant d'une des grandes factions du multivers, luttant pour la survie face à une menace cosmique grandissante : les Célestes et leur "Perfection Silencieuse". Vos choix détermineront non seulement le destin de votre peuple, mais aussi la nature même de la réalité.

## 🌟 Présentation

Le multivers est en proie à une guerre secrète. Alors que les morts se relèvent et que des cultes fanatiques sèment le chaos, une menace plus insidieuse se profile. Les Célestes, des êtres de loi pure, cherchent à figer toute réalité dans un cristal immuable. Ils manipulent les événements depuis l'ombre, utilisant même les terrifiants Démons comme pions.

En tant que leader, vous devrez :
- **Gérer des crises** : Cultes internes, invasions de morts-vivants, diplomatie tendue.
- **Faire des choix moraux** : La fin justifie-t-elle les moyens ? La force brute ou l'alliance ?
- **Découvrir le Lore** : Percez les secrets de L'Absolu (la Mort) et des Démons.

## 🏛️ Les Factions

Choisissez votre camp parmi six puissances uniques, chacune avec sa philosophie et son style visuel :

*   **Pacte Aethelgard**
    *   *Philosophie* : Une république hyper-capitaliste où le profit et l'efficacité priment.
    *   *Style* : Drones élégants, mechs de combat, néons bleus et oranges, architecture industrielle.
*   **Souverainetés Veridian**
    *   *Philosophie* : Une coalition en symbiose avec la nature, défendant le cycle de la vie et de la mort.
    *   *Style* : Forêts bioluminescentes, armures d'os, bêtes géantes invoquées, magie druidique.
*   **Guildes Chronomach**
    *   *Philosophie* : Une société cyberpunk transhumaniste obsédée par l'amélioration technologique et la liberté individuelle.
    *   *Style* : Villes pluvieuses, implants cybernétiques, hologrammes publicitaires, hackers de l'ombre.
*   **Pureté Céleste**
    *   *Philosophie* : Une théocratie monolithique guidée par une foi inébranlable et un zèle purificateur.
    *   *Style* : Cathédrales spatiales en marbre blanc, filigranes d'or, constructions angéliques, lumière aveuglante.
*   **Tisserands Anciens**
    *   *Philosophie* : Gardiens de l'équilibre cosmique utilisant des arts ésotériques pour protéger la réalité.
    *   *Style* : Runes flottantes, nébuleuses cosmiques, rituels mystiques, énergie violette et éthérée.
*   **Panthéon Ascendant**
    *   *Philosophie* : Une société héroïque menée par des demi-dieux, où la gloire personnelle est la plus haute vertu.
    *   *Style* : Architecture gréco-romaine futuriste, armures dorées, lances énergétiques, poses héroïques.

## 📜 Lore Profond

L'univers de Versefall repose sur trois piliers cosmiques :

1.  **Les Célestes** : Des êtres d'ordre absolu. Leur but est la "Perfection Silencieuse", un univers sans vie, sans changement, et sans souffrance. Ils voient le libre arbitre comme une erreur.
2.  **Les Démons** : Des agents du chaos et du changement. Bien que destructeurs, ils sont essentiels à la vitalité de l'univers. Les Célestes les utilisent pour pousser les mortels à désirer l'ordre à tout prix.
3.  **L'Absolu (La Mort)** : Une force neutre et nécessaire. Elle a été emprisonnée par les Célestes, ce qui a brisé le cycle naturel et causé la levée des morts.

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
    *   *(Optionnel)* Vous pouvez changer les modèles utilisés :
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

## 🎮 Mécaniques de Jeu

### 1. Le Codex
En haut à droite de l'écran, un bouton "Codex" apparaît lorsque vous découvrez des secrets.
*   **Fonctionnement** : L'IA détecte quand une information clé est révélée dans l'histoire et débloque l'entrée correspondante.
*   **Stratégie** : Consulter le Codex peut vous donner des indices sur la vraie nature de vos ennemis.

### 2. Intensité et Musique
La musique du jeu est dynamique.
*   En temps normal, le thème de votre faction joue pour l'immersion.
*   Si la scène générée est jugée "intense" (combat, révélation), la musique bascule sur un thème de bataille épique.

### 3. Les Trois Fins
Vos choix ne sont pas binaires (Bien/Mal). Ils mènent vers trois destinées :

*   🔴 **La Fin Tyrannique (Mauvaise Fin)**
    *   *Comment l'obtenir* : Répondez à la violence par la violence. Refusez les alliances. Écrasez vos ennemis sans chercher à comprendre.
    *   *Résultat* : Vous gagnez, mais vous devenez un dictateur impitoyable sur un univers en ruines.

*   ⚪ **La Fin de la Stagnation (Fin Neutre)**
    *   *Comment l'obtenir* : Acceptez les offres d'ordre et de sécurité. Laissez les Célestes vous "aider". Détruisez L'Absolu par mégarde.
    *   *Résultat* : La paix règne, mais c'est la paix d'un cimetière. L'univers se fige dans une perfection éternelle.

*   🟢 **La Fin de l'Éveil (Bonne Fin)**
    *   *Comment l'obtenir* : C'est le chemin le plus difficile. Enquêtez sur les cultes. Écoutez vos alliés. Comprenez que les Démons ne sont pas la vraie menace. Libérez L'Absolu.
    *   *Résultat* : L'équilibre est restauré. L'univers est sauf et libre d'évoluer.

## 🔧 Personnalisation Avancée (Pour les développeurs)

Si vous souhaitez modifier l'histoire ou les règles du jeu :

1.  **Modifier le Scénario** :
    Le "cerveau" du Maître de Jeu se trouve dans `services/prompts.ts`. Vous pouvez modifier la variable `systemInstruction` pour changer l'univers, les factions ou les conditions de victoire.

2.  **Changer les Modèles IA** :
    Outre le fichier `.env`, vous pouvez ajuster les paramètres de génération (température, topP) dans `services/geminiService.ts` pour rendre l'IA plus créative ou plus stricte.

---
*Développé avec React, Vite et Google Gemini API.*
