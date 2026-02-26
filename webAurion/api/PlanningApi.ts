import { getJSFFormParams, getPlanningCalendarId } from "../utils/AurionUtils";
import { generateDemoPlanning } from "../utils/demo";
import {
    getScheduleDates,
    planningResponseToEvents
} from "../utils/PlanningUtils";
import { PlanningEvent } from "../utils/types";
import Session from "./Session";

class PlanningApi {
    private session: Session;
    constructor(session: Session) {
        this.session = session;
    }

    // Récupération de l'emploi du temps en fonction de la date de début et de fin (timestamps en millisecondes)
    public fetchPlanning(weeksFromNow?: number): Promise<PlanningEvent[]> {
        return new Promise<PlanningEvent[]>(async (resolve, reject) => {
            //Mode démo
            if (this.session.isDemo()) {
                return resolve(generateDemoPlanning());
            }
            try {
                // On récupère le ViewState pour effectuer la requête
                let viewState = await this.session.getViewState("Mon planning");

                // On récupère l'ID dynamique du composant planning et les champs contextuels
                const planningPage = await this.session.sendGET<string>(
                    "/faces/Planning.xhtml"
                );
                const planningWidgetId =
                    getPlanningCalendarId(planningPage) || "j_idt119";

                // On envoie enfin la requête pour obtenir l'emploi du temps
                const params = getJSFFormParams(
                    planningWidgetId,
                    planningWidgetId,
                    viewState
                );

                //On récupère les dates de début et de fin de l'emploi du temps
                let { startTimestamp, endTimestamp } =
                    getScheduleDates(weeksFromNow);
                params.append(
                    `form:${planningWidgetId}_start`,
                    startTimestamp.toString()
                );
                params.append(
                    `form:${planningWidgetId}_end`,
                    endTimestamp.toString()
                );

                const response = await this.session.sendPOST<string>(
                    "/faces/Planning.xhtml",
                    params
                );
                resolve(planningResponseToEvents(response));
            } catch (error) {
                // En cas d'erreur, on supprime le cache de ViewState
                this.session.clearViewStateCache();
                reject(error);
            }
        });
    }
}

export default PlanningApi;
