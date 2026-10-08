# ===========================================================================
# Dockerfile du frontend React
# ===========================================================================
# Multi-etapes aussi :
#   Etape 1 : on construit le site (Vite genere des fichiers HTML/CSS/JS).
#   Etape 2 : on sert ces fichiers avec nginx, un serveur web leger.

# --- Etape 1 : build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# --- Etape 2 : serveur web ---
FROM nginx:alpine
# On copie le site construit dans le dossier que nginx sert
COPY --from=build /app/dist /usr/share/nginx/html
# nginx ecoute sur le port 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
