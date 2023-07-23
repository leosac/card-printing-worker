module.exports = function(app, container) {
    const logger = container.get('logger');
    const auth = container.get('auth');

   /**
     * @openapi
     * /auth:
     *   post:
     *     description: Authenticate.
     *     tags:
     *       - authentication
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
     *                context:
     *                  type: string
     *     responses:
     *       200:
     *         description: Returns the token.
     */
        app.post('/auth', async (req, res) => {
            try {
                const token = auth.authenticate(req.body.application, req.body.apikey, req.body.context);
                if (token === undefined) {
                    res.status(401);
                    res.end();
                } else {
                    res.json({
                        tokenValue: token
                    });
                }
            } catch(error) {
                logger.error(error);
                res.status(500);
                res.json(error); 
            }
        });
}