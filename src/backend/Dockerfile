# Image Node legere.
FROM node:20-alpine

WORKDIR /app

# On copie d'abord package.json pour profiter du cache Docker.
COPY package.json ./
RUN npm install --omit=dev

# Puis le reste du code.
COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
