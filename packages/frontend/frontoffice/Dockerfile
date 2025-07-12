FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
EXPOSE 4173 # TODO: adapter ce port si nécessaire dans l’environnement de production
# TODO: utiliser npm ci --omit=dev en production pour éviter les packages de dev
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
