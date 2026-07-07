# Changelog

## [1.1] - 2026-07-07
### Ajouts
- **Géocodage automatique** : Lors de l'ajout ou la modification d'un bar, la latitude et la longitude sont déduites automatiquement à partir de l'adresse renseignée (via l'API Nominatim OpenStreetMap).
- **Modification de bars existants** : Ajout d'un bouton "Suggérer une modification" dans la fiche détaillée du bar. Le formulaire s'ouvre pré-rempli pour soumettre des corrections.
- **Détails manquants** : Ajout de l'affichage du numéro de téléphone dans la fiche du bar.

### Modifications
- **Thème dynamique de la carte** : Le fond de carte Leaflet (tuiles CartoDB) s'adapte désormais au thème global. Il passe en mode clair (`light_all`) ou sombre (`dark_all`) de manière synchronisée avec l'interface.