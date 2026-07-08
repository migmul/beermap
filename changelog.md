# Changelog

## [1.7.1] - 2026-07-08
### Corrections
- **Clustering** : Changement de la couleur des clusters, en fonction de l'état des points qui le constitue.

## [1.7] - 2026-07-08
### Corrections
- **UI** : Correction des espacements de la Vue Liste (padding-top ajusté) et de l'interligne écrasée dans les modales.
- **Carte** : Passage au fond de carte JawgMaps pour avoir les labels en Français (Grand Est au lieu de Greater East).

### Ajouts
- **Clustering** : Intégration de Leaflet.markercluster. Les points proches se regroupent en dézoomant pour une meilleure lisibilité.
- **Modale Bar** : Ajout des indicateurs de statut (🟢 Ouvert, 🟡 Happy Hour, ⚫ Fermé) et d'un bouton Favori (si connecté).
- **Comptes Utilisateurs** :
  - Inscription : Ajout du champ Email et de la confirmation du mot de passe.
  - Modale Mon Compte : Affiche désormais "Bienvenue [pseudo] !".
- **Favoris** : Ajout d'un système de favoris persistants en base de données, avec un nouveau filtre "Mes Favoris" dans la barre latérale.

## [1.6.1] - 2026-07-08
### Corrections
- **Couleurs** : Refonte de la palette graphique du site.
- **Header** : Header flottant avec quatre bords arrondis.
- **Marqueurs** : Opacité différente et suppresion de la bordure pour les bars fermés et couleurs en accord avec la palette graphique.
- **Police d'écriture** : Ajout de la police "Gluten" pour l'ensemble du site.

## [1.6] - 2026-07-08
### Ajouts
- **Migration automatique (DB)** : Remplacement de `Base.metadata.create_all` par une fonction intelligente au démarrage du serveur qui vérifie l'existence des tables et ajoute dynamiquement les colonnes manquantes (Migration SQLite à chaud).
- **Numéro de version** : Affichage de "v1.6" en gris clair à côté du logo dans le header.
- **PWA Ready** : Ajout du fichier `manifest.json` et d'un Service Worker basique (`sw.js`) pour rendre l'application installable sur smartphone.

### Modifications
- **Responsive Design (Mobile)** :
  - La barre latérale (Sidebar) devient rétractable via un bouton flottant 🔍 en bas à gauche de l'écran sur mobile.
  - Le header s'adapte en hauteur et la navigation devient plus compacte.

## [1.5.3] - 2026-07-08
### Ajouts
- **Filtre Ouvert** : Ajout d'une case à cocher dans la barre latérale pour n'afficher que les bars actuellement ouverts.
- **Informations Web** : Ajout des champs "Site internet" et "Lien du menu". Visibles dans la modale d'information s'ils sont renseignés, et modifiables via le formulaire de suggestion.
- **Seed OSM (Web)** : Le script `seed.py` récupère désormais les tags OpenStreetMap `website` (ou `contact:website`) et `menu` (ou `url:menu`).

## [1.5.2] - 2026-07-08
### Ajouts
- **Amélioration de l'affichage des horaires** : On regroupe les jours ayant les mêmes horaires pour une meilleure lisibilité.
### Corrections
- **Compatibilité OSM (Horaires)** : La logique ne comprenait pas que Su-Th (Dimanche à Jeudi) chevauchait une fin de semaine, ce qui annulait la lecture.

## [1.5.1] - 2026-07-08
### Corrections
- **Compatibilité OSM (Horaires)** : Refonte de la gestion des horaires. Le système est maintenant capable de lire, interpréter et formater les horaires au format OpenStreetMap (ex: `Mo-Th 16:00-00:00; Fr-Sa 16:00-01:00`). L'indicateur Ouvert/Fermé prend désormais en compte le jour de la semaine et la gestion des horaires dépassant minuit (ex: `20:00-02:00`).
- **Modale Ajout/Édition** : Remplacement du champ horaire unique par une grille permettant de définir l'ouverture et la fermeture pour chaque jour de la semaine.

## [1.5] - 2026-07-07
### Ajouts
- **Vue Liste** : Création d'un mode d'affichage alternatif à la carte. La "Vue liste" affiche les bars filtrés sous forme de cartes (cards) dans une grille responsive, respectant le style Glassmorphism.
- **Navigation** : Les boutons "Vue carte" et "Vue liste" dans le header sont maintenant fonctionnels. Le basculement recalcule la taille de la carte (fix d'un bug Leaflet connu via `invalidateSize()`) pour éviter les tuiles grises.

## [1.4.3] - 2026-07-07
### Corrections
- **Régression de visibilité (Backend)** : Les modifications d'un bar existant ne masquent plus l'ancienne version. Une copie de brouillon est créée et vient écraser l'original uniquement après approbation de l'admin.
- **UI Modale d'ajout** : Renommage du titre en "Ajouter un bar" (HTML et JS) et correction du CSS inline pour empêcher le retour à la ligne des labels d'horaires.

## [1.4.2] - 2026-07-07
### Corrections
- **Filtrage des statuts (Backend)** : Correction de la requête de base de données pour s'assurer que seuls les bars avec le statut `approved` sont envoyés sur la carte publique.
- **Modifications en attente** : Lorsqu'un utilisateur modifie un bar existant, celui-ci repasse automatiquement en statut `pending` et disparait de la carte le temps d'être validé par un administrateur.

## [1.4.1] - 2026-07-07
### Modifications
- **Visibilité Sliders** : Ajustement CSS pour rendre la piste des sliders visible en thèmes clair et sombre.
- **Logique de Connexion** : Le bouton "Compte" devient "Connexion" si déconnecté. Une fois connecté, la modale affiche les informations du compte et un bouton de déconnexion.
- **Correction Modales** : Les modales d'administration et de compte se ferment correctement au clic en dehors du cadre.

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