module.exports = function(app, container) {
    const logger = container.get('logger');
    const auth = container.get('auth');
    const repository = container.get('repository');
    const queue = container.get('queue');

    /**
     * @openapi
     * /template:
     *   post:
     *     description: Load a new template.
     *     security:
     *       - Authorization: []
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
            res.json(repository.store(req.body));
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
     *     security:
     *       - Authorization: []
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
        const templates = repository.getAll();
        res.json(templates);
    });

    /**
     * @openapi
     * /template/{templateId}/check:
     *   get:
     *     description: Get if a template exists and is valid.
     *     security:
     *       - Authorization: []
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
            }
            res.json(true);
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
     *     security:
     *       - Authorization: []
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
     *                     type: [string, integer, boolean]
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
     *     security:
     *       - Authorization: []
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
            res.json(queue.add(req.params.templateId, req.body));
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
     *     security:
     *       - Authorization: []
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
            res.json(item.data);
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
     *     security:
     *       - Authorization: []
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