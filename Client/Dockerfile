FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start dev server with host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]