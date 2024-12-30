# Base image with systemd support
FROM consol/debian-xfce-vnc
ENV REFRESHED_AT 2022-10-12
# Switch to root user to install additional software
USER 0

#Set shell to bash
SHELL ["/bin/bash", "-c"]

# Get repositories and keys for Node.js and MySQL, then install core utilities
RUN apt-get update && \
    apt-get -y install apt-utils curl file gnupg lsb-release wget && \
    install -d -m 0755 /etc/apt/keyrings

# Set up Node.js repository
RUN curl -fsSL https://deb.nodesource.com/setup_21.x | bash -

# Download and install MySQL repository configuration
RUN curl -fsSL https://dev.mysql.com/get/mysql-apt-config_0.8.22-1_all.deb -o /tmp/mysql.deb && \
    dpkg -i /tmp/mysql.deb

# Set up Firefox repository from Mozilla and add GPG key
RUN wget -q https://packages.mozilla.org/apt/repo-signing-key.gpg -O- | tee /etc/apt/keyrings/packages.mozilla.org.asc && \
    echo "deb [signed-by=/etc/apt/keyrings/packages.mozilla.org.asc] https://packages.mozilla.org/apt mozilla main" | tee -a /etc/apt/sources.list.d/mozilla.list

# Correctly format the preferences file for the Mozilla repository
RUN echo "Package: *" > /etc/apt/preferences.d/mozilla && \
    echo "Pin: origin packages.mozilla.org" >> /etc/apt/preferences.d/mozilla && \
    echo "Pin-Priority: 1000" >> /etc/apt/preferences.d/mozilla

# Re-add required keys to resolve any missing key issues for the repositories
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com --recv-keys B7B3B788A8D3785C

# Update package lists and install necessary packages, replacing firefox with firefox-esr and mysql-server with mariadb-server
RUN apt-get update && \
    apt-get -y install firefox-nightly nodejs zip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/mysql.deb

RUN dpkg -L firefox-nightly
# Manually install Geckodriver for Selenium
RUN npm install -g geckodriver

# Manually install selenium-webdriver
RUN npm install -g selenium-webdriver


CMD ["sh", "/srv/analysis/scripts/run_crawl.sh"]
## switch back to default user
USER 1000
