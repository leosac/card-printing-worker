const PDFDocument = require('pdfkit');

module.exports = function(app, container) {
    const logger = container.get('logger');
    const auth = container.get('auth');
    const integrity = container.get('integrity');
    const repository = container.get('repository');
    const queue = container.get('queue');

    /**
     * @openapi
     *  components:
     *    schemas:
     *      Layout:
     *        type: object
     *        required:
     *          - size
     *          - orientation
     *        properties:
     *          size:
     *            type: string
     *            default: 'cr80'
     *            description: The card size (eg. cr80).
     *          orientation:
     *            type: string
     *            enum: ['landscape', 'portrait']
     *            default: 'landscape'
     *            description: The card orientation (landscape or portrait).
     *      Sides:
     *        type: object
     *        properties:
     *          front:
     *            $ref: '#/components/schemas/SideTemplate'
     *          back:
     *            $ref: '#/components/schemas/SideTemplate'
     *        additionalProperties:
     *          $ref: '#/components/schemas/SideTemplate'
     *      SideTemplate:
     *        type: object
     */

    async function generateOutput(layout, tpl, data, format, dpi, res) {
        const img = await container.get('render').generateImage(layout, tpl, data, dpi);
            if (format === 'pdf') {
                const doc = new PDFDocument({autoFirstPage:false});
                res.setHeader('Content-disposition', 'attachment; filename="cardtemplate.pdf"')
                res.setHeader('Content-Type', 'application/pdf');
                let kimg = doc.openImage(img);
                doc.addPage({size: [kimg.width, kimg.height]});
                doc.image(kimg, 0, 0);
                doc.pipe(res);
                doc.end();
            } else {
                res.setHeader('Content-Type', 'image/png');
                res.end(Buffer.from(img, 'binary'));
            }
    }

    function getCardSideTemplate(req, sides) {
        if (req.query.side) {
            return sides[req.query.side];
        }
        if (sides.front) {
            return sides.front;
        }
        return sides.back;
    }

    /**
     * @openapi
     * /render/image:
     *   post:
     *     description: Generate an image from a template and associated fields.
     *     tags:
     *       - render
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              type: object
     *              properties:
     *                layout:
     *                  $ref: '#/components/schemas/Layout'
     *                sides:
     *                  $ref: '#/components/schemas/Sides'
     *                template:
     *                  $ref: '#/components/schemas/SideTemplate'
     *                data:
     *                  type: object
     *                signature:
     *                  type: string
     *                format:
     *                  type: string
     *                  enum: ['png', 'pdf']
     *                  default: 'png'
     *                dpi:
     *                  type: number
     *                  default: 300
     *     responses:
     *       200:
     *         description: Returns the image.
     */
    app.post('/render/image', auth.authenticateToken, auth.checkGlobalPermission, async (req, res) => {
        try {
            let tpl;
            if (req.body.template) {
                tpl = req.body.template;
            } else if (req.body.sides) {
                tpl = getCardSideTemplate(req, req.body.sides);
            }
            if (!tpl) {
                throw new Error("No card side template to use.");
            }

            if (!integrity.check(req.body.data, req.body.signature)) {
                throw new Error("Wrong data signature.");
            }

            await generateOutput(req.body.layout, tpl, req.body.data, req.body.format, req.body.dpi, res);
        } catch(error) {
            logger.error(error);
            res.status(500);
            res.json(error); 
        }
    });

    /**
     * @openapi
     * /template/{templateId}/render/image:
     *   post:
     *     description: Generate an image from a template loaded from repository and associated fields.
     *     tags:
     *       - render
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
     *                signature:
     *                  type: string
     *                format:
     *                  type: string
     *                  enum: ['png', 'pdf']
     *                  default: 'png'
     *                dpi:
     *                  type: number
     *                  default: 300
     *     responses:
     *       200:
     *         description: Returns the image.
     */
    app.post('/template/:templateId/render/image', auth.authenticateToken, auth.checkGlobalPermission, async (req, res) => {
        try {
            const cardtpl = repository.get(req.params.templateId);
            if (!cardtpl) {
                throw new Error("Cannot found the card template from repository.");
            }
            const tpl = getCardSideTemplate(req, cardtpl.sides);
            if (!tpl) {
                throw new Error("No card side template to use.");
            }

            if (!integrity.check(req.body.data, req.body.signature)) {
                throw new Error("Wrong data signature.");
            }

            await generateOutput(cardtpl.layout, tpl, req.body.data, req.body.format, req.body.dpi, res);
        } catch(error) {
            logger.error(error);
            res.status(500);
            res.json(error); 
        }
    });

    /**
     * @openapi
     * /template/{templateId}/queue/{itemId}/render/image:
     *   post:
     *     description: Generate an image from a template loaded from repository and from an item on the queue.
     *     tags:
     *       - render
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
     *       200:
     *         description: Returns the image.
     */
    app.post('/template/:templateId/queue/:itemId/render/image', auth.authenticateToken, async (req, res) => {
        try {
            const cardtpl = repository.get(req.params.templateId);
            if (!cardtpl) {
                throw new Error("Cannot found the card template from repository.");
            }
            const tpl = getCardSideTemplate(req, cardtpl.sides);
            if (!tpl) {
                throw new Error("No card side template to use.");
            }
            const item = queue.get(req.params.templateId, req.params.itemId);
            if (!item) {
                throw new Error("Cannot found the item on the queue.");
            }
            if (!auth.checkQueuePermission(req, item)) {
                throw new Error("Bad token to access the targeted queue item.");
            }
            if (item.removing) {
                throw new Error("The item is marked as `removing` and then cannot be produced anymore.");
            }

            await generateOutput(cardtpl.layout, tpl, item.credential.data, item.credential.format, item.credential.dpi, res);

            logger.info("Bitmap generated, schedule removing the item from the queue.");
            queue.scheduleRemove(req.params.templateId, req.params.itemId, 30000);
        } catch(error) {
            logger.error(error);
            res.status(500);
            res.json(error); 
        }
    });
}