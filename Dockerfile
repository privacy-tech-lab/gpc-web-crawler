# Base image with systemd support
FROM consol/debian-xfce-vnc
ENV REFRESHED_AT 2022-10-12
ENV DB_CONNECTION=mysql
ENV DB_HOST=localhost
ENV DB_DATABASE=analysis
ENV DB_USERNAME=root
ENV DB_PASSWORD=toor
# Switch to root user to install additional software
USER 0

#Set shell to bash
SHELL ["/bin/bash", "-c"]

# Get repositories and keys for Node.js and MySQL, then install core utilities
RUN apt-get update && \
    apt-get -y install apt-utils curl file gnupg lsb-release wget python3-pip && \
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
    apt-get -y install apache2 firefox-nightly mariadb-server nodejs zip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/mysql.deb

RUN dpkg -L firefox-nightly
# Manually install Geckodriver for Selenium
RUN npm install -g geckodriver

# Manually install selenium-webdriver
RUN npm install -g selenium-webdriver


#update apt
RUN apt-get update

#install python venv
RUN apt-get -y install python3.11-venv

#create virtual environment
RUN python3 -m venv .venv

#use virtual environment
RUN source .venv/bin/activate

# Install Selenium using pip3
RUN .venv/bin/pip3 install selenium

# Expose the required ports for Apache and MySQL
EXPOSE 80 3306

# Keep the container running indefinitely to facilitate testing
CMD ["sleep", "infinity"]

# Install netcat (or nc) for network checks
RUN apt-get update && apt-get install -y netcat-openbsd

#install apache2
RUN apt-get install -y apache2 apache2-utils
RUN apt-get clean
#install phpmyadmin
RUN apt-get install -y php-mbstring php-zip php-gd php-php-gettext phpmyadmin
RUN phpenmod mbstring
RUN apt-get install -y libapache2-mod-php8.2
RUN echo "<?php phpinfo(); ?>" > /var/www/html/info.php
RUN mkdir -p /usr/local/share/phpmyadmin
RUN ln -s /usr/share/phpmyadmin /usr/local/share/phpmyadmin


RUN cat <<EOF >> /etc/apache2/apache2.conf
Alias /phpmyadmin /usr/local/share/phpmyadmin

<Directory /usr/local/share/phpmyadmin/>
    Options Indexes FollowSymLinks MultiViews
    AllowOverride All
    <IfModule mod_authz_core.c>
        Require all granted
    </IfModule>
    <IfModule !mod_authz_core.c>
        Order allow,deny
        Allow from all
    </IfModule>
    DirectoryIndex index.php
</Directory>
EOF
# Install supervisored for managing multiple processes.
RUN apt-get update && apt-get install -y supervisor
RUN mkdir -p /var/log/supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
CMD ["/usr/bin/supervisord"]


## switch back to default user
USER 1000
