FROM node:20.11
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
CMD ["node", "src/server.js"]
