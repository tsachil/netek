FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173 5180

# Run both the HTTP redirect server and Vite HTTPS server
CMD sh -c "node redirect-server.cjs & npm run dev -- --host"
