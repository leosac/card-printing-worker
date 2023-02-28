module.exports = function(app, container) {
    const logger = container.get('logger');

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
     *            description: The card size (eg. cr80).
     *          orientation:
     *            type: string
     *            description: The card orientation (landscape or portrait).
     *      Template:
     *        type: object
     */

    /**
     * @openapi
     * /render/image:
     *   post:
     *     description: Generate an image from a template and associated fields.
     *     requestBody:
     *        required: true
     *        content:
     *          application/json:
     *            schema:
     *              type: object
     *              required:
     *                - template
     *              properties:
     *                layout:
     *                  $ref: '#/components/schemas/Layout'
     *                template:
     *                  $ref: '#/components/schemas/Template'
     *                fields:
     *                  type: array
     *                  items:
     *                    type: object
     *                    required:
     *                      - name
     *                      - value
     *                    properties:
     *                      name:
     *                        type: string
     *                      value:
     *                        oneOf:
     *                          - type: string
     *                          - type: integer
     *                          - type: boolean
     *     responses:
     *       200:
     *         description: Returns the image.
     */
    app.post('/render/image', (req, res) => {
        container.get('render').generateImage(req.body.layout, req.body.template, req.body.fields).then(bmp => {
            console.log("Bitmap generated!");
            res.writeHead(200, [['Content-Type', 'image/png']]);
            res.end(Buffer.from(bmp, 'binary'));
        }).catch((error) => {
            logger.error(error);
            res.status(500);
            res.json(error);  
        });
    });
}