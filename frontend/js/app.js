let allBars = [];

async function loadAndRenderBars() {
    const isPintFilter = document.getElementById('filter-price').checked;
    const isHhFilter = document.getElementById('filter-hh').checked;
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    
    allBars = await API.fetchBars(isPintFilter ? 5.0 : null);
    
    let barsToRender = allBars.filter(bar => {
        // Filtrage Temps Réel (Happy Hour)
        if (isHhFilter && !Utils.isCurrentlyHappyHour(bar.hh_hours)) return false;
        
        // Filtrage textuel (Nom et Adresse)
        if (searchQuery) {
            const matchName = bar.name.toLowerCase().includes(searchQuery);
            const matchAddress = bar.address.toLowerCase().includes(searchQuery);
            if (!matchName && !matchAddress) return false;
        }
        return true;
    });
    
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
        submitBtn.disabled = true;

        const address = document.getElementById('add-address').value;
        const coords = await geocodeAddress(address);
        const center = map.getCenter();
        
        const formData = new FormData();
        formData.append('name', document.getElementById('add-name').value);
        formData.append('address', address);
        formData.append('phone', document.getElementById('add-phone').value);
        formData.append('tags', document.getElementById('add-tags').value);
        
        formData.append('latitude', coords ? coords.lat : center.lat);
        formData.append('longitude', coords ? coords.lon : center.lng);
        
        const hoursStart = document.getElementById('add-hours-start').value;
        const hoursEnd = document.getElementById('add-hours-end').value;
        const stdHours = (hoursStart && hoursEnd) ? `${hoursStart}-${hoursEnd}` : "";

        const hhStart = document.getElementById('add-hh-start').value;
        const hhEnd = document.getElementById('add-hh-end').value;
        const hhHours = (hhStart && hhEnd) ? `${hhStart}-${hhEnd}` : "";

        formData.append('standard_hours', stdHours);
        formData.append('hh_hours', hhHours);
        
        // Ajout des prix de la pinte
        const priceNormal = document.getElementById('add-price-normal').value;
        const priceHH = document.getElementById('add-price-hh').value;
        if (priceNormal) formData.append('pint_price', priceNormal);
        if (priceHH) formData.append('pint_hh_price', priceHH);

        const barId = document.getElementById('add-bar-id').value;
        if (barId) formData.append('bar_id', barId);
        
        const imageFile = document.getElementById('add-image').files[0];
        if (imageFile) formData.append('image', imageFile);

        try {
            await API.submitSuggestion(formData);
            UI.closeModals();
            loadAndRenderBars(); 
        } catch (error) {
            console.error(error);
        } finally {
            submitBtn.disabled = false;
        }
    });
}

function initDeleteLogic() {
    document.getElementById('btn-delete-bar').addEventListener('click', async () => {
        if (!UI.currentBarData) return;
        const confirmDelete = confirm(`Voulez-vous vraiment supprimer "${UI.currentBarData.name}" ?`);
        if (confirmDelete) {
            try {
                await API.deleteBar(UI.currentBarData.id);
                UI.closeModals();
                loadAndRenderBars();
            } catch (e) {
                alert("Erreur lors de la suppression.");
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    UI.initTheme();
    UI.initModals();
    MapService.init();
    initCrowdsourcing();
    initDeleteLogic();
    
    // Écouteurs pour la recherche (temps réel avec 'input')
    document.getElementById('search-input').addEventListener('input', loadAndRenderBars);
    document.getElementById('filter-price').addEventListener('change', loadAndRenderBars);
    document.getElementById('filter-hh').addEventListener('change', loadAndRenderBars);
    
    loadAndRenderBars();
});