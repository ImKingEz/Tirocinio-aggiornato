# Usa OpenJDK 17 (versione LTS) come base, adatta per le parti Java del tuo progetto
FROM openjdk:17-jdk-slim

# Installazione delle dipendenze di sistema necessarie
RUN apt-get update && apt-get install -y \
    bash \
    curl \
    wget \
    gnupg \
    ca-certificates \
    build-essential \
    unzip \
    libnss3 \
    fonts-liberation \
    procps \
    dos2unix \
    libxss1 \
    libappindicator3-1 \
    libgbm1 \
    lsb-release \
    xdg-utils \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Installazione di Google Chrome stable (la versione più recente)
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    apt-get update && \
    apt-get install -y ./google-chrome-stable_current_amd64.deb && \
    rm google-chrome-stable_current_amd64.deb

# Installazione di Node.js 18 LTS (richiesto per Angular 19.2.0) tramite nvm
ENV NVM_DIR=/usr/local/nvm
ENV NODE_VERSION=22.15.0
RUN mkdir -p "$NVM_DIR" && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && \
    . "$NVM_DIR/nvm.sh" && \
    nvm install $NODE_VERSION && \
    nvm use $NODE_VERSION && \
    nvm alias default $NODE_VERSION

# Configura il PATH per Node.js
ENV NODE_PATH="$NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules"
ENV PATH="$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH"

# Installazione di Maven (3.9.9 è una versione recente e stabile)
ENV MAVEN_VERSION=3.9.9
RUN mkdir -p /opt && \
    curl -fsSL "https://archive.apache.org/dist/maven/maven-$(echo ${MAVEN_VERSION} | cut -d. -f1)/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz" | tar -xz -C /opt/ && \
    ln -s /opt/apache-maven-${MAVEN_VERSION} /opt/maven
ENV MAVEN_HOME=/opt/maven
ENV PATH="$MAVEN_HOME/bin:$PATH"

# Installazione di Angular CLI 19.2.0 globalmente
RUN npm install -g @angular/cli@19.2.0

# Verifica le versioni installate
RUN node -v && npm -v && ng version && google-chrome --version

# Installazione di ChromeDriver, recuperando dinamicamente la versione compatibile
# con la versione di Chrome installata.
RUN CHROME_MAJOR_VERSION=$(google-chrome --version | grep -oP '\d+' | head -1) && \
    CHROMEDRIVER_URL=$(curl -s "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json" | \
                       jq -r ".channels.Stable.downloads.chromedriver[] | select(.platform == \"linux64\") | .url") && \
    echo "Downloading ChromeDriver from: $CHROMEDRIVER_URL" && \
    wget -O /tmp/chromedriver.zip "$CHROMEDRIVER_URL" && \
    unzip /tmp/chromedriver.zip -d /usr/local/bin/ && \
    mv /usr/local/bin/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver && \
    chmod +x /usr/local/bin/chromedriver && \
    rm -rf /tmp/chromedriver.zip /usr/local/bin/chromedriver-linux64

# Copia i file del tuo progetto
COPY mutanti_paper_ed_utilities/script_paolella_volpe_mutants /script_paolella_volpe_mutants
COPY runMutantsScript.sh /script_paolella_volpe_mutants/runMutantsScript.sh

# Correggi i line ending e i permessi dello script
WORKDIR /script_paolella_volpe_mutants
RUN dos2unix runMutantsScript.sh && chmod +x runMutantsScript.sh

# Imposta la directory di lavoro finale
WORKDIR /script_paolella_volpe_mutants

# Esegui lo script
ENTRYPOINT ["./runMutantsScript.sh"]