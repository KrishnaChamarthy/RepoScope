FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Install serve to serve static files
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Serve the built application
CMD ["serve", "-s", "dist", "-l", "5173"]