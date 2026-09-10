import useSessionStore from "@/stores/sessionStore";
import { PlanningEvent } from "@/webAurion/utils/types";
import { useEffect, useState } from "react";

// Cache des descriptions déjà récupérées (évite une requête à chaque ouverture d'un même cours)
const descriptionsCache = new Map<string, string>();

// Récupère la description d'un cours à la demande (elle n'est pas fournie avec l'emploi du temps)
// enabled: permet de ne lancer la requête que lorsque le cours est réellement affiché
export default function useEventDescription(
    event: PlanningEvent,
    enabled: boolean
): { description: string; loading: boolean } {
    const session = useSessionStore((state) => state.session);
    const [description, setDescription] = useState(
        () => descriptionsCache.get(event.id) || ""
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!enabled) return;

        // Description déjà récupérée pour ce cours
        const cachedDescription = descriptionsCache.get(event.id);
        if (cachedDescription !== undefined) {
            setDescription(cachedDescription);
            return;
        }

        if (!session) return;

        // Permet d'ignorer la réponse si le cours affiché a changé entre temps
        let isCurrentEvent = true;
        setDescription("");
        setLoading(true);

        session
            .getPlanningApi()
            .fetchEventDescription(event)
            .then((fetchedDescription) => {
                // On ne met en cache que les requêtes réussies
                descriptionsCache.set(event.id, fetchedDescription);
                if (isCurrentEvent) {
                    setDescription(fetchedDescription);
                }
            })
            .catch(() => {
                // L'erreur est déjà affichée dans les logs par l'API
            })
            .finally(() => {
                if (isCurrentEvent) {
                    setLoading(false);
                }
            });

        return () => {
            isCurrentEvent = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, event.id, session]);

    return { description, loading };
}
