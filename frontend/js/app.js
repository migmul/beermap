let allBars = [];

async function loadAndRenderBars() {
    // Lecture des filtres
    const isPintFilter = document.getElementById('filter-price').checked;
    const isHhFilter = document.getElementById('filter-hh').checked;
    
    // Appel API (ex: max_pint_price = 5 si coché)
    allBars = await API.fetchBars(isPintFilter ? 5.0 : null);
    
    // Filtrage JS additionnel pour l'indicateur temps réel
    let barsToRender = allBars;
    if (isHhFilter) {
        barsToRender = allBars.filter(bar => Utils.isCurrentlyHappyHour(bar.hh_hours));
    }
    
    MapService.renderMarkers(barsToRender, UI.openBarModal);
}

function initCrowdsourcing() {
    document.getElementById('add-bar-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', document.getElementById('add-name').value);
        formData.append('address', document.getElementById('add-address').value);
        
        // Simuler des coordonnées d'après le centre de la carte actuel
        const center = map.getCenter();
        formData.append('latitude', center.lat);
        formData.append('longitude', center.lng);
        
        const imageFile = document.getElementById('add-image').files[0];
        if (imageFile) formData.append('image', imageFile);

        try {
            await API.submitSuggestion(formData);
            alert("Suggestion ajoutée avec succès !");
            UI.closeModals();
            loadAndRenderBars(); // Rafraîchir la carte
            e.target.reset();
        } catch (error) {
            console.error("Erreur lors de l'ajout", error);
            alert("Erreur réseau");
        }
    });
}

// Point d'entrée principal
document.addEventListener('DOMContentLoaded', () => {
    UI.initTheme();
    UI.initModals();
    MapService.init();
    initCrowdsourcing();
    
    // Écouteurs pour le rafraichissement lors d'un clic sur un filtre
    document.getElementById('filter-price').addEventListener('change', loadAndRenderBars);
    document.getElementById('filter-hh').addEventListener('change', loadAndRenderBars);
    
    loadAndRenderBars();
    
    // Rafraichir les marqueurs HH toutes les minutes
    setInterval(loadAndRenderBars, 60000);
});