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

    async generateImages(tpl, data, dpi = undefined) {
        const images = [];
        await Promise.all(Object.keys(tpl.sides).map(async side => {
            const image = await this.generateImage(tpl.layout, tpl.sides[side], data, dpi);
            images.push(image);
        }));
        return images;
    }

    async generateImage(layout, sidetpl, data, dpi = undefined) {
        this.logger.info("Generating image...");

        let originDpi = 96 * 1.373;
        if (!layout) {
            layout = {
                size: 'cr80',
                orientation: 'landscape'
            };
        }
        if (layout.dpi !== undefined) {
            originDpi = layout.dpi
        }
        const scale = (dpi !== undefined) ? (dpi / originDpi) : 1;
        const app = new PIXI.Application({
            antialias: true,
            autoDensity: true,
            resolution: 1
        });
        const cr = new CardRenderer({
            renderer: app.renderer,
            stage: app.stage,
            grid: {
              ruler: false,
              scale: scale
            }
        });
        cr.data.card.border = 0;

        await cr.createCardStage(layout, sidetpl);
        if (data !== undefined) {
            await cr.setCardData(data);
        }
        cr.animate();
        let container = new PIXI.Container();
        container.addChild(app.stage);
        var canvas = app.renderer.extract.canvas(container);
        const base64img = canvas.toDataURL('image/png');

        app.stop();
        cr.graphics.renderer = undefined; // to avoid rendering on animate function
        cr.graphics.card = undefined;
        app.destroy(true, { children: true, texture: false, baseTexture: false });

        return this.dataURItoBlob(base64img);
    }
}

module.exports = RenderService;