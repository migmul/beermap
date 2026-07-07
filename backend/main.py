from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routers import bars, crowdsourcing

# Création des tables SQLite au démarrage
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Happy Hour Map API")

# Configuration CORS pour autoriser le frontend (typiquement sur un autre port en dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # A restreindre en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montage du dossier statique pour les images
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

# Inclusion des routeurs
app.include_router(bars.router)
app.include_router(crowdsourcing.router)