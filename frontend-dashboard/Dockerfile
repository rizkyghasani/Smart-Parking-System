FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose port Vite
EXPOSE 5173

# Jalankan npm run dev dengan host agar bisa diakses browser laptop
CMD ["npm", "run", "dev", "--", "--host"]