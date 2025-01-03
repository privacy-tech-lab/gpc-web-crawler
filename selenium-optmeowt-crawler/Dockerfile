# Base image with systemd support
FROM node:18

#Set shell to bash
SHELL ["/bin/bash", "-c"]

WORKDIR /srv/analysis/selenium-optmeowt-crawler

COPY . /srv/analysis/selenium-optmeowt-crawler

RUN npm install

CMD sh run_crawl.sh

