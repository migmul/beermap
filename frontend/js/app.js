let allBars = [];

async function loadAndRenderBars() {
    const isOpenFilter = document.getElementById('filter-open').checked;
    const isHhFilter = document.getElementById('filter-hh').checked;
    const maxPrice = parseFloat(document.getElementById('filter-price').value);
    const maxHhPrice = parseFloat(document.getElementById('filter-hh-price').value);
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    
    allBars = await API.fetchBars(); // Ne récupère que les "approved" grâce au backend
    
    let barsToRender = allBars.filter(bar => {
        // Filtrage ouvert
        if (isOpenFilter && !Utils.isOpen(bar.standard_hours)) return false;
        // Filtrage HH
        if (isHhFilter && !Utils.isCurrentlyHappyHour(bar.hh_hours)) return false;
        
        // Recherche textuelle
        if (searchQuery) {
            const matchName = bar.name.toLowerCase().includes(searchQuery);
            const matchAddress = bar.address ? bar.address.toLowerCase().includes(searchQuery) : false;
            
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
    MapService.renderList(barsToRender, UI.openBarModal); 
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
        formData.append('website', document.getElementById('add-website').value);
        formData.append('menu_link', document.getElementById('add-menu-link').value);

        let newSchedule = {};
        Utils.DAYS.forEach(d => {
            const start = document.getElementById(`add-h-${d}-start`).value;
            const end = document.getElementById(`add-h-${d}-end`).value;
            if (start && end) newSchedule[d] = `${start}-${end}`;
        });
        const stdHours = Utils.buildHoursString(newSchedule);
        
        formData.append('standard_hours', stdHours);

        const hhHours = `${document.getElementById('add-hh-start').value}-${document.getElementById('add-hh-end').value}`;
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
    const title = form.previousElementSibling; 
    const navLoginBtn = document.getElementById('nav-login');
    const modalContent = document.querySelector('#login-modal .modal-content');
    
    // Contenu initial du formulaire (pour le restaurer après déconnexion)
    const originalFormHTML = form.innerHTML;
    const originalSwitchHTML = switchBtn.parentElement.innerHTML;

    // --- Fonction utilitaire pour mettre à jour l'UI selon l'état ---
    function updateAuthStateUI() {
        const token = localStorage.getItem('beermap_token');
        const isAdmin = localStorage.getItem('beermap_is_admin') === '1';

        if (token) {
            // Utilisateur CONNECTÉ
            navLoginBtn.textContent = "Mon compte";
            if (isAdmin) document.getElementById('nav-admin').classList.remove('hidden');
            
            // Remplace le contenu de la modale par le profil
            title.textContent = "Bienvenue !";
            form.innerHTML = `<button type="button" id="btn-logout" class="glass-btn danger" style="width:100%; margin-top:20px;">Se déconnecter</button>`;
            switchBtn.parentElement.innerHTML = ""; // Masque le lien d'inscription
            
            // Écouteur déconnexion
            document.getElementById('btn-logout').addEventListener('click', () => {
                localStorage.removeItem('beermap_token');
                localStorage.removeItem('beermap_is_admin');
                document.getElementById('nav-admin').classList.add('hidden');
                updateAuthStateUI();
                UI.closeModals();
                alert("Vous avez été déconnecté.");
                window.location.reload(); // Optionnel : recharge pour être sûr de purger la mémoire
            });

        } else {
            // Utilisateur DÉCONNECTÉ
            navLoginBtn.textContent = "Connexion";
            document.getElementById('nav-admin').classList.add('hidden');
            
            // Restaure le formulaire
            title.textContent = "Connexion";
            form.innerHTML = originalFormHTML;
            
            // On doit recréer l'élément de switch car innerHTML l'a écrasé
            const p = document.createElement('p');
            p.style.cssText = "text-align:center; margin-top:15px; font-size:0.9em;";
            p.innerHTML = `Pas de compte ? <a href="#" id="switch-register" style="color:var(--accent);">S'inscrire</a>`;
            if(!document.getElementById('switch-register')) modalContent.appendChild(p);
            
            // Ré-attacher les écouteurs sur le formulaire fraîchement restauré
            attachFormListeners();
        }
    }

    // --- Gestion du formulaire de connexion/inscription ---
    function attachFormListeners() {
        const currentForm = document.getElementById('login-form');
        const currentSwitch = document.getElementById('switch-register');
        if(!currentForm || !currentSwitch) return;

        currentSwitch.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            title.textContent = isLoginMode ? "Connexion" : "Créer un compte";
            currentForm.querySelector('button').textContent = isLoginMode ? "Connexion" : "S'inscrire";
            currentSwitch.textContent = isLoginMode ? "S'inscrire" : "Se connecter";
        });

        currentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const pseudo = document.getElementById('login-pseudo').value;
            const pwd = document.getElementById('login-pwd').value;

            try {
                if (isLoginMode) {
                    const res = await API.login(pseudo, pwd);
                    localStorage.setItem('beermap_token', res.access_token);
                    localStorage.setItem('beermap_is_admin', res.is_admin);
                    updateAuthStateUI();
                    UI.closeModals();
                    alert("Connecté avec succès !");
                } else {
                    await API.register(`${pseudo}@beermap.fr`, pseudo, pwd); 
                    alert("Compte créé ! Vous pouvez maintenant vous connecter.");
                    currentSwitch.click(); 
                }
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // --- Écouteur Ouverture Modale ---
    navLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-modal').classList.remove('hidden');
    });

    // Initialisation
    updateAuthStateUI();
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
    UI.initNavigation()
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
    document.getElementById('filter-open').addEventListener('change', loadAndRenderBars);
    document.getElementById('filter-hh').addEventListener('change', loadAndRenderBars);
    
    // Gestion du panneau de filtres sur mobile
    const mobileFilterBtn = document.getElementById('mobile-filter-btn');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileFilterBtn) {
        mobileFilterBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            mobileFilterBtn.textContent = sidebar.classList.contains('open') ? '❌' : '🔍';
        });
    }

    // Fermer les filtres si on clique sur la carte (sur mobile)
    document.getElementById('map-container').addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            mobileFilterBtn.textContent = '🔍';
        }
    });
    
    loadAndRenderBars();
});
