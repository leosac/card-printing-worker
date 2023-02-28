import { Application } from 'pixi.js';
import { CardRenderer } from '@leosac/cardrendering';

export default class RenderService {
    constructor(container) {
        this.container = container;
        this.logger = container.get('logger');
    }

    async generateImage(layout, tpl, fields) {
        const app = new Application();
        const renderer = new CardRenderer({
            canvas: app.view,
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
        renderer.createCardStage(layout.size, layout.orientation, tpl);
        renderer.animate();

        return await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
    }
}