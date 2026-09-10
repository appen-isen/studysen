import { registerWebModule, NativeModule } from "expo";

// Pas de widgets sur le web : implémentation no-op pour que le code appelant
// reste commun à toutes les plateformes.
class WidgetDataBridgeModule extends NativeModule<{}> {
    setPlanningSnapshot(_json: string): void {}
    clearPlanningSnapshot(): void {}
}

export default registerWebModule(
    WidgetDataBridgeModule,
    "WidgetDataBridgeModule"
);
