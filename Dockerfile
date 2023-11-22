FROM oven/bun:alpine
WORKDIR /app
ADD package*.json ./
RUN npm install
ADD main.js ./
CMD [ "bun", "main.js"]