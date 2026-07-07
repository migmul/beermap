"""
seed.py – Peuple la base de données avec tous les bars de Strasbourg
récupérés via l'API Overpass (OpenStreetMap).

Usage :
    cd backend
    python seed.py
"""
<<<<<<< HEAD

import requests
import sys
import os

# Permet d'importer les modules du backend depuis ce fichier standalone
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
from models import Bar
=======
import requests
from backend.database import SessionLocal, engine, Base
from backend.models import Bar
>>>>>>> f9677f3 (v1.4.3)

# ── Création des tables si elles n'existent pas encore ──────────────────────
Base.metadata.create_all(bind=engine)

# ── Requête Overpass ─────────────────────────────────────────────────────────
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

OVERPASS_QUERY = """
[out:json][timeout:60];
area["name"="Strasbourg"]["boundary"="administrative"]["admin_level"="8"]->.strasbourg;
(
  node["amenity"="bar"](area.strasbourg);
  node["amenity"="pub"](area.strasbourg);
  node["amenity"="biergarten"](area.strasbourg);
);
out body;
"""


def fetch_bars_from_osm() -> list[dict]:
    """Interroge l'API Overpass et retourne la liste des éléments bruts."""
    print("📡 Requête vers l'API Overpass (OpenStreetMap)…")
<<<<<<< HEAD
    response = requests.get(OVERPASS_URL, params={"data": OVERPASS_QUERY}, timeout=90)
=======
    
    # Ajout de l'en-tête User-Agent obligatoire pour l'API Overpass
    headers = {
        "User-Agent": "BeerMapApp/1.0 (miguel@miguelmuller.fr)"
    }
    
    response = requests.get(
        OVERPASS_URL, 
        params={"data": OVERPASS_QUERY}, 
        headers=headers, 
        timeout=90
    )
>>>>>>> f9677f3 (v1.4.3)
    response.raise_for_status()
    elements = response.json().get("elements", [])
    print(f"✅ {len(elements)} établissements trouvés sur OSM.")
    return elements


def build_address(tags: dict) -> str:
    """Construit une adresse lisible à partir des tags OSM."""
    parts = [
        tags.get("addr:housenumber", ""),
        tags.get("addr:street", ""),
        tags.get("addr:postcode", ""),
        tags.get("addr:city", ""),
    ]
    return " ".join(p for p in parts if p).strip() or None


def build_tags(tags: dict) -> str:
    """Convertit les tags OSM pertinents en chaîne de tags BeerMap."""
    beermap_tags = []
    if tags.get("outdoor_seating") == "yes":
        beermap_tags.append("Terrasse")
    if tags.get("internet_access") in ("wlan", "wifi", "yes"):
        beermap_tags.append("WiFi")
    if tags.get("wheelchair") == "yes":
        beermap_tags.append("PMR")
    if tags.get("brewery"):
        beermap_tags.append("Brasserie")
    amenity = tags.get("amenity", "")
    if amenity == "biergarten":
        beermap_tags.append("Biergarten")
    elif amenity == "pub":
        beermap_tags.append("Pub")
    return ", ".join(beermap_tags) if beermap_tags else None


def seed():
    elements = fetch_bars_from_osm()
    db = SessionLocal()

    added = 0
    skipped = 0

    try:
        for el in elements:
            tags = el.get("tags", {})
            name = tags.get("name")

            # On ignore les établissements sans nom
            if not name:
                skipped += 1
                continue

            lat = el.get("lat")
            lon = el.get("lon")

            # Vérification anti-doublon (nom + coordonnées)
            existing = (
                db.query(Bar)
                .filter(Bar.name == name, Bar.latitude == lat, Bar.longitude == lon)
                .first()
            )
            if existing:
                skipped += 1
                continue

            bar = Bar(
                name=name,
                latitude=lat,
                longitude=lon,
                address=build_address(tags),
                phone=tags.get("phone") or tags.get("contact:phone"),
                standard_hours=tags.get("opening_hours"),
                hh_hours=None,          # Non disponible sur OSM
                tags=build_tags(tags),
                image_url=None,         # Pas d'image OSM
                status="pending",       # Validation manuelle requise
            )
            db.add(bar)
            added += 1

        db.commit()
        print(f"🍺 Seed terminé : {added} bars ajoutés, {skipped} ignorés (sans nom ou déjà présents).")

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors du seed : {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
