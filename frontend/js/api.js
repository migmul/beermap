const API_BASE_URL = "http://127.0.0.1:8000";

const API = {
    async fetchBars(maxPintPrice = null) {
        let url = `${API_BASE_URL}/bars/`;
        if (maxPintPrice) url += `?max_pint_price=${maxPintPrice}`;
        const response = await fetch(url);
        return response.json();
    },

    async submitSuggestion(formData) {
        const response = await fetch(`${API_BASE_URL}/crowdsourcing/suggest_bar/`, {
            method: 'POST',
            body: formData
        });
        return response.json();
    },

    async deleteBar(barId) {
        const response = await fetch(`${API_BASE_URL}/bars/${barId}`, {
            method: 'DELETE'
        });
        return response.json();
    }
};