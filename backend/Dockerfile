FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances (avec legacy-peer-deps si nécessaire)
RUN npm install --legacy-peer-deps

# Installer nodemon globalement pour le hot reload (utile en dev)
RUN npm install -g nodemon

# Copier le reste de l'application
COPY . .

# Exposer le port
EXPOSE 5000

# Commande par défaut
CMD ["npm", "start"]
