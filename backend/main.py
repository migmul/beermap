from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routers import bars, crowdsourcing, auth
from sqlalchemy import inspect, text

# Création des tables si elles n'existent pas du tout
models.Base.metadata.create_all(bind=engine)

# --- MIGRATION À CHAUD (SQLite) ---
def upgrade_db():
    inspector = inspect(engine)
    with engine.connect() as conn:
        if "bars" in inspector.get_table_names():
            columns = [col['name'] for col in inspector.get_columns("bars")]
            
            # Liste des colonnes ajoutées récemment à vérifier
            if "original_bar_id" not in columns:
                conn.execute(text("ALTER TABLE bars ADD COLUMN original_bar_id INTEGER"))
            if "website" not in columns:
                conn.execute(text("ALTER TABLE bars ADD COLUMN website VARCHAR"))
            if "menu_link" not in columns:
                conn.execute(text("ALTER TABLE bars ADD COLUMN menu_link VARCHAR"))
            if "user_favorites" not in inspector.get_table_names():
                models.user_favorites.create(engine)
            conn.commit()

upgrade_db()

app = FastAPI(title="Happy Hour Map API")

# Configuration CORS pour autoriser le frontend (typiquement sur un autre port en dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://beermap.migmul.fr", "http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montage du dossier statique pour les images
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

# Inclusion des routeurs
app.include_router(bars.router)
app.include_router(crowdsourcing.router)
app.include_router(auth.router)