# Use an official lightweight Node image
FROM node:20.19-slim

# Set the working directory.
WORKDIR /app

# Copy package files and install dependencies.
COPY package*.json ./
RUN npm install --production
RUN npm rebuild bcrypt

# Copy the rest of the code.
COPY . .

# Expose the port used by the Database Service (here, 5000).
EXPOSE 5000

# Run the ExpressJS application.
CMD ["npm", "start"]
