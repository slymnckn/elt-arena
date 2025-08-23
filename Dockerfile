FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME 0.0.0.0
ENV NODE_ENV=production

# Start the application
CMD ["pnpm", "start"]