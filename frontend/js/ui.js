const UI = {
    initTheme() {
        const toggleBtn = document.getElementById('theme-toggle');
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
        });
    },

    openBarModal(bar) {
        document.getElementById('modal-title').textContent = bar.name;
        document.getElementById('modal-address').textContent = bar.address;
        document.getElementById('modal-hours').textContent = bar.standard_hours;
        document.getElementById('modal-hh').textContent = bar.hh_hours || "Aucun";
        
        // Image logic
        const imgEl = document.getElementById('modal-image');
        if (bar.image_url) {
            imgEl.src = `${API_BASE_URL}${bar.image_url}`;
            imgEl.style.display = "block";
        } else {
            imgEl.style.display = "none";
        }

        // Happy Hour live indicator
        const hhIndicator = document.getElementById('hh-indicator');
        if (Utils.isCurrentlyHappyHour(bar.hh_hours)) {
            hhIndicator.classList.remove('hidden');
        } else {
            hhIndicator.classList.add('hidden');
        }

        // Tags
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

        // Menu
        const menuContainer = document.getElementById('modal-menu');
        menuContainer.innerHTML = '';
        bar.menus.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.item_name} - Normal: ${item.normal_price}€ | HH: ${item.hh_price || '-'}€`;
            menuContainer.appendChild(li);
        });

        document.getElementById('bar-modal').classList.remove('hidden');
    },

    closeModals() {
        document.getElementById('bar-modal').classList.add('hidden');
        document.getElementById('add-modal').classList.add('hidden');
    },

    initModals() {
        document.querySelector('.close-btn').addEventListener('click', this.closeModals);
        document.querySelector('.close-btn-add').addEventListener('click', this.closeModals);
        
        document.getElementById('fab-add').addEventListener('click', () => {
            document.getElementById('add-modal').classList.remove('hidden');
        });

        // Fermeture en cliquant en dehors de la modale
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if(e.target === modal) this.closeModals();
            });
        });
    }
};