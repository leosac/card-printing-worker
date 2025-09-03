const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const winston = require('winston');
const canvas = require('canvas');

const app = express();

if (!process.env.LOGGING_LEVEL) {
    process.env.LOGGING_LEVEL = "http";
}
const logger = winston.createLogger({
    level: process.env.LOGGING_LEVEL
});
if (!process.env.LOGGING_TYPE) {
    process.env.LOGGING_TYPE = "console";
}
const lineformat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});
const logformat = winston.format.combine(
    winston.format.timestamp(),
    lineformat
);
process.env.LOGGING_TYPE.split(',').forEach(logtype => {
    if (logtype === "file") {
        if (!process.env.LOGGING_DIRECTORY) {
            process.env.LOGGING_DIRECTORY = ".";
        }
        logger.add(new winston.transports.File({
            format: logformat,
            filename: process.env.LOGGING_DIRECTORY + '/leosac-cpw.log'
        }));
    } else if (logtype === "console") {
        logger.add(new winston.transports.Console({
            format: logformat
        }));
    }
});
const logHttp = {
    write: (message) => logger.http(message)
};

app.use(morgan('tiny', { stream: logHttp }));
app.use(cors({ origin: true }));
app.use(bodyParser.json({ limit: '5mb' }));

global.ImageData = canvas.ImageData; // Required since PIXI 7.2.x and Canvas update, temporary workaround (?). Not required if PIXI peer dependency <= 7.1.

if (!process.env.TEMPLATE_REPOSITORY) {
    logger.warn("The environment variable `TEMPLATE_REPOSITORY` is not defined. Templates caching/storage will not be persistent.");
}

if (!process.env.PIXI_APP_POOL_SIZE) {
    process.env.PIXI_APP_POOL_SIZE = 5;
}

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Leosac Card Printing Worker API",
            version: "1.1.0",
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
                url: "/",
                description: "Current Server"
            },
            {
                url: "http://localhost:4000/",
                description: "Development Server"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: ["./src/routes/*.js"],
};
  
const specs = swaggerJsdoc(swaggerOptions);
app.use(
    "/swagger",
    swaggerUi.serve,
    swaggerUi.setup(specs, { explorer: true })
);
app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});

require('./routes')(app, logger);

module.exports = app;