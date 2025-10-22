import PlanningApi from "./PlanningApi";
import {
    getJSFFormParams,
    getName,
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
    // Active les logs de debug des requêtes/réponses HTTP
    private httpDebug = true;

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

    // Redaction et normalisation des headers pour les logs
    private sanitizeHeaders(
        headers: Record<string, any> | undefined
    ): Record<string, string> {
        const result: Record<string, string> = {};
        if (!headers) return result;
        // Aplatir (peut être Headers-like ou simple record)
        const entries: Array<[string, any]> = Array.isArray(headers)
            ? (headers as Array<[string, any]>)
            : Object.entries(headers as Record<string, any>);
        for (const [k, v] of entries) {
            const key = String(k).toLowerCase();
            let val = typeof v === "string" ? v : JSON.stringify(v);
            if (["cookie", "authorization", "set-cookie"].includes(key)) {
                val = "<redacted>";
            }
            result[key] = val;
        }
        return result;
    }

    private headersToObject(h: Headers): Record<string, string> {
        const obj: Record<string, string> = {};
        try {
            h.forEach((value, key) => {
                const k = key.toLowerCase();
                obj[k] = ["set-cookie"].includes(k) ? "<redacted>" : value;
            });
        } catch {}
        return obj;
    }

    // Masquage du body (ex: password) + truncation
    private sanitizeBody(
        body: any,
        headers?: Record<string, any>
    ): string | undefined {
        if (body == null) return undefined;
        try {
            const contentType = String(
                headers?.["content-type"] || headers?.["Content-Type"] || ""
            ).toLowerCase();
            const raw = typeof body === "string" ? body : String(body);

            // x-www-form-urlencoded
            if (contentType.includes("application/x-www-form-urlencoded")) {
                const usp = new URLSearchParams(raw);
                if (usp.has("password")) usp.set("password", "<redacted>");
                return usp.toString().slice(0, 2000);
            }
            // JSON
            if (contentType.includes("application/json")) {
                const json = JSON.parse(raw);
                if (json && typeof json === "object") {
                    if ("password" in json)
                        (json as any).password = "<redacted>";
                }
                return JSON.stringify(json).slice(0, 2000);
            }
            // Texte par défaut
            return raw.slice(0, 2000);
        } catch {
            return String(body).slice(0, 2000);
        }
    }

    private debugLogRequest(
        fullUrl: string,
        method: string,
        headers: Record<string, any> | undefined,
        body: any
    ) {
        if (!this.httpDebug) return;
        const normalizedHeaders = this.sanitizeHeaders(headers);
        const safeBody = this.sanitizeBody(body, normalizedHeaders);
        console.log("[HTTP Request]", {
            url: fullUrl,
            method,
            headers: normalizedHeaders,
            body: safeBody
        });
    }

    private debugLogResponse(
        fullUrl: string,
        method: string,
        status: number,
        statusText: string,
        headers: Headers | Record<string, any> | undefined,
        bodyText: string
    ) {
        if (!this.httpDebug) return;
        const normalizedHeaders =
            headers instanceof Headers
                ? this.headersToObject(headers)
                : this.sanitizeHeaders(headers as Record<string, any>);
        const preview = (bodyText || "").slice(0, 2000);
        console.log("[HTTP Response]", {
            url: fullUrl,
            method,
            status,
            statusText,
            headers: normalizedHeaders,
            body: preview
        });
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

            // Log requête
            this.debugLogRequest(fullUrl, method, mergedHeaders, init?.body);

            const res = await fetch(fullUrl, {
                method: init?.method || "GET",
                headers: mergedHeaders,
                body: init?.body === null ? undefined : init?.body,
                // S'assurer que les cookies de session sont envoyés/stockés
                credentials: "include",
                signal: controller.signal
            });
            const text = await res.text();
            // Log réponse
            this.debugLogResponse(
                fullUrl,
                method,
                res.status,
                res.statusText,
                res.headers,
                text
            );

            // En cas d'erreur HTTP
            if (!res.ok) {
                const err = new Error(
                    `HTTP ${res.status} ${
                        res.statusText
                    } for ${url} — ${text.slice(0, 256)}`
                );
                (err as any).status = res.status;
                (err as any).statusText = res.statusText;
                (err as any).body = text.slice(0, 2000);
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
                        res.includes("Home page") ||
                        res.includes("Page d'accueil")
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
    public getViewState(subMenuId: string): Promise<string> {
        const attempt = async (): Promise<string> => {
            // Utiliser le cache si pertinent
            if (this.viewStateCache && this.subMenuIdCache === subMenuId) {
                return this.viewStateCache;
            }
            const schedulePage = await this.sendGET<string>(
                "/faces/Planning.xhtml"
            );
            let viewState = getViewState(schedulePage);
            if (!viewState) throw new Error("Viewstate not found");

            // Ici 291906 correspond au menu 'Scolarité' dans la sidebar
            // Requête utile pour intialiser le ViewState (obligatoire pour effectuer une requête)
            await this.sendSidebarRequest("291906", viewState);
            viewState = await this.sendSidebarSubmenuRequest(
                subMenuId,
                viewState
            );
            if (!viewState) throw new Error("Viewstate not found");
            this.viewStateCache = viewState;
            this.subMenuIdCache = subMenuId;
            return viewState;
        };

        return new Promise<string>(async (resolve, reject) => {
            try {
                const vs = await attempt();
                resolve(vs);
            } catch (e1) {
                // En cas d'échec, on nettoie et on retente une fois
                try {
                    this.clearViewStateCache();
                    const vs2 = await attempt();
                    resolve(vs2);
                } catch (e2) {
                    reject(new Error("Viewstate not found"));
                }
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
