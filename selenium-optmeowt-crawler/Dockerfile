# Base image with systemd support
FROM node:16

#Set shell to bash
SHELL ["/bin/bash", "-c"]

# Set a working directory inside the container (important!)
WORKDIR /srv/analysis/selenium-optmeowt-crawler

# Copy the crawler code (since the Dockerfile is in this directory, just copy everything)
COPY . /srv/analysis/selenium-optmeowt-crawler

RUN npm install

CMD ["sh", "run_crawl.sh"]

