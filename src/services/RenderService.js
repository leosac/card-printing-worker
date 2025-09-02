const PIXI = require('@pixi/node');
const CardRenderer = require('@leosac/cardrendering').CardRenderer;
const genericPool = require("generic-pool");

class RenderService {

    app = null;
    pixiPool = null;

    constructor(container) {
        this.container = container;
        this.logger = container.get('logger');

        const poolFactory = {
            create: function() {
                return new PIXI.Application({
                    antialias: true,
                    autoDensity: true,
                    resolution: 1
                });
            },
            destroy: function(app) {
                app.destroy(true, true);
            }
        };
        

        this.logger.info("Initializing PIXI.JS pool with a pool size of `"+ process.env.PIXI_APP_POOL_SIZE +"`.");
        this.pixiPool = genericPool.createPool(poolFactory, { min: process.env.PIXI_APP_POOL_SIZE, max: process.env.PIXI_APP_POOL_SIZE });
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
        const app = await this.pixiPool.acquire();
        app.start();
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
        cr.animateOnce();
        const container = new PIXI.Container();
        container.addChild(app.stage);
        var canvas = app.renderer.extract.canvas(container);
        const base64img = canvas.toDataURL('image/png');

        app.stop();
        container.destroy(false);
        cr.destroy({ children: true, texture: true, baseTexture: true });
        PIXI.Cache.reset();
        this.pixiPool.release(app);
        /*if ('gl' in app.renderer) {
            console.log('webgl loseContext');
            app.renderer.gl?.getExtension('WEBGL_lose_context')?.loseContext();
        }*/
        //app.destroy(true, true); app = null;
        //PIXI.utils.destroyTextureCache();
        //PIXI.utils.clearTextureCache();

        return this.dataURItoBlob(base64img);
    }
}

module.exports = RenderService;