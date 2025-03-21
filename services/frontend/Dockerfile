# Stage 1: Build
FROM node:20.19-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files and build the Next.js app
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:20.19-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only necessary files for production
COPY package*.json ./
RUN npm install --only=production

# Copy built Next.js output and public assets from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./

EXPOSE 3000
CMD ["npm", "start"]
