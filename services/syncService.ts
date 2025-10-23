import { getSecureStoreItem } from "@/stores/secureStore";
import useSessionStore from "@/stores/sessionStore";
import useSettingsStore from "@/stores/settingsStore";
import { useSyncStore } from "@/stores/syncStore";
import { useNotesStore, usePlanningStore } from "@/stores/webaurionStore";
import {
    sendUnknownNotesTelemetry,
    sendUnknownPlanningSubjectsTelemetry
} from "@/utils/colors";
import {
    cancelAllScheduledNotifications,
    scheduleCourseNotification
} from "@/utils/notificationConfig";
import { mergePlanning } from "@/utils/planning";
import Session from "@/webAurion/api/Session";
import { getScheduleDates } from "@/webAurion/utils/PlanningUtils";
import { PlanningEvent } from "@/webAurion/utils/types";

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const RETRY_DELAY_MS = 5 * 1000; // 5 secondes pour réessayer après une erreur
let syncIntervalId: ReturnType<typeof setInterval> | null = null;
let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;
let isSyncInProgress = false;

// Plannifie une nouvelle tentative de synchronisation si on est en erreur
function scheduleRetryIfNeeded(weekOffset: number) {
    const { syncStatus } = useSyncStore.getState();
    // Seulement si on est en erreur
    if (syncStatus !== "error") return;
    // Si un retry est déjà programmé, on ne fait rien
    if (retryTimeoutId) return;
    retryTimeoutId = setTimeout(() => {
        retryTimeoutId = null;
        syncData(weekOffset);
    }, RETRY_DELAY_MS);
}

// Annule un retry programmé
function clearPendingRetry() {
    if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
        retryTimeoutId = null;
    }
}

// Permet de synchroniser l'agenda et les notes depuis WebAurion
export async function syncData(weekOffset: number = 0) {
    if (isSyncInProgress) return;
    isSyncInProgress = true;
    console.log("Début de la synchronisation");
    try {
        const { session } = useSessionStore.getState();
        const { settings } = useSettingsStore.getState();
        const { setSyncStatus, syncStatus } = useSyncStore.getState();

        // Ne pas écraser le badge d'erreur si on est en retry après erreur
        if (syncStatus !== "error") {
            setSyncStatus("syncing");
        }

        // Si pas de session, on tente une connexion automatique
        if (!session && !(await autoLogin())) {
            setSyncStatus("error");
            scheduleRetryIfNeeded(weekOffset);
            return;
        }

        // Mise à jour des notes
        await updateNotes();

        // Puis mise à jour du planning
        const currentWeekPlanning = await updatePlanning(weekOffset);

        if (currentWeekPlanning) {
            // On planifie les notifications pour les cours
            cancelAllScheduledNotifications().then(() => {
                if (settings.notificationsEnabled) {
                    const now = new Date();
                    currentWeekPlanning.forEach((event) => {
                        if (
                            event.className !== "CONGES" &&
                            new Date(event.start) > now
                        ) {
                            scheduleCourseNotification(
                                event.title || event.subject,
                                event.room,
                                new Date(event.start)
                            );
                        }
                    });
                }
            });
        }
    } finally {
        isSyncInProgress = false;
    }
}

// Tente une connexion automatique avec les identifiants stockés
// Retourne un booléen indiquant si la connexion a réussi
async function autoLogin(): Promise<boolean> {
    const { setSession } = useSessionStore.getState();
    const { setSettings } = useSettingsStore.getState();
    //On récupère les identifiants stockés dans le secure store
    const storedUsername = await getSecureStoreItem("username");
    const storedPassword = await getSecureStoreItem("password");
    if (storedUsername && storedPassword) {
        const session = new Session();
        try {
            await session.login(storedUsername, storedPassword);
            //On sauvegarde la session dans le store
            setSession(session);
            //On sauvegarde le nom d'utilisateur dans les paramètres
            setSettings("username", session.getUsername());
            return true;
        } catch (err) {
            //Erreur de connexion (on est probablement hors ligne)
            console.log("Offline mode enabled!");
            console.error(err);
        }
    }
    return false;
}

// Met à jour les notes depuis WebAurion
async function updateNotes() {
    const { session } = useSessionStore.getState();
    if (!session) return;
    try {
        const fetchedNotes = await session.getNotesApi().fetchNotes();
        if (fetchedNotes) {
            // On met à jour les notes dans le store, et on envoie la télémétrie pour les notes inconnues
            useNotesStore.getState().setNotes(fetchedNotes);
            sendUnknownNotesTelemetry(fetchedNotes);
        }
    } catch (error) {
        console.error("Failed to update notes:", error);
    }
}

// Met à jour le planning depuis WebAurion
export async function updatePlanning(
    weekOffset: number
): Promise<PlanningEvent[] | null> {
    const { session } = useSessionStore.getState();
    const {
        setSyncStatus,
        setLastSyncDate,
        syncStatus,
        alreadySyncedPlanning,
        setAlreadySyncedPlanning
    } = useSyncStore.getState();
    const { planning, setPlanning } = usePlanningStore.getState();

    // Ne pas écraser le badge d'erreur si on est en retry après erreur
    if (syncStatus !== "error") {
        setSyncStatus("syncing");
    }

    if (!session) {
        setSyncStatus("error");
        return null;
    }

    // Calcul de la plage de dates pour la semaine
    const { startTimestamp, endTimestamp } = getScheduleDates(weekOffset);
    // On vérifie si les événements sont déjà synchronisés avec Internet
    const isWeekInSyncedPlanning = alreadySyncedPlanning.some(
        (event) =>
            new Date(event.start).getTime() >= startTimestamp &&
            new Date(event.end).getTime() <= endTimestamp
    );
    if (isWeekInSyncedPlanning) {
        console.log("Semaine déjà synchronisée, pas de nouvelle requête");
        setSyncStatus("success");
        return [...planning];
    }
    try {
        const currentWeekPlanning = await session
            .getPlanningApi()
            .fetchPlanning(weekOffset);
        const updatedPlanning = mergePlanning(planning, currentWeekPlanning);
        setPlanning(updatedPlanning);
        setAlreadySyncedPlanning(
            // On met à jour le planning synchronisé (pour éviter de re-télécharger les mêmes semaines)
            mergePlanning(alreadySyncedPlanning, currentWeekPlanning)
        );
        sendUnknownPlanningSubjectsTelemetry(updatedPlanning);
        // Synchronisation réussie
        setSyncStatus("success");
        setLastSyncDate(new Date());
        console.log("Synchronisation réussie");
        clearPendingRetry();
        return currentWeekPlanning;
    } catch (error) {
        console.error("Failed to update planning:", error);
    }
    setSyncStatus("error");
    scheduleRetryIfNeeded(weekOffset);
    return null;
}

// Démarre la synchronisation périodique
export function startAutoSync() {
    if (syncIntervalId) return;
    // Première synchro immédiate
    useSyncStore.getState().clearAlreadySyncedPlanning();
    syncData();
    syncIntervalId = setInterval(() => {
        syncData();
    }, SYNC_INTERVAL_MS);
}

// Arrête la synchronisation périodique et les retries
export function stopAutoSync() {
    if (syncIntervalId) {
        clearInterval(syncIntervalId);
        syncIntervalId = null;
    }
    clearPendingRetry();
}
