// Initiales d'un nom complet
export function getFirstLetters(username: string): string {
    const firstLetters = username.split(" ").map((name) => name.charAt(0));
    return firstLetters.join("");
}

// Prénom depuis un nom complet
export function getFirstNameFromName(username: string): string {
    //On prend le premier mot du nom complet
    return username.split(" ")[0];
}
