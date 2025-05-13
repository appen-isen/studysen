import PlanningApi from "./PlanningApi";
import {
    getJSFFormParams,
    getName,
    getViewState,
    paramsToHashMap
} from "../utils/AurionUtils";
import NotesApi from "./NotesApi";
import axios, { AxiosInstance } from "axios";
import { Platform } from "react-native";
import { sendTauriCommand } from "@/utils/desktop";

export class Session {
    private client: AxiosInstance;
    private baseURL: string = "https://web.isen-ouest.fr/webAurion";

    //Permet de sauvegarder le ViewState et le subMenuId pour les réutiliser dans les prochaines requêtes (optimisation)
    //Cela a pour but d'éviter d'effectuer 3 requêtes lorsque l'on refait la même demande (emploi du temps de la semaine suivante par exemple)
    private viewStateCache: string = "";
    private subMenuIdCache: string = "";

    // Nom et prénom de l'utilisateur
    private username: string = "";

    private demo_mode: boolean = false;

    constructor() {
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            withCredentials: true
        });
    }

    /**
     * Authentifie un utilisateur avec un nom d'utilisateur et un mot de passe.
     *
     * @param {string} username - Le nom d'utilisateur de l'utilisateur.
     * @param {string} password - Le mot de passe de l'utilisateur.
     * @returns {Promise<Session>} Une promesse qui se résout avec une instance de Session si l'authentification réussit.
     * @throws {Error} Si l'authentification échoue.
     */
    public login(
        username: string,
        password: string,
        timeout?: number
    ): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            //Mode de démo
            if (username === "demo" && password === "demo") {
                this.demo_mode = true;
                this.username = "Demo User";
                console.log(`Logged in as ${this.username}`);
                return resolve(true);
            }
            //Les paramètres nécessaires pour effectuer une requête POST
            const params = new URLSearchParams();
            params.append("username", username);
            params.append("password", password);

            // On envoie la requête de connexion
            this.sendPOST<string>(`/login`, params)
                .then((res) => {
                    // On traite la réponse de la connexion
                    // On vérifie si la connexion a réussi
                    if (
                        res.includes("Home page") ||
                        res.includes("Page d'accueil")
                    ) {
                        // On récupère le nom de l'utilisateur
                        this.username = getName(res);
                        console.log(`Logged in as ${this.username}`);
                        resolve(true);
                    }
                    resolve(false);
                })
                .catch((e) => reject(e));
        });
    }

    //On retourne le nom de l'utilisateur
    public getUsername(): string {
        return this.username;
    }

    // API pour le calendrier
    public getPlanningApi(): PlanningApi {
        return new PlanningApi(this);
    }
    // API pour les notes
    public getNotesApi(): NotesApi {
        return new NotesApi(this);
    }

    // (1ère phase) Besoin de simuler le clic sur la sidebar pour obtenir le ViewState nécessaire aux fonctionnements des reqûetes
    public sendSidebarRequest(
        subMenuId: string,
        viewState: string
    ): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                // 1 ère sidebar: formId = j_idt46, renderId = sidebar
                const params = getJSFFormParams(
                    "j_idt46",
                    "sidebar",
                    viewState
                );
                // On ajoute l'ID du sous-menu qui correspond à la rubrique chosie (Scolarité, mon compte, divers, ...)
                params.append(
                    "webscolaapp.Sidebar.ID_SUBMENU",
                    `submenu_${subMenuId}`
                );
                // On envoie la requête POST
                const response = await this.sendPOST<string>(
                    `/faces/Planning.xhtml`,
                    params
                );
                resolve(response);
            } catch (err) {
                reject(err);
            }
        });
    }

    // (2ème phase) Simulation du sous menu de la side bar pour obtenir le ViewState nécessaire aux fonctionnements des requêtes
    // Cette fonction retourne un second ViewState qui sera utilisé pour effectuer les prochaines requêtes POST
    public sendSidebarSubmenuRequest(
        subMenuId: string,
        viewState: string
    ): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            try {
                const params = new URLSearchParams();
                // On ajoute les paramètres nécessaires pour effectuer une requête POST
                params.append("form", "form");
                params.append("javax.faces.ViewState", viewState);
                params.append("form:sidebar", "form:sidebar");
                params.append("form:sidebar_menuid", subMenuId);
                const response = await this.sendPOST<string>(
                    `/faces/Planning.xhtml`,
                    params
                );
                const secondViewState = getViewState(response);
                if (secondViewState) {
                    resolve(secondViewState);
                } else {
                    reject(new Error("Viewstate not found"));
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    // Récupération du ViewState pour effectuer les différentes requêtes
    public getViewState(subMenuId: string): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            //On optimise l'accès au ViewState
            if (this.viewStateCache && this.subMenuIdCache === subMenuId) {
                return resolve(this.viewStateCache);
            }
            try {
                const schedulePage = await this.sendGET<string>(
                    "/faces/Planning.xhtml"
                );
                let viewState = getViewState(schedulePage);
                if (viewState) {
                    // Ici 291906 correspond au menu 'Scolarité' dans la sidebar
                    // Requête utile pour intialiser le ViewState (obligatoire pour effectuer une requête)
                    await this.sendSidebarRequest("291906", viewState);

                    // On récupère le ViewState pour effectuer la prochaine requête
                    viewState = await this.sendSidebarSubmenuRequest(
                        subMenuId,
                        viewState
                    );
                    if (viewState) {
                        this.viewStateCache = viewState;
                        this.subMenuIdCache = subMenuId;
                        return resolve(viewState);
                    }
                }
                return reject(new Error("Viewstate not found"));
            } catch (error) {
                reject(new Error("Viewstate not found"));
            }
        });
    }

    //Permet de vider le cache du ViewState et du subMenuId (si besoin)
    public clearViewStateCache(): void {
        this.viewStateCache = "";
        this.subMenuIdCache = "";
    }

    //Le mode démo permet de tester l'application avec des données fictives
    public isDemo(): boolean {
        return this.demo_mode;
    }

    public sendGET<T>(url: string): Promise<T> {
        if (Platform.OS === "web") {
            // On utilise la fonction pour envoyer la requête GET à travers Rust si on est sur l'application de bureau
            return sendTauriCommand("send_get", {
                url: this.baseURL + url
            }).then((response) => response);
        }
        return this.client.get<T>(url).then((response) => response.data);
    }

    public sendPOST<T>(url: string, data: URLSearchParams): Promise<T> {
        if (Platform.OS === "web") {
            // On utilise la fonction pour envoyer la requête POST à travers Rust si on est sur l'application de bureau
            return sendTauriCommand("send_post", {
                url: this.baseURL + url,
                params: paramsToHashMap(data)
            }).then((response) => response);
        }
        return this.client.post<T>(url, data).then((response) => response.data);
    }
}

export default Session;
