# Studysen

Studysen est un projet d'application mobile développé en React Native avec Expo et TypeScript par le club Appen. L'objectif de ce projet est de fournir une expérience mobile intuitive pour les étudiants.

## 📲 Télécharger l'application

<a href="https://apps.apple.com/us/app/studysen/id6753770477" target="_blank" rel="noopener noreferrer">
    <img alt="Télécharger sur l'App Store" width="200px" src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/fr-fr?releaseDate=1727654400">
</a>
<br>
<a href="https://play.google.com/store/apps/details?id=fr.appen.studysen" target="_blank" rel="noopener noreferrer">
    <img alt="Disponible sur Google Play" width="200px" src="https://play.google.com/intl/en_us/badges/static/images/badges/fr_badge_web_generic.png">
</a>

## 🎯 Fonctionnalités

-   Authentification automatique avec compte WebAurion
-   Emploi du temps WebAurion
-   Notes WebAurion par semestre avec moyenne générale
-   Affichage du cours actuel et à venir sur la page d'accueil
-   Sauvegarde du planning et des notes en local - Mode hors ligne et connexion instantanée
-   Posts et événements des clubs pour la vie étudiante
-   Notifications rappels de cours et pour les nouveaux posts de clubs
-   Demande de nouvelles fonctionnalités et rapports de bugs directement depuis l'application

## Espace Clubs (Communication)

Les responsables communication des clubs peuvent gérer leurs événements et leurs posts depuis l'espace dédié:

-   https://clubs.studysen.fr

Note: lorsqu'un club est créé, une demande de validation nous est automatiquement envoyée pour confirmer le club avant publication.

## 🚀 Installation et configuration

### Prérequis

-   Node.js (>= 16.x recommandé)
-   Git

### Étapes d'installation

1. Clonez le dépôt :
    ```bash
    git clone https://github.com/appen-isen/studysen.git
    cd studysen
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

## Backend

Le backend de l'application permet de gérer la partie vie étudiante (posts, événements, etc.) et est développé en Express.js. Il est facilement déployable en utilisant Docker. Le code source du backend est disponible dans le dépôt [studysen-backend](https://github.com/appen-isen/studysen-backend)

## 🤝 Contribution

Flux Git:

-   **Branches principales:**
    -   main: production (version publiée sur les stores)
    -   dev: intégration (développement en cours)
-   **Features:** partez de dev, nommez `feat/ma-feature`, puis Pull Request vers dev.
-   **Hotfixes:** partez de main, nommez `hotfix/mon-correctif`, puis Pull Request vers main et back-merge vers dev.

Exemples de commandes:

```bash
# Nouvelle fonctionnalité
git checkout dev
git pull
git checkout -b feat/ma-feature
# ... commits ...
git push -u origin feat/ma-feature
# Ouvrir une PR vers dev

# Correctif urgent en prod (hotfix)
git checkout main
git pull
git checkout -b hotfix/bug-critique
# ... commits ...
git push -u origin hotfix/bug-critique
# Ouvrir une PR vers main, puis merger main -> dev
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

## 🤖 Technologies utilisées

-   **React Native** : Framework pour le développement d'applications mobiles (Android et iOS).
-   **Expo** : Outils et services pour développer et déployer l'application.
-   **Typescript** : Typage statique pour JavaScript.
-   **Express**: Framework pour le backend

## 📚 Bibliothèques utilisées

-   **[Axios](https://github.com/axios/axios)** : Pour effectuer les requêtes HTTP
-   **[Zustand](https://github.com/pmndrs/zustand)** : Pour la gestion des variables globales de l'application
-   **[WebAurion API](https://github.com/dd060606/WebAurion-API)** : Pour communiquer avec WebAurion

### Ressources utiles

-   [Documentation React Native](https://reactnative.dev/docs/getting-started)
-   [Documentation Expo](https://docs.expo.dev)
