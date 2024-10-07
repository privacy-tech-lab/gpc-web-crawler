# Base image with systemd support
FROM jrei/systemd-debian

# Set environment variables to prevent interactive prompts during package installations
ENV TERM=linux \
    DEBIAN_FRONTEND=noninteractive

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
    apt-get -y install apache2 firefox-esr mariadb-server nodejs zip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/mysql.deb

# Manually install Geckodriver for Selenium
RUN npm install -g geckodriver

# Install Selenium using pip3
RUN pip3 install selenium

# Expose the required ports for Apache and MySQL
EXPOSE 80 3306

# Keep the container running indefinitely to facilitate testing
CMD ["sleep", "infinity"]


