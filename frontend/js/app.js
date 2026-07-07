let allBars = [];

async function loadAndRenderBars() {
    const isHhFilter = document.getElementById('filter-hh').checked;
    const maxPrice = parseFloat(document.getElementById('filter-price').value);
    const maxHhPrice = parseFloat(document.getElementById('filter-hh-price').value);
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    
    allBars = await API.fetchBars(); // Ne récupère que les "approved" grâce au backend
    
    let barsToRender = allBars.filter(bar => {
        // Filtrage HH
        if (isHhFilter && !Utils.isCurrentlyHappyHour(bar.hh_hours)) return false;
        
        // Recherche textuelle
        if (searchQuery) {
            const matchName = bar.name.toLowerCase().includes(searchQuery);
            const matchAddress = bar.address.toLowerCase().includes(searchQuery);
            if (!matchName && !matchAddress) return false;
        }

        // Filtrage par Prix des sliders
        let matchPrice = true;
        if (bar.menus && bar.menus.length > 0) {
            const pinte = bar.menus.find(m => m.item_name.toLowerCase().includes('pinte'));
            if (pinte) {
                if (pinte.normal_price > maxPrice) matchPrice = false;
                if (pinte.hh_price && pinte.hh_price > maxHhPrice) matchPrice = false;
            }
        }
        return matchPrice;
    });
    
    MapService.renderMarkers(barsToRender, UI.openBarModal);
}

// Fonction de géocodage inchangée
async function geocodeAddress(address) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await response.json();
        if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } catch (error) { console.error(error); }
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
        
        const stdHours = `${document.getElementById('add-hours-start').value}-${document.getElementById('add-hours-end').value}`;
        const hhHours = `${document.getElementById('add-hh-start').value}-${document.getElementById('add-hh-end').value}`;
        formData.append('standard_hours', stdHours.length > 2 ? stdHours : "");
        formData.append('hh_hours', hhHours.length > 2 ? hhHours : "");
        
        formData.append('tags', document.getElementById('add-tags').value);
        formData.append('latitude', coords ? coords.lat : center.lat);
        formData.append('longitude', coords ? coords.lon : center.lng);
        
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
            alert("Suggestion envoyée ! Elle sera visible après validation.");
            UI.closeModals();
            loadAndRenderBars(); 
        } catch (error) { console.error(error); } 
        finally { submitBtn.disabled = false; }
    });
}

function initAuth() {
    let isLoginMode = true;
    const form = document.getElementById('login-form');
    const switchBtn = document.getElementById('switch-register');
    const title = form.previousElementSibling; // Le <h2>
    
    // Gérer l'état initial (connecté ou non)
    const isAdmin = localStorage.getItem('beermap_is_admin') === '1';
    if (isAdmin) document.getElementById('nav-admin').classList.remove('hidden');

    switchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        title.textContent = isLoginMode ? "Mon Compte" : "Créer un compte";
        form.querySelector('button').textContent = isLoginMode ? "Connexion" : "S'inscrire";
        switchBtn.textContent = isLoginMode ? "S'inscrire" : "Se connecter";
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pseudo = document.getElementById('login-pseudo').value;
        const pwd = document.getElementById('login-pwd').value;

        try {
            if (isLoginMode) {
                const res = await API.login(pseudo, pwd);
                localStorage.setItem('beermap_token', res.access_token);
                localStorage.setItem('beermap_is_admin', res.is_admin);
                if (res.is_admin === 1) document.getElementById('nav-admin').classList.remove('hidden');
                alert("Connecté avec succès !");
                UI.closeModals();
            } else {
                await API.register("email@test.com", pseudo, pwd); // Email factice pour la V1
                alert("Compte créé ! Vous pouvez maintenant vous connecter.");
                switchBtn.click(); // Repasser en mode login
            }
        } catch (error) {
            alert(error.message);
        }
    });
}

function initAdmin() {
    document.getElementById('nav-admin').addEventListener('click', async (e) => {
        e.preventDefault();
        const list = document.getElementById('admin-list');
        list.innerHTML = 'Chargement...';
        document.getElementById('admin-modal').classList.remove('hidden');
        
        try {
            const pending = await API.fetchPendingBars();
            list.innerHTML = '';
            if (pending.length === 0) list.innerHTML = '<li>Aucun bar en attente.</li>';
            
            pending.forEach(bar => {
                const li = document.createElement('li');
                li.style.cssText = "display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--glass-border); padding: 10px 0;";
                li.innerHTML = `
                    <span><strong>${bar.name}</strong> (${bar.address})</span>
                    <div>
                        <button class="glass-btn primary btn-approve" data-id="${bar.id}">✓</button>
                        <button class="glass-btn danger btn-reject" data-id="${bar.id}">✗</button>
                    </div>
                `;
                list.appendChild(li);
            });

            // Boutons d'action admin
            document.querySelectorAll('.btn-approve').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    await API.updateBarStatus(e.target.dataset.id, "approved");
                    e.target.closest('li').remove();
                    loadAndRenderBars(); // Rafraîchit la carte
                });
            });
            document.querySelectorAll('.btn-reject').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    await API.deleteBar(e.target.dataset.id);
                    e.target.closest('li').remove();
                });
            });

        } catch (e) { list.innerHTML = "Erreur de chargement (Droits insuffisants ?)"; }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    UI.initTheme();
    UI.initModals();
    MapService.init();
    initCrowdsourcing();
    initAuth();
    initAdmin();
    
    // Sliders de prix (Mise à jour du texte visuel + Rechargement de la carte)
    const priceSlider = document.getElementById('filter-price');
    const hhPriceSlider = document.getElementById('filter-hh-price');
    
    priceSlider.addEventListener('input', (e) => {
        document.getElementById('val-price').textContent = e.target.value;
        loadAndRenderBars();
    });
    
    hhPriceSlider.addEventListener('input', (e) => {
        document.getElementById('val-hh').textContent = e.target.value;
        loadAndRenderBars();
    });

    document.getElementById('search-input').addEventListener('input', loadAndRenderBars);
    document.getElementById('filter-hh').addEventListener('change', loadAndRenderBars);
    
    loadAndRenderBars();
});