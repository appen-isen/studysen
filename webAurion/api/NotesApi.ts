import { generateDemoNotes } from "../utils/demo";
import { getNotesFromResponse } from "../utils/NoteUtils";
import { NotesList } from "../utils/types";
import Session from "./Session";

class NotesApi {
    private session: Session;
    constructor(session: Session) {
        this.session = session;
    }

    // Récupération des notes
    public fetchNotes(): Promise<NotesList[]> {
        return new Promise<NotesList[]>(async (resolve, reject) => {
            //Mode démo
            if (this.session.isDemo()) {
                return resolve(generateDemoNotes());
            }
            try {
                // On initialise le ViewState (obligatoire pour avoir une réponse correcteur du backend)
                await this.session.getViewState("Mes notes");
                const response = await this.session.sendGET<string>(
                    "/faces/LearnerNotationListPage.xhtml"
                );
                resolve(getNotesFromResponse(response));
            } catch (error) {
                // En cas d'erreur, on supprime le cache de ViewState
                this.session.clearViewStateCache();
                reject(error);
            }
        });
    }
}

export default NotesApi;
