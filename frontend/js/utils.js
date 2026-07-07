const Utils = {
    /**
     * Vérifie si l'heure actuelle est comprise dans la plage de l'Happy Hour
     * @param {string} hhHours Format "17:00-20:00"
     * @returns {boolean}
     */
    isCurrentlyHappyHour(hhHours) {
        if (!hhHours) return false;
        
        try {
            const [start, end] = hhHours.split('-');
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            
            const parseTime = (timeStr) => {
                const [h, m] = timeStr.trim().split(':').map(Number);
                return h * 60 + m;
            };

            const startTime = parseTime(start);
            const endTime = parseTime(end);

            // Gère les horaires passant minuit (ex: 18:00-02:00)
            if (endTime < startTime) {
                return currentTime >= startTime || currentTime <= endTime;
            }
            return currentTime >= startTime && currentTime <= endTime;
        } catch (e) {
            console.error("Format d'heure invalide", e);
            return false;
        }
    },
    isOpen(hours) {
        if (!hours || !hours.includes('-')) return false;
        try {
            const [start, end] = hours.split('-');
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const parseTime = (timeStr) => {
                const [h, m] = timeStr.trim().split(':').map(Number);
                return h * 60 + m;
            };
            const startTime = parseTime(start);
            const endTime = parseTime(end);
            if (endTime < startTime) return currentTime >= startTime || currentTime <= endTime;
            return currentTime >= startTime && currentTime <= endTime;
        } catch (e) { return false; }
    }
};

