FROM mariadb:latest

COPY ../setup.sql /docker-entrypoint-initdb.d/setup.sql

CMD ["mariadbd", "--console"]