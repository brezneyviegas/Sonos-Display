FROM node:22-alpine

# All speaker HTTP goes through curl (see sonos-curl.js)
RUN apk add --no-cache curl

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js sonos-curl.js ./
COPY public ./public

EXPOSE 3000

CMD ["node", "server.js"]
