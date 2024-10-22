# Use the Node.js 8.17.0 based on Debian Buster
FROM node:10

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose any ports your application needs
EXPOSE 3004

# Command to run your application (adjust as necessary)
CMD ["npm", "start"]
