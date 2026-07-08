# PadelPlay

Projet fullstack de gestion de matchs de padel.

- Backend : Spring Boot 3.5, Java 21, Maven
- Frontend : Angular 21, Angular Material, Tailwind, Vitest
- Base de donnees : PostgreSQL 15 avec Docker Compose

## Prerequis

Installer sur la machine :

- Java 21
- Node.js compatible avec Angular 21
- npm
- Docker Desktop

Verifier les versions :

```bash
java -version
node -v
npm -v
docker --version
```

## Structure du projet

```text
padell/
  src/                 Backend Spring Boot
  frontend/            Frontend Angular
  docker-compose.yml   PostgreSQL Docker
  pom.xml              Configuration Maven backend
  README.md            Documentation compilation et lancement
```

## Base de donnees PostgreSQL

Le projet utilise PostgreSQL via Docker.

Configuration :

```text
Base       : padelService
Utilisateur: padel
Mot de passe: padel
Port local : 5440
Port Docker: 5432
```

Demarrer PostgreSQL :

```bash
docker compose up -d
```

Verifier que le conteneur tourne :

```bash
docker ps
```

Arreter PostgreSQL :

```bash
docker compose down
```

Supprimer aussi les donnees de la base :

```bash
docker compose down -v
```

## Backend Spring Boot

Le backend se trouve a la racine du projet.

Port backend :

```text
http://localhost:8080
```

Configuration principale :

```text
src/main/resources/application.properties
```

Connexion a la base :

```properties
spring.datasource.url=jdbc:postgresql://localhost:5440/padelService
spring.datasource.username=padel
spring.datasource.password=padel
server.port=8080
```

### Installer/compiler le backend

Depuis la racine du projet :

```bash
.\mvnw.cmd clean compile
```

### Lancer les tests backend

```bash
.\mvnw.cmd test
```

### Builder le backend

```bash
.\mvnw.cmd clean package
```

Le fichier genere se trouve dans :

```text
target/
```

### Lancer le backend

Avec Maven :

```bash
.\mvnw.cmd spring-boot:run
```

Ou apres un package :

```bash
java -jar target/padelmultiple-0.0.1-SNAPSHOT.jar
```

## Swagger API

Quand le backend tourne :

```text
http://localhost:8080/swagger-ui.html
```

OpenAPI JSON :

```text
http://localhost:8080/v3/api-docs
```

## Frontend Angular

Le frontend se trouve dans :

```text
frontend/
```

Le proxy Angular redirige les appels `/api` vers le backend :

```text
frontend/proxy.conf.json
```

Configuration proxy :

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

### Installer les dependances frontend

Depuis le dossier `frontend` :

```bash
cd frontend
npm install
```

### Lancer le frontend en developpement

```bash
npm start
```

Ou explicitement sur le port 4200 :

```bash
npm run start:4200
```

URL frontend :

```text
http://localhost:4200
```

### Compiler le frontend

```bash
npm run build
```

Le build Angular est genere dans :

```text
frontend/dist/
```

### Lancer les tests frontend

```bash
npm test
```

Mode watch :

```bash
npm run test:watch
```

## Compilation complete du projet

Depuis la racine :

```bash
docker compose up -d
.\mvnw.cmd clean test
cd frontend
npm install
npm test
npm run build
```

## Lancement complet en local

Terminal 1 : base de donnees

```bash
docker compose up -d
```

Terminal 2 : backend

```bash
.\mvnw.cmd spring-boot:run
```

Terminal 3 : frontend

```bash
cd frontend
npm start
```

URLs :

```text
Frontend : http://localhost:4200
Backend  : http://localhost:8080
Swagger  : http://localhost:8080/swagger-ui.html
Postgres : localhost:5440
```

## Commandes utiles

Voir les logs PostgreSQL :

```bash
docker logs padel-db
```

Relancer proprement la base :

```bash
docker compose down
docker compose up -d
```

Nettoyer le build backend :

```bash
.\mvnw.cmd clean
```

Nettoyer le build frontend :

```bash
cd frontend
Remove-Item -Recurse -Force dist
```

## Ordre conseille pour une demo

1. Demarrer PostgreSQL :

```bash
docker compose up -d
```

2. Lancer le backend :

```bash
.\mvnw.cmd spring-boot:run
```

3. Lancer le frontend :

```bash
cd frontend
npm start
```

4. Ouvrir :

```text
http://localhost:4200
```

5. Verifier l'API avec Swagger :

```text
http://localhost:8080/swagger-ui.html
```
