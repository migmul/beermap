const UI = {
    currentBarData: null,

    initTheme() {
        const toggleBtn = document.getElementById('theme-toggle');
        // Récupération de la préférence ou Dark par défaut
        const savedTheme = localStorage.getItem('beermap_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        toggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('beermap_theme', newTheme); // Sauvegarde
            MapService.setTheme(newTheme);
        });
    },

    initNavigation() {
        const navMap = document.getElementById('nav-map');
        const navList = document.getElementById('nav-list');
        const mapContainer = document.getElementById('map-container');
        const listContainer = document.getElementById('list-container');

        navMap.addEventListener('click', (e) => {
            e.preventDefault();
            navMap.classList.add('active');
            navList.classList.remove('active');
            
            listContainer.classList.add('hidden');
            mapContainer.classList.remove('hidden');
            
            // Fix Leaflet : recalcule la taille après affichage
            setTimeout(() => { map.invalidateSize(); }, 100); 
        });

        navList.addEventListener('click', (e) => {
            e.preventDefault();
            navList.classList.add('active');
            navMap.classList.remove('active');
            
            mapContainer.classList.add('hidden');
            listContainer.classList.remove('hidden');
        });
    },

    openBarModal(bar) {
        UI.currentBarData = bar; // Stocker pour le bouton de modification

        document.getElementById('modal-title').textContent = bar.name;
        document.getElementById('modal-address').textContent = bar.address || "Adresse inconnue";
        document.getElementById('modal-phone').textContent = bar.phone || "N/A";
        document.getElementById('modal-hours').innerHTML = Utils.formatHoursToDisplay(bar.standard_hours) || "N/A";
        document.getElementById('modal-hh').textContent = bar.hh_hours || "Aucun";
        
        const imgEl = document.getElementById('modal-image');
        if (bar.image_url) {
            imgEl.src = `${API_BASE_URL}${bar.image_url}`;
            imgEl.style.display = "block";
        } else {
            imgEl.style.display = "none";
        }

        const hhIndicator = document.getElementById('hh-indicator');
        if (Utils.isCurrentlyHappyHour(bar.hh_hours)) hhIndicator.classList.remove('hidden');
        else hhIndicator.classList.add('hidden');

        const tagsContainer = document.getElementById('modal-tags');
        tagsContainer.innerHTML = '';
        if (bar.tags) {
            bar.tags.split(',').forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag-badge';
                span.textContent = tag.trim();
                tagsContainer.appendChild(span);
            });
        }

        const menuContainer = document.getElementById('modal-menu');
        menuContainer.innerHTML = '';
        bar.menus.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.item_name} - Normal: ${item.normal_price}€ | HH: ${item.hh_price || '-'}€`;
            menuContainer.appendChild(li);
        });

        document.getElementById('bar-modal').classList.remove('hidden');
    },

    openCrowdsourcingModal(editMode = false) {
        const form = document.getElementById('add-bar-form');
        form.reset(); 
        
        if (editMode && UI.currentBarData) {
            document.getElementById('form-title').textContent = "Modifier le bar";
            document.getElementById('add-bar-id').value = UI.currentBarData.id;
            document.getElementById('add-name').value = UI.currentBarData.name;
            document.getElementById('add-address').value = UI.currentBarData.address;
            document.getElementById('add-phone').value = UI.currentBarData.phone || "";
            document.getElementById('add-tags').value = UI.currentBarData.tags || "";
            
            // Éclatement de la chaîne "10:00-02:00" pour remplir les inputs time
            const schedule = Utils.parseHours(UI.currentBarData.standard_hours);
            Utils.DAYS.forEach(d => {
                if (schedule[d] && schedule[d].includes('-')) {
                    const [start, end] = schedule[d].split('-');
                    document.getElementById(`add-h-${d}-start`).value = start;
                    document.getElementById(`add-h-${d}-end`).value = end;
                } else {
                    document.getElementById(`add-h-${d}-start`).value = "";
                    document.getElementById(`add-h-${d}-end`).value = "";
                }
            });
            if (UI.currentBarData.hh_hours && UI.currentBarData.hh_hours.includes('-')) {
                const [hhStart, hhEnd] = UI.currentBarData.hh_hours.split('-');
                document.getElementById('add-hh-start').value = hhStart;
                document.getElementById('add-hh-end').value = hhEnd;
            }
            
            UI.closeModals(); 
        } else {
            document.getElementById('form-title').textContent = "Ajouter un bar";
            document.getElementById('add-bar-id').value = ""; 
        }
        
        document.getElementById('add-modal').classList.remove('hidden');
    },

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    },

    initModals() {
        document.querySelector('.close-btn').addEventListener('click', this.closeModals);
        document.querySelector('.close-btn-add').addEventListener('click', this.closeModals);
        document.querySelector('.close-btn-login').addEventListener('click', this.closeModals);
        document.querySelector('.close-btn-admin').addEventListener('click', this.closeModals);

        document.getElementById('fab-add').addEventListener('click', () => this.openCrowdsourcingModal(false));
        document.getElementById('btn-edit-bar').addEventListener('click', () => this.openCrowdsourcingModal(true));
        
        // NOUVEAU : Ouverture modale Compte
        document.getElementById('nav-login').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-modal').classList.remove('hidden');
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });
    }
};