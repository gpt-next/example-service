FROM node:18.12.0-alpine
WORKDIR /app
ADD package*.json ./
RUN npm install
ADD main.js ./
CMD [ "node", "main.js"]