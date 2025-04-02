// On récupère la date de début de semaine (lundi)
export function getCloserMonday(date: Date): Date {
    const d = new Date(date);
    // Obtenir le jour actuel (0 = dimanche, 1 = lundi, ..., 6 = samedi)
    let day = d.getDay();
    // Ajustement si aujourd'hui est samedi
    if (day === 6) {
        // Passer au lundi suivant
        d.setDate(d.getDate() + 2);
        day = d.getDay(); // Recalculer le jour après avoir avancé
    }
    // Calculer la différence pour atteindre lundi
    const daysToMonday = day === 0 ? 1 : 1 - day;
    // Créer la date de début (lundi 6h00)
    const startDate = new Date(d);
    startDate.setDate(d.getDate() + daysToMonday); // Passer au lundi de la semaine correspondante
    startDate.setHours(6, 0, 0, 0); // Fixer à 6h00
    return startDate;
}

// On récupère la date de fin de la semaine (semaine de travail = 5 jours)
export function getEndDate(startDate: Date) {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 4); // Ajouter 4 jours
    return endDate;
}
// Format de la date
export function formatDate(date: Date, includeYear = false) {
    return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: includeYear ? "2-digit" : undefined
    });
}

// Format de la date complète
export function formatFullDate(date: Date) {
    const formattedDate = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
    const formattedTime = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
    });
    return `${formattedDate} — ${formattedTime}`;
}

// Fonction pour calculer la date cible à partir du jour sélectionné (offset)
export function getWorkdayFromOffset(startDate: Date, offset: number): string {
    const date = new Date(startDate);
    date.setDate(date.getDate() + offset);
    return date.toISOString().split("T")[0];
}

// Fonction pour formater une date ISO en heure locale (format 24h)
export function formatDateToLocalTime(dateISO: string): string {
    const date = new Date(dateISO); // Convertit la chaîne ISO en objet Date
    const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit", // Format des heures avec 2 chiffres
        minute: "2-digit", // Format des minutes avec 2 chiffres
        hour12: false, // Utiliser un format 24 heures
        timeZone: "Europe/Paris" // Forcer le fuseau horaire (UTC+1)
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

// Fonction pour obtenir le numéro du jour dans la semaine de travail (0 = lundi, 4 = vendredi)
export function getDayNumberInWeek(date: Date): number {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return 0; // On gère le cas du week-end
    return dayOfWeek - 1;
}

// Fonction pour récupèrer le semestre actuel
export function getSemester(date: Date = new Date()): 0 | 1 {
    const month = date.getMonth(); // Mois actuel (0 = Janvier, 11 = Décembre)
    // Déterminer le semestre
    let semester: 0 | 1;
    if (month >= 8 || month <= 0) {
        semester = 0; // Septembre à Janvier -> Premier semestre
    } else {
        semester = 1; // Février à Juillet -> Deuxième semestre
    }

    return semester;
}

// Fonction pour vérifier si une date est dans la semaine de travail
export function isSameWorkWeek(date: Date) {
    const now = new Date();
    // On récupère le jour actuel
    const currentDay = now.getDay();

    // On cherche la date du lundi
    const startOfWeek = new Date(now);
    startOfWeek.setDate(
        now.getDate() - (currentDay === 0 ? 6 : currentDay - 1)
    );
    startOfWeek.setHours(1, 0, 0); // Début de la journée

    // On cherche la fin de semaine
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 4); // 4 jours pour aller à Vendredi
    endOfWeek.setHours(23, 59, 59); // Fin de la journée

    // On regarde si la date est comprise entre le lundi et le vendredi
    return date >= startOfWeek && date <= endOfWeek;
}

export function isToday(date: Date) {
    const now = new Date();
    return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );
}

// Transforme une date au format "JJ/MM/AAAA" en objet Date
export function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day); // Mois commence à 0 en JS
}
