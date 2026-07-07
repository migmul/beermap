# Changelog

## [1.4] - 2026-07-07
### Ajouts
- **Système de comptes & Auth JWT** : Ajout d'une table Utilisateurs (Email, Pseudo, Mot de passe hashé via `bcrypt`).
- **Validation (Admin)** : Les nouvelles suggestions ont le statut `pending`. Un compte Admin peut les valider/rejeter via un panneau dédié. Le bouton "Supprimer" est exclusif à l'Admin.
- **Compression d'images** : Utilisation de `Pillow` pour convertir toutes les photos uploadées en `.webp` (léger et optimisé).

### Modifications
- **Filtres (Sliders)** : Remplacement de la case "Pinte < 5€" par deux sliders (Prix standard et Prix HH) avec affichage en temps réel de la valeur.
- **UI/UX Couleurs** : Les checkbox et sliders utilisent le jaune d'accentuation.
- **État d'ouverture (Marqueurs)** : Vert = Happy Hour en cours / Jaune = Ouvert / Gris = Fermé.

## [1.3] - 2026-07-07
### Ajouts
- **Préférence de thème** : Sauvegarde du choix Light/Dark mode via `localStorage` pour qu'il persiste au rechargement.
- **Saisie des horaires optimisée** : Remplacement des champs texte par des champs `<input type="time">` couplés (début et fin) pour les horaires standards et l'Happy Hour.
- **Menu simplifié (Création)** : Ajout des champs permettant de renseigner le prix de la pinte normale et en Happy Hour lors de l'ajout d'un bar, pour alimenter directement la fiche.

### Modifications
- **Marqueur utilisateur** : Changement de la couleur du point de géolocalisation de l'utilisateur (passé de jaune à bleu) pour ne pas le confondre avec les bars.
- **UI de la modale** : Ajout d'une marge sous le titre "Suggérer un nouveau bar", et correction de la majuscule sur "bar".

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