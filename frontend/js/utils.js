const Utils = {
    DAYS: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    DAY_NAMES: { Mo: 'Lun', Tu: 'Mar', We: 'Mer', Th: 'Jeu', Fr: 'Ven', Sa: 'Sam', Su: 'Dim' },

    // Convertit une chaîne OSM ou simple en objet { Mo: "10:00-02:00", Tu: ... }
    parseHours(str) {
        let schedule = { Mo: "", Tu: "", We: "", Th: "", Fr: "", Sa: "", Su: "" };
        if (!str || str.toLowerCase() === 'nc' || str.toLowerCase() === 'a définir') return schedule;

        // Cas d'un horaire simple (ex: "10:00-02:00")
        if (/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(str.trim())) {
            this.DAYS.forEach(d => schedule[d] = str.trim());
            return schedule;
        }

        // Expression régulière robuste pour cibler tous les paires [Jours] [Horaires]
        // Capte "Mo-We", "Th,Fr", "Su-Th", etc. peu importe si séparé par une virgule ou un point-virgule
        const regex = /([A-Za-z\-,]+)\s+(\d{2}:\d{2}-\d{2}:\d{2})/g;
        let match;
        
        while ((match = regex.exec(str)) !== null) {
            const daysStr = match[1]; // Ex: "Su-Th" ou "Fr,Sa"
            const time = match[2];    // Ex: "11:30-01:30"

            daysStr.split(',').forEach(dPart => {
                if (dPart.includes('-')) {
                    const [start, end] = dPart.split('-');
                    const startIndex = this.DAYS.indexOf(start);
                    const endIndex = this.DAYS.indexOf(end);
                    
                    if (startIndex !== -1 && endIndex !== -1) {
                        // Cette boucle gère le passage par le Dimanche (ex: Su-Th -> index 6 à index 3)
                        let i = startIndex;
                        while (true) {
                            schedule[this.DAYS[i]] = time;
                            if (i === endIndex) break;
                            i = (i + 1) % 7; // Avance de 1 et boucle à 0 après 6
                        }
                    }
                } else {
                    if (this.DAYS.includes(dPart)) schedule[dPart] = time;
                }
            });
        }
        return schedule;
    },

    // Convertit l'objet schedule en chaîne compatible OSM
    buildHoursString(schedule) {
        let parts = [];
        this.DAYS.forEach(d => {
            if (schedule[d]) parts.push(`${d} ${schedule[d]}`);
        });
        return parts.join('; ');
    },

    // Formate les horaires pour l'affichage public
    formatHoursToDisplay(str, shortMode = false) {
        if (!str || str === 'A définir' || str === 'NC') return "Non communiqués";
        const schedule = this.parseHours(str);
        
        // Mode liste : n'affiche que l'horaire d'aujourd'hui
        if (shortMode) {
            const todayJs = new Date().getDay();
            const todayOSM = todayJs === 0 ? 'Su' : this.DAYS[todayJs - 1];
            return schedule[todayOSM] ? `Aujourd'hui : ${schedule[todayOSM]}` : "Fermé aujourd'hui";
        }

        // Si tous les jours sont identiques
        const first = schedule['Mo'];
        const allSame = this.DAYS.every(d => schedule[d] === first);
        if (allSame) {
            return first ? `Tous les jours : ${first}` : "Non communiqués";
        }

        // Algorithme de groupement des jours successifs ayant les mêmes horaires
        let groups = [];
        let currentStart = null, currentEnd = null, currentTime = null;

        for (let i = 0; i < this.DAYS.length; i++) {
            let d = this.DAYS[i];
            let t = schedule[d];
            if (t) {
                if (t === currentTime) {
                    currentEnd = d; // Étend le groupe actuel
                } else {
                    if (currentTime) groups.push({ start: currentStart, end: currentEnd, time: currentTime });
                    currentStart = d;
                    currentEnd = d;
                    currentTime = t;
                }
            } else {
                if (currentTime) {
                    groups.push({ start: currentStart, end: currentEnd, time: currentTime });
                    currentTime = null; // Marque une fermeture
                }
            }
        }
        if (currentTime) groups.push({ start: currentStart, end: currentEnd, time: currentTime });

        // Vérification de la boucle de fin de semaine (fusionne "Dim" et "Lun au Jeu" si identiques)
        if (groups.length > 1) {
            const firstGroup = groups[0];
            const lastGroup = groups[groups.length - 1];
            if (firstGroup.time === lastGroup.time && firstGroup.start === 'Mo' && lastGroup.end === 'Su') {
                firstGroup.start = lastGroup.start; // Repousse le début du groupe au Dimanche (ou avant)
                groups.pop(); // Supprime le dernier groupe puisqu'il est fusionné
            }
        }

        let output = [];
        groups.forEach(g => {
            if (g.start === g.end) {
                // Un jour seul
                output.push(`<strong>${this.DAY_NAMES[g.start]}</strong> : ${g.time}`);
            } else {
                // Calcul de la distance entre les jours pour savoir si on écrit "Ven, Sam" ou "Mer au Ven"
                let startIndex = this.DAYS.indexOf(g.start);
                let endIndex = this.DAYS.indexOf(g.end);
                let diff = endIndex - startIndex;
                if (diff < 0) diff += 7; // Répare le calcul si ça boucle sur Dimanche
                
                if (diff === 1) {
                    output.push(`<strong>${this.DAY_NAMES[g.start]}, ${this.DAY_NAMES[g.end]}</strong> : ${g.time}`);
                } else {
                    output.push(`<strong>${this.DAY_NAMES[g.start]} au ${this.DAY_NAMES[g.end]}</strong> : ${g.time}`);
                }
            }
        });

        if (output.length === 0) return "Non communiqués";
        return output.join('<br>');
    },

    isOpen(hoursStr) {
        if (!hoursStr) return false;
        const schedule = this.parseHours(hoursStr);
        const now = new Date();
        
        // JS getDay() -> 0: Dimanche, 1: Lundi. On mappe sur notre tableau
        const currentJsDay = now.getDay();
        const currentDayStr = currentJsDay === 0 ? 'Su' : this.DAYS[currentJsDay - 1];
        const yesterdayStr = currentJsDay === 0 ? 'Sa' : (currentJsDay === 1 ? 'Su' : this.DAYS[currentJsDay - 2]);

        const currentTime = now.getHours() * 60 + now.getMinutes();
        const parseTime = (t) => {
            const [h, m] = t.trim().split(':').map(Number);
            return h * 60 + m;
        };

        const checkTime = (timeStr, isYesterday) => {
            if (!timeStr) return false;
            try {
                const [start, end] = timeStr.split('-');
                const startTime = parseTime(start);
                const endTime = parseTime(end);

                if (endTime < startTime) {
                    // Traverse minuit (ex: 18:00-02:00)
                    if (isYesterday) return currentTime <= endTime;
                    else return currentTime >= startTime;
                } else {
                    if (isYesterday) return false;
                    return currentTime >= startTime && currentTime <= endTime;
                }
            } catch(e) { return false; }
        };

        // On est ouvert si l'horaire d'aujourd'hui matche, OU si l'horaire d'hier dépasse minuit et qu'on y est
        if (checkTime(schedule[currentDayStr], false)) return true;
        if (checkTime(schedule[yesterdayStr], true)) return true;

        return false;
    },

    isCurrentlyHappyHour(hhHours) {
        // La structure Happy Hour reste simple pour l'instant
        return this.isOpen(hhHours); 
    }
};