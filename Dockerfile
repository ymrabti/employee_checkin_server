### Stage 1: Build
FROM node:iron-alpine AS builder

# App directory
WORKDIR /usr/src/app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy app source
COPY . .

# Optional: If you're compiling (e.g. TypeScript)
# RUN yarn build

# Create and ensure /usr/src/employees_pointage exists in the build stage (optional, if needed)
RUN mkdir -p /usr/src/employees_pointage

### Stage 2: Runtime
FROM node:iron-alpine

# Create app directory with proper permissions
RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app

# Create additional directory for "employees_pointage" with specific user ID (1000)
RUN mkdir -p /usr/src/employees_pointage && chown -R 1000:1000 /usr/src/employees_pointage
RUN mkdir -p /usr/src/employees_pointage/_temp_ && chown -R 1000:1000 /usr/src/employees_pointage/_temp_


WORKDIR /usr/src/app

# Copy only necessary files from builder stage
COPY --from=builder /usr/src/app ./

# If there are specific files to copy from /usr/src/employees_pointage, you can now copy them
# Example (if the directory contains some content after your build process):
# COPY --from=builder /usr/src/employees_pointage /usr/src/employees_pointage

# Switch to non-root user
USER node

EXPOSE 7384
CMD ["yarn", "start"]
