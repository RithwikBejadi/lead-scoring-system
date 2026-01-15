FROM node:20
WORKDIR /app
COPY api/package*.json ./
COPY shared/queue/package*.json ../shared/queue/
RUN npm install && cd ../shared/queue && npm install
COPY api/ ./
COPY shared/ ../shared/
CMD ["node", "server.js"]