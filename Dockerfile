# Use an official Node.js image as the build stage
FROM node:16-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# (Optional) Build your app if you have a build script
# RUN npm run build

# Use a slimmer Node.js image for the final stage
FROM node:16-alpine

WORKDIR /app

# Copy only the package files for production dependency installation
COPY package*.json ./
RUN npm install --only=production

# Copy the built app from the builder stage
COPY --from=builder /app .

# Expose the port your app runs on
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
