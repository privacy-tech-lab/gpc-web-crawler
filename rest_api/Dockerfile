FROM node:16

WORKDIR /srv/analysis/rest_api

RUN apt-get update && apt-get install -y curl mariadb-client && rm -rf /var/lib/apt/lists/*

COPY . /srv/analysis/rest_api

RUN ls

RUN npm install

EXPOSE 8080

CMD if [ "$DEBUG_MODE" = "true" ]; then \
        echo "Starting API in debug mode..."; \
        node index.js debug; \
    else \
        echo "Starting API in normal mode..."; \
        node index.js; \
    fi