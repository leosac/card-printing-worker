require('dotenv').config();
const app = require('./app.js');
const https = require('https');
const http = require('http');
const fs = require('fs');

const hostname = process.env.HOSTNAME || "127.0.0.1";
const port = process.env.PORT || 4000;

http.createServer(app).listen(port, hostname, () => {
    console.log(`listening on ${hostname}:${port} with logging level '${process.env.LOGGING_LEVEL}'...`);
});
if (process.env.HTTPS_ENABLED === 'true') {
    var privateKey = fs.readFileSync(process.env.SSL_KEY);
    var certificate = fs.readFileSync(process.env.SSL_CERT);
    const options = {
        key: privateKey,
        cert: certificate
    }
    const port_ssl = process.env.PORT_SSL || 4001;
    https.createServer(options, app).listen(port_ssl, hostname, () => {
        console.log(`listening on ${hostname}:${port_ssl} with logging level '${process.env.LOGGING_LEVEL}'...`);
    });
}