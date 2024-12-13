// On récupère le jour de la semaine
export function getNextWorkday(date: Date) {
    let d = new Date(date);
    while (d.getDay() === 0 || d.getDay() === 6) {
        // Skip weekends
        d.setDate(d.getDate() + 1);
    }
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
        month: "long",
    });
}
