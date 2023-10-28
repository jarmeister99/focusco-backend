FROM node:18
RUN apt-get update
RUN apt-get install -y openssl


# Create app directory in Docker
WORKDIR /usr/src/app

# Install app dependencies by copying
# package.json and package-lock.json
COPY package*.json ./

# Install all the dependencies
RUN npm install

# Bundle app source inside Docker image
COPY . .

# Install Prisma CLI for running migrations
RUN npm install prisma

# Generate Prisma Client
RUN npx prisma generate

# Build the app
RUN npm run build

# Our app is running on port 3000 within the container,
# so we'll use that same port
EXPOSE 3000


# Here we use the "start:prod" script to run our app 
# within the container. This script will start the app 
# using the compiled JavaScript files in the "dist" folder.
CMD npx prisma migrate deploy && npm run start:prod