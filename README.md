# ISEN-Orbit

ISEN-Orbit est un projet d'application mobile développée en React Native avec Expo et TypeScript par le club Appen. L'objectif de ce projet est de fournir une expérience mobile intuitive pour les étudiants.

## 🎯 Fonctionnalités

-   Authentification avec ISEN - Page Login
-
-

## 🌱 Branches en développement

-   [`feat/planning`](https://github.com/appen-isen/isen-orbit/tree/feat/planning) : Emploi du temps (Page Planning)
-
-

## 🚀 Installation et configuration

### Prérequis

-   Node.js (>= 16.x recommandé)
-   Git

### Étapes d'installation

1. Clonez le dépôt :
    ```bash
    git clone https://github.com/appen-isen/isen-orbit.git
    cd ISEN-Orbit
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

## 🛠️ Technologies utilisées

-   **React Native** : Framework pour le développement d'applications mobiles (Android et iOS).
-   **Expo** : Outils et services pour développer et déployer l'application.
-   **Typescript** : Typage statique pour JavaScript.

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

### Ressources utiles

-   [Documentation React Native](https://reactnative.dev/docs/getting-started)
-   [Documentation Expo](https://docs.expo.dev)
