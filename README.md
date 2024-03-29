# Turborepo Docker starter

This is an official Docker starter Turborepo.

## What's inside?

This turborepo uses [Yarn](https://classic.yarnpkg.com/lang/en/) as a package manager. It includes the following packages/apps:

### Apps and Packages

- `web`: a [Next.js](https://nextjs.org/) app
- `api`: an [Express](https://expressjs.com/) server
- `ui`: ui: a React component library
- `eslint-config-custom`: `eslint` configurations for client side applications (includes `eslint-config-next` and `eslint-config-prettier`)
- `eslint-config-custom-server`: `eslint` configurations for server side applications (includes `eslint-config-next` and `eslint-config-prettier`)
- `scripts`: Jest configurations
- `logger`: Isomorphic logger (a small wrapper around console.log)
- `tsconfig`: tsconfig.json;s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

## Using this example

Run the following command:

```sh
npx degit vercel/turbo/examples/with-docker with-docker
cd with-docker
yarn install
git init . && git add . && git commit -m "Init"
```

### Docker

This repo is configured to be built with Docker, and Docker compose. To build all apps in this repo:

```
# Create a network, which allows containers to communicate
# with each other, by using their container name as a hostname
docker network create app_network

# Build prod using new BuildKit engine
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f docker-compose.yml build --parallel

# Start prod in detached mode
docker-compose -f docker-compose.yml up -d
```

Open http://localhost:3000.

To shutdown all running containers:

```
# Stop all running containers
docker kill $(docker ps -q) && docker rm $(docker ps -a -q)
```

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Jest](https://jestjs.io) test runner for all things JavaScript
- [Prettier](https://prettier.io) for code formatting


### DATABASE CREATION

```sql
CREATE DATABASE [adsb];
CREATE TABLE [dbo].[adsb] (
    [moment]        DATETIME          NOT NULL,
    [aircraft]      CHAR (6)          NOT NULL,
    [callsign]      VARCHAR (10)      NULL,
    [altitude]      SMALLINT          NULL,
    [position]      [sys].[geography] NULL,
    [track]         SMALLINT          NULL,
    [vertical_rate] SMALLINT          NULL,
    [ground]        BIT               NULL,
    CONSTRAINT [PK_adsb] PRIMARY KEY CLUSTERED ([aircraft] ASC, [moment] ASC)
);

```


## Relatorios

### BITA 15/33 tempo e velocidade, 5nm, 3nm, 6nm, cabeceira, twy livra
SELECT 
  type,
  l6.date AS '6nm date',
  l6.speed AS '6nm speed',
  l5.date AS '5nm date',
  l5.speed AS '5nm speed',
  l3.date AS '3nm date',
  l3.speed AS '3nm speed',
  thr.date AS 'thr date',
  thr.speed AS 'thr speed',
  CASE  WHEN o.date IS NULL THEN thr.out ELSE o.date END AS 'out rwy'
FROM adsb.Flight
INNER JOIN adsb.FlightLog thr ON id = thr.flight AND thr.waypoint = '15-33'
INNER JOIN adsb.FlightLog l5 ON id = l5.flight AND l5.waypoint = '15 5'
INNER JOIN adsb.FlightLog l3 ON id = l3.flight AND l3.waypoint = '15 3'
INNER JOIN adsb.FlightLog l6 ON id = l6.flight AND l6.waypoint = '15 6'
LEFT JOIN adsb.FlightLog o ON id = o.flight AND o.waypoint = 'OUT'
WHERE Flight.rwy = '15' 
AND Flight.destination = 'SBKP'
AND CASE  WHEN o.date IS NULL THEN thr.out ELSE o.date END IS NOT NULL


SELECT 
  type,
  l5.date AS '5nm date',
  l5.speed AS '5nm speed',
  l3.date AS '3nm date',
  l3.speed AS '3nm speed',
  thr.date AS 'thr date',
  thr.speed AS 'thr speed'
FROM adsb.Flight
INNER JOIN adsb.FlightLog thr ON id = thr.flight AND thr.waypoint = '15-33'
INNER JOIN adsb.FlightLog l5 ON id = l5.flight AND l5.waypoint = '33 5'
INNER JOIN adsb.FlightLog l3 ON id = l3.flight AND l3.waypoint = '33 3'
WHERE l5.date IS NOT NULL AND l3.date IS NOT NULL AND thr.date IS NOT NULL 
AND l3.date < thr.date AND l5.date < thr.date
AND Flight.destination = 'SBKP'

# Calculo de delta tempo para relatorio bita
SELECT 
  type,
  CONVERT(VARCHAR,thr.date,103) AS 'DATA',
  CONVERT(VARCHAR,thr.date, 108) AS 'HORA',
  DATEDIFF(SECOND,l6.date, l5.date) AS '𝚫 6-5',
  DATEDIFF(SECOND,l5.date, thr.date) AS '𝚫 5-THR',
  DATEDIFF(SECOND,l5.date, l3.date) AS '𝚫 5-3',
  DATEDIFF(SECOND,l3.date, thr.date) AS '𝚫 3-THR',
  l6.speed AS '6nm INST SPD',
  l5.speed AS '5nm INST SPD',
  l3.speed AS '3nm INST SPD',
  thr.speed AS 'THR INST SPD'
FROM adsb.Flight
INNER JOIN adsb.FlightLog thr ON id = thr.flight AND thr.waypoint = '15-33'
INNER JOIN adsb.FlightLog l5 ON id = l5.flight AND l5.waypoint = '33 5'
INNER JOIN adsb.FlightLog l3 ON id = l3.flight AND l3.waypoint = '33 3'
INNER JOIN adsb.FlightLog l6 ON id = l6.flight AND l6.waypoint = '33 6'
LEFT JOIN adsb.FlightLog o ON id = o.flight AND o.waypoint = 'OUT'
WHERE thr.date BETWEEN '2022-01-01' AND '2023-02-16 23:00:00' AND 
thr.date > l5.date AND thr.date > l6.date AND thr.date > l3.date
AND CASE  WHEN o.date IS NULL THEN thr.out ELSE o.date END IS NOT NULL
ORDER BY thr.date DESC