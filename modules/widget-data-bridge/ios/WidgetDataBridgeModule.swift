import ExpoModulesCore
import WidgetKit

// Doit correspondre à l'App Group déclaré dans app.json (ios.entitlements)
// et auto-synchronisé vers la target widget par @bacons/apple-targets.
private let appGroupId = "group.fr.appen.studysen"
private let planningSnapshotKey = "planningSnapshot"

// Pont natif permettant à l'app JS d'écrire l'emploi du temps dans le
// conteneur App Group partagé, afin que le widget WidgetKit (processus
// séparé, sans runtime JS) puisse le lire depuis son TimelineProvider.
public class WidgetDataBridgeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WidgetDataBridge")

    // Enregistre un snapshot JSON du planning (voir utils/widgetSync.ts pour le format)
    // et déclenche le rafraîchissement des widgets.
    Function("setPlanningSnapshot") { (json: String) in
      let defaults = UserDefaults(suiteName: appGroupId)
      defaults?.set(json, forKey: planningSnapshotKey)
      WidgetCenter.shared.reloadAllTimelines()
    }

    // Supprime le snapshot (ex: déconnexion) et rafraîchit les widgets.
    Function("clearPlanningSnapshot") {
      let defaults = UserDefaults(suiteName: appGroupId)
      defaults?.removeObject(forKey: planningSnapshotKey)
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
}
