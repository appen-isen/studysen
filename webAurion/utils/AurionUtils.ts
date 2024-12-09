import { load } from "cheerio";

// Extraction du ViewState de la page HTML (obligatoire pour effectuer une requête)
export function getViewState(html: string): string | undefined {
    const parser = load(html);
    //On recherche l'élément input avec l'attribut name="javax.faces.ViewState"
    const inputElement = parser('input[name="javax.faces.ViewState"]');

    if (inputElement.length > 0) {
        //On récupère la valeur de l'attribut value
        const viewState = inputElement.attr("value");
        return viewState;
    }
    return undefined;
}

// Paramètres nécessaires pour effectuer une requête avec le backend Java Server Faces (JSF)
// Form ID : ID du formulaire (Récupérable avec BurpSuite / Inspecteur de requêtes)
// Render ID : ID de l'élément à mettre à jour (Récupérable avec BurpSuite / Inspecteur de requêtes)
export function getJSFFormParams(
    formId: string,
    renderId: string,
    viewState: string
): URLSearchParams {
    const params = new URLSearchParams();
    params.append("javax.faces.partial.ajax", "true");
    params.append("javax.faces.source", `form:${formId}`);
    params.append("javax.faces.partial.execute", `form:${formId}`);
    params.append("javax.faces.partial.render", `form:${renderId}`);
    params.append(`form:${formId}`, `form:${formId}`);
    params.append("form", "form");
    params.append("javax.faces.ViewState", viewState);
    return params;
}
