/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
    type: "widget",
    name: "StudysenWidgets",
    displayName: "Studysen",
    // iOS 17+ requis par .containerBackground(), obligatoire sur toute vue de widget
    deploymentTarget: "17.0",
    icon: "../../assets/images/icon.png",
    // Vide: App Group auto-synchronisé depuis app.json (ios.entitlements).
    // Ne pas y définir "com.apple.security.application-groups" soi-même, sinon
    // ça écrase la synchro automatique
    entitlements: {}
};
