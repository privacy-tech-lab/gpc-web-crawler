#!/bin/bash

cd /srv/analysis/rest-api
echo "Running $0 in `pwd`"

set -e
set -x

# Start the MariaDB service
service mariadb start
service mariadb status &> /dev/null

# Configure the MariaDB database using compatible commands
# Update the root password and create the `analysis` database and tables
mysql -u root << SQLCOMMANDS || true
ALTER USER 'root'@'localhost' IDENTIFIED BY 'toor';
FLUSH PRIVILEGES;
CREATE DATABASE IF NOT EXISTS analysis;
USE analysis;
CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    site_id INTEGER,
    domain varchar(255),
    sent_gpc BOOLEAN,
    gpp_version TEXT,
    uspapi_before_gpc varchar(255),
    uspapi_after_gpc varchar(255),
    usp_cookies_before_gpc varchar(255),
    usp_cookies_after_gpc varchar(255),
    OptanonConsent_before_gpc varchar(255),
    OptanonConsent_after_gpc varchar(255),
    gpp_before_gpc TEXT,
    gpp_after_gpc TEXT,
    urlClassification TEXT,
    OneTrustWPCCPAGoogleOptOut_before_gpc BOOLEAN,
    OneTrustWPCCPAGoogleOptOut_after_gpc BOOLEAN,
    OTGPPConsent_before_gpc TEXT,
    OTGPPConsent_after_gpc TEXT
);
CREATE TABLE IF NOT EXISTS debug (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    domain varchar(255),
    a varchar(4000),
    b varchar(4000)
);
SQLCOMMANDS


# Install dependencies for the REST API using npm
npm install

# Start the REST API using Node.js directly instead of systemd
# This step replaces `systemctl` usage since Docker containers typically don't use systemd
node index.js debug

set +x
echo '--------------------------------------------------'
echo "REST API started at http://localhost:8080/analysis"
echo '--------------------------------------------------'
