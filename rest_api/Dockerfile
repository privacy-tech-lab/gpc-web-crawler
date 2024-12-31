FROM node:16

WORKDIR /srv/analysis/rest_api

RUN apt-get update && apt-get install -y curl mariadb-client && rm -rf /var/lib/apt/lists/*

RUN ls

RUN npm install

COPY . /srv/analysis/rest_api

EXPOSE 8080

CMD ["sh", "start_rest_api.sh"]