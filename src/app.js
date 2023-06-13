const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const Cabin = require('cabin');
const path = require('path');

const app = express();
const logger = new Cabin();

app.use(morgan('tiny'));
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(logger.middleware);

if (!process.env.TEMPLATE_REPOSITORY) {
    process.env.TEMPLATE_REPOSITORY = path.join(__dirname, '../repository');
}

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Leosac Card Printing Worker API",
            version: "0.1.0",
            description: "Leosac Card Printing API to generate bitmaps for further card printing.",
            license: {
                name: "AGPL",
                url: "https://www.gnu.org/licenses/agpl-3.0.en.html",
            },
            contact: {
                name: "Leosac",
                url: "https://leosac.com",
                email: "dev@leosac.com",
            },
        },
        servers: [
            {
                url: "http://localhost:4000/",
                description: "Development Server"
            }
        ],
        components: {
            securitySchemes: {
                Authorization: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    value: "Bearer <JWT token here>"
                }
            }
        }
    },
    apis: ["./src/routes/*.js"],
};
  
const specs = swaggerJsdoc(swaggerOptions);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, { explorer: true })
);

require('./routes')(app, logger);

module.exports = app;