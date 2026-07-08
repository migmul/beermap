FROM python:3.11-slim

# Définit le dossier de travail dans le conteneur
WORKDIR /app

# Copie le fichier des dépendances
COPY requirements.txt .

# Installe les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copie tout le code de l'application dans le conteneur
COPY . .

EXPOSE 9000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "9000"]
