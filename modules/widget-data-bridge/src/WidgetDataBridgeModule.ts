import { NativeModule, requireNativeModule } from "expo";

declare class WidgetDataBridgeModule extends NativeModule<{}> {
    // Écrit le snapshot JSON du planning dans le stockage partagé (App Group
    // iOS) et déclenche le rafraîchissement des widgets
    setPlanningSnapshot(json: string): void;
    // Supprime le snapshot stocké (ex: déconnexion)
    clearPlanningSnapshot(): void;
}

export default requireNativeModule<WidgetDataBridgeModule>("WidgetDataBridge");
