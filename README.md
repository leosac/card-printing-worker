# Card Printing Worker [![Build Status](https://github.com/leosac/card-printing-worker/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/leosac/card-printing-worker/actions/workflows/node.js.yml)
An autonomous (Node.js) server to generate bitmaps for (CR-80) card printing for card printers.

It can be used as a standalone microservice and is maintained/distributed as a core component of [Leosac Credential Provisioning](https://leosac.com/credential-provisioning/) solution.

# Run

## From source
 * Install [Node.js](https://nodejs.org/en/download) >= 16.10 and [Yarn](https://yarnpkg.com/getting-started/install).
 * `git clone https://github.com/leosac/card-printing-worker.git`
 * `cd card-printing-worker`
 * `yarn install`
 * `yarn run dev`

## With Docker
 * Install [Docker](https://docs.docker.com/engine/install/)
 * `docker pull leosac/leosac-card-printing-worker:snapshot`
 * `docker create --name leosac-cpw --init -p 4000:4000 -v /var/local/lcpw-repo:/data/repository leosac/leosac-card-printing-worker:snapshot`
 * `docker start leosac-cpw`

# Configuration
Configuration is done through environment variables. You can use dotenv to create such variables by creating *.env* file at the root folder. See [.env.example](https://github.com/leosac/card-printing-worker/blob/master/.env.example).

If using docker, define variables when creating the container with `-e VARIABLE=VALUE`.

# Use
By default, the server can be reached on http://localhost:4000/.
The REST API is documented with an embedded Swagger UI on http://localhost:4000/api-docs/ and also available [on SwaggerHub](https://app.swaggerhub.com/apis/LEOSAC/CardPrintingWorker/1.0.0#/).

JSON template samples can be found on [repository](https://github.com/leosac/card-printing-worker/tree/master/repository) folder.
Such templates have to follow [js-cardrendering](https://github.com/leosac/js-cardrendering) format and can easily be created with [js-cardeditor](https://github.com/leosac/js-cardeditor).
