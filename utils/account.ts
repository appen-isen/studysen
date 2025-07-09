// Initiales d'un nom complet
export function getFirstLetters(username: string): string {
    const firstLetters = username.split(" ").map((name) => name.charAt(0));
    return firstLetters.join("");
}

// Email depuis un nom complet
export function getEmailFromName(username: string): string {
    //On convertit le Prénom Nom en email valide
    const normalizedName = username
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return normalizedName.replace(" ", ".") + "@isen-ouest.yncrea.fr";
}

// Prénom depuis un nom complet
export function getFirstNameFromName(username: string): string {
    //On prend le premier mot du nom complet
    return username.split(" ")[0];
}
