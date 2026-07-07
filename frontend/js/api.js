const API_BASE_URL = "http://127.0.0.1:8000"; // URL locale du backend FastAPI

const API = {
    async fetchBars(maxPintPrice = null) {
        let url = `${API_BASE_URL}/bars/`;
        if (maxPintPrice) {
            url += `?max_pint_price=${maxPintPrice}`;
        }
        const response = await fetch(url);
        return response.json();
    },

    async submitSuggestion(formData) {
        const response = await fetch(`${API_BASE_URL}/crowdsourcing/suggest_bar/`, {
            method: 'POST',
            body: formData // On n'ajoute pas de headers, FormData gère le multipart/form-data
        });
        return response.json();
    }
};