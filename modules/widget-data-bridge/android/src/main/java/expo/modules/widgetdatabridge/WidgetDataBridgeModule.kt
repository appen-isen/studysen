package expo.modules.widgetdatabridge

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// sur Android, ce module ne sert a rien, il est juste un "stub" pour que le code JS appelant reste commun aux deux plateformes sans branchement Platform.OS.
class WidgetDataBridgeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WidgetDataBridge")

    Function("setPlanningSnapshot") { _: String -> }

    Function("clearPlanningSnapshot") { }
  }
}
