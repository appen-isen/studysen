// On récupère le jour de la semaine
export function getNextWorkday(date: Date): Date {
    // Clone de la date pour ne pas modifier l'original
    let d = new Date(date);

    // Si c'est samedi (6), avancer de 2 jours
    // Si c'est dimanche (0), avancer d'un jour
    if (d.getDay() === 6) {
        d.setDate(d.getDate() + 2);
    } else if (d.getDay() === 0) {
        d.setDate(d.getDate() + 1);
    }

    // Réinitialiser l'heure à 00:00:00
    d.setHours(0, 0, 0, 0);

    return d;
}

// On récupère la date de fin de la semaine (semaine de travail = 5 jours)
export function getEndDate(startDate: Date) {
    const d = new Date(startDate);
    let workdays = 0;
    while (workdays < 4) {
        // On ajoute un jour
        d.setDate(d.getDate() + 1);
        if (d.getDay() !== 0 && d.getDay() !== 6) {
            // On compte les jours de travail
            workdays++;
        }
    }
    return d;
}
// Format de la date
export function formatDate(date: Date) {
    return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
    });
}

// Fonction pour calculer la date cible à partir du jour sélectionné (offset)
export function getWorkdayFromOffset(startDate: Date, offset: number): string {
    let targetDate = new Date(startDate);
    targetDate.setHours(0, 0, 0, 0); // Réinitialiser à minuit en heure locale
    let daysToAdd = offset;

    while (daysToAdd > 0) {
        targetDate.setDate(targetDate.getDate() + 1);
        if (targetDate.getDay() !== 0 && targetDate.getDay() !== 6) {
            daysToAdd--;
        }
    }

    // Retourner une chaîne ISO construite manuellement en local (sans UTC 'Z')
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`; // Format YYYY-MM-DD, local
}

// Fonction pour formater une date ISO en heure locale (format 24h)
export function formatDateToLocalTime(dateISO: string): string {
    const date = new Date(dateISO); // Convertit la chaîne ISO en objet Date
    const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit", // Format des heures avec 2 chiffres
        minute: "2-digit", // Format des minutes avec 2 chiffres
        hour12: false, // Utiliser un format 24 heures
    };

    // Crée un formatteur pour la date locale française (France)
    const formatter = new Intl.DateTimeFormat("fr-FR", options);

    // Formate la date en heure et minutes
    return formatter.format(date);
}

// Fonction pour obtenir le numéro de la semaine à partir d'une date
export function weekFromNow(startDate: Date, targetDate: Date): number {
    const start = new Date(startDate);
    const diffInMs = targetDate.getTime() - start.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return Math.ceil(diffInDays / 7);
}
