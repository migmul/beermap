let map;
let markersLayer;

const MapService = {
    init() {
        // Initialisation de la carte centrée sur la France par défaut
        map = L.map('map-container', { zoomControl: false }).setView([46.603354, 1.888334], 6);
        
        // Thème sombre pour la carte via CartoDB
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors & CartoDB'
        }).addTo(map);
        
        markersLayer = L.layerGroup().addTo(map);
        this.locateUser();
    },

    locateUser() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 14);
                
                // Marqueur utilisateur
                L.circleMarker([latitude, longitude], {
                    color: '#DAA520', radius: 8, fillOpacity: 0.8
                }).addTo(map).bindPopup("Vous êtes ici");
            });
        }
    },

    renderMarkers(bars, onMarkerClick) {
        markersLayer.clearLayers();
        
        bars.forEach(bar => {
            // Icône personnalisée si on le souhaite, ici un marqueur classique jaune ocre
            const markerIcon = L.divIcon({
                className: 'custom-icon',
                html: `<div style="background-color: ${Utils.isCurrentlyHappyHour(bar.hh_hours) ? '#ff4500' : '#DAA520'}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
                iconSize: [24, 24]
            });

            const marker = L.marker([bar.latitude, bar.longitude], { icon: markerIcon });
            marker.on('click', () => onMarkerClick(bar));
            markersLayer.addLayer(marker);
        });
    }
};