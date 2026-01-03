# Utiliser une image Node légère
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers de dépendances pour tirer parti du cache Docker
COPY package*.json ./

# Installer les dépendances
RUN npm install --legacy-peer-deps

# Copier le reste du code source
COPY . .

# Construire l'application (React)
RUN npm run build

# Exposer le port sur lequel l'app tourne
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
