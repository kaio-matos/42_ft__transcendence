FROM node:20

# Create and define the node_modules's cache directory.
RUN mkdir /usr/src/cache
WORKDIR /usr/src/cache

# Install the application's dependencies into the node_modules's cache directory.
COPY frontend/package.json ./
COPY frontend/package-lock.json ./
RUN npm install

# Create and define the application's working directory.
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

COPY . .

WORKDIR /usr/src/app/frontend

RUN chmod +x /usr/src/app/.docker/client/entrypoint.sh

EXPOSE 5173
CMD [ "bash", "/usr/src/app/.docker/client/entrypoint.sh" ]
