const PIXI = require('@pixi/node');
const CardRenderer = require('@leosac/cardrendering').CardRenderer;

class RenderService {
    constructor(container) {
        this.container = container;
        this.logger = container.get('logger');
    }

    dataURItoBlob(dataURI) {
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for(var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return Buffer.from(new Uint8Array(array));
    }

    async generateImages(tpl, data) {
        const images = [];
        await Promise.all(Object.keys(tpl.sides).map(async side => {
            const image = await this.generateImage(tpl.layout, tpl.sides[side], data);
            images.push(image);
        }));
        return images;
    }

    async generateImage(layout, sidetpl, data) {
        this.logger.info("Generating image...");

        const app = new PIXI.Application();
        const cr = new CardRenderer({
            renderer: app.renderer,
            stage: app.stage,
            grid: {
              ruler: false
            }
        });
        cr.data.card.border = 0;
        if (!layout) {
            layout = {
                size: 'cr80',
                orientation: 'landscape'
            };
        }

        await cr.createCardStage(layout, sidetpl);
        await cr.setCardData(data);
        cr.animate();

        const base64img = app.renderer.extract.canvas(app.stage).toDataURL('image/png');
        return this.dataURItoBlob(base64img);
    }
}

module.exports = RenderService;