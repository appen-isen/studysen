import PlanningApi from "./PlanningApi";
import {
    getJSFFormParams,
    getName,
    getSidebarMenuId,
    getViewState,
    paramsToHashMap
} from "../utils/AurionUtils";
import NotesApi from "./NotesApi";
import { Platform } from "react-native";
import { sendTauriCommand } from "@/utils/desktop";
import { fetch } from "expo/fetch";

export class Session {
    private baseURL: string = "https://web.isen-ouest.fr/webAurion";
    private defaultTimeoutMs = 15000;

    //Permet de sauvegarder le ViewState et le subMenuId pour les réutiliser dans les prochaines requêtes (optimisation)
    //Cela a pour but d'éviter d'effectuer 3 requêtes lorsque l'on refait la même demande (emploi du temps de la semaine suivante par exemple)
    private viewStateCache: string = "";
    private subMenuIdCache: string = "";

    // Nom et prénom de l'utilisateur
    private username: string = "";

    private demo_mode: boolean = false;

    constructor() {}

    private getBaseHeaders(): Record<string, string> {
        return {
            "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0"
        };
    }

    private async fetchText(
        url: string,
        init?: RequestInit,
        timeoutMs: number = this.defaultTimeoutMs
    ): Promise<string> {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const fullUrl = this.baseURL + url;
            const mergedHeaders: Record<string, any> = {
                ...this.getBaseHeaders(),
                ...(init?.headers as any)
            };
            const method = init?.method || "GET";

            const res = await fetch(fullUrl, {
                method: init?.method || "GET",
                headers: mergedHeaders,
                body: init?.body === null ? undefined : init?.body,
                // S'assurer que les cookies de session sont envoyés/stockés
                credentials: "include",
                signal: controller.signal
            });
            const text = await res.text();
            // En cas d'erreur HTTP
            if (!res.ok) {
                const err = new Error(
                    `HTTP ${res.status} ${
                        res.statusText
                    } for ${url} — ${text.slice(0, 256)}`
                );
                (err as any).status = res.status;
                (err as any).statusText = res.statusText;
                throw err;
            }
            return text as unknown as string;
        } finally {
            clearTimeout(id);
        }
    }

    /**
     * Authentifie un utilisateur avec un nom d'utilisateur et un mot de passe.
     *
     * @param {string} username - Le nom d'utilisateur de l'utilisateur.
     * @param {string} password - Le mot de passe de l'utilisateur.
     * @returns {Promise<Session>} Une promesse qui se résout avec une instance de Session si l'authentification réussit.
     * @throws {Error} Si l'authentification échoue.
     */
    public login(username: string, password: string): Promise<boolean> {
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
                        !res.includes("Login or password invalid") &&
                        !res.includes("Login ou mot de passe invalide")
                    ) {
                        // On récupère le nom de l'utilisateur
                        this.username = getName(res);
                        console.log(`Logged in as ${this.username}`);
                        // On repart sur un ViewState propre après login
                        this.clearViewStateCache();
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
    public getViewState(subMenuName: string): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            //On optimise l'accès au ViewState
            if (this.viewStateCache && this.subMenuIdCache === subMenuName) {
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
                    const sidebarResponse = await this.sendSidebarRequest(
                        "291906",
                        viewState
                    );

                    // On récupère le sidebar_menuid correspondant au sous-menu demandé
                    const subMenuId = getSidebarMenuId(
                        sidebarResponse,
                        subMenuName
                    );
                    // Vérification de l'existence du subMenuId
                    if (!subMenuId) {
                        return reject(
                            new Error(
                                "Sidebar menu ID not found, subMenuName: " +
                                    subMenuName
                            )
                        );
                    }
                    // On récupère le ViewState pour effectuer la prochaine requête
                    viewState = await this.sendSidebarSubmenuRequest(
                        subMenuId,
                        viewState
                    );
                    if (viewState) {
                        this.viewStateCache = viewState;
                        this.subMenuIdCache = subMenuName;
                        return resolve(viewState);
                    }
                }
                return reject(
                    new Error(
                        "Viewstate not found, subMenuName: " + subMenuName
                    )
                );
            } catch (error) {
                reject(
                    new Error(
                        "Viewstate not found, subMenuName: " + subMenuName
                    )
                );
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
        // On ajoute un cache buster pour éviter les problèmes de cache
        return this.fetchText(url + `?cb=${Date.now()}`, {
            method: "GET"
        }).then((text) => text as unknown as T);
    }

    public sendPOST<T>(url: string, data: URLSearchParams): Promise<T> {
        if (Platform.OS === "web") {
            // On utilise la fonction pour envoyer la requête POST à travers Rust si on est sur l'application de bureau
            return sendTauriCommand("send_post", {
                url: this.baseURL + url,
                params: paramsToHashMap(data)
            }).then((response) => response);
        }
        return this.fetchText(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: data.toString()
        }).then((text) => text as unknown as T);
    }
}

export default Session;
