const UI = {
    currentBarData: null,

    initTheme() {
        const toggleBtn = document.getElementById('theme-toggle');
        toggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            // On notifie la carte pour changer les tuiles Leaflet
            MapService.setTheme(newTheme);
        });
    },

    openBarModal(bar) {
        UI.currentBarData = bar; // Stocker pour le bouton de modification

        document.getElementById('modal-title').textContent = bar.name;
        document.getElementById('modal-address').textContent = bar.address;
        document.getElementById('modal-phone').textContent = bar.phone || "Non renseigné";
        document.getElementById('modal-hours').textContent = bar.standard_hours;
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
            document.getElementById('form-title').textContent = "Suggérer une modification";
            document.getElementById('add-bar-id').value = UI.currentBarData.id;
            document.getElementById('add-name').value = UI.currentBarData.name;
            document.getElementById('add-address').value = UI.currentBarData.address;
            document.getElementById('add-phone').value = UI.currentBarData.phone || "";
            UI.closeModals(); // Ferme la fiche du bar
        } else {
            document.getElementById('form-title').textContent = "Suggérer un nouveau Bar";
            document.getElementById('add-bar-id').value = "";
        }
        document.getElementById('add-modal').classList.remove('hidden');
    },

    closeModals() {
        document.getElementById('bar-modal').classList.add('hidden');
        document.getElementById('add-modal').classList.add('hidden');
    },

    initModals() {
        document.querySelector('.close-btn').addEventListener('click', this.closeModals);
        document.querySelector('.close-btn-add').addEventListener('click', this.closeModals);
        
        document.getElementById('fab-add').addEventListener('click', () => this.openCrowdsourcingModal(false));
        document.getElementById('btn-edit-bar').addEventListener('click', () => this.openCrowdsourcingModal(true));

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if(e.target === modal) this.closeModals();
            });
        });
    }
};