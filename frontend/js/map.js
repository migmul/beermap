let map;
let markersLayer;
let currentTileLayer;

const MapService = {
    init() {
        map = L.map('map-container', { zoomControl: false }).setView([46.603354, 1.888334], 6);
        markersLayer = L.layerGroup().addTo(map);
        
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        this.setTheme(currentTheme);
        this.locateUser();
    },

    setTheme(theme) {
        if (currentTileLayer) {
            map.removeLayer(currentTileLayer);
        }
        
        // Basculement entre basemaps cartocdn selon le thème
        const themeMap = theme === 'dark' ? 'dark_all' : 'light_all';
        currentTileLayer = L.tileLayer(`https://{s}.basemaps.cartocdn.com/${themeMap}/{z}/{x}/{y}{r}.png`, {
            attribution: '&copy; OpenStreetMap & CartoDB'
        }).addTo(map);
    },

    locateUser() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 14);
                L.circleMarker([latitude, longitude], {
                    color: '#4285F4', radius: 8, fillOpacity: 0.8
                }).addTo(map).bindPopup("Vous êtes ici");
            });
        }
    },

    renderMarkers(bars, onMarkerClick) {
        markersLayer.clearLayers();
        bars.forEach(bar => {
            const isHH = Utils.isCurrentlyHappyHour(bar.hh_hours);
            const isOpen = Utils.isOpen(bar.standard_hours);
            
            // Logique de couleur (Vert > Jaune > Gris)
            let markerColor = '#808080'; // Gris par défaut (Fermé)
            if (isHH) markerColor = '#4CAF50'; // Vert (Happy Hour)
            else if (isOpen) markerColor = '#DAA520'; // Jaune ocre (Ouvert standard)

            const markerIcon = L.divIcon({
                className: 'custom-icon',
                html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
                iconSize: [24, 24]
            });

            const marker = L.marker([bar.latitude, bar.longitude], { icon: markerIcon });
            marker.on('click', () => onMarkerClick(bar));
            markersLayer.addLayer(marker);
        });
    },
    
    renderList(bars, onBarClick) {
        const container = document.getElementById('list-container');
        container.innerHTML = ''; // Vide la liste

        if (bars.length === 0) {
            container.innerHTML = '<p style="width:100%; text-align:center; padding-top:50px;">Aucun bar ne correspond à vos critères.</p>';
            return;
        }

        bars.forEach(bar => {
            const isHH = Utils.isCurrentlyHappyHour(bar.hh_hours);
            const isOpen = Utils.isOpen(bar.standard_hours);
            
            // Code couleur de l'état
            let statusDot = '⚫'; // Gris
            if (isHH) statusDot = '🟢';
            else if (isOpen) statusDot = '🟡';

            // Trouver le prix de la pinte pour l'affichage rapide
            let priceText = "Prix NC";
            if (bar.menus && bar.menus.length > 0) {
                const pinte = bar.menus.find(m => m.item_name.toLowerCase().includes('pinte'));
                if (pinte) priceText = `🍺 ${pinte.normal_price}€ ${pinte.hh_price ? '(HH: '+pinte.hh_price+'€)' : ''}`;
            }

            const card = document.createElement('div');
            card.className = 'glass-panel bar-card';
            card.innerHTML = `
                <h3><span>${bar.name}</span> <span>${statusDot}</span></h3>
                <p>📍 ${bar.address}</p>
                <p>🕒 ${Utils.formatHoursToDisplay(bar.standard_hours, true)}</p>
                <p style="font-weight: bold; color: var(--accent); margin-top: 5px;">${priceText}</p>
                ${bar.image_url ? `<img src="${API_BASE_URL}${bar.image_url}" alt="Photo de ${bar.name}">` : ''}
                <div class="tags">
                    ${bar.tags ? bar.tags.split(',').map(t => `<span class="tag-badge">${t.trim()}</span>`).join('') : ''}
                </div>
            `;
            
            // Clic sur la carte = Ouvre la modale de détails classique
            card.addEventListener('click', () => onBarClick(bar));
            container.appendChild(card);
        });
    }
};