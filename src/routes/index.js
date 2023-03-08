const Container = require('../container');

module.exports = function(app, logger) {
    /**
     * @openapi
     * /:
     *   get:
     *     description: Get the server name. Can be used as a simple test the server is running properly.
     *     responses:
     *       200:
     *         description: Returns the server name.
     */
    app.get('/', (req, res) => {
        res.json({
            message: 'Leosac Card Printing Worker instance'
        });
    });

    require('./render')(app, Container);
}
