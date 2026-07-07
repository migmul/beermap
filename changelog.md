# Changelog

## [1.2] - 2026-07-07
### Ajouts
- **Nouveau nom** : Le projet a été renommé "BeerMap".
- **Suppression** : Ajout de la possibilité de supprimer un bar (bouton dans la fiche et route API `DELETE`).
- **Horaires détaillés** : Le formulaire participatif permet maintenant de saisir les horaires standards, les horaires d'Happy Hour, ainsi que les tags (WiFi, Terrasse, etc.).
- **Recherche textuelle** : Ajout d'une barre de recherche par nom/adresse.
- **Animations** : Ajout d'un effet fluide (fade & scale) à l'ouverture des modales (`@keyframes`).

### Modifications
- **Nouveau Layout (UI)** :
  - Création d'un header (en-tête) sur toute la largeur avec le logo à gauche et le menu de navigation à droite (Vue carte, Vue liste).
  - Déplacement des filtres (Prix, Happy Hour) et de la recherche dans un panneau latéral gauche (Sidebar) vertical et flottant, en conservant le style Glassmorphism.

## [1.1] - 2026-07-07
### Ajouts
- **Géocodage automatique** : Lors de l'ajout ou la modification d'un bar, la latitude et la longitude sont déduites automatiquement à partir de l'adresse renseignée (via l'API Nominatim OpenStreetMap).
- **Modification de bars existants** : Ajout d'un bouton "Suggérer une modification" dans la fiche détaillée du bar. Le formulaire s'ouvre pré-rempli pour soumettre des corrections.
- **Détails manquants** : Ajout de l'affichage du numéro de téléphone dans la fiche du bar.

### Modifications
- **Thème dynamique de la carte** : Le fond de carte Leaflet (tuiles CartoDB) s'adapte désormais au thème global. Il passe en mode clair (`light_all`) ou sombre (`dark_all`) de manière synchronisée avec l'interface.