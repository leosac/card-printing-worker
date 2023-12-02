require('dotenv').config();
const app = require('./app.js');

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`listening on ${port} with logging level '${process.env.LOGGING_LEVEL}'...`);
});