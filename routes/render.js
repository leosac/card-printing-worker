import PDFDocument from "pdfkit";

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
     *            default: 'cr80'
     *            description: The card size (eg. cr80).
     *          orientation:
     *            type: string
     *            enum: ['landscape', 'portrait']
     *            default: 'landscape'
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
     *                data:
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
     *                format:
     *                  type: string
     *                  enum: ['png', 'pdf']
     *                  default: 'png'
     *     responses:
     *       200:
     *         description: Returns the image.
     */
    app.post('/render/image', (req, res) => {
        container.get('render').generateImage(req.body.layout, req.body.template, req.body.data).then(img => {
            if (req.body.format === 'pdf') {
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
        }).catch((error) => {
            logger.error(error);
            res.status(500);
            res.json(error);  
        });
    });
}