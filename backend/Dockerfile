FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
# Installer nodemon globalement pour le hot reload
RUN npm install -g nodemon
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
