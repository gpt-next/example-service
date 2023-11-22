FROM oven/bun:alpine
WORKDIR /app
ADD package*.json ./
RUN bun install
ADD src ./src
CMD [ "bun", "/src/main.ts"]