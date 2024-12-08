FROM node:16

WORKDIR /app

RUN apt-get update && apt-get install -y curl mariadb-client && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080



CMD ["sh", "/srv/analysis/scripts/rest_api.sh"]