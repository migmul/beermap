let allBars = [];

async function loadAndRenderBars() {
    const isPintFilter = document.getElementById('filter-price').checked;
    const isHhFilter = document.getElementById('filter-hh').checked;
    
    allBars = await API.fetchBars(isPintFilter ? 5.0 : null);
    
    let barsToRender = allBars;
    if (isHhFilter) {
        barsToRender = allBars.filter(bar => Utils.isCurrentlyHappyHour(bar.hh_hours));
    }
    
    MapService.renderMarkers(barsToRender, UI.openBarModal);
}

// Fonction utilitaire pour géocoder l'adresse avec Nominatim (OSM)
async function geocodeAddress(address) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await response.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
    } catch (error) {
        console.error("Erreur de géocodage", error);
    }
    return null;
}

function initCrowdsourcing() {
    document.getElementById('add-bar-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.textContent = "Recherche de l'adresse...";
        submitBtn.disabled = true;

        const address = document.getElementById('add-address').value;
        const barId = document.getElementById('add-bar-id').value;
        
        // Géocodage automatique à partir de l'adresse
        const coords = await geocodeAddress(address);
        let latitude, longitude;

        if (coords) {
            latitude = coords.lat;
            longitude = coords.lon;
        } else {
            alert("L'adresse n'a pas pu être géocodée. Position par défaut utilisée.");
            const center = map.getCenter();
            latitude = center.lat;
            longitude = center.lng;
        }
        
        const formData = new FormData();
        formData.append('name', document.getElementById('add-name').value);
        formData.append('address', address);
        formData.append('phone', document.getElementById('add-phone').value);
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
        if (barId) formData.append('bar_id', barId); // Pour le backend s'il s'agit d'une modification
        
        const imageFile = document.getElementById('add-image').files[0];
        if (imageFile) formData.append('image', imageFile);

        try {
            submitBtn.textContent = "Envoi...";
            await API.submitSuggestion(formData);
            alert("Suggestion transmise avec succès !");
            UI.closeModals();
            loadAndRenderBars(); 
        } catch (error) {
            console.error("Erreur lors de l'ajout", error);
            alert("Erreur réseau");
        } finally {
            submitBtn.textContent = "Envoyer la suggestion";
            submitBtn.disabled = false;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    UI.initTheme();
    UI.initModals();
    MapService.init();
    initCrowdsourcing();
    
    document.getElementById('filter-price').addEventListener('change', loadAndRenderBars);
    document.getElementById('filter-hh').addEventListener('change', loadAndRenderBars);
    
    loadAndRenderBars();
    setInterval(loadAndRenderBars, 60000);
});