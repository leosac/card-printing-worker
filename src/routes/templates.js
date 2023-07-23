module.exports = function(app, container) {
    const logger = container.get('logger');
    const auth = container.get('auth');
    const integrity = container.get('integrity');
    const repository = container.get('repository');
    const queue = container.get('queue');

    /**
     * @openapi
     * /template:
     *   post:
     *     description: Load a new template.
     *     tags:
     *       - template
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              type: object
     *     responses:
     *       200:
     *         description: Returns the associated template id.
     */
    app.post('/template', auth.authenticateToken, auth.checkGlobalPermission, async (req, res) => {
        try {
            res.json({id: repository.store(req.body)});
        } catch(error) {
            logger.error(error);
            res.status(500);
            res.json(error); 
        }
    });

    /**
     * @openapi
     * /template/{templateId}:
     *   post:
     *     description: Load a new template with expected id, or update an existing one.
     *     tags:
     *       - template
     *     parameters:
     *       - in: path
     *         name: templateId
     *         schema:
     *           type: string
     *         required: true
     *         description: The card template id
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              type: object
     *     responses:
     *       200:
     *         description: Returns the associated template id.
     */
    app.post('/template/:templateId', auth.authenticateToken, auth.checkGlobalPermission, async (req, res) => {
        try {
            res.json({id: repository.store(req.body, req.params.templateId)});
        } catch(error) {
            logger.error(error);
            res.status(500);
            res.json(error); 
        }
    });

    /**
     * @openapi
     * /templates:
     *   get:
     *     description: Get the list of permanent templates on the repository.
     *     tags:
     *       - template
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       '200':
     *         description: List of templates
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: string
     */
    app.get('/templates', auth.authenticateToken, auth.checkGlobalPermission, (req, res) => {
        const templates = repository.getAllIds();
        res.json(templates);
    });

    /**
     * @openapi
     * /template/{templateId}/check:
     *   get:
     *     description: Get if a template exists and is valid.
     *     tags:
     *       - template
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: templateId
     *         schema:
     *           type: string
     *         required: true
     *         description: The card template id
     *     responses:
     *       '200':
     *         description: True if the template exists and is valid, false otherwise.
     */
    app.get('/template/:templateId/check', auth.authenticateToken, auth.checkGlobalPermission, (req, res) => {
        try {
            const cardtpl = repository.get(req.params.templateId);
            if (!cardtpl) {
                res.json(false);
            } else {
                res.json(true);
            }
        } catch(error) {
            logger.error(error);
            res.status(500);
            res.json(error); 
        }
    });

    /**
     * @openapi
     * /template/{templateId}/fields:
     *   get:
     *     description: Get list of fields for a template.
     *     tags:
     *       - template
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: templateId
     *         schema:
     *           type: string
     *         required: true
     *         description: The card template id
     *     responses:
     *       '200':
     *         description: The fields list.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   name:
     *                     type: string
     *                   type:
     *                     type: string
     *                   value:
     *                     oneOf:
     *                       - type: string
     *                       - type: integer
     *                       - type: boolean
     */
    app.get('/template/:templateId/fields', auth.authenticateToken, auth.checkGlobalPermission, (req, res) => {
        try {
            const fields = repository.getFields(req.params.templateId);
            if (!fields) {
                res.status(404);
                res.end();
            } else {
                res.json(fields);
            }
        } catch(error) {
            logger.error(error);
            res.status(500);
            res.json(error); 
        }
    });

    /**
     * @openapi
     * /template/{templateId}/queue:
     *   post:
     *     description: Add a new element to the queue.
     *     tags:
     *       - template
     *       - queue
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: templateId
     *         schema:
     *           type: string
     *         required: true
     *         description: The card template id
     *     requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              type: object
     *              properties:
     *                data:
     *                  type: object
     *                format:
     *                  type: string
     *                  enum: ['png', 'pdf']
     *                  default: 'png'
     *     responses:
     *       200:
     *         description: Returns the item id on the queue.
     */
    app.post('/template/:templateId/queue', auth.authenticateToken, auth.checkGlobalPermission, async (req, res) => {
        try {
            const cardtpl = repository.get(req.params.templateId);
            if (!cardtpl) {
                throw new Error("Cannot found the card template from repository.");
            }
            
            if (!integrity.check(req.body.data, req.body.signature)) {
                throw new Error("Wrong data signature.");
            }
            
            res.json({id: queue.add(req.params.templateId, req.body)});
        } catch(error) {
            logger.error(error);
            res.status(500);
            res.json(error); 
        }
    });

    /**
     * @openapi
     * /template/{templateId}/queue/{itemId}:
     *   get:
     *     description: Get the item from the queue.
     *     tags:
     *       - template
     *       - queue
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: templateId
     *         schema:
     *           type: string
     *         required: true
     *         description: The card template id
     *       - in: path
     *         name: itemId
     *         schema:
     *           type: string
     *         required: true
     *         description: The item id
     *     responses:
     *       '200':
     *         description: The item data
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: string
     */
    app.get('/template/:templateId/queue/:itemId', auth.authenticateToken, (req, res) => {
        try {
            const item = queue.get(req.params.templateId, req.params.itemId);
            if (item === undefined) {
                throw new Error("The requested item cannot be found on the queue.");
            }
            if (!auth.checkQueuePermission(req, item)) {
                throw new Error("Bad token to access the targeted queue item.");
            }
            res.json(item.credential);
        } catch(error) {
            logger.error(error);
            res.status(500);
            res.json(error); 
        }
    });

    /**
     * @openapi
     * /template/{templateId}/layout:
     *   get:
     *     description: Get the template layout details.
     *     tags:
     *       - template
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: templateId
     *         schema:
     *           type: string
     *         required: true
     *         description: The card template id
     *     responses:
     *       '200':
     *         description: The layout
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                orientation:
     *                  type: string
     *                  enum: ['portrait', 'landscape']
     *                  default: 'landscape'
     *                size:
     *                  type: string
     *                  enum: ['cr80', 'cr79', 'cr100']
     *                  default: 'cr80'
     */
    app.get('/template/:templateId/layout', auth.authenticateToken, auth.checkGlobalPermission, (req, res) => {
        try {
            const tpl = repository.get(req.params.templateId);
            if (tpl === undefined) {
                res.status(404);
            } else {
                res.json(tpl.layout);
            }
        } catch(error) {
            logger.error(error);
            res.status(500);
            res.json(error); 
        }
    });

    /**
     * @openapi
     * /template/{templateId}/queue/{itemId}:
     *   delete:
     *     description: Delete the item from the queue.
     *     tags:
     *       - template
     *       - queue
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: templateId
     *         schema:
     *           type: string
     *         required: true
     *         description: The card template id
     *       - in: path
     *         name: itemId
     *         schema:
     *           type: string
     *         required: true
     *         description: The item id
     *     responses:
     *       '200':
     *         description: The item was removed
     */
    app.delete('/template/:templateId/queue/:itemId', auth.authenticateToken, (req, res) => {
        try {
            const item = queue.get(req.params.templateId, req.params.itemId);
            if (item === undefined) {
                throw new Error("The requested item cannot be found on the queue.");
            }
            if (!auth.checkQueuePermission(req, item)) {
                throw new Error("Bad token to access the targeted queue item.");
            }
            queue.remove(item.templateId, item.id);
            res.end();
        } catch(error) {
            logger.error(error);
            res.status(500);
            res.json(error); 
        }
    });
}