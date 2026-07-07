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
            const markerIcon = L.divIcon({
                className: 'custom-icon',
                html: `<div style="background-color: ${isHH ? '#ff4500' : '#DAA520'}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
                iconSize: [24, 24]
            });

            const marker = L.marker([bar.latitude, bar.longitude], { icon: markerIcon });
            marker.on('click', () => onMarkerClick(bar));
            markersLayer.addLayer(marker);
        });
    }
};