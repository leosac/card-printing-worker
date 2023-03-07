const app = require('./app.js');

const port = process.env.PORT || 4000;
if (!process.env.WEBSITE_ROOT) {
    process.env.WEBSITE_ROOT = 'http://localhost:4000';
} 
app.listen(port, () => {
    console.log(`listening on ${port}`);
});