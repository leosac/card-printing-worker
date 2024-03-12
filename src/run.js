require('dotenv').config();
const app = require('./app.js');

const hostname = process.env.HOSTNAME || "127.0.0.1";
const port = process.env.PORT || 4000;
app.listen(port, hostname, () => {
    console.log(`listening on ${hostname}:${port} with logging level '${process.env.LOGGING_LEVEL}'...`);
});