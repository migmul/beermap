const API_BASE_URL = "http://127.0.0.1:8000";

const API = {
    getToken() {
        return localStorage.getItem('beermap_token');
    },
    
    getHeaders(isFormData = false) {
        const headers = {};
        const token = this.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (!isFormData) headers['Content-Type'] = 'application/json';
        return headers;
    },

    async fetchBars() {
        const response = await fetch(`${API_BASE_URL}/bars/`);
        return response.json();
    },

    async fetchPendingBars() {
        const response = await fetch(`${API_BASE_URL}/bars/pending`, { headers: this.getHeaders() });
        return response.json();
    },

    async submitSuggestion(formData) {
        const response = await fetch(`${API_BASE_URL}/crowdsourcing/suggest_bar/`, {
            method: 'POST',
            headers: { ...this.getHeaders(true) }, // Pas de Content-Type pour un FormData
            body: formData
        });
        return response.json();
    },

    async deleteBar(barId) {
        const response = await fetch(`${API_BASE_URL}/bars/${barId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return response.json();
    },

    async updateBarStatus(barId, status) {
        const response = await fetch(`${API_BASE_URL}/bars/${barId}/status?status=${status}`, {
            method: 'PATCH',
            headers: this.getHeaders()
        });
        return response.json();
    },

    async login(username, password) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        });
        if (!response.ok) throw new Error("Identifiants incorrects");
        return response.json();
    },

    async register(email, pseudo, password) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, pseudo, password })
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Erreur d'inscription");
        }
        return response.json();
    }
};