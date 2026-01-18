# LeihSy Frontend

Dieses Repository enthält das Frontend der Anwendung **LeihSy**, einem Online-Portal zum Verleihen von Gegenständen der Hochschule Esslingen.
Das Frontend wird mit **Docker** gebaut und über **NGINX** ausgeliefert.

## Voraussetzungen

Folgende Software muss installiert sein:

- Docker
- Docker Compose (Plugin)

## Herunterladen und Konfiguration

Sourcecode herunterladen
```bash
git clone https://github.com/LeihSy/LeihSy_Frontend
```

In den Ordner LeihSy_Frontend navigieren
```bash
cd LeihSy_Frontend
```

Verbindungsdetails für das Backend und den Keycloak-Server anpassen
```bash
nano src/environments/environment.ts
```
Die API Base URL inkludiert nur den Hostnamen des Backend Servers, beispielsweise https://api.leihsy.hs-esslingen.com , also ohne /api/...

Optional: NGINX Webserver Konfiguration ändern in nginx.conf

## Bauen und Deployment

Docker Image bauen
```bash
docker build -t leihsy-frontend .
```

Docker Container starten mit der mitgelieferten docker-compose.yml
```bash
docker compose up -d
```

## Entwicklung

Die Anwendung kann zu Developmentzwecken testweise lokal ausgeführt werden.
Entsprechende Änderungen an den Verbindungsdetails können unter /src/environments/environment.ts getätigt werden.

NPM muss installiert sein.

Das Projekt initialisieren und Abhängigkeiten herunterladen und installieren
```bash
npm install
```

Die Angular CLI installieren
```bash
npm install -g @angular/cli
```

Die Version von Angular CLI überprüfen
```bash
ng version
```

Den Sourcecode bauen und einen lokalen Webserver starten der auf Änderungen im Code reagiert
```bash
ng serve
```

Der Webserver ist unter http://localhost:4200/ im Browser erreichbar.