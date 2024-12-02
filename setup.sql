GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost';
 ALTER USER 'root'@'localhost' IDENTIFIED BY 'toor';
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