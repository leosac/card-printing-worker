module.exports = function(app, container) {
    const logger = container.get('logger');
    const auth = container.get('auth');

   /**
     * @openapi
     * /auth:
     *   post:
     *     description: Authenticate.
     *     requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              type: object
     *              properties:
     *                apikey:
     *                  type: string
     *                application:
     *                  type: string
     *     responses:
     *       200:
     *         description: Returns the token.
     */
        app.post('/auth', async (req, res) => {
            try {
                const token = auth.authenticate(req.body.application, req.body.api_key);
                res.json({
                    TokenValue: token
                });
            } catch(error) {
                logger.error(error);
                res.status(500);
                res.json(error); 
            }
        });
}