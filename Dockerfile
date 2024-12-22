
FROM node:20.17.0

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Install TypeScript and ts-node globally for use in this container
RUN npm install -g typescript tsx

# Expose the port the app will run on
EXPOSE 5000

# Run the app using ts-node (for development)
CMD ["npm", "start"]
