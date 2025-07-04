# Studysen

Studysen est un projet d'application mobile développée en React Native avec Expo et TypeScript par le club Appen. L'objectif de ce projet est de fournir une expérience mobile intuitive pour les étudiants.

## 🎯 Fonctionnalités

-   Authentification avec WebAurion - Page Login
-   Emploi du temps WebAurion - Page Planning
-   Notes WebAurion - Page Notes
-   Affichage du cours actuel et à venir, ainsi que la moyenne de l'étudiant - Page Accueil
-   Affichage des informations du compte et des réglages de l'application - Page Paramètres (Mon compte)
-   Sauvegarde du planning et des notes en local - Mode hors ligne

## 🌱 Branches en développement

-
-
-

## 🚀 Installation et configuration

### Prérequis

-   Node.js (>= 16.x recommandé)
-   Git

### Étapes d'installation

1. Clonez le dépôt :
    ```bash
    git clone https://github.com/appen-isen/studysen.git
    cd Studysen
    ```
2. Installez les dépendances :
    ```bash
    npm install
    ```
3. Lancez l'application :
    ```bash
    npm start
    ```
4. Scannez le QR code avec l'application Expo Go pour tester sur un appareil physique, ou utilisez un émulateur Android/iOS configuré.

⚠️ Si vous souhaitez lancer le projet sur le réseau de l'ISEN, puisque celui-ci bloque les communications avec les ports non standards. Il faut réaliser les étapes suivantes:

1. Utiliser un VPN pour contourner les restrictions du Wifi (exemple: ProtonVPN)
2. Puis il faut utiliser cette commande pour lancer le projet:
    ```bash
    npx expo start --tunnel
    ```
3. Après cela, vous pourrez scanner le QR code avec l'application Expo Go et tout devrait fonctionner.

## 🤖 Technologies utilisées

-   **React Native** : Framework pour le développement d'applications mobiles (Android et iOS).
-   **Expo** : Outils et services pour développer et déployer l'application.
-   **Typescript** : Typage statique pour JavaScript.
-   **Express**: Framwork pour le backend (repo non publique car contient des informations sensibles)

## 📚 Bibliothèques utilisées

-   **[Axios](https://github.com/axios/axios)** : Pour effectuer les requêtes HTTP
-   **[Zustand](https://github.com/pmndrs/zustand)** : Pour la gestion des variables globales de l'application
-   **[React Native Paper](https://github.com/callstack/react-native-paper)** : Pour des composants graphiques animés
-   **[WebAurion API](https://github.com/dd060606/WebAurion-API)** : Pour communiquer avec WebAurion

## 🤝 Contribution

Pour contribuer au projet:

1. Créez une branche pour votre fonctionnalité/correctif :

    ```bash
    git checkout -b feat/nouvelle-fonctionnalité
    ```

2. Faites vos modifications et ajoutez des commits :

    ```bash
    git commit -m "feat: [votre fonctionnalité/modifs]"
    ```

3. Synchronisez votre travail sur le repo GitHub en envoyant votre branche

    ```bash
    git push origin feat/nouvelle-fonctionnalité
    ```

## 🛠️ Build de l'application

Pour constuire l'application (obtenir un exécutable Android/iOS), vous pouvez utiliser la démarche suivante:

1. Installer les service EAS

    ```bash
    npm install --global eas-cli
    ```

2. Connectez-vous à votre compte Expo (il doit faire parti de l'organisation Appen)

    ```bash
    eas login
    ```

3. Construire l'application

    - En mode 'preview':

        ```bash
        eas build --platform all --profile preview
        ```

    - En mode 'production':

        ```bash
        eas build --platform all --profile production
        ```

4. Faire une mise à jour rapide (quickfix)

    ```bash
    eas update --channel preview --message "[message]"
    ```

    ou

    ```bash
    eas update --channel production --message "[message]"
    ```

### Ressources utiles

-   [Documentation React Native](https://reactnative.dev/docs/getting-started)
-   [Documentation Expo](https://docs.expo.dev)
