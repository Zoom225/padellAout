# PadelPlay

Projet fullstack de gestion de matchs de padel.

- Backend : Spring Boot 3.5, Java 21, Maven
- Frontend : Angular 21, Angular Material, Tailwind, Vitest
- Base de donnees : PostgreSQL 15 via Docker Compose

## Vue d'ensemble

Le projet est compose de deux applications :

- un backend Spring Boot expose sur `http://localhost:8082`
- un frontend Angular expose en developpement sur `http://localhost:4200`

Le frontend appelle le backend via un proxy `/api`.

## Structure du projet

```text
padellAout/
  src/                       Backend Spring Boot
  frontend/                  Frontend Angular
  docker-compose.yml         PostgreSQL local
  pom.xml                    Build Maven backend
  README.md                  Documentation projet
```

### Backend

Organisation principale du backend :

```text
src/main/java/com/padell/padell/
  config/                    Securite, JWT, CORS, Swagger
  controller/                Endpoints REST
  dto/                       Requetes et reponses
  entity/                    Entites JPA
  mapper/                    Mapping DTO <-> entites
  repository/                Acces base de donnees
  service/                   Contrats de services
  service/impl/              Implementations metier
```

Points notables de l'architecture actuelle :

- `SecurityConfig` definit les acces par route
- `JwtAuthenticationFilter` reconstruit l'authentification depuis le JWT
- `JwtConfig` gere la generation et la lecture des claims JWT
- `MembreAccessService` centralise les controles d'acces sur les membres
- `MembreCreationService` sort la logique de creation hors du controller
- `CurrentMemberService` et `AdminAuthorizationService` se partagent les regles d'acces membre/admin

### Frontend

Organisation principale du frontend :

```text
frontend/src/app/
  core/
    api/                     Services HTTP
    auth/                    Session, login, stockage
    guards/                  Protections de routes
    interceptors/            Injection du token JWT
    i18n/                    Traductions FR/EN
  features/
    admin/                   Ecrans administrateur
    member/                  Ecrans membre
    home/                    Landing page
  shared/                    Modeles, composants, utilitaires
```

Points notables de l'architecture actuelle :

- `AuthSessionService` est la source centrale de verite pour les sessions frontend
- `AdminSessionService` et `MemberSessionService` sont des facades legeres au-dessus de cette session unifiee
- le projet est bilingue FR / EN via `core/i18n/translations.ts`
- l'interceptor HTTP ajoute automatiquement le token JWT sur les appels API proteges

## Prerequis

Installer sur la machine :

- Java 21
- Node.js compatible Angular 21
- npm
- Docker Desktop

Verifier les versions :

```bash
java -version
node -v
npm -v
docker --version
```

## Base de donnees PostgreSQL

Le projet utilise PostgreSQL via Docker Compose.

Configuration actuelle :

```text
Base        : padelService
Utilisateur : padel
Mot de passe: padel
Port local  : 5440
Port Docker : 5432
Conteneur   : padel-db
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

Supprimer aussi les donnees :

```bash
docker compose down -v
```

Voir les logs PostgreSQL :

```bash
docker logs padel-db
```

## Backend Spring Boot

Le backend se trouve a la racine du projet.

Configuration principale :

```text
src/main/resources/application.properties
```

Configuration runtime actuelle :

```properties
spring.datasource.url=jdbc:postgresql://localhost:5440/padelService
spring.datasource.username=padel
spring.datasource.password=padel
server.port=8082
springdoc.swagger-ui.path=/swagger-ui.html
```

### Compiler le backend

Depuis la racine du projet :

```bash
.\mvnw.cmd clean compile
ou
a la racine du projet : padellApplication avec la fleche droite
```

### Lancer les tests backend

```bash
.\mvnw.cmd test
```

### Builder le backend

```bash
.\mvnw.cmd clean package
```

Le jar genere se trouve dans :

```text
target/
```

### Lancer le backend

Avec Maven :

```bash
.\mvnw.cmd spring-boot:run
```

Ou apres packaging :

```bash
java -jar target/padelmultiple-0.0.1-SNAPSHOT.jar
```

## API et securite

Le backend utilise des JWT pour l'authentification.

Points utiles :

- login admin via `/api/auth/login`
- login membre via `/api/membres/login`
- les roles sont appliques a deux niveaux :
  - filtrage des routes dans `SecurityConfig`
  - verification metier fine dans les services d'autorisation
- le JWT contient un `principalType` pour distinguer explicitement admin et membre

## Swagger / OpenAPI

Quand le backend tourne :

```text
http://localhost:8082/swagger-ui.html
```

OpenAPI JSON :

```text
http://localhost:8082/v3/api-docs
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
"target": "http://localhost:8082",
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

### Compiler le frontend

```bash
npm run build
```

Le build est genere dans :

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

## Internationalisation

Le frontend gere actuellement deux langues :

- `fr`
- `en`

Les traductions se trouvent dans :

```text
frontend/src/app/core/i18n/translations.ts
```

Le service de langue se trouve dans :

```text
frontend/src/app/core/i18n/language.service.ts
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
Backend  : http://localhost:8082
Swagger  : http://localhost:8082/swagger-ui.html
Postgres : localhost:5440
```

## Commandes utiles

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

1. Demarrer PostgreSQL

```bash
docker compose up -d
```

2. Lancer le backend

```bash
.\mvnw.cmd spring-boot:run
```

3. Lancer le frontend

```bash
cd frontend
npm start
```

4. Ouvrir l'application

```text
http://localhost:4200
```

5. Verifier l'API si besoin

```text
http://localhost:8082/swagger-ui.html
```
