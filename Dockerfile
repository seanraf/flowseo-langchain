# Stage 1: Build the application
# Use the official Node.js 22 image as a parent image
FROM node:22-slim AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock first to leverage Docker cache
COPY package.json yarn.lock ./

# Install all dependencies, including devDependencies needed for build
RUN yarn install --frozen-lockfile --production=false

# Copy the rest of the application source code
# This includes src/, tsconfig.json, etc.
# .dockerignore prevents copying unnecessary files like local node_modules, .git
COPY . .

# Run the build script defined in package.json (tsc)
RUN yarn build
# At this point, the /app/dist directory contains the compiled JavaScript code

# Stage 2: Setup the production environment
# Use a slim Node.js 22 image for the final stage
FROM node:22-slim AS runner

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock again
COPY package.json yarn.lock ./

# Install *only* production dependencies
RUN yarn install --frozen-lockfile --production=true

# Copy the compiled code (dist directory) from the builder stage
COPY --from=builder /app/dist ./dist

# No need to explicitly EXPOSE port, Cloud Run injects the PORT environment variable
# and expects the application to listen on it. Our server.ts handles this.

# Define the command to run the application
# This executes the compiled server file using Node
CMD ["node", "dist/server.js"]
