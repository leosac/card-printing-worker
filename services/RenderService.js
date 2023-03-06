import * as PIXI from "@pixi/node";
import { CardRenderer } from "@leosac/cardrendering";

export default class RenderService {
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

    async generateImage(layout, tpl, data) {
        const app = new PIXI.Application();
        const cr = new CardRenderer({
            renderer: app.renderer,
            stage: app.stage,
            grid: {
              ruler: false
            }
        });
        if (!layout) {
            layout = {
                size: 'cr80',
                orientation: 'landscape'
            };
        }

        await cr.createCardStage(layout, tpl);
        await cr.setCardData(data);
        cr.animate();

        const base64img = app.renderer.extract.canvas(app.stage).toDataURL('image/png');
        return this.dataURItoBlob(base64img);
    }
}