import { Platform } from "react-native";

// Enregistrement de la tâche headless des widgets Android. Doit être fait de
// façon synchrone, avant tout le reste, car le système peut relancer un
// bundle JS "froid" (app fermée) juste pour rafraîchir un widget.
if (Platform.OS === "android") {
    const {
        registerWidgetTaskHandler
    } = require("react-native-android-widget");
    const {
        widgetTaskHandler
    } = require("./widgets/android/widgetTaskHandler");
    registerWidgetTaskHandler(widgetTaskHandler);
}

require("expo-router/entry");
