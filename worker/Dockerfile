FROM node:20
WORKDIR /app
COPY worker/package*.json ./
COPY shared/queue/package*.json ../shared/queue/
RUN npm install && cd ../shared/queue && npm install
COPY worker/ ./
COPY shared/ ../shared/
CMD ["node", "index.js"]