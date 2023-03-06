const path = require('path');
const fs = require('fs');

export default class RepositoryService {
    constructor(container) {
        this.container = container;
        this.logger = container.get('logger');

        this.load();
    }

    async load() {
        this.templates = [];
        const fullpath = path.join(__dirname, 'repository');

        if (fs.existsSync(fullpath)) {
            const files = await fs.promises.readdir(fullpath);
            return Promise.all(files.map(async file => {
                const fullfile = path.join(fullpath, file);
                const json = await fs.promises.readFile(fullfile, { encoding: 'utf8' });
                const tpl = JSON.parse(json);
                this.templates.push(tpl);
            }));
        } else {
            this.logger.warn("The repository folder doesn't exist.");
        }
    }

    get(name) {
        if (this.templates && this.templates.length > 0) {
            return this.templates.find(tpl => tpl.name.toLowerCase() === name.toLowerCase());
        } else {
            this.logger.error("The template list is not initialized or empty.");
            return undefined;
        }
    }
}