const Utils = {
    DAYS: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    DAY_NAMES: { Mo: 'Lun', Tu: 'Mar', We: 'Mer', Th: 'Jeu', Fr: 'Ven', Sa: 'Sam', Su: 'Dim' },

    // Convertit une chaîne OSM ou simple en objet { Mo: "10:00-02:00", Tu: ... }
    parseHours(str) {
        let schedule = { Mo: "", Tu: "", We: "", Th: "", Fr: "", Sa: "", Su: "" };
        if (!str || str.toLowerCase() === 'nc' || str.toLowerCase() === 'a définir') return schedule;

        // Cas d'un horaire simple de l'ancienne version (ex: "10:00-02:00")
        if (/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(str.trim())) {
            this.DAYS.forEach(d => schedule[d] = str.trim());
            return schedule;
        }

        // Cas OpenStreetMap (ex: "Mo-Th 16:00-00:00; Fr 16:00-02:00")
        const parts = str.split(';');
        parts.forEach(part => {
            part = part.trim();
            if (!part) return;
            const tokens = part.split(' ');
            if(tokens.length >= 2) {
                const time = tokens.pop(); // Ex: "16:00-00:00"
                const daysStr = tokens.join(''); // Ex: "Mo-Th,Fr"

                daysStr.split(',').forEach(dPart => {
                    if (dPart.includes('-')) {
                        const [start, end] = dPart.split('-');
                        const startIndex = this.DAYS.indexOf(start);
                        const endIndex = this.DAYS.indexOf(end);
                        if (startIndex !== -1 && endIndex !== -1) {
                            for (let i = startIndex; i <= endIndex; i++) schedule[this.DAYS[i]] = time;
                        }
                    } else {
                        if (this.DAYS.includes(dPart)) schedule[dPart] = time;
                    }
                });
            }
        });
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
        
        // Si tous les jours sont identiques
        const first = schedule['Mo'];
        const allSame = this.DAYS.every(d => schedule[d] === first);
        if (allSame && first) return shortMode ? `Tous les jours ${first}` : `Tous les jours : ${first}`;

        // Affichage détaillé
        let output = [];
        this.DAYS.forEach(d => {
            if (schedule[d]) output.push(`<strong>${this.DAY_NAMES[d]}</strong> : ${schedule[d]}`);
        });

        if (output.length === 0) return "Non communiqués";
        
        // Mode liste : n'affiche que l'horaire d'aujourd'hui
        if (shortMode) {
            const todayJs = new Date().getDay();
            const todayOSM = todayJs === 0 ? 'Su' : this.DAYS[todayJs - 1];
            return schedule[todayOSM] ? `Aujourd'hui : ${schedule[todayOSM]}` : "Fermé aujourd'hui";
        }
        
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