# Usa OpenJDK 17 (versione LTS) come base
FROM openjdk:17-jdk-slim

# === ARGOMENTO DI BUILD PER IL NOME DELLA CARTELLA DEL PROGETTO ===
# Definisci un argomento con un valore di default.
# Questo valore può essere sovrascritto durante la build con --build-arg PROJECT_DIR_NAME=...
ARG PROJECT_DIR_NAME=angular-example-no-id

# Installazione delle dipendenze di sistema (invariato)
RUN apt-get update && apt-get install -y \
    bash curl wget gnupg ca-certificates build-essential unzip libnss3 \
    fonts-liberation procps dos2unix libxss1 libappindicator3-1 libgbm1 \
    lsb-release xdg-utils jq bsdmainutils && rm -rf /var/lib/apt/lists/*

# Installazione di Google Chrome (invariato)
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    apt-get update && \
    apt-get install -y ./google-chrome-stable_current_amd64.deb && \
    rm google-chrome-stable_current_amd64.deb

# Installazione di Node.js via nvm (invariato)
ENV NVM_DIR=/usr/local/nvm
ENV NODE_VERSION=22.15.0
RUN mkdir -p "$NVM_DIR" && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && \
    . "$NVM_DIR/nvm.sh" && nvm install $NODE_VERSION && nvm use $NODE_VERSION && nvm alias default $NODE_VERSION
ENV NODE_PATH="$NVM_DIR/versions/node/v$NODE_VERSION/lib/node_modules"
ENV PATH="$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH"

# Installazione di Maven (invariato)
ENV MAVEN_VERSION=3.9.9
RUN mkdir -p /opt && \
    curl -fsSL "https://archive.apache.org/dist/maven/maven-$(echo ${MAVEN_VERSION} | cut -d. -f1)/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz" | tar -xz -C /opt/ && \
    ln -s /opt/apache-maven-${MAVEN_VERSION} /opt/maven
ENV MAVEN_HOME=/opt/maven
ENV PATH="$MAVEN_HOME/bin:$PATH"

# Installazione di Angular CLI (invariato)
RUN npm install -g @angular/cli@19.2.0

# Verifica versioni (invariato)
RUN node -v && npm -v && ng version && google-chrome --version

# Installazione di ChromeDriver (invariato)
RUN CHROME_MAJOR_VERSION=$(google-chrome --version | grep -oP '\d+' | head -1) && \
    CHROMEDRIVER_URL=$(curl -s "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json" | \
                       jq -r ".channels.Stable.downloads.chromedriver[] | select(.platform == \"linux64\") | .url") && \
    echo "Downloading ChromeDriver from: $CHROMEDRIVER_URL" && \
    wget -O /tmp/chromedriver.zip "$CHROMEDRIVER_URL" && \
    unzip /tmp/chromedriver.zip -d /usr/local/bin/ && \
    mv /usr/local/bin/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver && \
    chmod +x /usr/local/bin/chromedriver && \
    rm -rf /tmp/chromedriver.zip /usr/local/bin/chromedriver-linux64

# === MODIFICA CHIAVE QUI ===
# Imposta la directory di lavoro principale
WORKDIR /app

# Copia l'intero contenuto della cartella del progetto.
# Assumiamo che all'interno di ${PROJECT_DIR_NAME} ci sia una cartella 'frontend'
# che contiene l'applicazione Angular.
COPY progetti-per-test/${PROJECT_DIR_NAME}/ .

# Naviga alla directory dell'applicazione Angular all'interno del container
# per installare le dipendenze in un ambiente pulito.
WORKDIR /app/frontend

# Rimuovi eventuali dipendenze e package-lock.json preesistenti
# (specialmente se copiati dal sistema host) e reinstalla.
# Questo risolve il problema delle dipendenze opzionali e architetture mismatch.
RUN rm -rf node_modules package-lock.json && npm install --silent

# Torna alla directory root del progetto per gli script successivi
WORKDIR /app

# Copia lo script di esecuzione e imposta i permessi
COPY runMutantsScript.sh .
RUN dos2unix runMutantsScript.sh && chmod +x runMutantsScript.sh

# Definisce il comando che verrà eseguito all'avvio del container
ENTRYPOINT ["./runMutantsScript.sh"]