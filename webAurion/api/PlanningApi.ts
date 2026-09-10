import {
    getJSFBehaviorParams,
    getJSFFormParams,
    getPlanningCalendarId
} from "../utils/AurionUtils";
import { generateDemoPlanning, getDemoEventDescription } from "../utils/demo";
import {
    findEventInSchedule,
    getEventDescriptionFromResponse,
    getScheduleDates,
    getWeekRange,
    planningResponseToEvents
} from "../utils/PlanningUtils";
import { PlanningEvent } from "../utils/types";
import Session from "./Session";

const PLANNING_URL = "/faces/Planning.xhtml";
// ID utilisé si l'ID dynamique du widget planning n'est pas trouvé sur la page
const DEFAULT_PLANNING_WIDGET_ID = "j_idt119";

// Informations nécessaires pour effectuer une requête sur la page planning
type PlanningContext = {
    viewState: string;
    widgetId: string;
};

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
                const context = await this.getPlanningContext();

                //On récupère les dates de début et de fin de l'emploi du temps
                const { startTimestamp, endTimestamp } =
                    getScheduleDates(weeksFromNow);

                // On envoie enfin la requête pour obtenir l'emploi du temps
                const response = await this.loadPlanningRange(
                    context,
                    startTimestamp,
                    endTimestamp
                );
                resolve(planningResponseToEvents(response));
            } catch (error) {
                // En cas d'erreur, on supprime le cache de ViewState
                this.session.clearViewStateCache();
                reject(error);
            }
        });
    }

    // Récupération de la description d'un cours (elle n'est pas incluse dans l'emploi du temps)
    // Retourne une chaîne vide si le cours n'a pas de description
    public fetchEventDescription(event: PlanningEvent): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            //Mode démo
            if (this.session.isDemo()) {
                return resolve(getDemoEventDescription(event.id));
            }
            try {
                const context = await this.getPlanningContext();

                // Le backend ne connaît que les cours de la dernière semaine demandée:
                // on recharge celle du cours sélectionné avant de demander son détail
                const { startTimestamp, endTimestamp } = getWeekRange(
                    new Date(event.start)
                );
                const weekResponse = await this.loadPlanningRange(
                    context,
                    startTimestamp,
                    endTimestamp
                );

                // Les identifiants des cours sont régénérés à chaque chargement du planning:
                // celui enregistré dans l'application n'est plus valide, on récupère l'identifiant actuel
                const currentEvent = findEventInSchedule(
                    planningResponseToEvents(weekResponse),
                    event
                );
                if (!currentEvent) {
                    // Le cours n'existe plus (planning modifié depuis la dernière synchronisation)
                    return resolve("");
                }

                // On simule le clic sur le cours pour obtenir la fenêtre de détail
                const params = getJSFBehaviorParams(
                    context.widgetId,
                    ["modaleDetail", "confirmerSuppression"],
                    "eventSelect",
                    context.viewState
                );
                params.append(
                    `form:${context.widgetId}_selectedEventId`,
                    currentEvent.id
                );

                const response = await this.session.sendPOST<string>(
                    PLANNING_URL,
                    params
                );
                resolve(getEventDescriptionFromResponse(response));
            } catch (error) {
                console.error("Failed to fetch event description:", error);
                // En cas d'erreur, on supprime le cache de ViewState
                this.session.clearViewStateCache();
                reject(error);
            }
        });
    }

    // Récupération des informations nécessaires aux requêtes de la page planning
    private async getPlanningContext(): Promise<PlanningContext> {
        // On récupère le ViewState pour effectuer la requête
        const viewState = await this.session.getViewState("Mon planning");

        // On récupère l'ID dynamique du composant planning et les champs contextuels
        const planningPage = await this.session.sendGET<string>(PLANNING_URL);

        return {
            viewState,
            widgetId:
                getPlanningCalendarId(planningPage) ||
                DEFAULT_PLANNING_WIDGET_ID
        };
    }

    // Demande au backend de charger les cours d'une période (timestamps en millisecondes)
    private loadPlanningRange(
        context: PlanningContext,
        startTimestamp: number,
        endTimestamp: number
    ): Promise<string> {
        const params = getJSFFormParams(
            context.widgetId,
            context.widgetId,
            context.viewState
        );
        params.append(
            `form:${context.widgetId}_start`,
            startTimestamp.toString()
        );
        params.append(`form:${context.widgetId}_end`, endTimestamp.toString());

        return this.session.sendPOST<string>(PLANNING_URL, params);
    }
}

export default PlanningApi;
